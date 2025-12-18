from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import shutil
import os
import tabula
import pandas as pd
from core.utils import cleanup_file

router = APIRouter()

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

@router.post("/pdf-to-excel")
async def pdf_to_excel(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a PDF.")

    input_path = os.path.join(UPLOAD_DIR, f"excel_in_{file.filename}")
    output_filename = f"{os.path.splitext(file.filename)[0]}.xlsx"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    try:
        # Save uploaded file
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Extract tables from PDF using tabula
        # pages='all' will extract from all pages
        # multiple_tables=True returns a list of DataFrames
        dfs = tabula.read_pdf(input_path, pages='all', multiple_tables=True)

        if not dfs or len(dfs) == 0:
            raise HTTPException(status_code=400, detail="No tables found in the PDF.")

        # Create Excel writer
        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
            # If single table found, save to single sheet
            if len(dfs) == 1:
                dfs[0].to_excel(writer, sheet_name='Sheet1', index=False)
            else:
                # Multiple tables - save each to a separate sheet
                for idx, df in enumerate(dfs):
                    sheet_name = f'Table_{idx+1}'
                    df.to_excel(writer, sheet_name=sheet_name, index=False)

        background_tasks.add_task(cleanup_file, output_path)

        return FileResponse(
            output_path, 
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
            filename=output_filename
        )

    except Exception as e:
        print(f"Conversion error: {e}")
        raise HTTPException(status_code=500, detail=f"Conversion failed: {str(e)}")
    
    finally:
        cleanup_file(input_path)
