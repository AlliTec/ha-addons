#!/usr/bin/with-contenv bashio

bashio::log.info "--- STARTING ADDON ---"

bashio::log.info "Current directory: $(pwd)"
bashio::log.info "Listing files in /data..."
ls -la /data

bashio::log.info "Checking main.py for syntax..."
python3 -m py_compile /data/main.py
COMPILE_STATUS=$?
bashio::log.info "Syntax check finished with status: $COMPILE_STATUS"

if [ $COMPILE_STATUS -ne 0 ]; then
    bashio::log.error "Syntax error in main.py. Aborting."
    exit 1
fi

bashio::log.info "Attempting to start Uvicorn..."
uvicorn --app-dir /data main:app --host 0.0.0.0 --port 8000
