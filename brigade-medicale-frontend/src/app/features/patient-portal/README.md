# Patient Portal - Brigade Médicale

## Vue d'ensemble

Le portail patient est un espace dédié permettant aux patients de :
1. **S'auto-enrôler** avant leur visite à la clinique
2. **Accéder à leur carnet de santé** (consultations, analyses, ordonnances)
3. **Consulter les informations** et annonces de la clinique

## Architecture

```
features/patient-portal/
├── core/                          # Services et utilitaires
│   ├── services/
│   │   ├── patient-token.service.ts    # Gestion du token patient
│   │   ├── patient-public.service.ts   # API publique (enrôlement)
│   │   └── patient-portal.service.ts   # API carnet de santé
│   ├── guards/
│   │   └── patient.guard.ts            # Protection des routes
│   ├── interceptors/
│   │   └── patient-api.interceptor.ts  # Injection X-Patient-Token
│   └── index.ts                        # Barrel export
├── layout/
│   └── patient-shell/                  # Layout principal (sidebar + bottom nav)
├── pages/
│   ├── onboarding/                     # Formulaire d'inscription
│   ├── onboarding-success/             # Écran de succès + QR code
│   ├── patient-login/                  # Connexion patient existant
│   └── dashboard/                      # Pages du carnet de santé
│       ├── overview/                   # Accueil / résumé
│       ├── profile/                    # Profil patient
│       ├── visits/                     # Historique des visites
│       ├── consultations/              # Consultations médicales
│       ├── analyses/                   # Analyses de laboratoire
│       ├── pharmacie/                  # Ordonnances / médicaments
│       └── infos/                      # Annonces / conseils santé
└── README.md
```

## Liste des secteurs (imposée)

Les secteurs disponibles sont :
- EST 1
- EST 2
- OUEST 1
- OUEST 2
- SUD 1
- SUD 2
- NORD 1

## Flux d'enrôlement

```
┌─────────────────┐
│ /patient/onboarding │
│   Étape 1: Identité   │
│   - Nom, Prénom       │
│   - Date de naissance │
│   - Sexe              │
│   - Téléphone         │
│   - Secteur (dropdown)│
└─────────┬─────────────┘
          │
          ▼
┌─────────────────┐
│   Étape 2: Infos     │
│   - Église ? (bool)   │
│   - Secteur église    │
│   - Adresse, Ville    │
│   - Groupe sanguin    │
│   - Allergies         │
│   - Maladies chron.   │
└─────────┬─────────────┘
          │
          │ POST /api/public/patients/register
          ▼
┌─────────────────┐
│ /patient/success     │
│   - Numéro patient    │
│   - QR Code           │
│   - Bouton télécharger│
│   - Accès au dashboard│
└─────────────────┘
```

## Stockage du token patient

- **Clé localStorage** : `patientToken`
- **Clé numéro patient** : `patientNumber`
- **Clé QR code** : `patientQrCode`

Le token est stocké dans `localStorage` (et non sessionStorage) pour permettre au patient de revenir ultérieurement.

## Endpoints API utilisés

### Endpoints publics (pas de token requis)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/public/patients/register` | Enrôlement nouveau patient |
| GET | `/api/public/patients/check-phone/{phone}` | Vérifier si téléphone existe |
| POST | `/api/public/patients/login` | Connexion par token |
| POST | `/api/public/patients/login-phone` | Connexion par téléphone |

### Endpoints protégés (X-Patient-Token requis)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/patient/me` | Profil du patient |
| GET | `/api/patient/visits` | Liste des visites |
| GET | `/api/patient/consultations` | Liste des consultations |
| GET | `/api/patient/consultations/{id}` | Détail consultation |
| GET | `/api/patient/lab-tests` | Liste des analyses |
| GET | `/api/patient/lab-tests/{id}` | Détail analyse |
| GET | `/api/patient/prescriptions` | Liste des ordonnances |
| GET | `/api/patient/announcements` | Annonces et infos |

## Authentification

### Différence avec l'auth Staff

| Aspect | Staff | Patient |
|--------|-------|---------|
| Type de token | JWT Bearer | Token patient simple |
| Header | `Authorization: Bearer xxx` | `X-Patient-Token: xxx` |
| Stockage | sessionStorage | localStorage |
| Expiration | 15-30 min + refresh | Longue durée |
| Permissions | RBAC (rôles) | Lecture seule (son dossier) |

### Intercepteur

L'intercepteur `patientApiInterceptor` ajoute automatiquement le header `X-Patient-Token` pour toutes les requêtes vers `/api/patient/*`.

## Routes

```typescript
/patient
├── /onboarding          # Formulaire inscription (patientGuestGuard)
├── /login               # Connexion (patientGuestGuard)
├── /success             # Page succès après inscription
└── /dashboard           # Layout principal (patientGuard)
    ├── /overview        # Accueil
    ├── /profile         # Mon profil
    ├── /visits          # Mes visites
    ├── /consultations   # Mes consultations
    ├── /analyses        # Mes analyses
    ├── /pharmacie       # Mes médicaments
    └── /infos           # Informations
```

## Guards

- **patientGuard** : Vérifie présence du token, redirige vers `/patient/login` si absent
- **patientGuestGuard** : Redirige vers `/patient/dashboard` si déjà connecté

## Responsive Design

L'interface est conçue pour fonctionner sur :
- **Mobile** (≥360px) : Bottom navigation, cards empilées
- **Tablette** (≥768px) : Sidebar réduite, grilles adaptatives
- **Desktop** (≥1024px) : Sidebar complète, grilles multi-colonnes

### Points clés UX mobile :
- Taille de police minimum : 14px
- Boutons : hauteur minimum 44px
- Espacement tactile adéquat
- Navigation bottom fixe sur mobile

## TODO Backend

Si les endpoints ne sont pas encore implémentés côté backend :

### 1. Endpoint d'enrôlement
```csharp
[HttpPost("register")]
public async Task<IActionResult> Register(PatientRegisterDto dto)
{
    // 1. Valider les données
    // 2. Vérifier unicité téléphone
    // 3. Créer le patient
    // 4. Générer le token patient
    // 5. Générer le QR code (base64)
    // 6. Retourner PatientRegisterResponse
}
```

### 2. Nouveaux champs Patient
```csharp
public class Patient
{
    // ... existants ...
    public string? Sector { get; set; }
    public bool IsFromChurch { get; set; }
    public string? ChurchSector { get; set; }
    public string? ChronicDiseases { get; set; }
}
```

### 3. Endpoints carnet de santé
- Créer un contrôleur `PatientPortalController`
- Middleware pour valider `X-Patient-Token`
- Retourner uniquement les données du patient authentifié

## Gestion des erreurs API

Le frontend gère les erreurs API de manière user-friendly :

| Code HTTP | Message affiché |
|-----------|-----------------|
| 0 (réseau) | "Impossible de contacter le serveur. Vérifiez votre connexion internet." |
| 404 | "Le service d'inscription n'est pas disponible actuellement. Contactez l'accueil." |
| 409 | "Un patient avec ce numéro de téléphone existe déjà." |
| 400 | "Données invalides. Vérifiez les informations saisies." |
| 500 | "Erreur serveur. Réessayez dans quelques instants." |

## Tests

Pour tester le flux complet :

1. Accéder à `http://localhost:4200/patient/onboarding`
2. Remplir le formulaire d'inscription
3. Vérifier l'appel POST vers `/api/public/patients/register`
4. Après succès, vérifier :
   - Stockage du token dans localStorage
   - Affichage du QR code
   - Navigation vers le dashboard

## Maintenance

### Ajouter une nouvelle page au dashboard

1. Créer le composant dans `pages/dashboard/`
2. Ajouter la route dans `app.routes.ts`
3. Ajouter l'entrée menu dans `patient-shell.component.ts`

### Modifier le formulaire d'onboarding

Les champs sont définis dans `onboarding.component.ts` :
- `initForm()` : Définition du FormGroup
- Template : Sections Step 1 et Step 2

## Contact

Pour toute question technique, consulter l'équipe de développement Brigade Médicale.
