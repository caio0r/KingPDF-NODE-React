@echo off
cd /d "%~dp0frontend"
"C:\Program Files\nodejs\node.exe" node_modules\next\dist\bin\next start -p 3000 -H 0.0.0.0
