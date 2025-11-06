#!/usr/bin/with-contenv bashio

bashio::log.info "Starting Farm Assistant backend..."
uvicorn --app-dir /data main:app --host 0.0.0.0 --port 8000
