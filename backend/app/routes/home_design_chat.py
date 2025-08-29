from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session
from app.models import HomeDesignProject, HomeDesignConversation, HomeDesignEdit, User
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
import boto3
from botocore.exceptions import NoCredentialsError
import aiohttp
from app.config import settings
import fal_client
import os
from datetime import datetime
import anthropic
import json

router = APIRouter(tags=["home-design-chat"])

# Initialize Claude client
claude_client = anthropic.Anthropic(api_key=settings.CLAUDE_API_KEY)

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.S3_AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.S3_AWS_SECRET_ACCESS_KEY,
)

bucket_name = "homeideasai"


@router.post(
    "/chat",
    response_model=HomeDesignChatResponse,
    responses={400: {"model": ErrorResponse}},
)
async def home_design_chat(
    request: HomeDesignChatRequest,
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

        # Get agentic Claude response
        agentic_response = await get_agentic_claude_response(
            request.message,
            conversation_history,
            project.room_type,
            project.style_preference,
            project.current_image_url,
        )

        if agentic_response["type"] == "error":
            raise HTTPException(status_code=500, detail=agentic_response["message"])

        # Create or update conversation
        conversation_id = request.conversation_id or str(uuid4())

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

        # Update project image if new one was generated
        image_url = None
        if (
            agentic_response["type"] == "design_generation"
            and "image_url" in agentic_response
        ):
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
        if agentic_response["type"] == "design_generation":
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

        response = claude_client.messages.create(
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
        response = claude_client.messages.create(
            model="claude-sonnet-4-20250514",  # Using Claude Sonnet 4!
            max_tokens=1000,
            system=system_prompt,
            messages=messages,
            tools=tools,
        )

        print(f"Claude response content: {response.content}")
        print(
            f"Claude response content length: {len(response.content) if response.content else 0}"
        )

        # Handle tool calls - iterate through all content blocks
        if response.content and len(response.content) > 0:
            # Look for tool calls in all content blocks
            for content_block in response.content:
                print(
                    f"Content block type: {getattr(content_block, 'type', 'no type attribute')}"
                )
                print(f"Content block: {content_block}")

                if hasattr(content_block, "type") and content_block.type == "tool_use":
                    tool_name = content_block.name
                    tool_input = content_block.input
                    print(f"Tool called: {tool_name}")

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
                        # Call the tool function
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

        s3_client.put_object(
            Bucket=bucket_name,
            Key=key,
            Body=image_data,
            ContentType="image/png",
        )

        return f"https://cdn.{bucket_name}.com/{key}"

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

        s3_client.put_object(
            Bucket=bucket_name,
            Key=key,
            Body=image_data,
            ContentType="image/png",
        )

        return f"https://cdn.{bucket_name}.com/{key}"

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
