# ⚡ Quick Start - Deploy en 5 minutes

## 🎯 Pour les impatients

### Prérequis (5 min)
```bash
# 1. Azure CLI
choco install azure-cli              # Windows (Chocolatey)
brew install azure-cli               # macOS (Homebrew)
sudo apt install azure-cli           # Linux (apt)

# 2. .NET 8.0+
dotnet --version

# 3. Vérifier Az login
az login
az account show
```

### Deploy Infra (10 min)
```bash
cd BrigadeMedicale/infra

# PowerShell
./deploy-dev.ps1
# OU Bash
chmod +x deploy-dev.sh && ./deploy-dev.sh

# Script affiche:
# ✅ Static Web App: https://...
# ✅ API: https://...
# ✅ SQL Server: brigademed-dev-sql
```

### Post-Deploy (5 min)
```bash
cd ../src/BrigadeMedicale.API

# Configurer secrets locaux
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=tcp:...password=..."

# Appliquer migrations
dotnet ef database update --project ../BrigadeMedicale.Infrastructure

# Vérifier
dotnet ef database info
```

### Deploy Code (10 min)
```bash
# Frontend (GitHub Actions)
git push origin main
# → Static Web App détecte et build auto

# Backend (Manual ZIP)
cd src/BrigadeMedicale.API
dotnet publish --configuration Release --output ./publish
Compress-Archive -Path ./publish -DestinationPath api.zip

az webapp deployment source config-zip \
  --resource-group rg-brigademed-dev \
  --name brigademed-dev-api \
  --src api.zip
```

---

## 📊 Outputs Clés

Après le script deploy, vous avez:

| Ressource | URL/Nom | Tier |
|-----------|---------|------|
| **Frontend** | `https://xxx.azurestaticapps.net` | Free |
| **API** | `https://brigademed-dev-api.azurewebsites.net` | F1 (Free) |
| **SQL** | `brigademed-dev-sql.database.windows.net` | Serverless (auto-pause) |
| **Database** | `brigademed-dev-db` | GP_S_Gen5 |

---

## 🔐 Secrets Management

```bash
# Local (Never commit!)
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "..."
dotnet user-secrets list

# Azure App Settings (Auto-configured by Bicep)
az webapp config appsettings list \
  --resource-group rg-brigademed-dev \
  --name brigademed-dev-api
```

---

## 🧪 Test Endpoints

```bash
# API Health
curl https://brigademed-dev-api.azurewebsites.net/swagger

# Frontend
open https://brigademed-dev-swa.azurestaticapps.net

# Database
sqlcmd -S brigademed-dev-sql.database.windows.net \
       -U sqladmin -P YourPassword123! \
       -d brigademed-dev-db \
       -Q "SELECT @@VERSION"
```

---

## 🗑️ Cleanup (When Done)

```bash
# Delete everything
az group delete --name rg-brigademed-dev --yes --no-wait

# Verify deleted
az group exists --name rg-brigademed-dev
# Output: false
```

---

## 🚨 Common Issues

| Error | Fix |
|-------|-----|
| "Login failed for user 'sqladmin'" | Add your IP to SQL Firewall |
| "Connection timeout" | Wait for SQL to wake from auto-pause |
| "App Service F1 OOM" | Scale to B1 tier (~10€/month) |
| "Migration not applied" | Check `dotnet ef database info` and firewall |

---

## 📚 Full Docs

- **Infrastructure:** See `/infra/README.md`
- **Migrations:** See `/infra/EF_MIGRATIONS.md`
- **Code Updates:** See `/src/BrigadeMedicale.API/appsettings.Production.json`

---

**Enjoy! 🚀**
