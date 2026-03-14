#!/bin/bash

# Script to apply the Training Modules seeding migration
# Usage: ./apply-training-migration.sh

set -e

echo "=========================================="
echo "Brigade Médicale - Training Modules Setup"
echo "=========================================="
echo ""

# Check if we're in the right directory
if [ ! -f "BrigadeMedicale.sln" ]; then
    echo "Error: BrigadeMedicale.sln not found!"
    echo "Please run this script from the repository root directory."
    exit 1
fi

echo "1. Checking .NET installation..."
dotnet --version
echo ""

echo "2. Navigating to API project..."
cd src/BrigadeMedicale.API
echo "   Current directory: $(pwd)"
echo ""

echo "3. Building the project..."
dotnet build
echo ""

echo "4. Checking for pending migrations..."
dotnet ef migrations list | grep SeedTrainingModules && echo "   Migration found!" || echo "   Warning: Migration not found"
echo ""

echo "5. Applying the Training Modules seeding migration..."
echo "   (This will add training modules for all roles to the database)"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 1
fi

dotnet ef database update
echo ""

echo "6. Migration applied successfully!"
echo ""

echo "7. Verifying data was inserted..."
echo "   Querying database for module count..."
# Note: This requires sqlite3 or direct database access
echo "   (Manual verification: SELECT COUNT(*) FROM TrainingModules)"
echo ""

cd ../..
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Restart the API: dotnet run --project src/BrigadeMedicale.API"
echo "2. Check the frontend - training modules should now appear"
echo "3. View the database with: sqlite3 training.db"
echo ""
echo "For more information, see: TRAINING_SEEDING_SETUP.md"
