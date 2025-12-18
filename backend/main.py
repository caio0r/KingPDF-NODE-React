from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.endpoints import compress, split, merge, pdf_to_pptx, pdf_to_excel, word_to_pdf, pptx_to_pdf, excel_to_pdf, pdf_to_jpg, protect_pdf, pdf_to_word, edit_pdf

app = FastAPI(title="PDF Tools API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers

app.include_router(compress.router, prefix="/compress", tags=["compress"])
app.include_router(split.router, prefix="/split", tags=["split"])
app.include_router(merge.router, prefix="/merge", tags=["merge"])
app.include_router(pdf_to_pptx.router, prefix="/convert", tags=["convert"])
app.include_router(pdf_to_excel.router, prefix="/convert", tags=["convert"])
app.include_router(word_to_pdf.router, prefix="/convert", tags=["convert"])
app.include_router(pptx_to_pdf.router, prefix="/convert", tags=["convert"])
app.include_router(excel_to_pdf.router, prefix="/convert", tags=["convert"])
app.include_router(pdf_to_jpg.router, prefix="/convert", tags=["convert"])
app.include_router(protect_pdf.router, prefix="/protect", tags=["protect"])
app.include_router(pdf_to_word.router, prefix="/convert", tags=["convert"])
app.include_router(edit_pdf.router, prefix="/convert", tags=["edit"])

@app.get("/")
async def root():
    return {"message": "Welcome to PDF Tools API"}
