# 📁 Infrastructure Repository Structure

```
BrigadeMedicale/
├── infra/                           # 🆕 Infrastructure as Code
│   ├── main.bicep                   # Main Bicep template (all resources)
│   ├── params/
│   │   └── dev.bicepparam           # Dev environment parameters
│   ├── deploy-dev.ps1               # PowerShell deploy script
│   ├── deploy-dev.sh                # Bash deploy script (Linux/Mac)
│   ├── .deployment-outputs.json     # (Generated) Deployment outputs
│   ├── README.md                    # Full documentation
│   ├── QUICK_START.md               # 5-minute quick start
│   ├── EF_MIGRATIONS.md             # Database migration guide
│   └── STRUCTURE.md                 # This file
│
├── src/
│   ├── BrigadeMedicale.API/
│   │   ├── Program.cs               # ✅ Updated: SQL Server support
│   │   ├── appsettings.json         # Local development (SQLite)
│   │   ├── appsettings.Production.json  # 🆕 Azure SQL configuration
│   │   └── ...
│   ├── BrigadeMedicale.Infrastructure/
│   │   ├── Data/ApplicationDbContext.cs
│   │   ├── Migrations/
│   │   │   └── 20260214224154_AddTriageFeature.cs
│   │   └── ...
│   └── ...
│
├── brigade-medicale-frontend/       # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   └── ...
│   ├── angular.json
│   ├── package.json
│   └── ...
│
├── BrigadeMedicale.sln
└── README.md
```

---

## 🆕 Files Added (Infrastructure)

| File | Purpose | Usage |
|------|---------|-------|
| `infra/main.bicep` | IaC template | Deploy resources |
| `infra/params/dev.bicepparam` | Environment config | Dev parameter values |
| `infra/deploy-dev.ps1` | Deploy automation | Run on Windows |
| `infra/deploy-dev.sh` | Deploy automation | Run on Linux/Mac |
| `src/.../appsettings.Production.json` | Azure config | SQL Server connection |

## ✅ Files Modified

| File | Changes |
|------|---------|
| `src/BrigadeMedicale.API/Program.cs` | Added SQL Server support, CORS from App Settings |

---

## 📋 Deployment Flow

```
1. LOCAL (Development)
   ├─ SQLite database (brigade_medicale.db)
   ├─ appsettings.json
   └─ localhost:5238, localhost:4200

2. AZURE DEV (Internal Testing)
   ├─ Azure SQL Serverless (auto-pause)
   ├─ appsettings.Production.json
   ├─ App Service F1 tier
   ├─ Static Web App (Free)
   └─ ~5€/month cost

3. AZURE PROD (Future)
   ├─ Azure SQL (Business critical)
   ├─ App Service Standard
   ├─ CDN, Key Vault, Application Insights
   └─ ~500€+/month
```

---

## 🔄 Git Workflow

```bash
# 1. Pull latest
git pull origin main

# 2. Make code changes
# ... modify src/

# 3. Test locally
dotnet run
npm start

# 4. Commit
git add .
git commit -m "feat: add new feature"
git push origin main

# 5. CI/CD triggers automatically
# - GitHub Actions runs tests
# - Frontend: Static Web App deploys
# - Backend: EF migrations + API deploy (if configured)
```

---

## 🔐 Secrets Management

### Local (Never commit!)
```bash
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "..."
# Stored in: %APPDATA%\microsoft\UserSecrets\
```

### Azure (App Settings)
```bash
# Created by Bicep script
# Visible in: Azure Portal > App Service > Configuration
# Variables:
# - ConnectionStrings__DefaultConnection
# - ASPNETCORE_ENVIRONMENT
# - CORS_ALLOWED_ORIGINS
```

### GitHub (CI/CD)
```bash
# Created manually in: Settings > Secrets
# Variables:
# - AZURE_PUBLISH_PROFILE (for ZIP deploy)
# - AZURE_SQL_CONNECTION_STRING (for migrations)
```

---

## ✨ Quick Commands Reference

```bash
# Deploy infrastructure
cd infra && ./deploy-dev.ps1

# Apply migrations
dotnet ef database update --project ./src/BrigadeMedicale.Infrastructure

# Test API
curl https://brigademed-dev-api.azurewebsites.net/api/health

# View logs
az webapp log tail --name brigademed-dev-api --resource-group rg-brigademed-dev

# Cleanup
az group delete --name rg-brigademed-dev --yes
```

---

## 🎓 Learning Resources

- **Bicep:** https://learn.microsoft.com/en-us/azure/azure-resource-manager/bicep/
- **App Service:** https://learn.microsoft.com/en-us/azure/app-service/
- **Azure SQL:** https://learn.microsoft.com/en-us/azure/azure-sql/database/
- **EF Core:** https://learn.microsoft.com/en-us/ef/core/

---

**Created:** Feb 2025 | **Version:** 1.0 | **Env:** DEV
