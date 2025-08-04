FROM python:3.10-slim

WORKDIR /app

# Copy from server/ directory
COPY server/requirements.txt .
RUN pip install -r requirements.txt

# Copy entire server directory
COPY server/ .

EXPOSE 8000
CMD ["python", "main.py"]