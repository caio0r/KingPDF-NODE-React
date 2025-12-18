from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import shutil
import os
import fitz  # PyMuPDF
from PIL import Image
import zipfile
import io
from core.utils import cleanup_file

router = APIRouter()

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

@router.post("/pdf-to-jpg")
def pdf_to_jpg(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    input_path = os.path.join(UPLOAD_DIR, f"jpg_in_{file.filename}")
    base_name = os.path.splitext(file.filename)[0]
    
    # Ensure directories exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    try:
        # Save uploaded file
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print(f"Converting PDF: {file.filename}")
        
        # Open PDF with PyMuPDF
        pdf_document = fitz.open(input_path)
        total_pages = len(pdf_document)
        
        print(f"PDF has {total_pages} pages")
        
        # Create list to store image paths
        image_paths = []
        
        # Convert each page to JPG
        for page_num in range(total_pages):
            try:
                page = pdf_document[page_num]
                
                # Render page to image with high quality (3x zoom for better quality)
                mat = fitz.Matrix(3, 3)  # 3x zoom for better quality
                pix = page.get_pixmap(matrix=mat)
                
                print(f"Page {page_num + 1} rendered: {pix.width}x{pix.height}")
                
                # Convert to PIL Image
                img_data = pix.tobytes("png")
                img = Image.open(io.BytesIO(img_data))
                
                # Convert to RGB (remove alpha channel if present)
                if img.mode in ('RGBA', 'LA', 'P'):
                    rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'RGBA':
                        rgb_img.paste(img, mask=img.split()[3])
                    else:
                        rgb_img.paste(img)
                    img = rgb_img
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Save as JPG
                jpg_path = os.path.join(OUTPUT_DIR, f"{base_name}_page_{page_num + 1}.jpg")
                img.save(jpg_path, 'JPEG', quality=95, optimize=True)
                image_paths.append(jpg_path)
                
                print(f"Saved JPG: {jpg_path}")
                
            except Exception as page_error:
                print(f"Error converting page {page_num + 1}: {page_error}")
                raise
        
        pdf_document.close()
        
        if not image_paths:
            raise HTTPException(status_code=500, detail="No pages could be converted")
        
        # If single page, return the JPG directly
        if total_pages == 1:
            output_path = image_paths[0]
            output_filename = f"{base_name}.jpg"
            
            # Check if file exists
            if not os.path.exists(output_path):
                raise HTTPException(status_code=500, detail="Converted file not found")
            
            file_size = os.path.getsize(output_path)
            print(f"Returning single JPG: {output_filename} ({file_size} bytes)")
            
            background_tasks.add_task(cleanup_file, output_path)

            return FileResponse(
                output_path,
                media_type="image/jpeg",
                filename=output_filename
            )
        else:
            # Multiple pages - create a ZIP file
            zip_filename = f"{base_name}_images.zip"
            zip_path = os.path.join(OUTPUT_DIR, zip_filename)
            
            print(f"Creating ZIP with {len(image_paths)} images")
            
            with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                for img_path in image_paths:
                    zipf.write(img_path, os.path.basename(img_path))
            
            # Clean up individual JPG files after creating ZIP
            for img_path in image_paths:
                try:
                    cleanup_file(img_path)
                except:
                    pass
            
            zip_size = os.path.getsize(zip_path)
            print(f"Returning ZIP: {zip_filename} ({zip_size} bytes)")
            
            background_tasks.add_task(cleanup_file, zip_path)

            return FileResponse(
                zip_path,
                media_type="application/zip",
                filename=zip_filename
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"Conversion error: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")
    
    finally:
        # Clean up input file
        try:
            cleanup_file(input_path)
        except:
            pass
