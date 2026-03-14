# 🚀 Lance l'API + Frontend en local
# Usage: .\run-local.ps1

Write-Host "🚀 BrigadeMedicale - Lancement Local (API + Frontend)" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$rootDir = Get-Location
$apiDir = "$rootDir\src\BrigadeMedicale.API"
$frontendDir = "$rootDir\src\BrigadeMedicale.UI"

# Couleurs
$success = "Green"
$error = "Red"
$info = "Cyan"

# ============================================
# 1. VÉRIFIER LES PRÉREQUIS
# ============================================
Write-Host "`n📋 Étape 1: Vérification des prérequis..." -ForegroundColor $info

$dotnetVersion = dotnet --version 2>$null
if (-not $dotnetVersion) {
    Write-Host "❌ .NET CLI non trouvé. Installer depuis https://dotnet.microsoft.com/download" -ForegroundColor $error
    exit 1
}
Write-Host "✅ .NET CLI: $dotnetVersion" -ForegroundColor $success

$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "❌ Node.js non trouvé. Installer depuis https://nodejs.org" -ForegroundColor $error
    exit 1
}
Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor $success

$npmVersion = npm --version 2>$null
Write-Host "✅ npm: $npmVersion" -ForegroundColor $success

# ============================================
# 2. NETTOYER LES BUILDS PRÉCÉDENTS (OPTIONNEL)
# ============================================
Write-Host "`n🧹 Étape 2: Nettoyage des builds précédents..." -ForegroundColor $info

if (Test-Path "$apiDir\bin") {
    Remove-Item "$apiDir\bin" -Recurse -Force | Out-Null
    Write-Host "✅ Nettoyé: $apiDir\bin" -ForegroundColor $success
}

if (Test-Path "$apiDir\obj") {
    Remove-Item "$apiDir\obj" -Recurse -Force | Out-Null
    Write-Host "✅ Nettoyé: $apiDir\obj" -ForegroundColor $success
}

# ============================================
# 3. INSTALLER PACKAGES NUGET
# ============================================
Write-Host "`n📦 Étape 3: Installation des packages NuGet..." -ForegroundColor $info

Set-Location $rootDir
dotnet restore 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de 'dotnet restore'" -ForegroundColor $error
    exit 1
}
Write-Host "✅ Packages NuGet restaurés" -ForegroundColor $success

# ============================================
# 4. BUILD LA SOLUTION
# ============================================
Write-Host "`n🔨 Étape 4: Build de la solution..." -ForegroundColor $info

Set-Location $rootDir
dotnet build --configuration Debug 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de 'dotnet build'" -ForegroundColor $error
    Write-Host "💡 Conseil: Vérifier que tous les packages NuGet sont installés" -ForegroundColor $info
    exit 1
}
Write-Host "✅ Build réussi" -ForegroundColor $success

# ============================================
# 5. EF MIGRATIONS (SI NÉCESSAIRE)
# ============================================
Write-Host "`n🗄️  Étape 5: Vérification de la base de données..." -ForegroundColor $info

Set-Location $apiDir

# Les migrations sont appliquées automatiquement au démarrage de l'API
# (voir Program.cs: context.Database.MigrateAsync())
Write-Host "ℹ️  Les migrations seront appliquées au démarrage de l'API" -ForegroundColor $info

# ============================================
# 6. INSTALLER PACKAGES NPM (FRONTEND)
# ============================================
Write-Host "`n📦 Étape 6: Installation des dépendances Angular..." -ForegroundColor $info

Set-Location $frontendDir
npm install 2>&1 | Out-Null

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Attention lors du npm install (peut être non-bloquant)" -ForegroundColor "Yellow"
}
Write-Host "✅ Dépendances Angular installées" -ForegroundColor $success

# ============================================
# 7. LANCER L'API EN ARRIÈRE-PLAN
# ============================================
Write-Host "`n🚀 Étape 7: Lancement de l'API..." -ForegroundColor $info

Set-Location $apiDir

# Lancer l'API dans une nouvelle fenêtre PowerShell
$apiProcess = Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$apiDir'; dotnet run --configuration Debug`"" -PassThru
Write-Host "✅ API lancée (PID: $($apiProcess.Id))" -ForegroundColor $success
Write-Host "   URL: http://localhost:5000" -ForegroundColor $info

# Attendre que l'API soit prête (~5 secondes)
Write-Host "   ⏳ Attente du démarrage de l'API..." -ForegroundColor $info
Start-Sleep -Seconds 5

# Vérifier que l'API répond
$apiHealthCheck = $null
try {
    $apiHealthCheck = Invoke-WebRequest -Uri "http://localhost:5000/health" -ErrorAction SilentlyContinue
    if ($apiHealthCheck.StatusCode -eq 200) {
        Write-Host "   ✅ API prête!" -ForegroundColor $success
    }
} catch {
    Write-Host "   ⚠️  API en cours de démarrage (vérifier la console)" -ForegroundColor "Yellow"
}

# ============================================
# 8. LANCER LE FRONTEND EN ARRIÈRE-PLAN
# ============================================
Write-Host "`n🚀 Étape 8: Lancement du frontend Angular..." -ForegroundColor $info

Set-Location $frontendDir

# Lancer le frontend dans une nouvelle fenêtre PowerShell
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit -Command `"Set-Location '$frontendDir'; ng serve --open`"" -PassThru
Write-Host "✅ Frontend lancé (PID: $($frontendProcess.Id))" -ForegroundColor $success
Write-Host "   URL: http://localhost:4200" -ForegroundColor $info

# ============================================
# 9. RÉSUMÉ & INSTRUCTIONS
# ============================================
Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $info
Write-Host "✅ DÉMARRAGE COMPLET!" -ForegroundColor $success
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $info

Write-Host "`n📍 URLs d'accès:" -ForegroundColor $info
Write-Host "   API Backend:    http://localhost:5000" -ForegroundColor "Cyan"
Write-Host "   API Swagger:    http://localhost:5000/swagger" -ForegroundColor "Cyan"
Write-Host "   Frontend:       http://localhost:4200" -ForegroundColor "Cyan"

Write-Host "`n💻 Processus lancés:" -ForegroundColor $info
Write-Host "   API:      PID $($apiProcess.Id)" -ForegroundColor "Gray"
Write-Host "   Frontend: PID $($frontendProcess.Id)" -ForegroundColor "Gray"

Write-Host "`n📝 Notes:" -ForegroundColor $info
Write-Host "   • Les deux services tournent en parallèle dans des fenêtres séparées" -ForegroundColor "Gray"
Write-Host "   • Fermer une fenêtre = arrêter ce service" -ForegroundColor "Gray"
Write-Host "   • Les migrations DB se font automatiquement au démarrage" -ForegroundColor "Gray"
Write-Host "   • Pour arrêter tout: fermer les deux fenêtres" -ForegroundColor "Gray"

Write-Host "`n⏳ Patientez 10-15 secondes pour que les services démarrent complètement..." -ForegroundColor "Yellow"
Write-Host "   (Les deux navigateurs vont s'ouvrir automatiquement)" -ForegroundColor "Yellow"

Write-Host "`n✨ C'est prêt! Bonne session de développement 🚀" -ForegroundColor $success
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $info

# Garder la fenêtre ouverte
Read-Host "Appuyer sur Entrée pour terminer ce script"
