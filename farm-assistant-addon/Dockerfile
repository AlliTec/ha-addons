ARG BUILD_FROM=ghcr.io/hassio-addons/base:15.0.7
FROM ${BUILD_FROM}

# Set up the environment
ENV LANG C.UTF-8

# Install build dependencies and Python packages
RUN apk add --no-cache python3 py3-pip && \
    pip3 install --break-system-packages --only-binary=:all: fastapi uvicorn asyncpg jinja2 python-multipart

# Create app directory
RUN mkdir -p /app/templates /app/static

# Copy addon files (excluding .ssh-askpass and other sensitive files)
COPY run.sh /
COPY main.py /app/
COPY vin_decoder.py /app/
COPY config.yaml /app/
COPY templates/ /app/templates/
COPY static/ /app/static/

# Make run script executable
RUN chmod a+x /run.sh

# Expose the port
EXPOSE 8000

CMD [ "/run.sh" ]
