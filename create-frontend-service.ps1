$serviceName = 'KingPDFFrontend'
$nodePath = 'C:\Program Files\nodejs\node.exe'
$nextCliPath = 'C:\KINGPDF\KingPDF-NODE-React\frontend\node_modules\next\dist\bin\next'
$frontendDir = 'C:\KINGPDF\KingPDF-NODE-React\frontend'

$binary = '"' + $nodePath + '" "' + $nextCliPath + '" start "' + $frontendDir + '" -p 3000 -H 0.0.0.0'

Write-Output ("Creating service {0} with binary: {1}" -f $serviceName, $binary)

if (Get-Service -Name $serviceName -ErrorAction SilentlyContinue) {
    Write-Output "Service exists - removing existing service..."
    try { Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue } catch {}
    sc.exe delete $serviceName | Out-Null
    Start-Sleep -Seconds 1
}

try {
    New-Service -Name $serviceName -BinaryPathName $binary -DisplayName 'KingPDF Frontend' -StartupType Automatic
    Write-Output "Service created. Starting service..."
    Start-Service -Name $serviceName
    Start-Sleep -Seconds 3
    $s = Get-Service -Name $serviceName
    Write-Output "Service status: $($s.Status)"
} catch {
    Write-Error "Failed to create/start service: $_"
    exit 1
}
