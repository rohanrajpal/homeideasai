# Makefile

# Variables
BACKEND_DIR=backend
FRONTEND_DIR=frontend
DOCKER_COMPOSE=docker compose

# Help
.PHONY: help
help:
	@echo "Available commands:"
	@awk '/^[a-zA-Z_-]+:/{split($$1, target, ":"); print "  " target[1] "\t" substr($$0, index($$0,$$2))}' $(MAKEFILE_LIST)

# Backend commands
.PHONY: start-backend test-backend migrate-backend watch-backend

start-backend: ## Start the backend server with FastAPI
	cd $(BACKEND_DIR) && poetry run fastapi dev app/main.py --host 0.0.0.0 --port 8000 --reload

test-backend: ## Run backend tests using pytest
	cd $(BACKEND_DIR) && poetry run pytest

watch-backend: ## Start backend with file watchers
	cd $(BACKEND_DIR) && ./start.sh

wb: watch-backend ## Alias for watch-backend

# Frontend commands
.PHONY: start-frontend test-frontend watch-frontend

start-frontend: ## Start the frontend server with pnpm
	cd $(FRONTEND_DIR) && pnpm run dev

test-frontend: ## Run frontend tests using npm
	cd $(FRONTEND_DIR) && pnpm run test

watch-frontend: ## Start frontend with file watchers
	cd $(FRONTEND_DIR) && ./start.sh

wf: watch-frontend ## Alias for watch-frontend

# Docker commands
.PHONY: docker-backend-shell docker-frontend-shell build-backend-container build-frontend-container \
        up-backend-container up-frontend-container

docker-backend-shell: ## Access the backend container shell
	$(DOCKER_COMPOSE) run --rm backend sh

docker-frontend-shell: ## Access the frontend container shell
	$(DOCKER_COMPOSE) run --rm frontend sh

docker-build-backend: ## Build the backend container with no cache
	docker build backend --no-cache

docker-build-frontend: ## Build the frontend container with no cache
	docker build frontend --no-cache

docker-up-backend: ## Start the backend container
	$(DOCKER_COMPOSE) up backend

docker-up-frontend: ## Start the frontend container
	$(DOCKER_COMPOSE) up frontend

docker-migrate-db: ## Run database migrations using Alembic
	$(DOCKER_COMPOSE) run --rm backend alembic upgrade head

docker-test-backend: ## Run tests for the backend
	$(DOCKER_COMPOSE) run --rm backend pytest

docker-test-frontend: ## Run tests for the frontend
	$(DOCKER_COMPOSE) run --rm frontend pnpm run test

backend-generate-migration: ## Generate a new migration
	cd $(BACKEND_DIR) && poetry run alembic revision --autogenerate -m "$(name)" && poetry run alembic upgrade head

backend-migrate: ## Run migrations
	cd $(BACKEND_DIR) && poetry run alembic upgrade head

backend-migrate-down: ## Rollback the last migration
	cd $(BACKEND_DIR) && poetry run alembic downgrade
