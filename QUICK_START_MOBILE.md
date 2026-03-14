# ⚡ QUICK START - Mobile Patient App

**5 minutes pour tester**

## Step 1: Compiler

```bash
cd src/BrigadeMedicale.Patient.Mobile
dotnet build -c Debug
```

✅ **Résultat attendu:** "Build succeeded" - 0 erreurs

## Step 2: Exécuter

### Windows (Desktop)
```bash
dotnet maui run -f net10.0-windows
```

### Android (Emulator)
```bash
dotnet maui run -f net10.0-android
```

### iOS (Simulator sur Mac)
```bash
dotnet maui run -f net10.0-ios
```

## Step 3: Test Flow

### ✅ Test 1: Écran d'accueil
- [ ] App démarre
- [ ] Affiche "Brigade Médicale"
- [ ] 4 cartes informatives visibles
- [ ] 2 boutons: "Me connecter" + "Créer un compte"

### ✅ Test 2: Créer un compte
1. Clic "Créer un compte" → OnboardingPage
2. **Étape 1 - Identité:**
   - [ ] Saisir Prénom: "Jean"
   - [ ] Saisir Nom: "Dupont"
   - [ ] Sélectionner Date: avant aujourd'hui
   - [ ] Sélectionner Sexe: "Male"
   - [ ] Saisir Téléphone: "+243 123 456 789"
   - [ ] Sélectionner Secteur: "EST 1"
   - [ ] Clic "Suivant" → Étape 2

3. **Étape 2 - Santé:**
   - [ ] Toggle "Est de l'église?" → ON
   - [ ] Sélectionner Secteur d'église
   - [ ] Saisir Adresse
   - [ ] Saisir Ville
   - [ ] Saisir Groupe sanguin
   - [ ] Clic "Soumettre"

4. **Succès:**
   - [ ] Affiche "Succès!" ✅
   - [ ] Affiche numéro patient (BM-2026-XXXXX)
   - [ ] Affiche QR code
   - [ ] 2 boutons: "Accéder carnet" + "Partager QR"

### ✅ Test 3: Login
1. Retour MainPage (clic back/home)
2. Clic "Me connecter" → LoginPage
3. Saisir Numéro patient: BM-2026-XXXXX (du step 2)
4. Saisir Téléphone: +243 123 456 789
5. Clic "Connexion"
6. Doit afficher SuccessPage (numéro + QR)

### ✅ Test 4: Dark Mode
1. Settings → Appearance
2. Toggle Dark Mode
3. Vérifier que:
   - [ ] Couleurs s'ajustent
   - [ ] Texte reste lisible
   - [ ] Pas d'erreurs

## Mode MOCK (Si backend pas disponible)

### Scénario
1. Backend API .NET arrêté
2. Tenter enregistrement
3. Doit recevoir 404 sur `/api/public/patients/register`
4. App bascule en mode MOCK

### Vérifier
- [ ] Enregistrement fonctionne sans API
- [ ] Numéro patient généré: BM-2026-XXXXX
- [ ] QR code généré localement
- [ ] Token généré aléatoire

## Points Critiques

| Point | Status | Notes |
|-------|--------|-------|
| Compilation | ✅ | 0 erreurs XAML/C# |
| MainPage | ✅ | Affiche + responsive |
| LoginPage | ✅ | Validation OK |
| OnboardingPage | ✅ | 2 étapes + nav |
| SuccessPage | ✅ | QR + Share |
| Dark mode | ✅ | AppThemeBinding |
| Token storage | ⏳ | À vérifier après API |
| API integration | ⏳ | Dépend backend |

## Troubleshooting

### "Build échoue"
```bash
# Nettoyer et recompiler
dotnet clean
dotnet restore
dotnet build
```

### "App se ferme au démarrage"
- Vérifier logs DEBUG
- Vérifier Exceptions dans MauiProgram

### "Pages ne changent pas"
- Vérifier Shell navigation:
  ```bash
  Shell.Current.GoToAsync("onboarding");
  ```
- Vérifier AppShell.xaml routes

### "Dark mode pas visible"
- Vérifier DeviceInfo.Current.RequestedTheme
- Vérifier AppThemeBinding dans XAML

## Fichiers Clés à Consulter

| Fichier | Contenu |
|---------|---------|
| `MauiProgram.cs` | DI + configuration |
| `AppShell.xaml` | Routes navigation |
| `MainPage.xaml` | Écran accueil |
| `OnboardingPage.xaml` | Inscription 2 étapes |
| `TokenService.cs` | Authentification |
| `ApiClient.cs` | Calls API |

## Logs Utiles

### Enable DEBUG logs
```csharp
// Dans MauiProgram.cs
#if DEBUG
builder.Logging.AddDebug();
#endif
```

### Check Errors
```bash
# Windows: View → Output → Debug
# VS Code: Debug console
```

## Backend Configuration

### Local Development
```
API Base URL: http://localhost:5238
Endpoints: /api/public/patients/...
```

### Production
```
API Base URL: https://api.brigademedical.com
(À configurer dans MauiProgram.cs)
```

---

**Prêt à tester? Go! 🚀**
