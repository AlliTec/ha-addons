ARG BUILD_FROM
FROM ${BUILD_FROM}

# Set up the environment
ENV LANG C.UTF-8

# Install build dependencies and Python packages
RUN apk add --no-cache postgresql-dev gcc musl-dev && \
    pip install fastapi uvicorn asyncpg

# Copy the addon files
COPY . /data

# Set the working directory
WORKDIR /data

# Expose the port
EXPOSE 8000

# Start the addon
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
