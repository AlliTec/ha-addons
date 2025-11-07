ARG BUILD_FROM
FROM ${BUILD_FROM}

# Set up the environment
ENV LANG C.UTF-8

# Install build dependencies and Python packages
RUN apk add --no-cache python3 py3-pip postgresql-dev gcc musl-dev && \
    pip3 install --break-system-packages fastapi uvicorn asyncpg jinja2

# Create app directory
RUN mkdir -p /app/templates /app/static

# Copy addon files
COPY run.sh /
COPY run_update.sh /
COPY main.py /app/
COPY import_data.py /app/
COPY update_schema.py /app/
COPY templates/ /app/templates/
COPY static/ /app/static/

# Make run script executable
RUN chmod a+x /run.sh
RUN chmod a+x /run_update.sh

# Expose the port
EXPOSE 8000

CMD [ "/run.sh" ]
