#!/bin/bash

if [ -f /.dockerenv ]; then
    echo "Running in Docker with improved concurrency"
    uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    python watcher.py
else
    echo "Running locally with improved concurrency via Poetry"
    poetry run uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &
    poetry run python watcher.py
fi

wait