from app.config import settings
from app.routes.billing import router as billing_router
from app.routes.items import router as items_router
from app.routes.waitlist import router as waitlist_router
from app.routes.home_design_projects import router as home_design_projects_router
from app.routes.home_design_chat import router as home_design_chat_router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .schemas import UserCreate, UserRead, UserUpdate
from .users import AUTH_URL_PATH, auth_backend, fastapi_users, google_oauth_router
from .routes.lead_generation import router as lead_generation_router
from .utils import simple_generate_unique_route_id
import modal


web_app = FastAPI(generate_unique_id_function=simple_generate_unique_route_id)

app = modal.App("homeideasai-backend")

image = (
    modal.Image.debian_slim()
    .run_commands(
        "apt-get update && apt-get install -y libgl1",
        "apt-get install -y libglib2.0-0 libsm6 libxrender1 libxext6",
    )
    .poetry_install_from_file("pyproject.toml")
)


origins = [
    settings.FRONTEND_URL,
    "http://localhost:8080",
]

web_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


web_app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix=f"/{AUTH_URL_PATH}/jwt",
    tags=["auth"],
)
web_app.include_router(
    google_oauth_router,
    prefix="/auth/google",
    tags=["auth"],
)
web_app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)
web_app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)
web_app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix=f"/{AUTH_URL_PATH}",
    tags=["auth"],
)
web_app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)
web_app.include_router(billing_router, prefix="/billing")
web_app.include_router(items_router, prefix="/items")
web_app.include_router(waitlist_router, prefix="/waitlist")
web_app.include_router(lead_generation_router, prefix="/lead-generation")
web_app.include_router(home_design_projects_router, prefix="/home-design")
web_app.include_router(home_design_chat_router, prefix="/home-design")


@app.function(image=image, secrets=[modal.Secret.from_name("custom-secret")])
# @app.function(image=image, secrets=[modal.Secret.from_name("custom-secret-2")])  # prod
@modal.asgi_app()
def fastapi_app():
    return web_app
