#!/bin/bash

# Production server with proper concurrency settings
if [ -f /.dockerenv ]; then
    echo "Running in Docker with production settings"
    gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
else
    echo "Running locally with production settings via Poetry"
    poetry run gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
fi
