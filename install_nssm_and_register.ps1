$zip = Join-Path $env:TEMP 'nssm.zip'
$out = Join-Path $env:TEMP 'nssm'

Write-Output "Downloading NSSM to $zip..."
Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile $zip -UseBasicParsing

if (Test-Path $out) { Remove-Item -Recurse -Force $out }
Expand-Archive -Path $zip -DestinationPath $out -Force

$n = Get-ChildItem -Path $out -Recurse -Filter 'nssm.exe' | Sort-Object FullName | Select-Object -Last 1
if (-not $n) { Write-Error 'nssm not found'; exit 1 }
$nssm = $n.FullName
Write-Output "Using nssm: $nssm"

# Frontend service
& $nssm install KingPDFFrontend 'C:\Program Files\nodejs\node.exe' 'node_modules\next\dist\bin\next start -p 3000 -H 0.0.0.0'
& $nssm set KingPDFFrontend AppDirectory 'C:\KINGPDF\KingPDF-NODE-React\frontend'
& $nssm set KingPDFFrontend AppStdout "$env:USERPROFILE\.pm2\logs\kingpdf-frontend-out.log"
& $nssm set KingPDFFrontend AppStderr "$env:USERPROFILE\.pm2\logs\kingpdf-frontend-error.log"

# Backend service
& $nssm install KingPDFBackend 'C:\Users\ccmota\AppData\Local\Programs\Python\Python312\python.exe'
& $nssmPath set KingPDFBackend AppParameters "-m uvicorn main:app --host 0.0.0.0 --port 7070"
& $nssm set KingPDFBackend AppDirectory 'C:\KINGPDF\KingPDF-NODE-React\backend'
& $nssm set KingPDFBackend AppStdout "$env:USERPROFILE\.pm2\logs\kingpdf-backend-out.log"
& $nssm set KingPDFBackend AppStderr "$env:USERPROFILE\.pm2\logs\kingpdf-backend-error.log"

# Start services
& $nssm start KingPDFFrontend
& $nssm start KingPDFBackend

# Firewall rules
netsh advfirewall firewall add rule name="KingPDF Frontend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="KingPDF Backend" dir=in action=allow protocol=TCP localport=8999

Start-Sleep -Seconds 3

try { (Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5).StatusCode; Write-Output 'FR_OK' } catch { Write-Output 'FR_FAIL' }
try { (Invoke-WebRequest -Uri 'http://localhost:8999' -UseBasicParsing -TimeoutSec 5).StatusCode; Write-Output 'BE_OK' } catch { Write-Output 'BE_FAIL' }
