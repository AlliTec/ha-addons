ARG BUILD_FROM
FROM ${BUILD_FROM}

# Set up the environment
ENV LANG C.UTF-8

# Install build dependencies and Python packages
RUN apk add --no-cache python3 py3-pip postgresql-dev gcc musl-dev && \
    pip3 install --break-system-packages fastapi uvicorn asyncpg jinja2 python-multipart

# Create app directory
RUN mkdir -p /app/templates /app/static

# Copy addon files (excluding .ssh-askpass and other sensitive files)
COPY run.sh /
COPY main.py /app/
COPY vin_decoder.py /app/
COPY templates/ /app/templates/
COPY static/ /app/static/

# Make run script executable
RUN chmod a+x /run.sh

# Expose the port
EXPOSE 8000

CMD [ "/run.sh" ]
