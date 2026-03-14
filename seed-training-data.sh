#!/bin/bash

# Script to seed comprehensive training data into Brigade Médicale database
# Usage: bash seed-training-data.sh or ./seed-training-data.sh

API_URL="https://localhost:7288/api/training/seed-comprehensive-data"

echo "🎓 Brigade Médicale - Seeding Comprehensive Training Data"
echo "=========================================================="
echo ""
echo "API Endpoint: $API_URL"
echo ""

echo "📡 Sending seed request..."
echo ""

# Make the request and capture the response
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -k) # -k for self-signed certificates on localhost

# Check if response is valid JSON
if echo "$RESPONSE" | grep -q "success"; then
    echo "✅ Success!"
    echo ""
    echo "📊 Seeding Results:"
    echo "-------------------"

    # Parse and display response (requires jq)
    if command -v jq &> /dev/null; then
        MESSAGE=$(echo "$RESPONSE" | jq -r '.message')
        CREATED=$(echo "$RESPONSE" | jq -r '.createdCount')
        TOTAL=$(echo "$RESPONSE" | jq -r '.totalCount')

        echo "Message: $MESSAGE"
        echo "Created: $CREATED / $TOTAL modules"
        echo ""

        echo "📚 Modules by Role:"
        echo "-------------------"
        ADMIN=$(echo "$RESPONSE" | jq -r '.details.staffAdminModules')
        ACCUEIL=$(echo "$RESPONSE" | jq -r '.details.staffAccueilModules')
        MEDECIN=$(echo "$RESPONSE" | jq -r '.details.staffMedecinModules')
        LABORANTIN=$(echo "$RESPONSE" | jq -r '.details.staffLaborantinModules')
        PHARMACIEN=$(echo "$RESPONSE" | jq -r '.details.staffPharmacienModules')
        SUPERVISEUR=$(echo "$RESPONSE" | jq -r '.details.staffSuperviseurModules')
        PATIENT=$(echo "$RESPONSE" | jq -r '.details.patientModules')

        echo "✓ StaffAdmin:      $ADMIN module(s)"
        echo "✓ StaffAccueil:    $ACCUEIL module(s)"
        echo "✓ StaffMedecin:    $MEDECIN module(s)"
        echo "✓ StaffLaborantin: $LABORANTIN module(s)"
        echo "✓ StaffPharmacien: $PHARMACIEN module(s)"
        echo "✓ StaffSuperviseur: $SUPERVISEUR module(s)"
        echo "✓ Patient:         $PATIENT module(s)"
        echo ""

        echo "📋 Created Modules:"
        echo "-------------------"
        echo "$RESPONSE" | jq -r '.createdModules[]' | while read -r module; do
            echo "  ✓ $module"
        done
        echo ""
    else
        echo "$RESPONSE"
        echo ""
    fi

    echo "🎉 Training data successfully seeded!"
    echo ""
    echo "📖 Next Steps:"
    echo "  1. Login to the application"
    echo "  2. Go to Training section"
    echo "  3. Select your role to see available modules"
    echo "  4. Click 'COMMENCER' to start a module"
    echo ""
    exit 0
else
    echo "❌ Error seeding training data"
    echo ""
    echo "Response:"
    echo "$RESPONSE"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Ensure API is running: dotnet run --project src/BrigadeMedicale.API"
    echo "  2. Check API is accessible at $API_URL"
    echo "  3. Verify database connection is working"
    echo "  4. Check application logs for errors"
    echo ""
    exit 1
fi
