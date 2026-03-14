@echo off
REM Script to apply the Training Modules seeding migration
REM Usage: apply-training-migration.bat

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo Brigade Medicale - Training Modules Setup
echo ==========================================
echo.

REM Check if we're in the right directory
if not exist "BrigadeMedicale.sln" (
    echo Error: BrigadeMedicale.sln not found!
    echo Please run this script from the repository root directory.
    pause
    exit /b 1
)

echo 1. Checking .NET installation...
dotnet --version
echo.

echo 2. Navigating to API project...
cd src\BrigadeMedicale.API
echo    Current directory: !cd!
echo.

echo 3. Building the project...
dotnet build
if errorlevel 1 (
    echo Build failed!
    pause
    exit /b 1
)
echo.

echo 4. Checking for pending migrations...
dotnet ef migrations list | findstr /i "SeedTrainingModules" >nul
if errorlevel 1 (
    echo    Warning: SeedTrainingModules migration not found
) else (
    echo    Migration found!
)
echo.

echo 5. Applying the Training Modules seeding migration...
echo    (This will add training modules for all roles to the database)
echo.
set /p CONFIRM="Continue? (y/n) "
if /i not "%CONFIRM%"=="y" (
    echo Migration cancelled.
    pause
    exit /b 1
)
echo.

dotnet ef database update
if errorlevel 1 (
    echo Migration failed!
    pause
    exit /b 1
)
echo.

echo 6. Migration applied successfully!
echo.

echo 7. Verifying data was inserted...
echo    Querying database for module count...
echo    (Manual verification: SELECT COUNT(*) FROM TrainingModules;)
echo.

cd ..\..
echo ==========================================
echo Setup Complete!
echo ==========================================
echo.
echo Next steps:
echo 1. Restart the API: dotnet run --project src\BrigadeMedicale.API
echo 2. Check the frontend - training modules should now appear
echo 3. View the database with your preferred SQLite viewer
echo.
echo For more information, see: TRAINING_SEEDING_SETUP.md
echo.

pause
