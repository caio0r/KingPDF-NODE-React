@echo off
cd /d "C:\KINGPDF\KingPDF-NODE-React\backend"
"C:\Users\ccmota\AppData\Local\Programs\Python\Python312\python.exe" -m uvicorn main:app --host 0.0.0.0 --port 7070
