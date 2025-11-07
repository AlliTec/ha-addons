#!/usr/bin/with-contenv bashio

bashio::log.info "Updating database schema..."

python3 /app/update_schema.py
