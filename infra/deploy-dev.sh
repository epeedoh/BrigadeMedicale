#!/bin/bash

# ==================== CONFIGURATION ====================
PREFIX="brigademed"
ENVIRONMENT="dev"
LOCATION="francecentral"
RESOURCE_GROUP="rg-${PREFIX}-${ENVIRONMENT}"
BICEP_FILE="$(dirname "$0")/main.bicep"
PARAMS_FILE="$(dirname "$0")/params/dev.bicepparam"

echo "🚀 BrigadeMedicale Azure Deployment (DEV)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Resource Group: $RESOURCE_GROUP"
echo "Location: $LOCATION"
echo ""

# ==================== CHECK AZURE CLI ====================
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Install from https://aka.ms/cli"
    exit 1
fi

AZ_VERSION=$(az version --output json | grep -o '"azure-cli": "[^"]*"' | cut -d'"' -f4)
echo "✅ Azure CLI version: $AZ_VERSION"

# ==================== GET SQL PASSWORD ====================
echo ""
echo "📝 SQL Admin Password required"
read -sp "Enter SQL admin password (min 8 chars, uppercase+digits+special): " SQL_PASSWORD
echo ""

if [ ${#SQL_PASSWORD} -lt 8 ]; then
    echo "❌ Password must be at least 8 characters"
    exit 1
fi

# ==================== LOGIN ====================
echo ""
echo "🔐 Logging into Azure..."
az login

SUBSCRIPTION=$(az account show --query name -o tsv)
echo "📌 Subscription: $SUBSCRIPTION"

# ==================== CREATE RESOURCE GROUP ====================
echo ""
echo "📦 Creating resource group: $RESOURCE_GROUP"
az group create \
    --name "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --tags env=dev project=BrigadeMedicale owner=student

if [ $? -ne 0 ]; then
    echo "❌ Failed to create resource group"
    exit 1
fi
echo "✅ Resource group created"

# ==================== DEPLOY BICEP ====================
echo ""
echo "🔨 Deploying infrastructure (Bicep)..."
DEPLOYMENT=$(az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file "$BICEP_FILE" \
    --parameters \
        prefix="$PREFIX" \
        environment="$ENVIRONMENT" \
        location="$LOCATION" \
        sqlAdminPassword="$SQL_PASSWORD" \
    --output json)

if [ $? -ne 0 ]; then
    echo "❌ Deployment failed"
    exit 1
fi

echo "✅ Infrastructure deployed successfully"

# ==================== EXTRACT OUTPUTS ====================
echo ""
echo "📊 Deployment Outputs:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

STATIC_WEB_APP_URL=$(echo "$DEPLOYMENT" | jq -r '.properties.outputs.staticWebAppUrl.value')
API_URL=$(echo "$DEPLOYMENT" | jq -r '.properties.outputs.apiUrl.value')
SQL_SERVER_FQDN=$(echo "$DEPLOYMENT" | jq -r '.properties.outputs.sqlServerFqdn.value')
SQL_DATABASE=$(echo "$DEPLOYMENT" | jq -r '.properties.outputs.sqlDatabaseName.value')
SQL_SERVER=$(echo "$DEPLOYMENT" | jq -r '.properties.outputs.sqlServerName.value')
CONNECTION_STRING=$(echo "$DEPLOYMENT" | jq -r '.properties.outputs.connectionStringTemplate.value')

echo ""
echo "🌐 Frontend (Static Web App):"
echo "   URL: $STATIC_WEB_APP_URL"
echo ""
echo "⚙️  Backend API:"
echo "   URL: $API_URL"
echo ""
echo "🗄️  SQL Database:"
echo "   Server: $SQL_SERVER_FQDN"
echo "   Database: $SQL_DATABASE"
echo "   Admin: sqladmin"
echo ""
echo "🔐 Connection String:"
echo "   $CONNECTION_STRING"
echo ""

# ==================== SAVE OUTPUTS ====================
OUTPUT_FILE="$(dirname "$0")/.deployment-outputs.json"
cat > "$OUTPUT_FILE" <<EOF
{
  "timestamp": "$(date -Iseconds)",
  "resourceGroup": "$RESOURCE_GROUP",
  "staticWebAppUrl": "$STATIC_WEB_APP_URL",
  "apiUrl": "$API_URL",
  "sqlServerFqdn": "$SQL_SERVER_FQDN",
  "sqlDatabaseName": "$SQL_DATABASE",
  "sqlServerName": "$SQL_SERVER"
}
EOF

echo "💾 Outputs saved to: .deployment-outputs.json"

echo ""
echo "📋 Next Steps:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1️⃣  Run EF migrations:"
echo "   dotnet ef database update --project ./src/BrigadeMedicale.Infrastructure"
echo "2️⃣  Deploy API code (see README for options)"
echo "3️⃣  Deploy frontend (GitHub Actions or manual)"
echo ""
echo "✅ Deployment Complete!"
echo ""
