# Script PowerShell pour identifier et arrêter les processus utilisant le port 5238.
# Usage: Exécuter PowerShell en administrateur et lancer .\kill_port_5238.ps1
param(
    [int]$Port = 5238
)

Write-Host "Recherche de processus utilisant le port $Port..."
$connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
if (-not $connections) {
    Write-Host "Aucun processus n'utilise le port $Port." -ForegroundColor Green
    exit 0
}

$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

Write-Host "Processus trouvés :"
foreach ($pid in $pids) {
    $proc = Get-Process -Id $pid -ErrorAction SilentlyContinue
    $cim = Get-CimInstance Win32_Process -Filter "ProcessId=$pid" -ErrorAction SilentlyContinue
    $path = $cim.ExecutablePath
    Write-Host "PID: $pid  Name: $($proc.ProcessName)  Path: $path"
}

$confirm = Read-Host "Voulez-vous arrêter ces processus ? (o/N)"
if ($confirm -match '^[oO]') {
    foreach ($pid in $pids) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction Stop
            Write-Host "Processus $pid arrêté." -ForegroundColor Yellow
        }
        catch {
            Write-Host "Impossible d'arrêter le processus $pid : $_" -ForegroundColor Red
        }
    }
    Write-Host "Vérification du port..."
    Start-Sleep -Seconds 1
    Get-NetTCPConnection -LocalPort $Port | Format-Table -AutoSize
} else {
    Write-Host "Aucune action effectuée." -ForegroundColor Cyan
}
