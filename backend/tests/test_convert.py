from fastapi.testclient import TestClient
from main import app
import os
import pytest

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to PDF Tools API"}

def test_convert_pdf_to_word_invalid_file():
    response = client.post("/convert/pdf-to-word", files={"file": ("test.txt", b"content", "text/plain")})
    assert response.status_code == 400
    assert response.json() == {"detail": "Invalid file type. Please upload a PDF."}

# Note: To test success, we need a real PDF file. 
# We can skip this for now or create a dummy PDF if possible.
