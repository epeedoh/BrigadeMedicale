# Configuration d'Exécution - Brigade Médicale Frontend

## 📋 Vue d'ensemble

Ce fichier explique comment modifier la configuration de l'application **sans redéploiement du frontend** en éditant simplement le fichier `config.json`.

---

## 🔧 Fichier de Configuration

**Emplacement:** `/assets/config.json`

**Contenu:**
```json
{
  "production": false,
  "apiUrl": "https://littleaqualamp51.conveyor.cloud/api",
  "tokenKey": "brigade_access_token",
  "refreshTokenKey": "brigade_refresh_token",
  "environment": "development"
}
```

---

## ✏️ Modifier la Configuration

### **Sur le serveur déployé (IIS):**

1. **Ouvrez un explorateur de fichiers** sur le serveur
2. **Naviguez vers:** `C:\Users\surface\source\repos\BrigadeMedicale\publish\ui\assets\`
3. **Ouvrez** `config.json` avec Notepad ou Visual Studio Code
4. **Modifiez** les paramètres (voir ci-dessous)
5. **Sauvegardez** le fichier (Ctrl+S)
6. **Videz le cache du navigateur** (F5 ou Ctrl+Shift+Delete)
7. **Rechargez** la page (F5)

---

## 📝 Paramètres Configurables

### **1. `apiUrl` - URL de l'API Backend**

**Description:** URL de base pour toutes les requêtes API

**Exemples:**
```json
"apiUrl": "https://littleaqualamp51.conveyor.cloud/api"
```
```json
"apiUrl": "http://localhost:5238/api"
```
```json
"apiUrl": "https://api.brigade-medicale.com/api"
```

**⚠️ Important:**
- Ne pas ajouter de `/` à la fin
- Respecter le protocole: `http://` ou `https://`
- S'assurer que l'API est accessible depuis ce domaine

### **2. `production` - Mode Production**

**Description:** Active/désactive le mode production

```json
"production": true
```
- `true` → Mode production (optimisations, moins de logs)
- `false` → Mode développement (logs détaillés, debugging)

### **3. `tokenKey` & `refreshTokenKey` - Clés du localStorage**

**Description:** Clés pour stocker les tokens d'authentification

```json
"tokenKey": "brigade_access_token",
"refreshTokenKey": "brigade_refresh_token"
```

⚠️ **Attention:** Si vous changez ces valeurs, les utilisateurs seront déconnectés car leurs anciens tokens ne seront plus trouvés.

### **4. `environment` - Identifiant de l'environnement**

**Description:** Nom de l'environnement (informationnel)

```json
"environment": "development"
```
```json
"environment": "staging"
```
```json
"environment": "production"
```

---

## 🚀 Exemples d'Utilisation

### **Configuration de Développement Local:**
```json
{
  "production": false,
  "apiUrl": "http://localhost:5238/api",
  "tokenKey": "brigade_access_token",
  "refreshTokenKey": "brigade_refresh_token",
  "environment": "development"
}
```

### **Configuration de Production:**
```json
{
  "production": true,
  "apiUrl": "https://littleaqualamp51.conveyor.cloud/api",
  "tokenKey": "brigade_access_token",
  "refreshTokenKey": "brigade_refresh_token",
  "environment": "production"
}
```

### **Configuration de Staging (Test):**
```json
{
  "production": false,
  "apiUrl": "https://staging-api.brigade-medicale.com/api",
  "tokenKey": "brigade_access_token",
  "refreshTokenKey": "brigade_refresh_token",
  "environment": "staging"
}
```

---

## 🔄 Chargement Automatique

La configuration est **chargée automatiquement au démarrage** de l'application via `ConfigService`:

1. L'application démarre
2. `APP_INITIALIZER` charge `/assets/config.json`
3. Tous les services utilisent cette configuration
4. Les requêtes API utilisent le `apiUrl` configuré

---

## ❌ Dépannage

### **Les modifications du config.json ne prennent pas effet**

**Solutions:**
1. **Videz le cache du navigateur:**
   - `Ctrl+Shift+Delete` → Sélectionner "Tout" → Vider
2. **Rechargez la page en force:**
   - `Ctrl+Shift+R` (Windows) ou `Cmd+Shift+R` (Mac)
3. **Vérifiez le fichier config.json:**
   - Assurez-vous que le JSON est **valide** (pas de virgules manquantes)
4. **Vérifiez la console du navigateur:**
   - F12 → Console → Cherchez les erreurs

### **Erreur: "Configuration non chargée"**

**Cause:** Le fichier `config.json` n'a pas pu être chargé ou le JSON est invalide

**Solution:**
1. Vérifiez que le fichier existe: `/assets/config.json`
2. Validez le JSON: [jsonlint.com](https://www.jsonlint.com)
3. Vérifiez les permissions du fichier

### **Les requêtes API échouent (404, 403)**

**Cause:** L'URL de l'API n'est pas correcte ou l'API n'est pas accessible

**Solution:**
1. Vérifiez que `apiUrl` est correct
2. Testez l'URL dans le navigateur
3. Vérifiez les en-têtes CORS de l'API
4. Consultez la console (F12) pour voir l'URL exacte utilisée

---

## 📊 Vérification de la Configuration Chargée

**Ouvrez la console du navigateur (F12):**

```javascript
// Tapez dans la console:
fetch('/assets/config.json').then(r => r.json()).then(c => console.log(c))
```

La configuration chargée s'affichera dans la console.

---

## 🎯 Résumé

| Action | Fichier | Nécessite Redéploiement |
|--------|---------|-------------------------|
| Modifier URL API | `/assets/config.json` | ❌ Non |
| Modifier mode production | `/assets/config.json` | ❌ Non |
| Modifier token keys | `/assets/config.json` | ❌ Non |
| Ajouter nouvelles variables | Code TypeScript | ✅ Oui |
| Modifier la logique métier | Code TypeScript | ✅ Oui |

---

## 💡 Conseils

✅ **À faire:**
- Sauvegarder une copie du config.json avant modifications
- Tester les modifications dans la console avant de redéployer
- Documenter les changements de configuration

❌ **À éviter:**
- Modifier le config.json en mode édition du texte incomplet
- Ajouter des paramètres non reconnus (ils seront ignorés)
- Utiliser des protocoles mixtes HTTP/HTTPS sans raison

---

**Besoin d'aide?** Contactez l'équipe de développement! 🚀
