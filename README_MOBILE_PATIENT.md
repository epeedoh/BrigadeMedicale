# 📱 Application Mobile Patient - Brigade Médicale

## ✅ Statut: Prêt Phase 2

Cette application MAUI cross-platform permet aux patients de Brigade Médicale de:
- Inscriptions avec 2 étapes (identité + santé)
- Authentification sécurisée par token
- Accès au carnet de santé
- Gestion QR code patient

**Phase 1 (Auth + Onboarding):** ✅ **LIVRÉ**
**Phase 2 (Health Record):** ⏳ À faire

---

## 🚀 Démarrage Rapide

### Compilation
```bash
cd src/BrigadeMedicale.Patient.Mobile
dotnet build -c Debug
```

### Exécution
```bash
# Windows Desktop
dotnet maui run -f net10.0-windows

# Android
dotnet maui run -f net10.0-android

# iOS
dotnet maui run -f net10.0-ios
```

---

## 📋 Architecture

Voir `IMPLEMENTATION_GUIDE.md` pour documentation complète.

```
Core/
├── Http/ApiClient.cs          (Client REST + token auto)
├── Storage/TokenStorage.cs    (Stockage sécurisé)
├── Models/                    (DTOs + Enums)
└── ViewModels/BaseViewModel.cs (MVVM base)

Features/
├── Auth/
│   ├── Services/TokenService.cs
│   └── Pages/LoginPage.xaml
├── Onboarding/
│   ├── Pages/OnboardingPage.xaml  (2 étapes)
│   └── Pages/SuccessPage.xaml    (QR + numéro)
└── HealthRecord/
    └── (À implémenter Phase 2)
```

---

## 🎨 Design

- **Couleurs**: Teal (#008B8B) + Bleu (#0066CC)
- **Responsive**: Mobile/Tablet support
- **Dark Mode**: Complètement implémenté
- **Accessibilité**: Boutons 44px min

---

## 🔐 Authentification

### Token Flow
1. Enregistrement → `/api/public/patients/register`
2. Login → `/api/public/patients/login-phone`
3. Token stocké → `SecureStorage` (puis `Preferences` fallback)
4. Header automatique → `X-Patient-Token: {token}`

### Pages Implémentées
✅ **MainPage** - Accueil avec 2 CTA
✅ **LoginPage** - Connexion patient  
✅ **OnboardingPage** - Inscription 2 étapes
✅ **SuccessPage** - Numéro + QR + Share

---

## 📡 Endpoints API

**Public:**
- `POST /api/public/patients/register`
- `POST /api/public/patients/login-phone`
- `GET /api/public/patients/check-phone/{phone}`

**Protégés** (Phase 2):
- `GET /api/patient/me`
- `GET /api/patient/visits`
- `GET /api/patient/consultations`
- `GET /api/patient/lab-tests`
- `GET /api/patient/prescriptions`
- `GET /api/patient/announcements`

---

## 🧪 Checklist Phase 1

- [x] Code MAUI complet
- [x] Services (Auth, API, Storage)
- [x] Pages Auth + Onboarding
- [x] Design responsive
- [x] Dark mode
- [x] Compilation OK (0 erreurs)
- [x] Documentation

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| `IMPLEMENTATION_GUIDE.md` | Architecture + patterns |
| `CODE_EXAMPLES.md` | 15+ exemples pratiques |
| `IMPLEMENTATION_SUMMARY.md` | Fichiers créés/modifiés |

---

## ⏳ Phase 2 (Prochaine)

Carnet de santé avec bottom nav:
- Overview (résumé)
- Profil + secteur/église  
- Visites timeline
- Consultations liste/détail
- Analyses liste/détail
- Pharmacie/Ordonnances
- Infos/Annonces
- Logout

**ETA**: +1 semaine de développement

---

**Créé**: 2026-02-11  
**Version**: 1.0.0-alpha  
**Status**: ✅ Complet Phase 1
