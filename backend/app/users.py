import json
import re
import uuid
from typing import Optional

from fastapi import Depends, Request, Response, Body
from fastapi_users import (
    BaseUserManager,
    FastAPIUsers,
    InvalidPasswordException,
    UUIDIDMixin,
)
from fastapi_users.authentication import (
    AuthenticationBackend,
    BearerTransport,
    JWTStrategy,
)
from fastapi_users.db import SQLAlchemyUserDatabase
from httpx_oauth.clients.google import GoogleOAuth2

from .config import settings
from .database import get_user_db
from .email import send_reset_password_email, send_verification_email
from .models import User
from .schemas import UserCreate
import requests


AUTH_URL_PATH = "auth"

# Initialize Google OAuth2 client
google_oauth_client = GoogleOAuth2(
    client_id=settings.GOOGLE_OAUTH_CLIENT_ID,
    client_secret=settings.GOOGLE_OAUTH_CLIENT_SECRET,
    scopes=[
        "email",
        "profile",
        "openid",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
    ],
)

url = "https://app.loops.so/api/v1/events/send"


class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.RESET_PASSWORD_SECRET_KEY
    verification_token_secret = settings.VERIFICATION_SECRET_KEY

    async def on_after_register(self, user: User, request: Optional[Request] = None):
        print(f"User {user.id} has registered.")
        if user.is_verified:
            print(f"User {user.id} is already verified.")
            await self.give_credits(user)

    async def on_after_forgot_password(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        await send_reset_password_email(user, token)

    async def on_after_request_verify(
        self, user: User, token: str, request: Optional[Request] = None
    ):
        print(f"Verification requested for user {user.id}. Verification token: {token}")
        await send_verification_email(user, token)

    async def on_after_verify(
        self,
        user: User,
        request: Optional[Request] = None,
    ):
        print(f"User {user.id} has verified their email.")

        await self.give_credits(user)

    async def give_credits(self, user: User):
        await self.user_db.update(user, {"credits": user.credits + 3})
        await self.trigger_account_created(user)

    async def trigger_account_created(self, user: User):
        payload = {
            "email": user.email,
            "userId": str(user.id),
            "nailsCustomerId": str(user.id),
            "eventName": "Nails Deisgn AI Account Created",
            "eventProperties": {},
            "mailingLists": {},
        }
        headers = {
            "Authorization": f"Bearer {settings.LOOPS_API_KEY}",
            "Content-Type": "application/json",
        }
        response = requests.request("POST", url, json=payload, headers=headers)
        print(response.text)

    async def validate_password(
        self,
        password: str,
        user: UserCreate,
    ) -> None:
        errors = []

        if len(password) < 8:
            errors.append("Password should be at least 8 characters.")
        if user.email in password:
            errors.append("Password should not contain e-mail.")
        if not any(char.isupper() for char in password):
            errors.append("Password should contain at least one uppercase letter.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password should contain at least one special character.")

        if errors:
            raise InvalidPasswordException(reason=errors)


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


bearer_transport = BearerTransport(tokenUrl=f"{AUTH_URL_PATH}/jwt/login")


def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(
        secret=settings.ACCESS_SECRET_KEY,
        lifetime_seconds=settings.ACCESS_TOKEN_EXPIRE_SECONDS,
    )


auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])

current_active_user = fastapi_users.current_user(active=True)

# Google OAuth routes
google_oauth_router = fastapi_users.get_oauth_router(
    google_oauth_client,
    auth_backend,
    settings.ACCESS_SECRET_KEY,
    associate_by_email=True,
    is_verified_by_default=True,
    redirect_url=f"{settings.FRONTEND_URL}/google/callback",
)
