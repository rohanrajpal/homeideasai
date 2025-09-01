from typing import List, Dict, Any, AsyncGenerator
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session
from app.models import (
    HomeDesignProject,
    HomeDesignConversation,
    HomeDesignEdit,
    User,
    OAuthAccount,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from app.schemas import (
    HomeDesignChatRequest,
    HomeDesignChatResponse,
    HomeDesignConversationRead,
    HomeDesignEditRead,
    ChatMessage,
    ErrorResponse,
)
from app.users import current_active_user
from uuid import uuid4
import asyncio
import aioboto3
from botocore.exceptions import NoCredentialsError
import aiohttp
from app.config import settings
import fal_client
import os
from datetime import datetime
import anthropic
import json
import weakref
from collections import defaultdict
from contextlib import asynccontextmanager
import jwt

router = APIRouter(tags=["home-design-chat"])

# Initialize Claude client (ASYNC version)
claude_client = anthropic.AsyncAnthropic(api_key=settings.CLAUDE_API_KEY)

bucket_name = "homeideasai"


# Event emitter system for real-time updates
class EventEmitter:
    def __init__(self):
        self._listeners: Dict[str, List[asyncio.Queue]] = defaultdict(list)
        self._listener_refs = weakref.WeakSet()

    async def emit(self, event: str, data: Dict[str, Any]):
        """Emit an event to all listeners"""
        if event in self._listeners:
            # Create a copy of listeners to avoid modification during iteration
            listeners = self._listeners[event].copy()
            for queue in listeners:
                try:
                    await queue.put(data)
                except:
                    # Remove broken queues
                    if queue in self._listeners[event]:
                        self._listeners[event].remove(queue)

    @asynccontextmanager
    async def listen(self, event: str):
        """Context manager for listening to events"""
        queue = asyncio.Queue()
        self._listeners[event].append(queue)
        self._listener_refs.add(queue)
        try:
            yield queue
        finally:
            if queue in self._listeners[event]:
                self._listeners[event].remove(queue)


# Global event emitter instance
event_emitter = EventEmitter()


# Async S3 upload helper
async def upload_to_s3(
    file_data: bytes, key: str, content_type: str = "image/png"
) -> str:
    """Upload file data to S3 asynchronously"""
    session = aioboto3.Session()
    async with session.client(
        "s3",
        aws_access_key_id=settings.S3_AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.S3_AWS_SECRET_ACCESS_KEY,
    ) as s3_client:
        await s3_client.put_object(
            Bucket=bucket_name,
            Key=key,
            Body=file_data,
            ContentType=content_type,
        )
    return f"https://cdn.{bucket_name}.com/{key}"


# Background task for image generation
async def process_image_generation_background(
    project_id: str,
    user_id: str,
    transformation_request: str,
    image_url: str,
    room_type: str,
    style_preference: str,
    conversation_id: str,
    prompt: str,
):
    """Background task to handle image generation and database updates"""
    try:
        from app.database import get_async_session_context

        # Generate the image
        new_image_url = await generate_design_transformation(
            image_url, transformation_request, room_type, style_preference
        )

        # Update database with new image
        session_maker = get_async_session_context()
        async with session_maker() as db:
            # Update project
            project_result = await db.execute(
                select(HomeDesignProject).where(
                    HomeDesignProject.id == project_id,
                    HomeDesignProject.user_id == user_id,
                )
            )
            project = project_result.scalar_one_or_none()

            if project:
                old_image_url = project.current_image_url
                project.current_image_url = new_image_url
                project.updated_at = datetime.utcnow()

                # Create edit record
                edit = HomeDesignEdit(
                    id=str(uuid4()),
                    project_id=project_id,
                    prompt=prompt,
                    before_image_url=old_image_url,
                    after_image_url=new_image_url,
                    edit_type="ai_design_transformation",
                    created_at=datetime.utcnow(),
                )
                db.add(edit)

                # Update conversation with generated image
                conv_result = await db.execute(
                    select(HomeDesignConversation).where(
                        HomeDesignConversation.id == conversation_id
                    )
                )
                conversation = conv_result.scalar_one_or_none()
                if conversation and conversation.messages:
                    # Update the last assistant message with the image
                    messages = conversation.messages
                    for i in range(len(messages) - 1, -1, -1):
                        if messages[i]["role"] == "assistant":
                            messages[i]["image_url"] = new_image_url
                            break
                    conversation.messages = messages
                    conversation.updated_at = datetime.utcnow()

                await db.commit()

                # Emit success event for real-time updates
                await event_emitter.emit(
                    f"project_update_{project_id}",
                    {
                        "type": "design_generation_complete",
                        "project_id": project_id,
                        "new_image_url": new_image_url,
                        "conversation_id": conversation_id,
                        "timestamp": datetime.utcnow().isoformat(),
                    },
                )

    except Exception as e:
        print(f"Error in background image generation: {e}")

        # Emit error event for real-time updates
        await event_emitter.emit(
            f"project_update_{project_id}",
            {
                "type": "design_generation_error",
                "project_id": project_id,
                "error": str(e),
                "conversation_id": conversation_id,
                "timestamp": datetime.utcnow().isoformat(),
            },
        )


@router.post(
    "/chat",
    response_model=HomeDesignChatResponse,
    responses={400: {"model": ErrorResponse}},
)
async def home_design_chat(
    request: HomeDesignChatRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
) -> HomeDesignChatResponse:
    """Handle chat interactions for home design projects"""

    try:
        # Verify project ownership
        project_result = await db.execute(
            select(HomeDesignProject).where(
                HomeDesignProject.id == request.project_id,
                HomeDesignProject.user_id == user.id,
            )
        )
        project = project_result.scalar_one_or_none()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Check user credits
        if user.credits <= 0:
            raise HTTPException(status_code=400, detail="Insufficient credits")

        # Get conversation history if conversation_id is provided
        conversation_history = []
        if request.conversation_id:
            conv_result = await db.execute(
                select(HomeDesignConversation).where(
                    HomeDesignConversation.id == request.conversation_id,
                    HomeDesignConversation.project_id == request.project_id,
                )
            )
            conversation = conv_result.scalar_one_or_none()
            if conversation:
                conversation_history = conversation.messages or []

        # Set conversation_id for use in agentic response
        conversation_id = request.conversation_id or str(uuid4())

        # Get agentic Claude response
        agentic_response = await get_agentic_claude_response(
            request.message,
            conversation_history,
            project.room_type,
            project.style_preference,
            project.current_image_url,
            background_tasks,  # Pass background tasks to handle tool calls directly
            request.project_id,
            str(user.id),
            conversation_id,
        )

        if agentic_response["type"] == "error":
            raise HTTPException(status_code=500, detail=agentic_response["message"])

        # Create or update conversation
        # Add user message and assistant response to history
        new_messages = conversation_history + [
            {
                "role": "user",
                "content": request.message,
                "timestamp": datetime.utcnow().isoformat(),
            },
            {
                "role": "assistant",
                "content": agentic_response["message"],
                "timestamp": datetime.utcnow().isoformat(),
            },
        ]

        if request.conversation_id:
            # Update existing conversation
            conversation.messages = new_messages
            conversation.updated_at = datetime.utcnow()
        else:
            # Create new conversation
            conversation = HomeDesignConversation(
                id=conversation_id,
                project_id=request.project_id,
                messages=new_messages,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(conversation)

        # Handle different response types
        image_url = None
        if agentic_response["type"] == "design_generation_queued":
            # Background task has already been queued in get_agentic_claude_response
            # Deduct credit for queued generation
            user.credits = max(0, user.credits - 1)

        elif (
            agentic_response["type"] == "design_generation"
            and "image_url" in agentic_response
        ):
            # Handle immediate generation (if any remain)
            image_url = agentic_response["image_url"]
            project.current_image_url = image_url
            project.updated_at = datetime.utcnow()

            # Create edit record
            edit = HomeDesignEdit(
                id=str(uuid4()),
                project_id=request.project_id,
                prompt=request.message,
                before_image_url=project.current_image_url,
                after_image_url=image_url,
                edit_type="ai_design_transformation",
                created_at=datetime.utcnow(),
            )
            db.add(edit)

            # Deduct credit
            user.credits = max(0, user.credits - 1)

        await db.commit()

        # Build response based on agentic response type
        response_data = {
            "message": ChatMessage(
                role="assistant",
                content=agentic_response["message"],
                timestamp=datetime.utcnow(),
            ),
            "conversation_id": conversation_id,
            "image_url": image_url,
        }

        # Include type and options for design_options responses
        if agentic_response["type"] == "design_options":
            response_data["type"] = "design_options"
            response_data["options"] = agentic_response.get("options", [])
        elif agentic_response["type"] == "design_generation_queued":
            response_data["type"] = "design_generation_queued"
            response_data["processing"] = True

        return HomeDesignChatResponse(**response_data)

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in home design chat: {e}")
        await db.rollback()
        raise HTTPException(status_code=500, detail="Internal server error")


async def analyze_image_for_design_options(
    room_type: str, style_preference: str, analysis_note: str, user_request: str = ""
) -> dict:
    """Tool function: Generate AI-powered, contextual design options based on the specific request"""

    try:
        # Use Claude to generate specific, contextual design options
        system_prompt = f"""You are an expert interior designer analyzing a {room_type or 'room'} image. 
        
Context:
- Room type: {room_type or 'not specified'}
- Style preference: {style_preference or 'not specified'}
- Analysis note: {analysis_note}
- User request: {user_request}

Generate 4 specific, relevant design options that directly address the user's request and the space shown. 
Each option should be tailored to what the user is asking about (e.g., if they mention "brick wall", focus on brick wall treatments).

Return a JSON object with this exact structure:
{{
  "options": [
    {{
      "name": "Specific Option Name",
      "description": "Detailed description relevant to their request",
      "key_changes": ["specific change 1", "specific change 2"]
    }}
  ]
}}

Make the options specific to their request, not generic design styles."""

        response = await claude_client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=800,
            system=system_prompt,
            messages=[
                {
                    "role": "user",
                    "content": f"Generate specific design options for: {user_request or 'this space'}",
                }
            ],
        )

        # Parse Claude's response
        response_text = response.content[0].text if response.content else ""

        try:
            # Try to extract JSON from markdown code blocks
            import json
            import re

            # Look for JSON wrapped in markdown code blocks
            json_match = re.search(
                r"```json\s*(\{.*?\})\s*```", response_text, re.DOTALL
            )
            if json_match:
                json_str = json_match.group(1)
                result = json.loads(json_str)
                return result
            else:
                # Try parsing the entire response as JSON (fallback)
                result = json.loads(response_text)
                return result

        except (json.JSONDecodeError, AttributeError) as e:
            # Fallback if JSON parsing fails
            print(f"Failed to parse Claude response as JSON: {response_text}")
            print(f"Parse error: {e}")
            return {
                "options": [
                    {
                        "name": "Custom Design Option",
                        "description": "A tailored design approach based on your specific request.",
                        "key_changes": [
                            "Contextual change",
                            "Specific improvement",
                        ],
                    }
                ]
            }

    except Exception as e:
        print(f"Error generating design options: {e}")
        # Emergency fallback
        return {
            "options": [
                {
                    "name": "Design Consultation",
                    "description": "Let's discuss your specific design needs to create the perfect solution.",
                    "key_changes": [
                        "Personalized approach",
                        "Custom solutions",
                    ],
                }
            ]
        }


async def generate_design_transformation(
    image_url: str, transformation_request: str, room_type: str, style_preference: str
) -> str:
    """Tool function: Generate a design transformation image"""

    # Create a detailed prompt that preserves POV
    enhanced_prompt = f"Keep the same room layout, camera angle, and perspective. Only modify: {transformation_request}. IMPORTANT: Preserve the exact camera angle, room layout, and all elements not mentioned in the transformation request. Do not change the overall room perspective or add/remove major architectural elements."

    try:
        # Try Nano Banana first, fallback to Flux if it fails
        try:
            return await edit_image_with_nano_banana(image_url, enhanced_prompt)
        except HTTPException as e:
            if "content_policy_violation" in str(e.detail).lower():
                print(
                    f"Nano Banana failed with content policy violation, falling back to Flux: {e.detail}"
                )
                return await edit_image_with_flux_pro(image_url, enhanced_prompt)
            else:
                raise e
    except Exception as e:
        print(f"Error in design transformation tool: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate design transformation: {str(e)}",
        )


async def get_agentic_claude_response(
    current_message: str,
    conversation_history: List[Dict[str, Any]],
    room_type: str,
    style_preference: str,
    project_image_url: str,
    background_tasks: BackgroundTasks = None,
    project_id: str = None,
    user_id: str = None,
    conversation_id: str = None,
) -> Dict[str, Any]:
    """Get an agentic response from Claude using tool calling"""

    # Build conversation context
    messages = []
    for msg in conversation_history:
        messages.append({"role": msg["role"], "content": msg["content"]})

    # Add current message
    messages.append({"role": "user", "content": current_message})

    # Define tools that Claude can use
    tools = [
        {
            "name": "provide_design_options",
            "description": "Analyze the space and provide curated design style options for the user to choose from",
            "input_schema": {
                "type": "object",
                "properties": {
                    "analysis_note": {
                        "type": "string",
                        "description": "Brief note about what you observed in the space",
                    }
                },
                "required": ["analysis_note"],
            },
        },
        {
            "name": "generate_design_transformation",
            "description": "Generate a visual design transformation based on user's specific request",
            "input_schema": {
                "type": "object",
                "properties": {
                    "transformation_request": {
                        "type": "string",
                        "description": "Specific description of what design changes to make",
                    },
                    "style_note": {
                        "type": "string",
                        "description": "Brief note about the style being applied",
                    },
                },
                "required": ["transformation_request", "style_note"],
            },
        },
    ]

    system_prompt = f"""You are an expert interior design assistant with access to powerful design tools. 

Current context:
- Room type: {room_type or 'not specified'}
- Style preference: {style_preference or 'not specified'}
- Project image: AVAILABLE at {project_image_url} (the user has already uploaded a room image)

IMPORTANT: The user has already uploaded a room image for this project. You can see and work with this existing image. Do NOT ask them to upload another image.

When to use tools:
1. Use `provide_design_options` when users ask about:
   - Specific elements (brick wall, furniture, colors, etc.)
   - Design possibilities or ideas
   - How to transform something
   - What they can do with a space/element
   
2. Use `generate_design_transformation` when users want to:
   - Actually generate/create a design
   - See a visual transformation
   - Apply a specific style they've chosen

For `provide_design_options`, make your analysis_note specific to what they're asking about (e.g., "analyzing the brick wall feature" if they mention brick wall).

**The image is already available - proceed with analysis and design work immediately.**"""

    try:
        response = await claude_client.messages.create(
            model="claude-sonnet-4-20250514",  # Using Claude Sonnet 4!
            max_tokens=1000,
            system=system_prompt,
            messages=messages,
            tools=tools,
        )

        # Handle tool calls - iterate through all content blocks
        if response.content and len(response.content) > 0:
            # Look for tool calls in all content blocks
            for content_block in response.content:
                if hasattr(content_block, "type") and content_block.type == "tool_use":
                    tool_name = content_block.name
                    tool_input = content_block.input

                    if tool_name == "provide_design_options":
                        # Call the tool function with context
                        options_result = await analyze_image_for_design_options(
                            room_type,
                            style_preference,
                            tool_input.get("analysis_note", ""),
                            current_message,  # Pass the user's actual request
                        )

                        return {
                            "type": "design_options",
                            "message": f"{tool_input.get('analysis_note', '')} Here are some design directions I'd recommend:",
                            "options": options_result["options"],
                        }

                    elif tool_name == "generate_design_transformation":
                        # Queue the image generation as a background task if background_tasks is provided
                        if (
                            background_tasks
                            and project_id
                            and user_id
                            and conversation_id
                        ):
                            transformation_request = tool_input.get(
                                "transformation_request", current_message
                            )

                            background_tasks.add_task(
                                process_image_generation_background,
                                project_id=project_id,
                                user_id=user_id,
                                transformation_request=transformation_request,
                                image_url=project_image_url,
                                room_type=room_type,
                                style_preference=style_preference,
                                conversation_id=conversation_id,
                                prompt=current_message,
                            )

                            return {
                                "type": "design_generation_queued",
                                "message": f"{tool_input.get('style_note', 'I\'m creating your transformed design!')}\n\nI'm generating your design transformation now. This may take a few moments - you'll see the result appear shortly.",
                                "processing": True,
                            }
                        else:
                            # Fallback to synchronous generation if no background task support
                            try:
                                new_image_url = await generate_design_transformation(
                                    project_image_url,
                                    tool_input["transformation_request"],
                                    room_type,
                                    style_preference,
                                )

                                return {
                                    "type": "design_generation",
                                    "message": f"{tool_input.get('style_note', 'Here is your transformed design!')}\n\nI've preserved the original room layout and perspective while making the specific changes you requested.",
                                    "image_url": new_image_url,
                                }
                            except Exception as e:
                                return {
                                    "type": "error",
                                    "message": f"I encountered an issue generating your design: {str(e)}. Would you like to try a different approach?",
                                }

            # If no tool calls found, extract text from text blocks
            text_parts = []
            for content_block in response.content:
                if hasattr(content_block, "type") and content_block.type == "text":
                    text_parts.append(content_block.text)

            if text_parts:
                return {"type": "conversation", "message": " ".join(text_parts)}

        # Fallback if no content blocks found
        return {
            "type": "error",
            "message": "I received an empty response. Could you please try rephrasing your request?",
        }

    except Exception as e:
        print(f"Error in agentic Claude response: {e}")
        return {
            "type": "error",
            "message": "I apologize, but I'm having trouble processing your request right now. Could you please try again?",
        }


async def edit_image_with_nano_banana(image_url: str, prompt: str) -> str:
    """Edit an image using Nano Banana"""
    os.environ["FAL_KEY"] = settings.FAL_KEY

    try:
        # Add additional constraints for better editing
        enhanced_prompt = f"{prompt}. IMPORTANT: Preserve the exact camera angle, room layout, and all elements not mentioned in the edit request. Do not change the overall room perspective or add/remove major architectural elements."

        handler = await fal_client.submit_async(
            "fal-ai/nano-banana/edit",
            arguments={
                "prompt": enhanced_prompt,
                "image_urls": [image_url],  # Note: expects array of URLs
            },
        )

        # Wait for completion
        async for event in handler.iter_events(with_logs=True):
            print(event)

        result = await handler.get()
        edited_image_url = result["images"][0]["url"]

        # Download and upload to our S3
        image_data = await download_image(edited_image_url)
        unique_id = uuid4()
        key = f"edits/{unique_id}.png"

        return await upload_to_s3(image_data, key, "image/png")

    except Exception as e:
        print(f"Error editing image with Nano Banana: {e}")
        # Check if it's a content policy violation and preserve the error type
        error_str = str(e)
        if "content_policy_violation" in error_str.lower():
            raise HTTPException(
                status_code=400, detail=f"Content policy violation: {error_str}"
            )
        else:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to edit image with Nano Banana: {error_str}",
            )


async def edit_image_with_flux_pro(image_url: str, prompt: str) -> str:
    """Edit an image using Flux Pro as fallback"""
    os.environ["FAL_KEY"] = settings.FAL_KEY

    try:
        # Add additional constraints for Flux Pro as well
        enhanced_prompt = f"{prompt}. IMPORTANT: Preserve the exact camera angle, room layout, and all elements not mentioned in the edit request. Do not change the overall room perspective or add/remove major architectural elements."

        handler = await fal_client.submit_async(
            "fal-ai/flux-pro",
            arguments={
                "prompt": enhanced_prompt,
                "image_url": image_url,
            },
        )

        # Wait for completion
        async for event in handler.iter_events(with_logs=True):
            print(event)

        result = await handler.get()
        edited_image_url = result["images"][0]["url"]

        # Download and upload to our S3
        image_data = await download_image(edited_image_url)
        unique_id = uuid4()
        key = f"home_edits/{unique_id}.png"

        return await upload_to_s3(image_data, key, "image/png")

    except Exception as e:
        print(f"Error editing image with Flux Pro: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to edit image with Flux Pro: {str(e)}"
        )


async def download_image(url: str) -> bytes:
    """Download image data from a URL"""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            response.raise_for_status()
            return await response.read()


@router.get(
    "/conversations/{project_id}", response_model=List[HomeDesignConversationRead]
)
async def get_project_conversations(
    project_id: str,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Get all conversations for a project"""
    # Verify project ownership
    project_result = await db.execute(
        select(HomeDesignProject).where(
            HomeDesignProject.id == project_id, HomeDesignProject.user_id == user.id
        )
    )
    project = project_result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get conversations
    result = await db.execute(
        select(HomeDesignConversation)
        .where(HomeDesignConversation.project_id == project_id)
        .order_by(HomeDesignConversation.updated_at.desc())
    )
    conversations = result.scalars().all()

    return conversations


@router.get("/edits/{project_id}", response_model=List[HomeDesignEditRead])
async def get_project_edits(
    project_id: str,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Get all edits for a project"""
    # Verify project ownership
    project_result = await db.execute(
        select(HomeDesignProject).where(
            HomeDesignProject.id == project_id, HomeDesignProject.user_id == user.id
        )
    )
    project = project_result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get edits
    result = await db.execute(
        select(HomeDesignEdit)
        .where(HomeDesignEdit.project_id == project_id)
        .order_by(HomeDesignEdit.created_at.desc())
    )
    edits = result.scalars().all()

    return edits


@router.post("/analyze-image")
async def analyze_image_for_design(
    request: dict,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Trigger initial analysis using agentic Claude"""

    try:
        project_id = request.get("project_id")
        if not project_id:
            raise HTTPException(status_code=400, detail="project_id is required")

        # Get the project
        result = await db.execute(
            select(HomeDesignProject).where(
                HomeDesignProject.id == project_id,
                HomeDesignProject.user_id == user.id,
            )
        )
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Use agentic Claude to analyze and decide what to show
        agentic_response = await get_agentic_claude_response(
            "I just uploaded this room image. Please help me explore design possibilities for this space.",
            [],  # Empty conversation history for initial analysis
            project.room_type,
            project.style_preference,
            project.current_image_url,
        )

        print(f"Agentic response type: {agentic_response.get('type')}")
        print(f"Agentic response keys: {list(agentic_response.keys())}")

        if agentic_response["type"] == "design_options":
            return {
                "analysis": agentic_response["message"],
                "options": agentic_response["options"],
            }
        else:
            # Claude didn't call the tool, so let's provide options manually
            print(f"Claude response was: {agentic_response}")
            print(f"Providing manual options as fallback")

            # Always provide design options regardless of Claude's response
            manual_options = await analyze_image_for_design_options(
                project.room_type or "space",
                project.style_preference or "modern",
                "Initial analysis",
                "explore design possibilities for this space",
            )

            # Use Claude's message if it's a conversation type, otherwise use a default
            analysis_text = agentic_response.get(
                "message",
                "I'd be happy to help you explore design possibilities for your space!",
            )

            return {
                "analysis": f"{analysis_text}\n\nHere are some curated design directions to consider:",
                "options": manual_options["options"],
            }

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in analyze_image_for_design: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze image")


async def get_user_from_token(token: str, db: AsyncSession) -> User:
    """Extract user from JWT token for SSE authentication"""
    try:
        from app.config import settings
        import uuid

        # Decode the JWT token manually - disable audience verification
        payload = jwt.decode(
            token,
            settings.ACCESS_SECRET_KEY,
            algorithms=["HS256"],
            options={"verify_aud": False},  # Disable audience verification
        )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # Convert string UUID to UUID object
        try:
            user_uuid = uuid.UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=401, detail="Invalid user ID format")

        # Get user from database
        user_db = SQLAlchemyUserDatabase(db, User, OAuthAccount)
        user = await user_db.get(user_uuid)

        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found or inactive")

        return user

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        print(f"Authentication error in SSE: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")


@router.get("/events/{project_id}")
async def project_events_stream(
    project_id: str,
    token: str,
    db: AsyncSession = Depends(get_async_session),
):
    """Server-Sent Events endpoint for real-time project updates"""

    # Authenticate user using the JWT token
    user = await get_user_from_token(token, db)

    # Verify project ownership
    project_result = await db.execute(
        select(HomeDesignProject).where(
            HomeDesignProject.id == project_id,
            HomeDesignProject.user_id == user.id,
        )
    )
    project = project_result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    async def event_generator() -> AsyncGenerator[str, None]:
        """Generate SSE formatted messages"""
        try:
            # Send initial connection message
            connection_data = {"type": "connected", "project_id": project_id}
            yield f"data: {json.dumps(connection_data)}\n\n"

            # Listen for project-specific events
            async with event_emitter.listen(f"project_update_{project_id}") as queue:
                while True:
                    try:
                        # Wait for events with timeout to send periodic keepalive
                        event_data = await asyncio.wait_for(queue.get(), timeout=30.0)
                        yield f"data: {json.dumps(event_data)}\n\n"
                    except asyncio.TimeoutError:
                        # Send keepalive
                        keepalive_data = {
                            "type": "keepalive",
                            "timestamp": datetime.utcnow().isoformat(),
                        }
                        yield f"data: {json.dumps(keepalive_data)}\n\n"
                    except Exception as e:
                        print(f"Error in SSE stream: {e}")
                        break
        except Exception as e:
            print(f"Error in event generator: {e}")
            yield f"data: {json.dumps({'type': 'error', 'message': 'Stream error'})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    )
