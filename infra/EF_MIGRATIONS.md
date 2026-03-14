# 🗄️ EF Core Migrations Guide

Guide pour appliquer les migrations Entity Framework Core sur Azure SQL.

---

## 📋 Prérequis

- .NET CLI 8.0+
- Accès à Azure SQL (firewall ouvert)
- Connection string pour Azure SQL Database

---

## 🔧 Option 1: Migrations depuis Machine Locale (Recommandé pour DEV)

### Étape 1: Obtenir la connection string
```bash
# Depuis le fichier d'outputs
cat .deployment-outputs.json | jq -r '.connectionString'

# Ou depuis Azure Portal:
# SQL Database > Connection strings > ADO.NET
```

### Étape 2: Configurer User Secrets (Sécurisé)
```bash
cd src/BrigadeMedicale.API

# Initialiser User Secrets (première fois)
dotnet user-secrets init

# Ajouter connection string
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Server=tcp:brigademed-dev-sql.database.windows.net,1433;Initial Catalog=brigademed-dev-db;Persist Security Info=False;User ID=sqladmin;Password=YourPassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Vérifier
dotnet user-secrets list
```

### Étape 3: Appliquer les migrations
```bash
# Depuis le dossier API
cd src/BrigadeMedicale.API

# Lister les migrations (pour vérifier)
dotnet ef migrations list --project ../BrigadeMedicale.Infrastructure

# Appliquer les migrations à Azure SQL
dotnet ef database update --project ../BrigadeMedicale.Infrastructure

# Logs
# Output: Executed DbCommand (X ms) ...
#         Applied migration '202601250000_InitialCreate' ...
```

### Étape 4: Vérifier
```bash
# Test via PowerShell/Bash
sqlcmd -S brigademed-dev-sql.database.windows.net -U sqladmin -P YourPassword123! -d brigademed-dev-db -Q "SELECT * FROM __EFMigrationsHistory"

# Output: Vérifier qu'il y a des entrées (InitialCreate, AddTriageFeature, etc.)
```

---

## 🚀 Option 2: Migrations via CI/CD Pipeline (Recommandé pour PROD)

### GitHub Actions Workflow
Créer: `.github/workflows/deploy-migrations.yml`

```yaml
name: 'Apply EF Migrations'

on:
  push:
    branches:
      - main
    paths:
      - 'src/BrigadeMedicale.*/**'
  workflow_dispatch:

env:
  DOTNET_VERSION: '8.0.x'

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: ${{ env.DOTNET_VERSION }}

      - name: Restore
        run: dotnet restore

      - name: Apply Migrations
        env:
          ConnectionString: ${{ secrets.AZURE_SQL_CONNECTION_STRING }}
          ASPNETCORE_ENVIRONMENT: Production
        working-directory: ./src/BrigadeMedicale.API
        run: |
          dotnet tool install --global dotnet-ef
          dotnet ef database update --project ../BrigadeMedicale.Infrastructure

      - name: Migration Status
        if: success()
        run: echo "✅ Migrations applied successfully to Azure SQL"

      - name: Migration Failed
        if: failure()
        run: |
          echo "❌ Migration failed"
          exit 1
```

### Configuration GitHub Secrets
```bash
# Aller dans Settings > Secrets and variables > Actions
# Ajouter AZURE_SQL_CONNECTION_STRING:
Server=tcp:brigademed-dev-sql.database.windows.net,1433;Initial Catalog=brigademed-dev-db;Persist Security Info=False;User ID=sqladmin;Password=YourPassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

---

## 📝 Créer une Nouvelle Migration

Quand vous modifiez les entités EF Core:

```bash
cd src/BrigadeMedicale.Infrastructure

# Créer une migration
dotnet ef migrations add AddNewFeature --project . --startup-project ../BrigadeMedicale.API

# Le fichier migrationXXX_AddNewFeature.cs est créé

# Commit & push
git add Migrations/
git commit -m "feat: add new feature migration"
git push
```

---

## 🔄 Reverting Migrations

Si vous devez annuler une migration:

```bash
# Lister les migrations
dotnet ef migrations list

# Revenir à une migration antérieure (ex: InitialCreate)
dotnet ef database update InitialCreate

# Supprimer la dernière migration (avant le commit)
dotnet ef migrations remove

# Puis re-commit
git add Migrations/
git commit -m "revert: remove last migration"
```

---

## 🚨 Troubleshooting

### ❌ Erreur: "Login failed for user 'sqladmin'"
**Cause:** Firewall SQL bloque votre IP.
```bash
# Vérifier firewall rules
az sql server firewall-rule list \
  --resource-group rg-brigademed-dev \
  --server brigademed-dev-sql

# Ajouter votre IP (remplacer 203.0.113.42)
az sql server firewall-rule create \
  --resource-group rg-brigademed-dev \
  --server brigademed-dev-sql \
  --name "AllowDevMachine" \
  --start-ip-address 203.0.113.42 \
  --end-ip-address 203.0.113.42
```

### ❌ Erreur: "Migration not applied"
```bash
# Vérifier l'état de la DB
dotnet ef database update --verbose

# Si table __EFMigrationsHistory n'existe pas:
dotnet ef database drop -f
dotnet ef database update
```

### ❌ Erreur: "Connection timeout"
```bash
# Vérifier que SQL est réveillé (sortir de auto-pause)
az sql db resume \
  --name brigademed-dev-db \
  --server brigademed-dev-sql \
  --resource-group rg-brigademed-dev

# Attendre 10-20 secondes puis retry
```

### ❌ Erreur: "Cannot open database 'brigademed-dev-db'"
```bash
# Database n'existe pas ou a un nom différent
# Vérifier:
az sql db list \
  --server brigademed-dev-sql \
  --resource-group rg-brigademed-dev

# Si absente, redéployer Bicep
```

---

## ✅ Bonnes Pratiques

1. **Migrations = Committed Code**
   ```bash
   git add Migrations/
   git commit
   git push
   ```

2. **Production = CI/CD Only**
   - Ne pas faire `dotnet ef database update` en prod directement
   - Utiliser GitHub Actions ou Azure Pipelines

3. **Staging/Dev = Flexible**
   - OK de faire migrations manuelles pour tests rapides
   - Puis CI/CD pour prod

4. **Backup avant migrations**
   ```bash
   az sql db copy \
     --name brigademed-dev-db \
     --server brigademed-dev-sql \
     --resource-group rg-brigademed-dev \
     --dest-name brigademed-dev-db-backup-$(date +%Y%m%d)
   ```

---

## 📚 Ressources

- [EF Core Migrations](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [Azure SQL Connection Strings](https://learn.microsoft.com/en-us/azure/azure-sql/database/connect-query-content-reference-guide)
- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)

---

**Créé:** Feb 2025 | **Version:** 1.0
