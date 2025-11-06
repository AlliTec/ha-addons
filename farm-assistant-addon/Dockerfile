ARG BUILD_FROM
FROM ${BUILD_FROM}

# Set up the environment
ENV LANG C.UTF-8

# Install Python packages
RUN pip install fastapi uvicorn

# Copy the addon files
COPY . /data

# Set the working directory
WORKDIR /data

# Expose the port
EXPOSE 8000

# Start the addon
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
