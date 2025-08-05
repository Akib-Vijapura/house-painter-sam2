FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10


WORKDIR /app/app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install sam2

COPY . .

# Create models folder and download the model at container startup (entrypoint)
RUN mkdir -p models

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]