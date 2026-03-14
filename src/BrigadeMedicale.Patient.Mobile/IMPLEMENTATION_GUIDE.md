# Guide d'Implémentation - Brigade Médicale Patient Mobile

## Vue d'ensemble

Ce guide couvre l'implémentation complète de l'application MAUI Patient pour Brigade Médicale.

## État du Projet

### Complété

1. **MauiProgram.cs** - Configuration complète de l'injection de dépendances
   - Services HTTP (ApiClient)
   - Services d'authentification (TokenService)
   - Stockage sécurisé (SecureTokenStorage)
   - Enregistrement de toutes les pages et ViewModels

2. **Pages Créées**
   - `MainPage.xaml/cs` - Écran d'accueil avec boutons Login/Register
   - `Features/Auth/Pages/LoginPage.xaml/cs` - Connexion patient
   - `Features/Onboarding/Pages/OnboardingPage.xaml/cs` - Inscription (2 étapes)
   - `Features/Onboarding/Pages/SuccessPage.xaml/cs` - Affichage QR + numéro patient

3. **Navigation**
   - `AppShell.xaml` - Configuration complète de la navigation
   - Routes configurées: main, login, onboarding, success, health-record

4. **Design et Styles**
   - `Resources/Styles/Colors.xaml` - Palette teal/bleu Brigade Médicale
   - `Resources/Styles/Styles.xaml` - Styles globaux (boutons, entrées, labels)
   - Convertisseurs de valeurs pour les bindings

5. **ViewModels Existants**
   - `LoginViewModel` - Gestion connexion patient
   - `OnboardingViewModel` - Gestion inscription 2 étapes
   - `SuccessViewModel` - Affichage des infos de succès

## Prochaines Étapes

### 1. Tester la Compilation
```bash
cd src/BrigadeMedicale.Patient.Mobile
dotnet build
```

### 2. Configuration API
Modifier `MauiProgram.cs` pour pointer vers votre API :
```csharp
#if DEBUG
    var baseUrl = "http://localhost:5238"; // Votre URL API
#else
    var baseUrl = "https://api.brigademedical.com";
#endif
```

### 3. Tester sur Émulateur/Appareil
```bash
# Android
dotnet maui run -f net8.0-android

# iOS
dotnet maui run -f net8.0-ios

# Windows
dotnet maui run -f net8.0-windows
```

## Architecture Actuelle

```
BrigadeMedicale.Patient.Mobile/
├── Core/
│   ├── Http/
│   │   └── ApiClient.cs
│   ├── Models/
│   │   ├── PatientDtos.cs
│   │   └── Enums.cs
│   ├── Storage/
│   │   └── SecureTokenStorage.cs
│   └── Converters/
│       └── ValueConverters.cs
├── Features/
│   ├── Auth/
│   │   ├── Pages/
│   │   │   └── LoginPage.xaml/cs
│   │   ├── Services/
│   │   │   └── TokenService.cs
│   │   └── ViewModels/
│   │       └── LoginViewModel.cs
│   └── Onboarding/
│       ├── Pages/
│       │   ├── OnboardingPage.xaml/cs
│       │   └── SuccessPage.xaml/cs
│       └── ViewModels/
│           ├── OnboardingViewModel.cs
│           └── SuccessViewModel.cs
├── Resources/
│   └── Styles/
│       ├── Colors.xaml
│       └── Styles.xaml
├── MainPage.xaml/cs
├── AppShell.xaml/cs
├── App.xaml/cs
└── MauiProgram.cs
```

## Pages Créées - Détails

### MainPage.xaml
- **Rôle**: Écran d'accueil / Point d'entrée
- **Éléments**:
  - Logo/Branding Brigade Médicale
  - 2 boutons: "Me connecter" et "Créer un compte"
  - 4 cartes informatives (Dossiers, Sécurisé, Accès, 24/7)
  - Responsive design (mobile & tablet)
  - Dark mode support

### LoginPage.xaml
- **Rôle**: Authentification patient
- **Éléments**:
  - Champs: Numéro patient, Numéro téléphone
  - Validation en temps réel
  - Indicateur de chargement
  - Lien vers inscription
  - Support boutons secondaires

### OnboardingPage.xaml
- **Rôle**: Inscription en 2 étapes
- **Étape 1 - Identité**:
  - Prénom, Nom, Date de naissance
  - Sexe, Téléphone, Secteur
- **Étape 2 - Santé**:
  - Adresse, Ville
  - Groupe sanguin, Allergies
  - Maladies chroniques
  - Optionnel: Secteur d'église
- **Navigation**: Boutons Précédent/Suivant
- **Barre de progression**: Affiche l'avancement

### SuccessPage.xaml
- **Rôle**: Confirmation et affichage des infos
- **Éléments**:
  - Icône de succès (checkmark)
  - Affichage du numéro patient (copiable)
  - Affichage du code QR
  - Boutons: Accéder carnet, Partager QR
  - Tips de sécurité

## Couleurs Brigade Médicale

```xaml
Primary:          #008B8B (Teal foncé)
PrimaryDark:      #006666 (Teal très foncé)
PrimaryLight:     #20B2AA (Teal clair)
PrimaryVeryLight: #E0F7F6 (Teal très clair)
Secondary:        #0066CC (Bleu)
Success:          #28A745 (Vert)
Warning:          #FFC107 (Orange)
Error:            #DC3545 (Rouge)
```

## Styles Disponibles

### Labels
- `PageTitle` - Titre de page (28px, teal)
- `SectionTitle` - Sous-titre (18px, teal foncé)
- `BodyText` - Texte corps (14px)
- `CaptionText` - Sous-texte (12px)
- `ErrorText` - Erreur rouge
- `SuccessText` - Succès vert

### Boutons
- `PrimaryButton` - Bouton principal (teal)
- `SecondaryButton` - Bouton secondaire (bordure)

### Entrées
- `FormEntry` - Champ texte
- `FormPicker` - Liste déroulante
- `FormDatePicker` - Sélecteur date

## Convertisseurs Disponibles

```xaml
{StaticResource InvertedBoolConverter}        <!-- Inverse bool -->
{StaticResource StringNullOrEmptyBoolConverter}<!-- String != null/empty -->
{StaticResource ProgressConverter}            <!-- Num étape → progress -->
{StaticResource StepConverter}                <!-- Afficher étape X -->
```

## Bindings MVVM

Toutes les pages utilisent le pattern MVVM :

```csharp
// Dans le code-behind
public LoginPage(LoginViewModel viewModel)
{
    InitializeComponent();
    BindingContext = viewModel;
}
```

## À Implémenter Ultérieurement

1. **Carnet de Santé**
   - HealthRecordShell.xaml
   - Onglets: Overview, Profil, Visites, Consultations, Tests, Prescriptions, Annonces

2. **Autres Fonctionnalités**
   - Gestion de session
   - Actualisation tokens
   - Logout
   - Récupération de mot de passe

## Validation des Données

### Étape 1 Onboarding
- Prénom requis
- Nom requis
- Date de naissance valide (< aujourd'hui)
- Téléphone ≥ 10 chiffres
- Secteur sélectionné

### Étape 2 Onboarding
- Secteur d'église si IsFromChurch = true

### Login
- Numéro patient non vide
- Téléphone non vide

## États de Chargement

Utilise `ActivityIndicator` pendant les requêtes API :

```xaml
<ActivityIndicator
    IsRunning="{Binding IsLoading}"
    IsVisible="{Binding IsLoading}"
    Color="{StaticResource Primary}" />
```

## Messages d'Erreur

Les messages d'erreur s'affichent en utilisant `StatusMessage` du ViewModel :

```xaml
<Label
    Text="{Binding StatusMessage}"
    Style="{StaticResource ErrorText}" />
```

## Dark Mode

Toutes les pages supportent le mode sombre via `AppThemeBinding` :

```xaml
BackgroundColor="{AppThemeBinding Light={StaticResource White}, Dark={StaticResource OffBlack}}"
```

## Notes d'Implémentation

1. **SecureStorage**: Utilise SecureStorage.SetAsync/GetAsync avec fallback sur Preferences
2. **Navigation**: Utilise les routes Shell (e.g., `Shell.Current.GoToAsync("login")`)
3. **HttpClient**: Timeout 30 secondes, headers X-Patient-Token automatiques
4. **Responsive Design**: Grid et StackLayout adaptatifs pour tous les écrans

## Dépannage

### Pages ne s'affichent pas
- Vérifier que les pages sont enregistrées dans MauiProgram.cs
- Vérifier les routes dans AppShell.xaml

### Bindings ne fonctionnent pas
- Vérifier que BindingContext est assigné dans le code-behind
- Vérifier les noms de propriétés (case-sensitive)
- Activer Debug binding: `{Binding PropertyName, Mode=TwoWay, UpdateSourceTrigger=PropertyChanged}`

### API ne répond pas
- Vérifier le baseUrl dans MauiProgram.cs
- Vérifier les certificats SSL en développement
- Consulter les logs: `Debug.WriteLine($"...")`

## Contrats API Attendus

### POST /api/public/patients/register
```json
{
  "firstName": "string",
  "lastName": "string",
  "dateOfBirth": "2024-01-01",
  "gender": 0,
  "phoneNumber": "string",
  "address": "string",
  "city": "string",
  "bloodType": "string",
  "allergies": "string",
  "chronicDiseases": "string",
  "sector": "string",
  "isFromChurch": false,
  "churchSector": "string"
}
```

Réponse attendue:
```json
{
  "success": true,
  "data": {
    "patientNumber": "BM-2024-12345",
    "accessToken": "token...",
    "qrCodeDataUrl": "data:image/png;base64,..."
  }
}
```

### POST /api/public/patients/login-phone
```json
{
  "patientNumber": "BM-2024-12345",
  "phoneNumber": "+243..."
}
```

Même réponse que register.

## Documentation Additionnelle

- MAUI: https://learn.microsoft.com/en-us/dotnet/maui/
- XAML: https://learn.microsoft.com/en-us/dotnet/maui/xaml/
- Binding: https://learn.microsoft.com/en-us/dotnet/maui/fundamentals/data-binding/

---
**Dernière mise à jour**: 2026-02-11
**Statut**: Pages critiques complétées
