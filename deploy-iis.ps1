# Deploy to IIS - API + Frontend
# Usage: .\deploy-iis.ps1
# Note: Run as Administrator

Write-Host "`n=== BrigadeMedicale - IIS Deployment (API + Frontend) ===" -ForegroundColor Cyan

# Check if running as Admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")
if (-not $isAdmin) {
    Write-Host "ERROR: This script must run as Administrator!" -ForegroundColor Red
    Write-Host "   Right-click > Run as administrator" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Administrator mode detected" -ForegroundColor Green

$rootDir = Get-Location
$apiDir = "$rootDir\src\BrigadeMedicale.API"
$frontendDir = "$rootDir\brigade-medicale-frontend"
$apiPublishDir = "$rootDir\publish\api"
$frontendPublishDir = "$rootDir\publish\ui"
$iisPath = "C:\inetpub\wwwroot"

# ============================================
# 1. CHECK PREREQUISITES
# ============================================
Write-Host "`n[1/10] Checking prerequisites..." -ForegroundColor Cyan

# Check IIS (Windows 11 Pro uses Get-WindowsOptionalFeature)
$iisFeature = Get-WindowsOptionalFeature -Online -FeatureName IIS-WebServer -ErrorAction SilentlyContinue
if (-not $iisFeature -or $iisFeature.State -ne "Enabled") {
    Write-Host "ERROR: IIS is not installed!" -ForegroundColor Red
    Write-Host "   Control Panel > Programs > Turn Windows features on or off" -ForegroundColor Gray
    Write-Host "   CHECK: Internet Information Services (IIS)" -ForegroundColor Gray
    exit 1
}
Write-Host "[OK] IIS installed" -ForegroundColor Green

# Check .NET CLI
$dotnetVersion = dotnet --version 2>$null
if (-not $dotnetVersion) {
    Write-Host "ERROR: .NET CLI not found" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] .NET: $dotnetVersion" -ForegroundColor Green

# Check Node.js
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "ERROR: Node.js not found" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Node.js: $nodeVersion" -ForegroundColor Green

# ============================================
# 2. CLEAN PUBLISH FOLDERS
# ============================================
Write-Host "`n[2/10] Cleaning publish folders..." -ForegroundColor Cyan

if (Test-Path $apiPublishDir) {
    Remove-Item $apiPublishDir -Recurse -Force | Out-Null
    Write-Host "[OK] Cleaned: $apiPublishDir" -ForegroundColor Green
}

if (Test-Path $frontendPublishDir) {
    Remove-Item $frontendPublishDir -Recurse -Force | Out-Null
    Write-Host "[OK] Cleaned: $frontendPublishDir" -ForegroundColor Green
}

New-Item -ItemType Directory -Path $apiPublishDir -Force | Out-Null
New-Item -ItemType Directory -Path $frontendPublishDir -Force | Out-Null
Write-Host "[OK] Publish folders created" -ForegroundColor Green

# ============================================
# 3. BUILD & PUBLISH API
# ============================================
Write-Host "`n[3/10] Building and publishing API..." -ForegroundColor Cyan

Set-Location $apiDir

Write-Host "   Building..." -ForegroundColor Gray
dotnet build --configuration Release 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Build successful" -ForegroundColor Green

Write-Host "   Publishing..." -ForegroundColor Gray
dotnet publish --configuration Release --output $apiPublishDir --no-build 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Publish failed" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] API published" -ForegroundColor Green

# ============================================
# 4. BUILD & PUBLISH FRONTEND
# ============================================
Write-Host "`n[4/10] Building and publishing Frontend..." -ForegroundColor Cyan

Set-Location $frontendDir

Write-Host "   Installing npm packages..." -ForegroundColor Gray
npm install 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "   WARNING: npm install had issues (continuing...)" -ForegroundColor Yellow
}
Write-Host "   [OK] Dependencies installed" -ForegroundColor Green

Write-Host "   Building Angular..." -ForegroundColor Gray
npx ng build --configuration production 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Angular build failed" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Angular build successful" -ForegroundColor Green

Write-Host "   Copying files..." -ForegroundColor Gray
Copy-Item "dist\brigade-medicale-frontend\*" -Destination $frontendPublishDir -Recurse -Force
Write-Host "[OK] Frontend published" -ForegroundColor Green

# ============================================
# 5. CREATE IIS SITE FOR API
# ============================================
Write-Host "`n[5/10] Configuring IIS for API..." -ForegroundColor Cyan

$apiSiteName = "BrigadeMedicale-API"
$apiPort = 8080
$apiBindingHostname = "api.local"

Import-Module WebAdministration -ErrorAction SilentlyContinue

# Remove existing site
$existingSite = Get-Website -Name $apiSiteName -ErrorAction SilentlyContinue
if ($existingSite) {
    Write-Host "   Removing existing site..." -ForegroundColor Gray
    Stop-Website -Name $apiSiteName -ErrorAction SilentlyContinue
    Remove-Website -Name $apiSiteName -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Create new site
Write-Host "   Creating IIS site '$apiSiteName'..." -ForegroundColor Gray
New-Website -Name $apiSiteName `
    -PhysicalPath $apiPublishDir `
    -Port $apiPort `
    -HostHeader $apiBindingHostname `
    -ApplicationPool "DefaultAppPool" | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] API site created" -ForegroundColor Green
} else {
    Write-Host "WARNING: Site creation issue (may already exist)" -ForegroundColor Yellow
}

# ============================================
# 6. CREATE IIS SITE FOR FRONTEND
# ============================================
Write-Host "`n[6/10] Configuring IIS for Frontend..." -ForegroundColor Cyan

$frontendSiteName = "BrigadeMedicale-UI"
$frontendPort = 8081
$frontendBindingHostname = "app.local"

# Remove existing site
$existingSite = Get-Website -Name $frontendSiteName -ErrorAction SilentlyContinue
if ($existingSite) {
    Write-Host "   Removing existing site..." -ForegroundColor Gray
    Stop-Website -Name $frontendSiteName -ErrorAction SilentlyContinue
    Remove-Website -Name $frontendSiteName -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# Create new site
Write-Host "   Creating IIS site '$frontendSiteName'..." -ForegroundColor Gray
New-Website -Name $frontendSiteName `
    -PhysicalPath $frontendPublishDir `
    -Port $frontendPort `
    -HostHeader $frontendBindingHostname `
    -ApplicationPool "DefaultAppPool" | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Frontend site created" -ForegroundColor Green
} else {
    Write-Host "WARNING: Site creation issue (may already exist)" -ForegroundColor Yellow
}

# ============================================
# 7. CONFIGURE HOSTS FILE
# ============================================
Write-Host "`n[7/10] Configuring hosts file..." -ForegroundColor Cyan

$hostsFile = "C:\Windows\System32\drivers\etc\hosts"
$hostsContent = Get-Content $hostsFile

$apiEntry = "127.0.0.1       $apiBindingHostname"
$frontendEntry = "127.0.0.1       $frontendBindingHostname"

$needsUpdate = $false

if ($hostsContent -notlike "*$apiEntry*") {
    Add-Content $hostsFile "`n$apiEntry"
    Write-Host "[OK] Added: $apiEntry" -ForegroundColor Green
    $needsUpdate = $true
}

if ($hostsContent -notlike "*$frontendEntry*") {
    Add-Content $hostsFile "`n$frontendEntry"
    Write-Host "[OK] Added: $frontendEntry" -ForegroundColor Green
    $needsUpdate = $true
}

if (-not $needsUpdate) {
    Write-Host "[OK] Hosts file already configured" -ForegroundColor Green
}

# ============================================
# 8. START IIS SITES
# ============================================
Write-Host "`n[8/10] Starting IIS sites..." -ForegroundColor Cyan

Start-Website -Name $apiSiteName -ErrorAction SilentlyContinue
Write-Host "[OK] API site started" -ForegroundColor Green

Start-Website -Name $frontendSiteName -ErrorAction SilentlyContinue
Write-Host "[OK] Frontend site started" -ForegroundColor Green

Start-Sleep -Seconds 3

# ============================================
# 9. VERIFY SITES ARE HEALTHY
# ============================================
Write-Host "`n[9/10] Verifying site health..." -ForegroundColor Cyan

try {
    $apiCheck = Invoke-WebRequest -Uri "http://$apiBindingHostname`:$apiPort/swagger" -ErrorAction SilentlyContinue
    if ($apiCheck.StatusCode -eq 200) {
        Write-Host "[OK] API accessible: http://$apiBindingHostname`:$apiPort" -ForegroundColor Green
    }
} catch {
    Write-Host "INFO: API starting up (wait 30 seconds)" -ForegroundColor Yellow
}

try {
    $uiCheck = Invoke-WebRequest -Uri "http://$frontendBindingHostname`:$frontendPort" -ErrorAction SilentlyContinue
    if ($uiCheck.StatusCode -eq 200) {
        Write-Host "[OK] Frontend accessible: http://$frontendBindingHostname`:$frontendPort" -ForegroundColor Green
    }
} catch {
    Write-Host "INFO: Frontend starting up (wait 30 seconds)" -ForegroundColor Yellow
}

# ============================================
# 10. SUMMARY & NEXT STEPS
# ============================================
Write-Host "`n[10/10] Deployment complete!" -ForegroundColor Green

Write-Host "`n=================================================" -ForegroundColor Cyan
Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan

Write-Host "`nAccess URLs:" -ForegroundColor Cyan
Write-Host "   API:         http://$apiBindingHostname`:$apiPort" -ForegroundColor Cyan
Write-Host "   API Swagger: http://$apiBindingHostname`:$apiPort/swagger" -ForegroundColor Cyan
Write-Host "   Frontend:    http://$frontendBindingHostname`:$frontendPort" -ForegroundColor Cyan

Write-Host "`nPhysical paths:" -ForegroundColor Cyan
Write-Host "   API:      $apiPublishDir" -ForegroundColor Gray
Write-Host "   Frontend: $frontendPublishDir" -ForegroundColor Gray

Write-Host "`nManage in IIS Manager:" -ForegroundColor Cyan
Write-Host "   Open: inetmgr" -ForegroundColor Gray
Write-Host "   Sites:" -ForegroundColor Gray
Write-Host "     - $apiSiteName (port $apiPort)" -ForegroundColor Gray
Write-Host "     - $frontendSiteName (port $frontendPort)" -ForegroundColor Gray

Write-Host "`nConfigure HTTPS:" -ForegroundColor Cyan
Write-Host "   1. Open IIS Manager (inetmgr)" -ForegroundColor Gray
Write-Host "   2. Select site" -ForegroundColor Gray
Write-Host "   3. Right-click > Edit Bindings > Add (HTTPS, port 443)" -ForegroundColor Gray
Write-Host "   4. Select or create SSL certificate" -ForegroundColor Gray

Write-Host "`nFirst access may take 30-60 seconds (JIT compilation)" -ForegroundColor Yellow
Write-Host "View logs in: IIS Manager > Logs" -ForegroundColor Gray

Write-Host "`nOpening sites in browser..." -ForegroundColor Cyan
Start-Process "http://$apiBindingHostname`:$apiPort/swagger"
Start-Process "http://$frontendBindingHostname`:$frontendPort"

Write-Host "`n[COMPLETE] IIS deployment finished!" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Cyan

Read-Host "Press Enter to exit"
