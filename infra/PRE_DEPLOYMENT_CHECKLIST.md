# ✅ Pre-Deployment Checklist

Vérifier avant de lancer le déploiement.

---

## 🔧 Outils Requis

- [ ] **Azure CLI** installé
  ```bash
  az version
  # Output: 2.50.0 ou plus récent
  ```

- [ ] **.NET 8.0+** installé
  ```bash
  dotnet --version
  # Output: 8.x.x
  ```

- [ ] **PowerShell 7.0+** (pour deploy-dev.ps1)
  ```bash
  pwsh --version
  # Output: 7.x ou plus
  ```

- [ ] **Git** installé
  ```bash
  git --version
  ```

---

## 🔐 Compte Azure

- [ ] Azure subscription active
  ```bash
  az login
  az account show
  # Note: Subscription ID et Name
  ```

- [ ] Permissions: **Owner** ou **Contributor**
  ```bash
  az role assignment list --assignee <your-email>
  ```

- [ ] Quota disponible:
  ```bash
  az provider show --namespace Microsoft.Web --query resourceTypes
  az provider show --namespace Microsoft.Sql --query resourceTypes
  ```

---

## 📁 Fichiers en Place

- [ ] `/infra/main.bicep` existe
- [ ] `/infra/params/dev.bicepparam` existe
- [ ] `/infra/deploy-dev.ps1` existe (Windows) ou `/infra/deploy-dev.sh` (Linux/Mac)
- [ ] `/src/BrigadeMedicale.API/appsettings.Production.json` existe
- [ ] `/src/BrigadeMedicale.API/Program.cs` modifié (SQL Server support)

### Vérifier:
```bash
cd BrigadeMedicale

# Bicep syntax valid
az bicep build ./infra/main.bicep

# PowerShell script syntax
pwsh -Command "Test-Path './infra/deploy-dev.ps1'"

# Files exist
ls infra/
ls src/BrigadeMedicale.API/appsettings.*.json
```

---

## 🌐 Connectivité

- [ ] Internet stable ✓
- [ ] Pas de proxy/firewall bloquant Azure
  ```bash
  curl https://management.azure.com/
  # HTTP 401/403 = OK (auth required)
  # Connection refused = Bloqué
  ```

---

## 💾 Backup (Optionnel mais recommandé)

```bash
# Git commit tous les changements locaux
git add .
git commit -m "feat: azure deployment infrastructure"
git push origin main
```

---

## 🚀 Go / No-Go

### ✅ GO - Prêt à déployer
- [ ] Tous les outils installés
- [ ] Azure login OK
- [ ] Fichiers en place
- [ ] Pas d'erreurs Bicep

### ❌ NO-GO - Attendre
- [ ] Problème de connectivité Azure
- [ ] Outil manquant
- [ ] Fichiers manquants
- [ ] Erreur Bicep

---

## 📝 Avant de Lancer

**Notepad/TextEdit:**
```
Nom du Resource Group: rg-brigademed-dev
Région: francecentral
SQL Admin: sqladmin
SQL Password: [à entrer lors du script]
```

**Temps estimé:** 8-10 minutes (Bicep deploy)

---

## 🎬 Commande de Lancement

### PowerShell (Windows)
```powershell
cd BrigadeMedicale/infra
./deploy-dev.ps1
```

### Bash (Linux/Mac)
```bash
cd BrigadeMedicale/infra
chmod +x deploy-dev.sh
./deploy-dev.sh
```

### À faire pendant le script:
1. **Azure Login:** Cliquer sur lien d'authentification
2. **SQL Password:** Entrer un password sécurisé (min 8 chars + majuscule + chiffre + spécial)
3. **Attendre:** Bicep déploie (5-10 min)
4. **Outputs:** Noter les URLs affichées

---

## ✅ Après Déploiement

### Vérifier succès
```bash
# Resource Group créé
az group show --name rg-brigademed-dev

# Resources déployées
az resource list --resource-group rg-brigademed-dev

# Outputs sauvegardés
cat infra/.deployment-outputs.json
```

### Prochaines étapes
1. **EF Migrations** → voir `/infra/EF_MIGRATIONS.md`
2. **Deploy Code** → voir `/infra/README.md` section "Déploiement du code"
3. **Test API** → `curl https://brigademed-dev-api.azurewebsites.net/swagger`

---

## 🆘 Si Erreur

```bash
# Logs complets
az deployment group show \
  --resource-group rg-brigademed-dev \
  --name main \
  --query properties.outputs

# Erreur Bicep spécifique
az bicep build ./infra/main.bicep --verbose

# Cleanup
az group delete --name rg-brigademed-dev --yes --no-wait
```

---

**Ready? Let's go! 🚀**

```bash
cd BrigadeMedicale/infra && ./deploy-dev.ps1  # (Windows)
# ou
cd BrigadeMedicale/infra && ./deploy-dev.sh   # (Linux/Mac)
```
