from fastapi_users.db import (
    SQLAlchemyBaseUserTableUUID,
    SQLAlchemyBaseOAuthAccountTableUUID,
)
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import (
    Column,
    String,
    Integer,
    ForeignKey,
    DateTime,
    func,
    ARRAY,
    Text,
    JSON,
    Boolean,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4
from sqlalchemy.orm import Mapped


class Base(DeclarativeBase):
    pass


class OAuthAccount(SQLAlchemyBaseOAuthAccountTableUUID, Base):
    pass


class User(SQLAlchemyBaseUserTableUUID, Base):
    stripe_customer_id = Column(String, nullable=True)
    credits = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())

    # Subscription fields
    stripe_subscription_id = Column(String, nullable=True)
    subscription_status = Column(
        String, nullable=True
    )  # active, canceled, past_due, etc.
    subscription_current_period_start = Column(DateTime, nullable=True)
    subscription_current_period_end = Column(DateTime, nullable=True)
    subscription_cancel_at_period_end = Column(Boolean, default=False)
    plan_id = Column(String, nullable=True)  # Store the Stripe price ID

    items = relationship("Item", back_populates="user", cascade="all, delete-orphan")

    home_design_projects = relationship(
        "HomeDesignProject", back_populates="user", cascade="all, delete-orphan"
    )
    oauth_accounts: Mapped[list[OAuthAccount]] = relationship(
        "OAuthAccount", lazy="joined"
    )


class Item(Base):
    __tablename__ = "items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    quantity = Column(Integer, nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)

    user = relationship("User", back_populates="items")


class Waitlist(Base):
    __tablename__ = "waitlist"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, server_default=func.now())


class HomeDesignProject(Base):
    __tablename__ = "home_design_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("user.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    original_image_url = Column(String, nullable=False)
    current_image_url = Column(String, nullable=False)
    room_type = Column(String, nullable=True)  # living_room, bedroom, kitchen, etc.
    style_preference = Column(String, nullable=True)  # modern, rustic, minimalist, etc.
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="home_design_projects")
    conversations = relationship(
        "HomeDesignConversation", back_populates="project", cascade="all, delete-orphan"
    )
    edits = relationship(
        "HomeDesignEdit", back_populates="project", cascade="all, delete-orphan"
    )


class HomeDesignConversation(Base):
    __tablename__ = "home_design_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id = Column(
        UUID(as_uuid=True), ForeignKey("home_design_projects.id"), nullable=False
    )
    messages = Column(
        JSON, nullable=False
    )  # Array of {role: "user"|"assistant", content: string}
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    project = relationship("HomeDesignProject", back_populates="conversations")


class HomeDesignEdit(Base):
    __tablename__ = "home_design_edits"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    project_id = Column(
        UUID(as_uuid=True), ForeignKey("home_design_projects.id"), nullable=False
    )
    conversation_id = Column(
        UUID(as_uuid=True), ForeignKey("home_design_conversations.id"), nullable=True
    )
    prompt = Column(Text, nullable=False)
    before_image_url = Column(String, nullable=False)
    after_image_url = Column(String, nullable=False)
    edit_type = Column(
        String, nullable=False
    )  # "style_change", "furniture_add", "color_change", etc.
    created_at = Column(DateTime, server_default=func.now())

    project = relationship("HomeDesignProject", back_populates="edits")
    conversation = relationship("HomeDesignConversation")
