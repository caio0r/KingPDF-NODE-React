from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import shutil
import os
import zipfile
from pypdf import PdfReader, PdfWriter
from core.utils import cleanup_file
from typing import List

router = APIRouter()

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

def parse_page_range(range_str: str, max_pages: int) -> List[int]:
    """Parses a string like '1-3,5' into a list of 0-indexed page numbers."""
    pages = set()
    parts = range_str.split(',')
    for part in parts:
        part = part.strip()
        if '-' in part:
            start, end = map(int, part.split('-'))
            # Adjust for 1-based index from user input
            pages.update(range(start - 1, end))
        else:
            pages.add(int(part) - 1)
    
    valid_pages = sorted([p for p in pages if 0 <= p < max_pages])
    return valid_pages

@router.post("/split-pdf")
async def split_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    pages: str = Form(...), # e.g., "1-5" or "1,3,5"
    merge: bool = Form(True) # If True, creates one PDF with selected pages. If False, creates separate PDFs.
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    input_path = os.path.join(UPLOAD_DIR, f"split_in_{file.filename}")
    base_filename = os.path.splitext(file.filename)[0]
    
    try:
        # Save uploaded file
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        reader = PdfReader(input_path)
        total_pages = len(reader.pages)
        
        try:
            selected_pages = parse_page_range(pages, total_pages)
        except ValueError:
             raise HTTPException(status_code=400, detail="Invalid page range format.")

        if not selected_pages:
            raise HTTPException(status_code=400, detail="No valid pages selected.")

        if merge:
            # Create a single PDF with selected pages
            writer = PdfWriter()
            for page_num in selected_pages:
                writer.add_page(reader.pages[page_num])
            
            output_filename = f"split_{base_filename}.pdf"
            output_path = os.path.join(OUTPUT_DIR, output_filename)
            
            with open(output_path, "wb") as f:
                writer.write(f)

            background_tasks.add_task(cleanup_file, output_path)
                
            return FileResponse(output_path, media_type="application/pdf", filename=output_filename)
        
        else:
            # Create a ZIP with separate PDFs for each selected page
            zip_filename = f"split_{base_filename}.zip"
            zip_path = os.path.join(OUTPUT_DIR, zip_filename)
            
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for page_num in selected_pages:
                    writer = PdfWriter()
                    writer.add_page(reader.pages[page_num])
                    
                    page_pdf_name = f"{base_filename}_page_{page_num + 1}.pdf"
                    page_pdf_path = os.path.join(OUTPUT_DIR, page_pdf_name)
                    
                    with open(page_pdf_path, "wb") as f:
                        writer.write(f)
                    
                    zipf.write(page_pdf_path, page_pdf_name)
                    os.remove(page_pdf_path) # Clean up individual file after zipping
            
            background_tasks.add_task(cleanup_file, zip_path)

            return FileResponse(zip_path, media_type="application/zip", filename=zip_filename)

    except Exception as e:
        print(f"Split error: {e}")
        raise HTTPException(status_code=500, detail=f"Split failed: {str(e)}")
    
    finally:
        cleanup_file(input_path)
