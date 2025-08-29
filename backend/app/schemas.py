from datetime import datetime
import uuid
from typing import List, Dict, Any, Optional

from fastapi_users import schemas
from pydantic import BaseModel
from uuid import UUID


class UserRead(schemas.BaseUser[uuid.UUID]):
    credits: int | None = None
    subscription_status: str | None = None
    subscription_current_period_start: datetime | None = None
    subscription_current_period_end: datetime | None = None
    subscription_cancel_at_period_end: bool | None = None
    plan_id: str | None = None


class UserCreate(schemas.BaseUserCreate):
    pass


class UserUpdate(schemas.BaseUserUpdate):
    pass


class ItemBase(BaseModel):
    name: str
    description: str | None = None
    quantity: int | None = None


class ItemCreate(ItemBase):
    pass


class ItemRead(ItemBase):
    id: UUID
    user_id: UUID

    class Config:
        from_attributes = True


class StripeCheckoutSession(BaseModel):
    url: str


class Invoice(BaseModel):
    invoice_link: str
    date: datetime
    amount: str
    credits: int


class ErrorResponse(BaseModel):
    detail: str


class CompleteCheckoutSessionResponse(BaseModel):
    status: str
    amount: float
    currency: str


# Home Design Project Schemas
class HomeDesignProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    original_image_url: str
    room_type: Optional[str] = None
    style_preference: Optional[str] = None


class HomeDesignProjectRead(BaseModel):
    id: UUID
    name: str
    description: Optional[str]
    original_image_url: str
    current_image_url: str
    room_type: Optional[str]
    style_preference: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HomeDesignProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    current_image_url: Optional[str] = None
    room_type: Optional[str] = None
    style_preference: Optional[str] = None


# Home Design Conversation Schemas
class HomeDesignConversationCreate(BaseModel):
    project_id: UUID
    messages: List[Dict[str, Any]]


class HomeDesignConversationRead(BaseModel):
    id: UUID
    project_id: UUID
    messages: List[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HomeDesignConversationUpdate(BaseModel):
    messages: List[Dict[str, Any]]


# Home Design Edit Schemas
class HomeDesignEditCreate(BaseModel):
    project_id: UUID
    conversation_id: Optional[UUID] = None
    prompt: str
    before_image_url: str
    edit_type: str


class HomeDesignEditRead(BaseModel):
    id: UUID
    project_id: UUID
    conversation_id: Optional[UUID]
    prompt: str
    before_image_url: str
    after_image_url: str
    edit_type: str
    created_at: datetime

    class Config:
        from_attributes = True


# Image Upload Schema
class ImageUploadResponse(BaseModel):
    image_url: str


# Chat Message Schema
class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: Optional[datetime] = None


# Home Design Chat Request
class HomeDesignChatRequest(BaseModel):
    project_id: str  # Will be validated as UUID in the endpoint
    message: str
    conversation_id: Optional[str] = None  # Will be validated as UUID in the endpoint


# Home Design Chat Response
class HomeDesignChatResponse(BaseModel):
    conversation_id: str
    message: ChatMessage
    image_url: Optional[str] = None  # If an image edit was performed
    type: Optional[str] = (
        None  # Response type: "design_options", "design_generation", "design_generation_queued", etc.
    )
    options: Optional[List[Dict[str, Any]]] = (
        None  # Design options when type is "design_options"
    )
    processing: Optional[bool] = None  # If image generation is processing in background


# Subscription Schemas
class SubscriptionInfo(BaseModel):
    status: str
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False
    plan_name: Optional[str] = None
    credits_remaining: int = 0


class CancelSubscriptionResponse(BaseModel):
    success: bool
    message: str
    cancel_at_period_end: bool
