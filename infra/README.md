# 🚀 BrigadeMedicale - Azure DEV Deployment

Infrastructure as Code pour déployer BrigadeMedicale sur Azure avec coûts minimisés (~0€ pour tests internes).

## 📋 Prérequis

### Outils locaux
- **Azure CLI** 2.50+ → https://aka.ms/cli
- **.NET CLI** 8.0+ → https://dotnet.microsoft.com/download
- **PowerShell** 7.0+ (ou PowerShell Core sur Linux/Mac)
- **Git** (pour clone du repo)

### Compte Azure
- Subscription Azure active
- Permissions: Owner ou Contributor sur la subscription
- Quota: App Service F1, SQL Serverless disponibles

### Vérification prérequis
```bash
az version
dotnet --version
pwsh --version
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│           Azure Resource Group (rg-brigademed-dev)      │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────────┐         ┌──────────────────┐    │
│  │ Static Web App   │         │  App Service     │    │
│  │ (Free Tier)      │         │  (F1 - 1 vCPU)   │    │
│  │ Angular Frontend │◄────►   │ .NET API         │    │
│  └──────────────────┘         └──────────────────┘    │
│                                        │               │
│                                        │ TCP 1433      │
│                                        ▼               │
│                                ┌──────────────────┐    │
│                                │  Azure SQL Svr   │    │
│                                │  Serverless (1vC)│    │
│                                │  Auto-pause 60min│    │
│                                │  ~0€ quand inac  │    │
│                                └──────────────────┘    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Déploiement

### 1️⃣ Cloner & Naviguer
```bash
cd BrigadeMedicale/infra
```

### 2️⃣ Connexion Azure
```bash
az login
az account show
# Si plusieurs subscriptions:
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 3️⃣ Lancer le déploiement
```powershell
./deploy-dev.ps1
```

Le script va:
- ✅ Créer Resource Group `rg-brigademed-dev`
- ✅ Déployer infrastructure Bicep
- ✅ Configurer SQL + App Service
- ✅ Afficher les URLs et outputs
- ✅ Sauvegarder dans `.deployment-outputs.json`

**Durée estimée:** 5-8 minutes

### 4️⃣ Configurations post-déploiement

#### A. EF Core Migrations
```bash
cd ../src/BrigadeMedicale.API

# Depuis machine locale (avec credential Azure)
dotnet ef database update --project ../BrigadeMedicale.Infrastructure
```

Ou via Azure DevOps/GitHub Actions CI/CD (recommandé).

#### B. Firewall SQL (Optionnel - Sécuriser)
Par défaut, "Azure Services" et "Allow all" sont activés. Pour restreindre:

```bash
RESOURCE_GROUP="rg-brigademed-dev"
SQL_SERVER=$(az sql server list -g $RESOURCE_GROUP --query "[0].name" -o tsv)

# Ajouter votre IP locale
YOUR_IP="203.0.113.42"  # Replace with your public IP
az sql server firewall-rule create \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER \
  --name "AllowMyIp" \
  --start-ip-address $YOUR_IP \
  --end-ip-address $YOUR_IP

# Supprimer la règle "Allow all"
az sql server firewall-rule delete \
  --resource-group $RESOURCE_GROUP \
  --server $SQL_SERVER \
  --name "AllowAllAzureServices"
```

---

## 📦 Déploiement du code

### Frontend (Static Web App)

**Option 1: GitHub Actions (Recommandé)**
1. Push vers branche `main` du repo GitHub
2. SWA détecte automatiquement et build/deploy

**Option 2: Manual Deployment**
```bash
cd brigade-medicale-frontend

npm install
npm run build

# Zip et upload
cd dist/brigade-medicale-frontend
$zipPath = "app-${env:COMPUTERNAME}.zip"
Compress-Archive -Path . -DestinationPath $zipPath

az staticwebapp secrets list \
  --name brigademed-dev-swa \
  --query properties.apiKey \
  --output tsv > $env:TEMP\swa-token.txt

curl -X POST `
  -H "Content-Type: application/zip" `
  -H "Authorization: Bearer $(cat $env:TEMP\swa-token.txt)" `
  --data-binary "@$zipPath" `
  "https://api-${env:COMPUTERNAME}.azurestaticapps.net/api/deploy"
```

### Backend API

**Option 1: Continuous Deployment (CI/CD)**
Configurer GitHub Actions workflow:
```yaml
name: Deploy API
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0'
      - run: dotnet publish --configuration Release --output ./publish
      - uses: Azure/webapps-deploy@v2
        with:
          app-name: brigademed-dev-api
          publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
          package: ./publish
```

**Option 2: Manual ZIP Deployment**
```bash
cd src/BrigadeMedicale.API
dotnet publish --configuration Release --output ./publish

# Zip
$publishPath = "./publish"
$zipFile = "api-release.zip"
Compress-Archive -Path $publishPath -DestinationPath $zipFile

# Deploy
az webapp deployment source config-zip `
  --resource-group rg-brigademed-dev `
  --name brigademed-dev-api `
  --src $zipFile
```

---

## 📊 Coûts Estimés

| Service | Tier | Coût/mois | Notes |
|---------|------|-----------|-------|
| **Static Web App** | Free | **0€** | ✅ 100GB bandwidth gratuit |
| **App Service** | F1 | **0€** | ✅ 60 min/jour (suffisant tests) |
| **SQL Database** | Serverless | **~5€** | Auto-pause = coût minimal |
| **Data Transfer** | - | **0€** | <1GB/mois sans coûts |
| **TOTAL** | - | **~5€/mois** | ✅ Économe pour DEV |

> **Alertes coûts**: Configurer dans Azure Portal
> ```
> Cost Management + Billing > Budgets > New budget
> Set: $10 threshold, Alerts at 50%, 75%, 100%
> ```

---

## 🗑️ Destruction (Cleanup)

Pour supprimer **toute l'infrastructure**:

```bash
az group delete --name rg-brigademed-dev --yes --no-wait
```

> **Attendez ~2-3 min** pour que les ressources soient complètement supprimées.

Vérifier:
```bash
az group exists --name rg-brigademed-dev
# Output: false
```

---

## 🔍 Troubleshooting

### ❌ Erreur: "Deployment failed"
**Cause:** Souvent permissions insuffisantes ou quota SQL.
```bash
# Vérifier permission
az account show

# Checker quotas
az provider show --namespace Microsoft.Sql --query "resourceTypes[?resourceType=='servers'].locations" -o table
```

### ❌ Erreur: "Login failed for user"
**Cause:** Firewall SQL bloque la connexion.
```bash
# Vérifier règles firewall
az sql server firewall-rule list \
  --resource-group rg-brigademed-dev \
  --server brigademed-dev-sql

# Ajouter IP courante
az sql server firewall-rule create \
  --resource-group rg-brigademed-dev \
  --server brigademed-dev-sql \
  --name AllowDev \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 255.255.255.255
```

### ❌ Erreur: "EF Migrations not applied"
**Solution:**
```bash
# Manuellement depuis dev machine
dotnet ef database update \
  --project ./src/BrigadeMedicale.Infrastructure \
  --configuration Release

# Ou via PowerShell Azure:
$connStr = "Server=tcp:brigademed-dev-sql.database.windows.net,1433;Initial Catalog=brigademed-dev-db;Persist Security Info=False;User ID=sqladmin;Password=<PASSWORD>;..."
$env:DefaultConnection = $connStr
dotnet ef database update
```

### ❌ App Service F1 trop lent/OOM
**Migration vers B1:**
```bash
az appservice plan update \
  --name brigademed-dev-asp \
  --resource-group rg-brigademed-dev \
  --sku B1

# Coût: ~10€/mois (mais ressources stables)
```

### ⚠️ SQL Auto-pause ne fonctionne pas
**Vérifier:**
```bash
az sql db show \
  --name brigademed-dev-db \
  --server brigademed-dev-sql \
  --resource-group rg-brigademed-dev \
  --query "autoPauseDelay"
# Output: 60 (minutes, normal)
```

---

## 📚 Commandes utiles

### Monitoring
```bash
# Logs API (live)
az webapp log tail --name brigademed-dev-api --resource-group rg-brigademed-dev

# Vérifier santé App Service
az webapp show --name brigademed-dev-api --resource-group rg-brigademed-dev --query "state"

# Vérifier état SQL
az sql db show --name brigademed-dev-db --server brigademed-dev-sql --resource-group rg-brigademed-dev --query "status"
```

### Restart Services
```bash
# Restart API
az webapp restart --name brigademed-dev-api --resource-group rg-brigademed-dev

# Restart SQL (reprendre après auto-pause)
az sql db resume --name brigademed-dev-db --server brigademed-dev-sql --resource-group rg-brigademed-dev
```

### Database Backup (Manual)
```bash
az sql db copy \
  --name brigademed-dev-db \
  --server brigademed-dev-sql \
  --resource-group rg-brigademed-dev \
  --dest-name brigademed-dev-db-backup-$(date +%Y%m%d)
```

---

## 📝 Configuration Application

### App Settings (Azure)
La connexion SQL est auto-configurée par le script deploy. Vérifier:

```bash
az webapp config appsettings list \
  --name brigademed-dev-api \
  --resource-group rg-brigademed-dev
```

**Variables clés:**
- `ASPNETCORE_ENVIRONMENT` = `Production`
- `ConnectionStrings__DefaultConnection` = string SQL
- `CORS_ALLOWED_ORIGINS` = SWA URL

### Local Development (LocalDB)
Pas de changement. Continuer avec:
```json
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=(localdb)\\mssqllocaldb;Initial Catalog=BrigadeMedicaleDb;Integrated Security=true;"
  }
}
```

---

## 🔐 Sécurité - Checklist

- [ ] SQL password **minimum 8 caractères, majuscule + chiffres + spéciaux**
- [ ] Firewall SQL restreint (pas "Allow all" en prod)
- [ ] CORS configuré pour SWA URL uniquement
- [ ] API en HTTPS uniquement (`httpsOnly: true`)
- [ ] Application Insights désactivé (coûts)
- [ ] Secrets = App Settings ou Key Vault (pas hardcodé)
- [ ] IP locale = whitelist firewall (dev/debug)

---

## 📧 Support / Questions

1. **Erreurs Bicep**: `az bicep build ./main.bicep`
2. **Logs API**: `az webapp log tail ...`
3. **Coûts** : Cost Management Portal Azure

---

**Créé**: Feb 2025 | **Version**: 1.0 | **Env**: DEV (tests internes)
