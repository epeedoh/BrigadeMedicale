#!/usr/bin/env pwsh

# ==================== CONFIGURATION ====================
$prefix = 'brigademed'
$environment = 'dev'
$location = 'francecentral'
$resourceGroupName = "rg-${prefix}-${environment}"
$bicepFile = Join-Path $PSScriptRoot 'main.bicep'
$paramsFile = Join-Path $PSScriptRoot 'params' 'dev.bicepparam'

# ==================== VALIDATION ====================
if (-not (Test-Path $bicepFile)) {
    Write-Error "Bicep file not found: $bicepFile"
    exit 1
}

if (-not (Test-Path $paramsFile)) {
    Write-Error "Params file not found: $paramsFile"
    exit 1
}

Write-Host "🚀 BrigadeMedicale Azure Deployment (DEV)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Resource Group: $resourceGroupName" -ForegroundColor Yellow
Write-Host "Location: $location" -ForegroundColor Yellow
Write-Host ""

# ==================== CHECK AZURE CLI ====================
if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI not found. Install from https://aka.ms/cli"
    exit 1
}

$azVersion = az version --output json | ConvertFrom-Json
Write-Host "✅ Azure CLI version: $($azVersion.'azure-cli')" -ForegroundColor Green

# ==================== GET SQL PASSWORD ====================
Write-Host ""
Write-Host "📝 SQL Admin Password required" -ForegroundColor Cyan
$sqlPassword = Read-Host "Enter SQL admin password (min 8 chars, uppercase+digits+special)" -AsSecureString
$sqlPasswordPlain = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($sqlPassword))

if ($sqlPasswordPlain.Length -lt 8) {
    Write-Error "Password must be at least 8 characters"
    exit 1
}

# ==================== CREATE RESOURCE GROUP ====================
Write-Host ""
Write-Host "📦 Creating resource group: $resourceGroupName" -ForegroundColor Cyan
az group create `
    --name $resourceGroupName `
    --location $location `
    --tags env=dev project=BrigadeMedicale owner=student | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to create resource group"
    exit 1
}
Write-Host "✅ Resource group created" -ForegroundColor Green

# ==================== DEPLOY BICEP ====================
Write-Host ""
Write-Host "🔨 Deploying infrastructure (Bicep)..." -ForegroundColor Cyan
$deployment = az deployment group create `
    --resource-group $resourceGroupName `
    --template-file $bicepFile `
    --parameters `
        prefix=$prefix `
        environment=$environment `
        location=$location `
        sqlAdminPassword=$sqlPasswordPlain `
    --output json | ConvertFrom-Json

if ($LASTEXITCODE -ne 0) {
    Write-Error "Deployment failed"
    exit 1
}

Write-Host "✅ Infrastructure deployed successfully" -ForegroundColor Green

# ==================== EXTRACT OUTPUTS ====================
Write-Host ""
Write-Host "📊 Deployment Outputs:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$outputs = $deployment.properties.outputs

$staticWebAppUrl = $outputs.staticWebAppUrl.value
$apiUrl = $outputs.apiUrl.value
$sqlServerFqdn = $outputs.sqlServerFqdn.value
$sqlDatabaseName = $outputs.sqlDatabaseName.value
$sqlServerName = $outputs.sqlServerName.value
$connectionStringTemplate = $outputs.connectionStringTemplate.value

Write-Host ""
Write-Host "🌐 Frontend (Static Web App):" -ForegroundColor Green
Write-Host "   URL: $staticWebAppUrl" -ForegroundColor White
Write-Host ""
Write-Host "⚙️  Backend API:" -ForegroundColor Green
Write-Host "   URL: $apiUrl" -ForegroundColor White
Write-Host ""
Write-Host "🗄️  SQL Database:" -ForegroundColor Green
Write-Host "   Server: $sqlServerFqdn" -ForegroundColor White
Write-Host "   Database: $sqlDatabaseName" -ForegroundColor White
Write-Host "   Admin: sqladmin" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Connection String:" -ForegroundColor Yellow
Write-Host "   $connectionStringTemplate" -ForegroundColor Gray
Write-Host ""

# ==================== NEXT STEPS ====================
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "1️⃣  Update App Service connection string (already configured)" -ForegroundColor White
Write-Host "2️⃣  Run EF migrations:" -ForegroundColor White
Write-Host "   dotnet ef database update --project ./src/BrigadeMedicale.Infrastructure" -ForegroundColor Gray
Write-Host "3️⃣  Deploy API code:" -ForegroundColor White
Write-Host "   az webapp deployment source config-zip --resource-group $resourceGroupName --name ${prefix}-${environment}-api --src app.zip" -ForegroundColor Gray
Write-Host "4️⃣  Deploy frontend (GitHub Actions from SWA settings)" -ForegroundColor White
Write-Host ""

# ==================== SAVE OUTPUTS ====================
$outputsFile = Join-Path $PSScriptRoot '.deployment-outputs.json'
$deploymentInfo = @{
    timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    resourceGroup = $resourceGroupName
    staticWebAppUrl = $staticWebAppUrl
    apiUrl = $apiUrl
    sqlServerFqdn = $sqlServerFqdn
    sqlDatabaseName = $sqlDatabaseName
    sqlServerName = $sqlServerName
}

$deploymentInfo | ConvertTo-Json | Set-Content $outputsFile
Write-Host "💾 Outputs saved to: .deployment-outputs.json" -ForegroundColor Cyan

Write-Host ""
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
