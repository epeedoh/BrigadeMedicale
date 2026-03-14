# LIVRABLE 1 : ARCHITECTURE GLOBALE

**Projet** : Brigade Médicale - Application de gestion médicale terrain
**Date** : 2026-01-24
**Version** : 1.0
**Statut** : En attente de validation

---

## 1. VUE D'ENSEMBLE DU SYSTÈME

```
┌─────────────────────────────────────────────────────────────────┐
│                        COUCHE CLIENT                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────┐              │
│  │   WEB APP        │         │   MOBILE APP     │              │
│  │   (Angular)      │         │   (.NET MAUI)    │              │
│  │                  │         │                  │              │
│  │ • Staff Portal   │         │ • Phase 2        │              │
│  │ • Patient Self   │         │ • Hors ligne     │              │
│  │   Onboarding     │         │                  │              │
│  └──────────────────┘         └──────────────────┘              │
│           │                            │                         │
└───────────┼────────────────────────────┼─────────────────────────┘
            │                            │
            └────────────┬───────────────┘
                         │ HTTPS / JWT
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COUCHE API (Gateway)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│              ASP.NET Core Web API (RESTful)                      │
│                                                                   │
│  • Authentification JWT (Staff uniquement)                       │
│  • Validation Token/QR (Patients)                                │
│  • RBAC Authorization                                            │
│  • Rate Limiting & CORS                                          │
│                                                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COUCHE MÉTIER (Business Logic)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Patient   │  │    Staff    │  │  Medical    │             │
│  │   Service   │  │   Service   │  │  Service    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Pharmacy   │  │   Audit     │  │  Document   │             │
│  │   Service   │  │   Service   │  │  Service    │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                   │
│  • Anti-doublon Patient                                          │
│  • Gestion du parcours                                           │
│  • Génération QR Code                                            │
│  • Calcul automatique stock                                      │
│                                                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                 COUCHE ACCÈS DONNÉES (Data Access)               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│              Entity Framework Core (Code First)                  │
│                                                                   │
│  • Repositories Pattern                                          │
│  • Unit of Work                                                  │
│  • Migrations automatiques                                       │
│                                                                   │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    COUCHE PERSISTANCE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│          SQL Server / PostgreSQL                                 │
│                                                                   │
│  • Données patients                                              │
│  • Données médicales                                             │
│  • Référentiels (médicaments, pathologies...)                    │
│  • Audit logs                                                    │
│  • Stock pharmacie                                               │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. ARCHITECTURE BACKEND (ASP.NET Core)

### 2.1 Structure en couches

```
BrigadeMedicale.API/
├── Controllers/              # Points d'entrée API
│   ├── AuthController.cs
│   ├── PatientsController.cs
│   ├── ConsultationsController.cs
│   ├── PharmacyController.cs
│   └── StaffController.cs
│
├── Services/                 # Logique métier
│   ├── Interfaces/
│   └── Implementations/
│       ├── PatientService.cs
│       ├── AuthService.cs
│       ├── ConsultationService.cs
│       ├── PharmacyService.cs
│       └── AuditService.cs
│
├── Data/                     # Accès données
│   ├── ApplicationDbContext.cs
│   ├── Repositories/
│   └── Migrations/
│
├── Models/                   # Entités métier
│   ├── Entities/
│   ├── DTOs/
│   └── ViewModels/
│
├── Middleware/               # Middlewares custom
│   ├── ExceptionHandling.cs
│   └── AuditLogging.cs
│
└── Utilities/                # Helpers
    ├── QRCodeGenerator.cs
    ├── TokenValidator.cs
    └── AntiDuplicateDetector.cs
```

---

## 3. ARCHITECTURE FRONTEND (Angular)

### 3.1 Structure modulaire

```
brigade-medicale-web/
├── src/
│   ├── app/
│   │   ├── core/                    # Services globaux
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── jwt.interceptor.ts
│   │   │   │   └── error.interceptor.ts
│   │   │   └── services/
│   │   │       └── api.service.ts
│   │   │
│   │   ├── shared/                  # Composants réutilisables
│   │   │   ├── components/
│   │   │   ├── directives/
│   │   │   └── pipes/
│   │   │
│   │   ├── features/                # Modules métier
│   │   │   ├── public/
│   │   │   │   └── patient-onboarding/   # Page publique
│   │   │   │
│   │   │   ├── staff/               # Zone authentifiée
│   │   │   │   ├── dashboard/
│   │   │   │   ├── accueil/
│   │   │   │   ├── consultation/
│   │   │   │   ├── laboratory/
│   │   │   │   ├── pharmacy/
│   │   │   │   └── admin/
│   │   │
│   │   └── layouts/
│   │       ├── public-layout/
│   │       └── staff-layout/
```

---

## 4. FLUX D'AUTHENTIFICATION

### 4.1 Staff (JWT classique)

```
┌─────────┐                 ┌─────────┐                ┌──────────┐
│  Staff  │                 │   API   │                │    DB    │
└────┬────┘                 └────┬────┘                └────┬─────┘
     │                           │                          │
     │ POST /auth/login          │                          │
     │ {email, password}         │                          │
     ├──────────────────────────>│                          │
     │                           │                          │
     │                           │ Vérification             │
     │                           ├─────────────────────────>│
     │                           │                          │
     │                           │<─────────────────────────┤
     │                           │ User + Role              │
     │                           │                          │
     │ {token, user, role}       │                          │
     │<──────────────────────────┤                          │
     │                           │                          │
     │ GET /patients             │                          │
     │ Header: Bearer {token}    │                          │
     ├──────────────────────────>│                          │
     │                           │ Validation JWT + Role    │
     │                           │                          │
     │ [patients]                │                          │
     │<──────────────────────────┤                          │
```

### 4.2 Patient (Token/QR sans compte)

```
┌─────────┐                 ┌─────────┐                ┌──────────┐
│ Patient │                 │   API   │                │    DB    │
└────┬────┘                 └────┬────┘                └────┬─────┘
     │                           │                          │
     │ POST /patients/register   │                          │
     │ {nom, prenom, tel, dob}   │                          │
     ├──────────────────────────>│                          │
     │                           │                          │
     │                           │ Anti-doublon check       │
     │                           ├─────────────────────────>│
     │                           │                          │
     │                           │<─────────────────────────┤
     │                           │                          │
     │                           │ Création Patient         │
     │                           │ Génération Token         │
     │                           │ Génération QR Code       │
     │                           │                          │
     │ {patientId, qrCode,       │                          │
     │  accessToken}             │                          │
     │<──────────────────────────┤                          │
     │                           │                          │
     │ GET /patients/me          │                          │
     │ ?token={accessToken}      │                          │
     │ OU ?phone={}&dob={}       │                          │
     ├──────────────────────────>│                          │
     │                           │                          │
     │ {infos patient}           │                          │
     │<──────────────────────────┤                          │
```

---

## 5. FLUX PARCOURS PATIENT

```
   ACCUEIL              MÉDECIN           LABORATOIRE        MÉDECIN          PHARMACIE
      │                    │                   │                │                 │
      ▼                    │                   │                │                 │
┌──────────┐              │                   │                │                 │
│ Création │              │                   │                │                 │
│  Dossier │              │                   │                │                 │
│ + QR Code│              │                   │                │                 │
└────┬─────┘              │                   │                │                 │
     │                    │                   │                │                 │
     │ File d'attente     │                   │                │                 │
     │ Consultation       │                   │                │                 │
     └───────────────────>▼                   │                │                 │
                     ┌──────────┐             │                │                 │
                     │Examen     │             │                │                 │
                     │clinique   │             │                │                 │
                     │           │             │                │                 │
                     │Prescription│            │                │                 │
                     │bilan?     │             │                │                 │
                     └────┬──────┘             │                │                 │
                          │                    │                │                 │
                          │ OUI                │                │                 │
                          └───────────────────>▼                │                 │
                                          ┌──────────┐          │                 │
                                          │Réalisation│         │                 │
                                          │examens    │         │                 │
                                          │           │         │                 │
                                          │Saisie     │         │                 │
                                          │résultats  │         │                 │
                                          └────┬──────┘         │                 │
                                               │                │                 │
                                               └───────────────>▼                 │
                                                           ┌──────────┐           │
                                                           │Diagnostic│           │
                                                           │final     │           │
                                                           │          │           │
                                                           │Ordon-    │           │
                                                           │nance     │           │
                                                           └────┬─────┘           │
                                                                │                 │
                                                                └────────────────>▼
                                                                            ┌──────────┐
                                                                            │Délivrance│
                                                                            │médica-   │
                                                                            │ments     │
                                                                            │          │
                                                                            │MAJ stock │
                                                                            └──────────┘
```

---

## 6. GESTION DES RÔLES (RBAC)

| Rôle | Permissions |
|------|-------------|
| **ADMIN** | • Gestion utilisateurs<br>• Configuration système<br>• Tous les rapports<br>• Gestion référentiels |
| **ACCUEIL** | • Créer/modifier patient<br>• Saisir constantes<br>• Orienter vers consultation |
| **MEDECIN** | • Consulter dossier patient<br>• Créer consultation<br>• Prescrire examens/médicaments<br>• Saisir diagnostic |
| **LABORANTIN** | • Voir prescriptions d'examens<br>• Saisir résultats<br>• Valider bilans |
| **PHARMACIEN** | • Voir ordonnances<br>• Délivrer médicaments<br>• Gérer stock pharmacie |
| **SUPERVISEUR** | • Lecture seule tous dossiers<br>• Statistiques<br>• Export données |

---

## 7. STRATÉGIE ANTI-DOUBLON PATIENT

### Algorithme de détection

```
Étape 1 : Recherche exacte
- Téléphone identique

Étape 2 : Recherche floue
- Nom + Prénom (similarité > 80%)
- Date de naissance identique
- Sexe identique

Étape 3 : Confirmation manuelle
- Si doute → affichage des candidats similaires
- Agent d'accueil valide ou crée nouveau
```

---

## 8. SÉCURITÉ & CONFORMITÉ

### 8.1 Données sensibles (RGPD-like)

- **Chiffrement** : Données au repos (DB) + transit (HTTPS)
- **Pseudonymisation** : ID patient anonyme dans logs
- **Traçabilité** : Audit complet (qui, quoi, quand)
- **Conservation** : Politique de rétention configurable

### 8.2 Mécanismes de sécurité

```
┌─────────────────────────────────────────┐
│  COUCHE SÉCURITÉ                        │
├─────────────────────────────────────────┤
│                                         │
│  1. HTTPS obligatoire                   │
│  2. JWT avec expiration (Staff)         │
│  3. Token à usage unique (Patient)      │
│  4. Rate Limiting (anti-bruteforce)     │
│  5. CORS restrictif                     │
│  6. Validation inputs (DTO)             │
│  7. SQL Injection → EF Core protège     │
│  8. XSS → Angular sanitize auto         │
│  9. Logs audit immuables                │
│ 10. Secrets en variables env            │
│                                         │
└─────────────────────────────────────────┘
```

---

## 9. GESTION HORS LIGNE (contrainte terrain)

### Phase 1 (Web uniquement)
- Mode connecté requis
- Délai de timeout augmenté
- Cache navigateur pour assets statiques

### Phase 2 (Mobile MAUI)
- SQLite locale
- Synchronisation différée
- Détection conflits

---

## 10. SCALABILITÉ & PERFORMANCE

```
┌──────────────────────────────────────────────┐
│  OPTIMISATIONS                               │
├──────────────────────────────────────────────┤
│                                              │
│  Backend :                                   │
│  • Pagination API (limite 50 résultats)     │
│  • Cache Redis (optionnel)                  │
│  • Indexes DB sur colonnes recherchées      │
│  • Lazy loading EF Core                     │
│                                              │
│  Frontend :                                  │
│  • Lazy loading modules Angular             │
│  • Virtual scrolling (listes longues)       │
│  • Compression assets (gzip)                │
│  • Service Worker (PWA optionnel)           │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 11. ENVIRONNEMENTS

| Env | Usage | Base de données |
|-----|-------|-----------------|
| **Development** | Développeurs locaux | LocalDB / PostgreSQL local |
| **Staging** | Tests pré-production | PostgreSQL cloud |
| **Production** | Terrain ONG | SQL Server ou PostgreSQL |

---

## 12. MONITORING & LOGS

```
┌────────────────────────────────────────┐
│  OBSERVABILITÉ                         │
├────────────────────────────────────────┤
│                                        │
│  Logs :                                │
│  • Serilog (structured logging)       │
│  • Niveaux : Info, Warning, Error     │
│  • Rotation fichiers quotidienne       │
│                                        │
│  Audit :                               │
│  • Table AuditLogs en BDD             │
│  • Traçabilité complète actions       │
│                                        │
│  Métriques (optionnel) :              │
│  • Nombre patients/jour               │
│  • Temps moyen parcours               │
│  • Stock critique pharmacie           │
│                                        │
└────────────────────────────────────────┘
```

---

## 13. POINTS D'ATTENTION TERRAIN

### ✅ Facilités

- Interface simple (staff peu formé)
- Workflow guidé (pas de choix complexes)
- Messages d'erreur explicites en français
- Impression QR code patient (imprimante thermique)

### ⚠️ Contraintes

- Connectivité limitée → timeouts élevés
- Électricité instable → sauvegarde fréquente
- Plusieurs médecins simultanés → gestion concurrence
- Papier de secours → export PDF dossier patient

---

## 14. DIAGRAMME LOGIQUE GLOBAL

```
┌─────────────────────────────────────────────────────────────────────┐
│                          INTERNET                                    │
└────────────────────────────┬────────────────────────────────────────┘
                             │
         ┌───────────────────┴───────────────────┐
         │                                       │
    ┌────▼─────┐                          ┌─────▼──────┐
    │  Patient │                          │   Staff    │
    │   Web    │                          │    Web     │
    │ (public) │                          │ (authent.) │
    └────┬─────┘                          └─────┬──────┘
         │                                      │
         └───────────────┬──────────────────────┘
                         │
                    ┌────▼─────┐
                    │   API    │
                    │ Gateway  │
                    │   JWT    │
                    └────┬─────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
    ┌────▼────┐    ┌────▼────┐    ┌────▼────┐
    │ Patient │    │ Medical │    │ Pharmacy│
    │ Service │    │ Service │    │ Service │
    └────┬────┘    └────┬────┘    └────┬────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
                   ┌────▼────┐
                   │   EF    │
                   │  Core   │
                   └────┬────┘
                        │
                   ┌────▼────┐
                   │   DB    │
                   │SQL/PGSQL│
                   └─────────┘
```

---

## 15. POINTS DE DÉCISION TECHNIQUES

### 15.1 Base de données

**Options évaluées** :
- SQL Server (Windows, licences)
- PostgreSQL (Open source, multi-plateforme)

**Recommandation** : PostgreSQL
- Gratuit
- Performant
- Compatible Linux/Windows/Docker
- Communauté active

### 15.2 Authentification Patient

**Méthodes supportées** :
1. Téléphone + Date de naissance
2. Token unique (généré à l'enregistrement)
3. QR Code (contient le token)

**Sécurité** :
- Token expire après 30 jours d'inactivité
- Rate limiting sur vérification téléphone/DDN
- QR code signé cryptographiquement

### 15.3 Gestion des fichiers (Photos, Documents)

**Stockage** :
- Base64 en BDD (petits fichiers < 100KB)
- Système de fichiers local (photos, scans)
- Chemin stocké en BDD

---

## 16. DÉPENDANCES TECHNIQUES PRINCIPALES

### Backend (ASP.NET Core)
```
- Microsoft.AspNetCore.Authentication.JwtBearer
- Microsoft.EntityFrameworkCore
- Microsoft.EntityFrameworkCore.SqlServer / Npgsql.EntityFrameworkCore.PostgreSQL
- Serilog.AspNetCore
- QRCoder (génération QR code)
- Swashbuckle.AspNetCore (Swagger/OpenAPI)
```

### Frontend (Angular)
```
- @angular/material (UI components)
- @angular/forms (Reactive Forms)
- @auth0/angular-jwt (JWT helper)
- ngx-qrcode (affichage QR code)
- chart.js / ng2-charts (statistiques)
```

---

## ✅ CHECKLIST DE VALIDATION

- [x] Backend ASP.NET Core Web API
- [x] Frontend Angular
- [x] Staff authentifié JWT + RBAC (6 rôles)
- [x] Patient sans compte (Token/QR/Téléphone+DDN)
- [x] Self-onboarding web public
- [x] Parcours patient complet (Accueil → Consultation → Labo → Pharmacie)
- [x] Gestion stock pharmacie (auto-calcul)
- [x] Traçabilité totale (audit logs)
- [x] Anti-doublon patient
- [x] Sécurité multicouche
- [x] Simplicité terrain (UI guidée, messages clairs)
- [x] Contraintes connectivité (timeouts, cache)

---

## 📋 PROCHAINES ÉTAPES

**LIVRABLE 2** : Modèle de données détaillé
- Schéma des tables
- Relations et cardinalités
- Contraintes et index
- Script SQL de création

---

**⏸️ EN ATTENTE DE VALIDATION CLIENT**

_Merci de valider cette architecture avant de poursuivre._
