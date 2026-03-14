# Plan d'implémentation - Application Mobile Patient (MAUI)

## 🎯 Objectif
Créer une application MAUI pour les patients avec:
- Onboarding 2 étapes (identité + infos santé)
- Authentification par token
- Carnet de santé (lectures seules)
- Mode Mock DEV si API indisponible

## 📁 Structure du projet
```
src/BrigadeMedicale.Patient.Mobile/
├── MauiProgram.cs
├── Platforms/
├── Resources/
├── Features/
│   ├── Onboarding/
│   │   ├── Pages/
│   │   │   ├── OnboardingPage.xaml
│   │   │   └── SuccessPage.xaml
│   │   ├── ViewModels/
│   │   │   ├── OnboardingViewModel.cs
│   │   │   └── SuccessViewModel.cs
│   │   └── Models/
│   ├── Auth/
│   │   ├── Pages/
│   │   │   └── LoginPage.xaml
│   │   ├── ViewModels/
│   │   │   └── LoginViewModel.cs
│   │   └── Services/
│   │       └── TokenService.cs
│   └── HealthRecord/
│       ├── Pages/
│       ├── ViewModels/
│       └── Models/
├── Core/
│   ├── Http/
│   │   └── ApiClient.cs
│   ├── Storage/
│   │   └── SecureTokenStorage.cs
│   └── Models/
│       ├── ApiResponse.cs
│       ├── PatientDtos.cs
│       └── Enums.cs
└── App.xaml

```

## 🔄 Endpoints API à supporter
**Public (sans token):**
- `POST /api/public/patients/register`
- `GET /api/public/patients/check-phone/{phone}`
- `POST /api/public/patients/login-phone`

**Protégés (X-Patient-Token header):**
- `GET /api/patient/me`
- `GET /api/patient/visits`
- `GET /api/patient/consultations`
- `GET /api/patient/consultations/{id}`
- `GET /api/patient/lab-tests`
- `GET /api/patient/lab-tests/{id}`
- `GET /api/patient/prescriptions`
- `GET /api/patient/announcements`

## ✅ Checklist de livraison
- [ ] Projet MAUI créé et ajouté à la solution
- [ ] Onboarding 2 étapes (identifier + santé)
- [ ] Écran succès avec QR et partage
- [ ] Login patient (par téléphone/numéro)
- [ ] Token storage sécurisé
- [ ] Header X-Patient-Token ajouté aux appels API
- [ ] Carnet de santé (overview/profil/visites/consultations/analyses/pharmacie/infos)
- [ ] Gestion des états (loading/error/empty)
- [ ] Mode Mock DEV
- [ ] Support mobile + tablette
- [ ] Build Android OK

## 🚀 Prochaines étapes
1. Créer la structure MAUI complète
2. Implémenter les services HTTP
3. Implémenter l'onboarding
4. Implémenter le carnet de santé
5. Tester avec le backend
