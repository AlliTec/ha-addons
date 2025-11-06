#!/usr/bin/with-contenv bashio

# Start the FastAPI server
bashio::log.info "Starting Farm Assistant Addon..."

bashio::log.info "Setting file permissions..."
chmod -R 755 /data

bashio::log.info "Changing to /data directory..."
cd /data

bashio::log.info "Listing files in /data..."
ls -l /data

bashio::log.info "Starting the Farm Assistant backend..."
uvicorn main:app --host 0.0.0.0 --port 8000
