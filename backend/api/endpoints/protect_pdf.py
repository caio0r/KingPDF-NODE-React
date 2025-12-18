from fastapi import APIRouter, UploadFile, File, HTTPException, Form, BackgroundTasks
from fastapi.responses import FileResponse
import shutil
import os
import pikepdf
from core.utils import cleanup_file

router = APIRouter()

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

@router.post("/protect-pdf")
async def protect_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    password: str = Form(...)
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")
    
    if not password or len(password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters long.")

    input_path = os.path.join(UPLOAD_DIR, f"protect_in_{file.filename}")
    output_filename = f"{os.path.splitext(file.filename)[0]}_protected.pdf"
    output_path = os.path.join(OUTPUT_DIR, output_filename)
    
    # Ensure directories exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    try:
        # Save uploaded file
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"Protecting PDF: {file.filename} with password")
        
        # Open the PDF with pikepdf
        with pikepdf.open(input_path) as pdf:
            # Save with password protection
            # R=6 means AES-256 encryption (most secure)
            pdf.save(
                output_path,
                encryption=pikepdf.Encryption(
                    user=password,
                    owner=password,
                    R=6  # AES-256
                )
            )
        
        print(f"PDF protected successfully: {output_filename}")
        
        # Check if file was created
        if not os.path.exists(output_path):
            raise HTTPException(status_code=500, detail="Protected file could not be created.")
        
        file_size = os.path.getsize(output_path)
        print(f"Protected PDF size: {file_size} bytes")
        
        background_tasks.add_task(cleanup_file, output_path)

        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename=output_filename
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Protection error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao proteger: {str(e)}")
    
    finally:
        # Clean up input file
        try:
            cleanup_file(input_path)
        except:
            pass
