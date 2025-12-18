from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
import os
import shutil
import io
import logging

import fitz  # PyMuPDF
from PIL import Image

from core.utils import cleanup_file

router = APIRouter()

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"


@router.post("/compress-pdf")
async def compress_pdf(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Compressão "à prova de bug":
    - Renderiza cada página como imagem
    - Reduz DPI e aplica JPEG
    - Reconstrói um novo PDF só com essas imagens
    """
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Please upload a PDF.",
        )

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    input_path = os.path.join(UPLOAD_DIR, f"compress_in_{file.filename}")
    output_filename = f"compressed_{file.filename}"
    output_path = os.path.join(OUTPUT_DIR, output_filename)

    # parâmetros de compressão
    TARGET_DPI = 72          # 72 dpi ≈ resolução de tela, já reduz bem
    JPEG_QUALITY = 70        # 0–100 (60 = bem comprimido, ainda legível)

    try:
        # salva upload
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        original_size = os.path.getsize(input_path)
        logging.info(f"[PDF COMPRESS] Original size: {original_size} bytes")

        # abre PDF de origem
        src_doc = fitz.open(input_path)
        dst_doc = fitz.open()  # novo PDF

        # 72 pontos = 1 polegada; usamos isso pra controlar DPI
        zoom = TARGET_DPI / 72.0
        matrix = fitz.Matrix(zoom, zoom)

        for page_index in range(len(src_doc)):
            page = src_doc[page_index]

            # renderiza a página como bitmap (sem alpha)
            pix = page.get_pixmap(matrix=matrix, alpha=False)

            # PyMuPDF -> PIL
            img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

            # exporta como JPEG comprimido em memória
            img_buf = io.BytesIO()
            img.save(
                img_buf,
                format="JPEG",
                quality=JPEG_QUALITY,
                optimize=True,
            )
            img_bytes = img_buf.getvalue()

            # cria nova página com o MESMO tamanho em pontos do original
            new_page = dst_doc.new_page(
                width=page.rect.width,
                height=page.rect.height,
            )

            # coloca a imagem ocupando a página inteira
            new_page.insert_image(new_page.rect, stream=img_bytes)

        # salva o PDF comprimido (sem fallback pro original)
        dst_doc.save(output_path)
        dst_doc.close()
        src_doc.close()

        compressed_size = os.path.getsize(output_path)
        logging.info(
            f"[PDF COMPRESS] Compressed size: {compressed_size} bytes "
            f"({compressed_size / original_size:.2%} do original)"
        )

        background_tasks.add_task(cleanup_file, output_path)

        return FileResponse(
            output_path,
            media_type="application/pdf",
            filename=output_filename,
        )

    except Exception as e:
        logging.error(f"[PDF COMPRESS] Fatal error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        cleanup_file(input_path)
