#!/bin/bash

# Function to handle cleanup
cleanup() {
  echo "Shutting down gracefully..."
  # Add any other cleanup commands here
  kill $(jobs -p)  # Terminate background jobs
  wait
}

# Trap the interrupt signal (Ctrl+C)
trap cleanup INT

pnpm run dev &

node watcher.js

wait