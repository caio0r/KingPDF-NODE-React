from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import shutil
import os
import fitz  # PyMuPDF
import json
from typing import List, Optional
from pydantic import BaseModel, Json
import io
from PIL import Image
from core.utils import cleanup_file

router = APIRouter()

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

# Pydantic models for parsing the JSON 'edits' field
class TextEdit(BaseModel):
    id: str
    pageIndex: int
    text: str
    x: float  # Percentage (0-1) or Points
    y: float  # Percentage (0-1) or Points
    fontSize: int = 12
    color: str = "#000000"  # Hex
    fontFamily: str = "helv" # standard font

class ImageEdit(BaseModel):
    id: str
    pageIndex: int
    x: float
    y: float
    width: float
    height: float
    fileIndex: int # Index in the list of uploaded images

class RectangleEdit(BaseModel):
    id: str
    pageIndex: int
    x: float
    y: float
    width: float
    height: float
    color: str = "#FFFFFF" # Default white for eraser
    fill: bool = True

class EditOperations(BaseModel):
    texts: List[TextEdit] = []
    images: List[ImageEdit] = []
    rectangles: List[RectangleEdit] = []

@router.post("/edit-pdf")
def edit_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    edits: str = Form(...),
    image_files: List[UploadFile] = File(default=[])
):
    """
    Edits a PDF by stamping text, images, and shapes.
    """
    try:
        edits_data = json.loads(edits)
        edits_model = EditOperations(**edits_data)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="Invalid JSON in 'edits' field")
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Validation error: {e}")

    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    # Prepare paths
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    input_path = os.path.join(UPLOAD_DIR, f"edit_in_{file.filename}")
    output_filename = f"edited_{file.filename}"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    try:
        # Save main PDF
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Process image files into a list of bytes
        loaded_images = []
        for img_file in image_files:
            content = img_file.file.read()
            loaded_images.append(content)

        doc = fitz.open(input_path)

        # Apply Rectangle Edits (Eraser/Shapes)
        for rect_op in edits_model.rectangles:
            if 0 <= rect_op.pageIndex < len(doc):
                page = doc[rect_op.pageIndex]
                rect_page = page.rect
                
                x = rect_op.x * rect_page.width
                y = rect_op.y * rect_page.height
                w = rect_op.width * rect_page.width
                h = rect_op.height * rect_page.height
                
                shape_rect = fitz.Rect(x, y, x + w, y + h)
                
                # Parse color
                r, g, b = 1, 1, 1 # Default white
                if rect_op.color.startswith("#") and len(rect_op.color) == 7:
                    r = int(rect_op.color[1:3], 16) / 255
                    g = int(rect_op.color[3:5], 16) / 255
                    b = int(rect_op.color[5:7], 16) / 255
                
                # Draw rectangle
                shape = page.new_shape()
                shape.draw_rect(shape_rect)
                if rect_op.fill:
                    shape.finish(color=(r, g, b), fill=(r, g, b))
                else:
                    shape.finish(color=(r, g, b))
                shape.commit()

        # Apply Text Edits
        for text_op in edits_model.texts:
            if 0 <= text_op.pageIndex < len(doc):
                page = doc[text_op.pageIndex]
                
                rect = page.rect
                
                # Calculate position
                pos_x = text_op.x * rect.width
                pos_y = text_op.y * rect.height
                
                # Parse hex color
                r, g, b = 0, 0, 0
                if text_op.color.startswith("#") and len(text_op.color) == 7:
                    r = int(text_op.color[1:3], 16) / 255
                    g = int(text_op.color[3:5], 16) / 255
                    b = int(text_op.color[5:7], 16) / 255

                # Insert Text
                page.insert_text(
                    (pos_x, pos_y + text_op.fontSize), 
                    text_op.text,
                    fontsize=text_op.fontSize,
                    color=(r, g, b),
                    fontname="helv"
                )

        # Apply Image Edits
        for img_op in edits_model.images:
            if 0 <= img_op.pageIndex < len(doc) and 0 <= img_op.fileIndex < len(loaded_images):
                page = doc[img_op.pageIndex]
                rect = page.rect
                
                img_bytes = loaded_images[img_op.fileIndex]
                
                x = img_op.x * rect.width
                y = img_op.y * rect.height
                w = img_op.width * rect.width
                h = img_op.height * rect.height
                
                # Define rectangle for image
                img_rect = fitz.Rect(x, y, x + w, y + h)
                
                page.insert_image(img_rect, stream=img_bytes)

        doc.save(output_path)
        doc.close()

        background_tasks.add_task(cleanup_file, output_path)

        return FileResponse(output_path, media_type="application/pdf", filename=output_filename)

    except Exception as e:
        print(f"Edit PDF Error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error editing PDF: {str(e)}")
    
    finally:
        cleanup_file(input_path)
