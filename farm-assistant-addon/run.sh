#!/usr/bin/with-contenv bashio

# Start the FastAPI server
bashio::log.info "Starting the Farm Assistant backend..."
cd /data
uvicorn main:app --host 0.0.0.0 --port 8000
