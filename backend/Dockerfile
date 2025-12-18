# Use official Python lightweight image
FROM python:3.10-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install system dependencies
# - default-jre: Required for tabula-py (PDF to Excel)
# - libreoffice: Required for converting Office docs to PDF (if we enable that path later, good to have) or general doc processing
# - poppler-utils: Useful utility for PDF processing
# - libgl1: Required for some opencv/image libraries if used
RUN apt-get update && apt-get install -y \
    default-jre \
    libreoffice \
    poppler-utils \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Create uploads and outputs directories to ensure they exist/permissions
RUN mkdir -p uploads outputs

# Expose port
EXPOSE 8000

# Run the application
# Workers can be adjusted via command line or env var, default to 4 for "production-like" local server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
