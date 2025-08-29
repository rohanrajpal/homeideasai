from app.config import settings
from app.routes.billing import router as billing_router
from app.routes.items import router as items_router
from app.routes.waitlist import router as waitlist_router
from app.routes.home_design_projects import router as home_design_projects_router
from app.routes.home_design_chat import router as home_design_chat_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime

from .schemas import UserCreate, UserRead, UserUpdate
from .users import AUTH_URL_PATH, auth_backend, fastapi_users, google_oauth_router
from .routes.lead_generation import router as lead_generation_router
from .utils import simple_generate_unique_route_id


app = FastAPI(generate_unique_id_function=simple_generate_unique_route_id)


origins = [
    settings.FRONTEND_URL,
    "http://localhost:8080",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix=f"/{AUTH_URL_PATH}/jwt",
    tags=["auth"],
)
app.include_router(
    google_oauth_router,
    prefix="/auth/google",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)
app.include_router(billing_router, prefix="/billing")
app.include_router(items_router, prefix="/items")
app.include_router(waitlist_router, prefix="/waitlist")
app.include_router(lead_generation_router, prefix="/lead-generation")
app.include_router(home_design_projects_router, prefix="/home-design")
app.include_router(home_design_chat_router, prefix="/home-design")


@app.get("/", tags=["root"])
async def root():
    """Root endpoint with basic API information"""
    return {
        "message": "HomeIdeasAI Backend API",
        "status": "running",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint to verify service status"""
    return {
        "status": "ok",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "homeideasai-backend",
    }
