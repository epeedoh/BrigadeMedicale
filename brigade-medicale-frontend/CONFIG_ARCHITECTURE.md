# 🎯 Configuration Architecture - Brigade Médicale Frontend

## 📌 SOURCE UNIQUE DE VÉRITÉ

```
C:\inetpub\wwwroot\Brigade\ui\assets\config.json
```

**C'est LE SEUL fichier à modifier pour changer l'API en production.**

---

## 🏗️ Architecture Simplifiée

### **Flux de Configuration:**

```
Application Start
  ↓
APP_INITIALIZER (app.config.ts)
  ↓
ConfigService.loadConfig()
  ↓
/assets/config.json (SEULE SOURCE)
  ↓
Tous les services utilisent ConfigService.getApiUrl()
```

---

## 📂 Fichiers de Configuration

### ✅ **UTILISÉ EN PRODUCTION:**

```json
C:\inetpub\wwwroot\Brigade\ui\assets\config.json
{
  "production": false,
  "apiUrl": "https://longsagetower32.conveyor.cloud/api",
  "tokenKey": "brigade_access_token",
  "refreshTokenKey": "brigade_refresh_token",
  "environment": "development"
}
```

**Modifier UNIQUEMENT ce fichier pour changer l'API!**

---

### ❌ **IGNORÉS (Pas utilisés en production):**

```
src/environments/environment.ts        → Développement uniquement
src/environments/environment.prod.ts   → Développement uniquement
```

Ces fichiers sont ignorés en production. Ne les modifiez pas pour changer l'API!

---

## 🔄 Comment Ça Fonctionne

### **1. Startup**
```typescript
// app.config.ts
{
  provide: APP_INITIALIZER,
  useFactory: (configService: ConfigService) => () => configService.loadConfig(),
  deps: [ConfigService],
  multi: true
}
```

### **2. ConfigService**
```typescript
async loadConfig(): Promise<AppConfig> {
  // Charge /assets/config.json avec anti-cache
  this.config = await fetch('/assets/config.json?v=' + timestamp);
  return this.config;
}
```

### **3. Tous les Services**
```typescript
// Exemple: AuthService
private getAuthUrl(): string {
  return `${this.configService.getApiUrl()}/auth`;
}
```

---

## 🚀 Changer l'API (PRODUCTION)

### **Étape 1: Modifier le fichier**
```bash
C:\inetpub\wwwroot\Brigade\ui\assets\config.json
```

Changez:
```json
"apiUrl": "https://NOUVELLE_URL/api"
```

### **Étape 2: Vider le cache navigateur**
- `Ctrl+Shift+Delete` → "Tout" → Vider

### **Étape 3: Rafraîchir**
- `F5` ou `Ctrl+Shift+R`

**Aucun redéploiement du frontend nécessaire!** ✨

---

## 📊 Résumé des URLs

| URL | Fichier | Utilisé? | But |
|-----|---------|----------|-----|
| `longsagetower32.conveyor.cloud` | config.json (IIS) | ✅ OUI | Production |
| `goodsparklytree45.conveyor.cloud` | environment.ts | ❌ NON | Dev (ignoré) |
| `littleaqualamp51.conveyor.cloud` | ~~Ancien fallback~~ | ❌ NON | Supprimé |

---

## ⚠️ Bonnes Pratiques

✅ **À FAIRE:**
- Modifier uniquement `/assets/config.json` en production
- Vider le cache après modification
- Tester la connexion après changement

❌ **À ÉVITER:**
- Modifier `environment.ts` ou `environment.prod.ts` en production
- Redéployer le frontend juste pour changer l'API
- Garder plusieurs copies du fichier de config

---

## 🔍 Vérification

Pour vérifier quelle API est utilisée:

```javascript
// Console du navigateur (F12)
fetch('/assets/config.json').then(r => r.json()).then(c => console.log(c.apiUrl))
```

Devrait afficher l'API URL de votre config.json.

---

**Dernière mise à jour: 2026-03-10**
