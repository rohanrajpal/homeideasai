from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_async_session
from app.models import HomeDesignProject, User
from app.schemas import (
    HomeDesignProjectCreate,
    HomeDesignProjectRead,
    HomeDesignProjectUpdate,
    ImageUploadResponse,
    ErrorResponse,
)
from app.users import current_active_user
from uuid import uuid4
import aiohttp
import boto3
from botocore.exceptions import NoCredentialsError
from app.config import settings

router = APIRouter(tags=["home-design-projects"])

s3_client = boto3.client(
    "s3",
    aws_access_key_id=settings.S3_AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.S3_AWS_SECRET_ACCESS_KEY,
)

bucket_name = "homeideasai"


@router.post("/upload-image", response_model=ImageUploadResponse)
async def upload_image(
    file: UploadFile = File(...),
    user: User = Depends(current_active_user),
):
    """Upload an image to S3 for home design projects"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read file content
    content = await file.read()

    # Generate unique filename
    unique_id = uuid4()
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    key = f"home_uploads/{unique_id}.{file_extension}"

    try:
        # Upload to S3
        s3_client.put_object(
            Bucket=bucket_name,
            Key=key,
            Body=content,
            ContentType=file.content_type,
        )
        image_url = f"https://cdn.{bucket_name}.com/{key}"
        return ImageUploadResponse(image_url=image_url)
    except NoCredentialsError:
        raise HTTPException(status_code=500, detail="AWS credentials not found")


@router.post(
    "/projects",
    response_model=HomeDesignProjectRead,
    responses={400: {"model": ErrorResponse}},
)
async def create_project(
    project_data: HomeDesignProjectCreate,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Create a new home design project"""
    # Create new project
    db_project = HomeDesignProject(
        id=uuid4(),
        user_id=user.id,
        name=project_data.name,
        description=project_data.description,
        original_image_url=project_data.original_image_url,
        current_image_url=project_data.original_image_url,  # Initially same as original
        room_type=project_data.room_type,
        style_preference=project_data.style_preference,
    )
    db.add(db_project)
    await db.commit()
    await db.refresh(db_project)

    return db_project


@router.get("/projects", response_model=List[HomeDesignProjectRead])
async def get_user_projects(
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
    skip: int = 0,
    limit: int = 10,
):
    """Get user's home design projects"""
    result = await db.execute(
        select(HomeDesignProject)
        .where(HomeDesignProject.user_id == user.id)
        .order_by(HomeDesignProject.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    projects = result.scalars().all()
    return projects


@router.get("/projects/{project_id}", response_model=HomeDesignProjectRead)
async def get_project(
    project_id: str,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Get a specific project"""
    result = await db.execute(
        select(HomeDesignProject).where(
            HomeDesignProject.id == project_id, HomeDesignProject.user_id == user.id
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


@router.put("/projects/{project_id}", response_model=HomeDesignProjectRead)
async def update_project(
    project_id: str,
    project_update: HomeDesignProjectUpdate,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Update a project"""
    result = await db.execute(
        select(HomeDesignProject).where(
            HomeDesignProject.id == project_id, HomeDesignProject.user_id == user.id
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Update fields
    for field, value in project_update.dict(exclude_unset=True).items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)

    return project


@router.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    db: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """Delete a project"""
    result = await db.execute(
        select(HomeDesignProject).where(
            HomeDesignProject.id == project_id, HomeDesignProject.user_id == user.id
        )
    )
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    await db.delete(project)
    await db.commit()

    return {"message": "Project deleted successfully"}
