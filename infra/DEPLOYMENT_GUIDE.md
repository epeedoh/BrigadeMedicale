# 🚀 Guide Étape par Étape - Déploiement Azure

**Durée totale:** ~15-20 minutes (déploiement ~8-10 min)

---

## ✅ ÉTAPE 0: Préparation (2 min)

### Vérifier les prérequis

Ouvrir **PowerShell** (Admin) et vérifier:

```powershell
# Vérifier Azure CLI
az version

# Vérifier .NET CLI
dotnet --version

# Vérifier PowerShell
$PSVersionTable.PSVersion
```

**Résultats attendus:**
```
Azure CLI: 2.50+
.NET CLI: 8.0+
PowerShell: 7.0+
```

❌ **Si Azure CLI manque:**
```
👉 Installer: https://aka.ms/cli
   Puis redémarrer PowerShell
```

---

## ✅ ÉTAPE 1: Naviguer vers le dossier deployment (1 min)

```powershell
cd c:\Users\surface\source\repos\BrigadeMedicale\infra

# Vérifier les fichiers
ls -Filter "*.ps1"
# Vous devriez voir: deploy-dev.ps1
```

---

## ✅ ÉTAPE 2: Lancer le script de déploiement (1 min)

```powershell
.\deploy-dev.ps1
```

---

## ✅ ÉTAPE 3: Répondre aux questions (3 min)

### ❓ Question 1: Mot de passe SQL Admin

**Prompt:**
```
📝 SQL Admin Password required
Enter SQL admin password (min 8 chars, uppercase+digits+special):
```

**✍️ Entrer un mot de passe FORT:**
```
Exemple: MyAzure2025!Dev
Critères:
  ✅ Min 8 caractères
  ✅ 1 majuscule (M, A, D)
  ✅ 1 chiffre (2, 0, 2, 5)
  ✅ 1 caractère spécial (!, @, #, $)
```

⚠️ **IMPORTANT:**
- Le mot de passe NE sera PAS visible (tapez simplement)
- Vous devrez le **réutiliser plus tard** pour les migrations
- Notez-le quelque part! 📝

---

### ❓ Question 2: Login Azure

**Prompt:**
```
🔐 Logging into Azure...
```

**Ce qui va se passer:**
1. Un navigateur s'ouvre
2. Connectez-vous avec votre compte Azure
3. Retournez à PowerShell (automatiquement)

**Si pas de navigateur:**
```powershell
# Alternative
az login --use-device-code
# Puis suivre les instructions
```

---

## ✅ ÉTAPE 4: Attendre le déploiement (8-10 min) ⏳

**Vous verrez:**

```
📦 Creating resource group: rg-brigademed-dev
✅ Resource group created

🔨 Deploying infrastructure (Bicep)...
[En cours...]

✅ Infrastructure deployed successfully
```

**Ne pas fermer PowerShell !** ⚠️

---

## ✅ ÉTAPE 5: Résultats du déploiement (2 min)

**Après le déploiement, vous verrez:**

```
📊 Deployment Outputs:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🌐 Frontend (Static Web App):
   URL: https://brigademed-dev-XXXX.azurestaticapps.net

⚙️  Backend API:
   URL: https://brigademed-dev-api.azurewebsites.net

🗄️  SQL Database:
   Server: brigademed-dev-sql.database.windows.net
   Database: brigademed-dev-db
   Admin: sqladmin

🔐 Connection String:
   Server=tcp:brigademed-dev-sql.database.windows.net,1433;...

💾 Outputs saved to: .deployment-outputs.json
```

### ✅ Vérification
```powershell
# Voir les outputs
cat .deployment-outputs.json
```

---

## 📝 ÉTAPE 6: Noter les informations importantes

**Créer un fichier `DEPLOYMENT_INFO.txt` localement:**

```
=== DÉPLOIEMENT AZURE DEV ===
Date: [aujourd'hui]

SQL Password: [votre mot de passe]
Frontend URL: https://...
API URL: https://...
SQL Server: brigademed-dev-sql.database.windows.net
SQL Database: brigademed-dev-db
SQL User: sqladmin

Connection String:
Server=tcp:...
```

⚠️ **Gardez ce fichier en sécurité!** (Ne pas commit sur Git)

---

## ✅ ÉTAPE 7: Vérifier le déploiement dans Azure Portal (1 min)

1. Aller sur: https://portal.azure.com
2. Chercher: `rg-brigademed-dev`
3. Vous devriez voir:
   - ✅ Static Web App
   - ✅ App Service (API)
   - ✅ SQL Database
   - ✅ SQL Server

---

## 🚨 Troubleshooting

### ❌ "Azure CLI not found"
```powershell
# Installer Azure CLI
# https://aka.ms/cli
# Puis redémarrer PowerShell
```

### ❌ "Login failed"
```powershell
# Vérifier que vous avez un abonnement Azure valide
az account show

# Si vide, créer un compte Azure (gratuit)
# https://azure.microsoft.com/free
```

### ❌ "Deployment failed"
```powershell
# Voir les erreurs complètes
az deployment group list --resource-group rg-brigademed-dev

# Réessayer avec plus d'infos
.\deploy-dev.ps1 -Verbose
```

### ❌ "Timeout ou déploiement interrompu"
```powershell
# Attendre 30 secondes et relancer
.\deploy-dev.ps1

# Le script va continuer où il s'est arrêté
```

---

## ✅ ÉTAPE 8: Prochaines étapes (après déploiement) 🎯

### Étape 8a: Ajouter votre IP au Firewall SQL (2 min)
```powershell
# Votre IP publique
$ip = (curl -s https://api.ipify.org)
Write-Host "Votre IP: $ip"

# Ajouter à Firewall SQL
az sql server firewall-rule create `
  --resource-group rg-brigademed-dev `
  --server brigademed-dev-sql `
  --name "AllowMyMachine" `
  --start-ip-address $ip `
  --end-ip-address $ip
```

### Étape 8b: Configurer les secrets locaux (2 min)
```powershell
cd ..\src\BrigadeMedicale.API

# Initialiser User Secrets
dotnet user-secrets init

# Ajouter connection string
# Remplacer {PASSWORD} par votre mot de passe SQL
dotnet user-secrets set "ConnectionStrings:DefaultConnection" `
  "Server=tcp:brigademed-dev-sql.database.windows.net,1433;Initial Catalog=brigademed-dev-db;Persist Security Info=False;User ID=sqladmin;Password={PASSWORD};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# Vérifier
dotnet user-secrets list
```

### Étape 8c: Appliquer les migrations (3 min)
```powershell
# Depuis BrigadeMedicale.API
dotnet ef database update --project ..\BrigadeMedicale.Infrastructure

# Vous verrez:
# Executed DbCommand (X ms) ...
# Applied migration 'XXXXX_InitialCreate' ...
```

### Étape 8d: Déployer le code (10-15 min)
```powershell
# Frontend: Push vers GitHub (auto-deploy via GitHub Actions)
git push origin main

# Backend: Voir README.md pour options
# - Option 1: ZIP deployment
# - Option 2: GitHub Actions
```

---

## 📊 Coûts estimés

| Resource | Coût/mois | Notes |
|----------|-----------|-------|
| Static Web App (Free) | 0€ | 100GB bandwidth |
| App Service (F1) | 0€ | 60 min/jour suffisent |
| Azure SQL (Serverless) | ~5€ | Auto-pause en 60 min |
| **TOTAL** | **~5€** | ✅ Très économique! |

---

## ✅ Checklist de déploiement

- [ ] Azure CLI installé et vérifié
- [ ] PowerShell ouvert en tant qu'Admin
- [ ] Navigué vers `/infra`
- [ ] Lancé `.\deploy-dev.ps1`
- [ ] Entré mot de passe SQL (8+ caractères, complexe)
- [ ] Connecté à Azure via navigateur
- [ ] Attendu 8-10 minutes (déploiement)
- [ ] Noté les URLs et infos SQL
- [ ] Vérifié dans Azure Portal
- [ ] Ajouté IP au Firewall SQL
- [ ] Configuré User Secrets
- [ ] Appliqué EF migrations
- [ ] Déployé le code

---

## 🎉 Succès!

Une fois complété, vous aurez:
- ✅ Infrastructure Azure DEV complètement déployée
- ✅ Base de données SQL prête
- ✅ API prête à recevoir du code
- ✅ Frontend Static Web App prête
- ✅ Coût minimal (~5€/mois)

**Questions?** Consultez:
- `README.md` - Guide complet
- `EF_MIGRATIONS.md` - Migrations détaillées
- `QUICK_START.md` - Référence rapide

---

**Prêt à déployer? Lancez le script! 🚀**
