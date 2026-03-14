# Script to seed comprehensive training data into Brigade Medicale database
# Usage: .\seed-training-data.ps1

[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$apiUrl = "https://localhost:7288/api/training/seed-comprehensive-data"

Write-Host "Brigade Medicale - Seeding Comprehensive Training Data" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "API Endpoint: $apiUrl" -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "Sending seed request..." -ForegroundColor Yellow
    Write-Host ""

    # Ignore certificate validation for localhost
    [System.Net.ServicePointManager]::ServerCertificateValidationCallback = { return $true }

    $response = Invoke-RestMethod -Uri $apiUrl `
        -Method Post `
        -ContentType "application/json"

    Write-Host "SUCCESS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Seeding Results:" -ForegroundColor Cyan
    Write-Host "-------------------" -ForegroundColor Cyan
    Write-Host "Message: $($response.message)" -ForegroundColor Green
    Write-Host "Created: $($response.createdCount) / $($response.totalCount) modules" -ForegroundColor Green
    Write-Host ""

    Write-Host "Modules by Role:" -ForegroundColor Cyan
    Write-Host "-------------------" -ForegroundColor Cyan
    $adminCount = $response.details.staffAdminModules
    $accueilCount = $response.details.staffAccueilModules
    $medecinCount = $response.details.staffMedecinModules
    $laborantinCount = $response.details.staffLaborantinModules
    $pharmacienCount = $response.details.staffPharmacienModules
    $superviseurCount = $response.details.staffSuperviseurModules
    $patientCount = $response.details.patientModules

    Write-Host "  Staff Admin:      $adminCount module(s)" -ForegroundColor Green
    Write-Host "  Staff Accueil:    $accueilCount module(s)" -ForegroundColor Green
    Write-Host "  Staff Medecin:    $medecinCount module(s)" -ForegroundColor Green
    Write-Host "  Staff Laborantin: $laborantinCount module(s)" -ForegroundColor Green
    Write-Host "  Staff Pharmacien: $pharmacienCount module(s)" -ForegroundColor Green
    Write-Host "  Staff Superviseur: $superviseurCount module(s)" -ForegroundColor Green
    Write-Host "  Patient:          $patientCount module(s)" -ForegroundColor Green
    Write-Host ""

    Write-Host "Created Modules:" -ForegroundColor Cyan
    Write-Host "-------------------" -ForegroundColor Cyan
    foreach ($module in $response.createdModules) {
        Write-Host "  + $module" -ForegroundColor Green
    }
    Write-Host ""

    Write-Host "COMPLETE! Training data successfully seeded!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Login to the application" -ForegroundColor Yellow
    Write-Host "  2. Go to Training section" -ForegroundColor Yellow
    Write-Host "  3. Select your role to see available modules" -ForegroundColor Yellow
    Write-Host "  4. Click 'COMMENCER' to start a module" -ForegroundColor Yellow
    Write-Host ""
    exit 0
}
catch {
    Write-Host "ERROR seeding training data" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Yellow
    Write-Host "$($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Cyan
    Write-Host "  1. Ensure API is running: dotnet run --project src/BrigadeMedicale.API" -ForegroundColor Yellow
    Write-Host "  2. Check API is accessible at $apiUrl" -ForegroundColor Yellow
    Write-Host "  3. Verify database connection is working" -ForegroundColor Yellow
    Write-Host "  4. Check application logs for errors" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
