FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application (all files in the server folder)
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Environment variables
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1
ENV HYDRA_FULL_ERROR=1
ENV PYTORCH_ENABLE_MPS_FALLBACK=1

EXPOSE 8000

# Use gunicorn as production server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "4", "main:app"]
