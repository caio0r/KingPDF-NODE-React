Write-Output "Creating Scheduled Tasks (SYSTEM) to run frontend and backend at startup"

$frontendAction = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c "cd /d C:\KINGPDF\KingPDF-NODE-React\frontend && ""C:\Program Files\nodejs\node.exe"" node_modules\\next\\dist\\bin\\next start -p 3000 -H 0.0.0.0"'
$backendAction = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument '/c "cd /d C:\KINGPDF\KingPDF-NODE-React\backend && ""C:\Users\ccmota\AppData\Local\Programs\Python\Python312\python.exe"" -m uvicorn main:app --host 0.0.0.0 --port 7070"'

$principal = New-ScheduledTaskPrincipal -UserId "NT AUTHORITY\\SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask -TaskName 'KingPDF Frontend' -Action $frontendAction -Trigger (New-ScheduledTaskTrigger -AtStartup) -Principal $principal -Force
Register-ScheduledTask -TaskName 'KingPDF Backend'  -Action $backendAction  -Trigger (New-ScheduledTaskTrigger -AtStartup) -Principal $principal -Force

Start-ScheduledTask -TaskName 'KingPDF Frontend' -ErrorAction SilentlyContinue
Start-ScheduledTask -TaskName 'KingPDF Backend' -ErrorAction SilentlyContinue

netsh advfirewall firewall add rule name="KingPDF Frontend" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="KingPDF Backend" dir=in action=allow protocol=TCP localport=7070

Start-Sleep -Seconds 4
try { (Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5).StatusCode; Write-Output 'FR_OK' } catch { Write-Output 'FR_FAIL' }
try { (Invoke-WebRequest -Uri 'http://localhost:7070' -UseBasicParsing -TimeoutSec 5).StatusCode; Write-Output 'BE_OK' } catch { Write-Output 'BE_FAIL' }
