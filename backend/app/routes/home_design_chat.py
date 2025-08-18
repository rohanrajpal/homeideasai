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
async def chat_with_claude(
    chat_request: HomeDesignChatRequest,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Chat with Claude about home design and potentially edit images"""

    # Check if user has enough credits
    if user.credits <= 0:
        raise HTTPException(status_code=400, detail="Insufficient credits")

    # Get the project
    result = await db.execute(
        select(HomeDesignProject).where(
            HomeDesignProject.id == chat_request.project_id,
            HomeDesignProject.user_id == user.id,
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Get or create conversation
    conversation = None
    if chat_request.conversation_id:
        conv_result = await db.execute(
            select(HomeDesignConversation).where(
                HomeDesignConversation.id == chat_request.conversation_id
            )
        )
        conversation = conv_result.scalar_one_or_none()

    if not conversation:
        conversation = HomeDesignConversation(
            id=uuid4(), project_id=chat_request.project_id, messages=[]
        )
        db.add(conversation)

    # Add user message to conversation
    user_message = {
        "role": "user",
        "content": chat_request.message,
        "timestamp": datetime.utcnow().isoformat(),
    }
    conversation.messages.append(user_message)

    # Analyze message with Claude to determine if image editing is needed
    should_edit_image, edit_prompt = await analyze_message_for_image_edit(
        chat_request.message, project.room_type, project.style_preference
    )

    assistant_response = ""
    edited_image_url = None

    if should_edit_image:
        # Perform image edit with Flux Kontext
        edited_image_url = await edit_image_with_flux_kontext(
            project.current_image_url, edit_prompt
        )

        # Update project's current image
        project.current_image_url = edited_image_url

        # Create edit record
        edit_record = HomeDesignEdit(
            id=uuid4(),
            project_id=project.id,
            conversation_id=conversation.id,
            prompt=edit_prompt,
            before_image_url=project.current_image_url,
            after_image_url=edited_image_url,
            edit_type="chat_request",
        )
        db.add(edit_record)

        # Deduct credit
        user.credits -= 1
        db.add(user)

        assistant_response = f"I've made the changes you requested! Here's your updated design. The edit applied: {edit_prompt}"
    else:
        # Just respond with Claude without editing
        assistant_response = await get_claude_response(
            chat_request.message,
            conversation.messages[:-1],  # Exclude the current user message
            project,
        )

    # Add assistant response to conversation
    assistant_message = {
        "role": "assistant",
        "content": assistant_response,
        "timestamp": datetime.utcnow().isoformat(),
    }
    conversation.messages.append(assistant_message)

    await db.commit()
    await db.refresh(conversation)

    return HomeDesignChatResponse(
        conversation_id=conversation.id,
        message=ChatMessage(
            role="assistant", content=assistant_response, timestamp=datetime.utcnow()
        ),
        image_url=edited_image_url,
    )


async def analyze_message_for_image_edit(
    message: str, room_type: str, style_preference: str
) -> tuple[bool, str]:
    """Use Claude to analyze if the message requires an image edit"""

    system_prompt = f"""You are an expert interior design assistant. Analyze the user's message to determine if they want to make visual changes to their {room_type or 'room'} design.

Current style preference: {style_preference or 'not specified'}

Respond with a JSON object:
{{
    "should_edit": boolean,
    "edit_prompt": "specific prompt for image editing if should_edit is true, otherwise empty string"
}}

Examples of messages that require editing:
- "Make the walls blue"
- "Add a sofa here"
- "Change the lighting to warmer"
- "Remove the rug"
- "Make it more modern"

Examples that don't require editing:
- "What color would work well here?"
- "Tell me about this style"
- "What furniture would you recommend?"
"""

    try:
        response = claude_client.messages.create(
            model="claude-3-haiku-20240307",
            max_tokens=200,
            system=system_prompt,
            messages=[{"role": "user", "content": message}],
        )

        # Parse the JSON response
        import json

        result = json.loads(response.content[0].text)
        return result.get("should_edit", False), result.get("edit_prompt", "")

    except Exception as e:
        print(f"Error analyzing message: {e}")
        # Fallback: simple keyword detection
        edit_keywords = [
            "change",
            "add",
            "remove",
            "make",
            "paint",
            "color",
            "furniture",
            "lighting",
            "wall",
            "floor",
            "ceiling",
        ]
        should_edit = any(keyword in message.lower() for keyword in edit_keywords)
        return should_edit, message if should_edit else ""


async def get_claude_response(
    current_message: str,
    conversation_history: List[Dict[str, Any]],
    project: HomeDesignProject,
) -> str:
    """Get a response from Claude for design advice"""

    system_prompt = f"""You are an expert interior designer assistant helping with a {project.room_type or 'room'} design project.

Project details:
- Room type: {project.room_type or 'not specified'}
- Style preference: {project.style_preference or 'not specified'}
- Project name: {project.name}
- Description: {project.description or 'none provided'}

Provide helpful, specific advice about interior design. Be conversational and encouraging. If the user asks for visual changes, let them know you can help implement those changes to their design."""

    # Format conversation history for Claude
    messages = []
    for msg in conversation_history[-10:]:  # Last 10 messages for context
        messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": current_message})

    try:
        response = claude_client.messages.create(
            model="claude-3-sonnet-20240229",
            max_tokens=500,
            system=system_prompt,
            messages=messages,
        )

        return response.content[0].text

    except Exception as e:
        print(f"Error getting Claude response: {e}")
        return "I'm having trouble responding right now. Please try again in a moment."


async def edit_image_with_flux_kontext(image_url: str, prompt: str) -> str:
    """Edit an image using Flux Kontext"""
    os.environ["FAL_KEY"] = settings.FAL_KEY

    try:
        handler = await fal_client.submit_async(
            "fal-ai/flux-pro/kontext",
            arguments={"prompt": prompt, "image_url": image_url},
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
        print(f"Error editing image with Flux Kontext: {e}")
        raise HTTPException(status_code=500, detail="Failed to edit image")


async def download_image(url: str) -> bytes:
    """Download image data from a URL"""
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
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
