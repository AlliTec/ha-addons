#!/usr/bin/with-contenv bashio

# Start the FastAPI server
bashio::log.info "Starting the Farm Assistant backend..."
uvicorn main:app --host 0.0.0.0 --port 8000
