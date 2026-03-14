# Script to cleanup old demo training modules from Brigade Medicale SQLite database
# Usage: .\cleanup-old-modules.ps1
# This script deletes old demo modules and keeps only comprehensive training modules

Write-Host "Brigade Medicale - Cleaning Up Old Demo Training Modules" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Database configuration (SQLite)
$dbPath = "brigade_medicale.db"

Write-Host "Database: $dbPath (SQLite)" -ForegroundColor Yellow
Write-Host ""

try {
    Write-Host "Connecting to database..." -ForegroundColor Yellow

    # Create connection to SQLite
    $connectionString = "Data Source=$dbPath;Version=3;"
    $connection = New-Object System.Data.SQLite.SQLiteConnection
    $connection.ConnectionString = $connectionString
    $connection.Open()

    Write-Host "Connected successfully!" -ForegroundColor Green
    Write-Host ""

    # SQL command to delete old demo modules
    $deleteQuery = @"
DELETE FROM TrainingModules
WHERE Title IN (
    'Gestion Administrative',
    'Politique et Conformité',
    'Gestion de Crise',
    'Bienvenue et Accueil',
    'Enregistrement Patient',
    'Communication Efficace',
    'Protocoles Médicaux',
    'Documentation Médicale',
    'Gestion d''Urgence',
    'Prélèvement d''Échantillons',
    'Analyse de Laboratoire',
    'Sécurité Biologique',
    'Gestion Pharmacie',
    'Interactions Médicamenteuses',
    'Service Client Pharmacie',
    'Leadership et Supervision',
    'Assurance Qualité',
    'Gestion de Conflits',
    'Créer mon Dossier',
    'Mon Code QR',
    'Ma Consultation'
);
"@

    Write-Host "Deleting old demo modules..." -ForegroundColor Yellow

    # Execute delete command
    $command = $connection.CreateCommand()
    $command.CommandText = $deleteQuery
    $deletedRows = $command.ExecuteNonQuery()

    Write-Host "SUCCESS! Deleted $deletedRows old demo module(s)" -ForegroundColor Green
    Write-Host ""

    # Query to show remaining modules
    Write-Host "Remaining Comprehensive Training Modules:" -ForegroundColor Cyan
    Write-Host "==========================================" -ForegroundColor Cyan
    Write-Host ""

    $selectQuery = @"
SELECT
    Title,
    Audience,
    DurationMinutes,
    (SELECT COUNT(*) FROM TrainingSteps ts WHERE ts.ModuleId = tm.Id) as StepCount
FROM TrainingModules tm
ORDER BY Audience, Title;
"@

    $command = $connection.CreateCommand()
    $command.CommandText = $selectQuery
    $reader = $command.ExecuteReader()

    $moduleCount = 0
    while ($reader.Read()) {
        $title = $reader["Title"]
        $audience = $reader["Audience"]
        $duration = $reader["DurationMinutes"]
        $steps = $reader["StepCount"]

        Write-Host "  + $title" -ForegroundColor Green
        Write-Host "    Audience: $audience | Duration: $duration min | Steps: $steps" -ForegroundColor White

        $moduleCount++
    }
    $reader.Close()

    Write-Host ""
    Write-Host "Total comprehensive modules remaining: $moduleCount" -ForegroundColor Green
    Write-Host ""

    Write-Host "COMPLETE! Old demo modules cleaned up successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Refresh your browser (Ctrl+F5)" -ForegroundColor Yellow
    Write-Host "  2. Go back to Training section" -ForegroundColor Yellow
    Write-Host "  3. You will now see only comprehensive training modules" -ForegroundColor Yellow
    Write-Host ""

    $connection.Close()
    exit 0
}
catch {
    Write-Host "ERROR cleaning up training modules" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Yellow
    Write-Host "$($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Cyan
    Write-Host "  1. Ensure database file exists: $dbPath" -ForegroundColor Yellow
    Write-Host "  2. Verify System.Data.SQLite is installed" -ForegroundColor Yellow
    Write-Host "  3. Check file permissions" -ForegroundColor Yellow
    Write-Host "  4. Check application logs for errors" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Alternative: Use SQL directly in the SQLite database file" -ForegroundColor Yellow
    Write-Host ""

    if ($connection -and $connection.State -eq 'Open') {
        $connection.Close()
    }

    exit 1
}
