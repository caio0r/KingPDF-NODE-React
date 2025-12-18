from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import shutil
import os
from pypdf import PdfWriter
from core.utils import cleanup_file
from typing import List

router = APIRouter()

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

@router.post("/merge-pdf")
async def merge_pdf(background_tasks: BackgroundTasks, files: List[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")
    
    # Validate files
    for file in files:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"Invalid file type: {file.filename}. Please upload only PDFs.")

    merged_filename = "merged_document.pdf"
    output_path = os.path.join(OUTPUT_DIR, merged_filename)
    
    temp_files = []

    try:
        writer = PdfWriter()

        for file in files:
            temp_path = os.path.join(UPLOAD_DIR, f"merge_in_{file.filename}")
            temp_files.append(temp_path)
            
            # Save uploaded file temporarily
            with open(temp_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            # Append to writer
            writer.append(temp_path)

        # Write merged PDF
        with open(output_path, "wb") as f:
            writer.write(f)

        background_tasks.add_task(cleanup_file, output_path)

        return FileResponse(
            output_path, 
            media_type="application/pdf", 
            filename=merged_filename
        )

    except Exception as e:
        print(f"Merge error: {e}")
        raise HTTPException(status_code=500, detail=f"Merge failed: {str(e)}")
    
    finally:
        # Cleanup input files
        for path in temp_files:
            cleanup_file(path)
