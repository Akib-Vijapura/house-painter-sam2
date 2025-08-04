FROM nvidia/cuda:12.1.1-cudnn8-runtime-ubuntu22.04

# Install dependencies
RUN apt-get update && apt-get install -y \
    python3 python3-pip git wget curl ffmpeg libsm6 libxext6 \
    && rm -rf /var/lib/apt/lists/*

# Create work directory
WORKDIR /app

# Copy everything
COPY . /app

# Install Python dependencies
RUN pip3 install --upgrade pip
RUN pip3 install -r requirements.txt

# Expose port
EXPOSE 8000

# Run the Flask app
CMD ["python3", "app.py"]
