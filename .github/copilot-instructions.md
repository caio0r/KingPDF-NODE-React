# AI Coding Agent Instructions for KingPDF

## Architecture Overview
- **Backend**: FastAPI (Python) serving PDF manipulation APIs on port 8999 (production) or 8000 (Docker dev). Endpoints in `backend/api/endpoints/` handle conversions, compression, etc.
- **Frontend**: Next.js 16 (TypeScript) on port 4040 (production) or 3000 (Docker dev). Uses `GenericConverterPage` component for upload/convert/download flows.
- **Integration**: Frontend calls backend via axios; CORS configured for localhost origins. API base URL set via `NEXT_PUBLIC_API_URL` (e.g., `http://localhost:8999`).

## Key Patterns
- **File Processing**: Upload to `uploads/`, process with libraries (PyMuPDF, pdf2docx, etc.), output to `outputs/`, return `FileResponse`, cleanup with `BackgroundTasks`. See `backend/api/endpoints/compress.py`.
- **Frontend Converters**: Extend `GenericConverterPage` with props for endpoint, formats, icons. Handles state, progress simulation, error display. See `frontend/app/convert/pdf-to-word/page.tsx`.
- **Dependencies**: Backend uses `pikepdf`, `PyMuPDF`, `pdf2docx` for PDF ops; frontend uses `axios`, `framer-motion`, `react-pdf` for UI.

## Developer Workflows
- **Local Dev**: Run `START_APP.bat` for Docker setup (backend on 8999, frontend on 3000). Or manual: `cd backend && uvicorn main:app --port 8999`; `cd frontend && npm run dev` (port 4040).
- **Testing**: Backend uses `pytest`; run `pytest` in `backend/`. Frontend: `npm run lint` for ESLint.
- **Build/Deploy**: Docker Compose for containerized deployment. Manual PM2 for Windows production. See `MANUAL_INSTALL.md`, `docker-compose.yml`.

## Conventions
- **Error Handling**: Raise `HTTPException` in backend; display user-friendly messages in frontend.
- **File Extensions**: Validate uploads (e.g., `.pdf` only); set result extensions (e.g., `.docx`).
- **Cleanup**: Always use `core/utils.py` `cleanup_file` for temp files.
- **Routing**: Backend prefixes like `/convert`, `/compress`; frontend pages in `app/` subdirs.

## Examples
- Adding converter: Create endpoint in `backend/api/endpoints/`, include router in `main.py`, add frontend page using `GenericConverterPage`.
- PDF Compression: Rasterize pages to JPEG at 72 DPI, rebuild PDF. See `compress.py` for bug-proof method.