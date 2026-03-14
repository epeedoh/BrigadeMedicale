# LIVRABLE 3 : API REST - SPÉCIFICATIONS DÉTAILLÉES

**Projet** : Brigade Médicale - Application de gestion médicale terrain
**Date** : 2026-01-24
**Version** : 1.0
**Statut** : En attente de validation

---

## AJUSTEMENTS INTÉGRÉS (suite validation LIVRABLE 2)

✅ **PatientNumber format lisible** : BM-2026-00001 (BM-ANNÉE-SÉQUENCE)
✅ **Gender : Enum technique** (0=Male, 1=Female, 2=Other)
✅ **Calcul stock côté applicatif** (pas de trigger DB)
✅ **Limitation tokens actifs** : max 3 tokens actifs/patient

---

## 1. VUE D'ENSEMBLE DE L'API

### 1.1 Informations générales

| Propriété | Valeur |
|-----------|--------|
| **Base URL** | `https://api.brigade-medicale.org/v1` |
| **Architecture** | Monolithe modulaire (ASP.NET Core Web API) |
| **Format** | JSON (application/json) |
| **Encodage** | UTF-8 |
| **Versioning** | URI Path (/v1, /v2...) |
| **Documentation** | Swagger/OpenAPI 3.0 |

### 1.2 Codes HTTP standards

| Code | Description | Usage |
|------|-------------|-------|
| 200 | OK | Succès GET/PUT |
| 201 | Created | Succès POST |
| 204 | No Content | Succès DELETE |
| 400 | Bad Request | Validation échouée |
| 401 | Unauthorized | JWT manquant/invalide |
| 403 | Forbidden | Rôle insuffisant |
| 404 | Not Found | Ressource inexistante |
| 409 | Conflict | Doublon détecté |
| 422 | Unprocessable Entity | Logique métier échouée |
| 500 | Internal Server Error | Erreur serveur |

### 1.3 Structure de réponse standard

#### Succès
```json
{
  "success": true,
  "data": { /* ... */ },
  "message": "Opération réussie"
}
```

#### Erreur
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": [
      {
        "field": "phoneNumber",
        "message": "Le numéro de téléphone est requis"
      }
    ]
  }
}
```

---

## 2. AUTHENTIFICATION

### 2.1 Mécanismes d'authentification

| Type | Méthode | Usage |
|------|---------|-------|
| **Staff** | JWT Bearer Token | Toutes routes /api/staff/* |
| **Patient** | Query Parameter ou Header | Routes /api/patients/me |
| **Public** | Aucune | /api/public/* (onboarding) |

### 2.2 Endpoints authentification

#### `POST /api/auth/login` (Staff uniquement)

**Description** : Authentification du personnel médical

**Authentification** : ❌ Aucune (public)

**Request Body** :
```json
{
  "username": "dr.jean.dupont",
  "password": "SecureP@ssw0rd"
}
```

**Response 200** :
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-01-25T10:30:00Z",
    "user": {
      "id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "username": "dr.jean.dupont",
      "email": "jean.dupont@brigade.org",
      "firstName": "Jean",
      "lastName": "Dupont",
      "roles": ["MEDECIN"]
    }
  },
  "message": "Connexion réussie"
}
```

**Payload JWT** :
```json
{
  "sub": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "username": "dr.jean.dupont",
  "roles": ["MEDECIN"],
  "exp": 1737801000,
  "iat": 1737714600
}
```

**Erreurs** :
- `401` : Identifiants invalides
- `403` : Compte désactivé

---

#### `POST /api/auth/refresh`

**Description** : Renouvellement du token JWT

**Authentification** : ✅ JWT Bearer

**Request Body** :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200** :
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-01-26T10:30:00Z"
  }
}
```

---

#### `POST /api/auth/logout`

**Description** : Déconnexion (invalidation côté client)

**Authentification** : ✅ JWT Bearer

**Response 204** : No Content

---

### 2.3 Vérification accès patient

#### `POST /api/auth/patient/verify`

**Description** : Vérification identité patient (téléphone + date naissance)

**Authentification** : ❌ Aucune

**Request Body** :
```json
{
  "phoneNumber": "+33612345678",
  "dateOfBirth": "1985-03-15"
}
```

**Response 200** :
```json
{
  "success": true,
  "data": {
    "patientId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "firstName": "Marie",
    "lastName": "Martin",
    "accessToken": "pt_2026_a1b2c3d4e5f67890"
  }
}
```

**Erreurs** :
- `404` : Patient non trouvé
- `429` : Trop de tentatives (rate limiting)

---

## 3. GESTION PATIENTS

### 3.1 Enregistrement public (self-onboarding)

#### `POST /api/public/patients/register`

**Description** : Auto-enregistrement patient sans compte

**Authentification** : ❌ Aucune

**Request Body** :
```json
{
  "firstName": "Fatou",
  "lastName": "Diallo",
  "dateOfBirth": "1990-07-22",
  "gender": 1,
  "phoneNumber": "+221771234567",
  "alternativePhone": null,
  "address": "Quartier Médina, Dakar",
  "city": "Dakar",
  "emergencyContact": "Amadou Diallo",
  "emergencyPhone": "+221779876543"
}
```

**Champs** :
- `gender` : 0=Male, 1=Female, 2=Other

**Response 201** :
```json
{
  "success": true,
  "data": {
    "patientId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "patientNumber": "BM-2026-00042",
    "accessToken": "pt_2026_b2c3d4e5f6a78901",
    "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "message": "Dossier créé avec succès. Conservez votre QR code."
  }
}
```

**Détection anti-doublon** :
- Si téléphone + date naissance existent → `409 Conflict`
- Si similarité nom+prénom > 80% → retour candidats

**Response 409** (doublon détecté) :
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_PATIENT",
    "message": "Un patient similaire existe déjà",
    "possibleMatches": [
      {
        "patientId": "existing-id",
        "patientNumber": "BM-2026-00010",
        "firstName": "Fatou",
        "lastName": "Dialo",
        "dateOfBirth": "1990-07-22",
        "phoneNumber": "+221771234567"
      }
    ]
  }
}
```

---

### 3.2 Création patient par staff (accueil)

#### `POST /api/staff/patients`

**Description** : Création dossier patient par agent d'accueil

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN, ACCUEIL

**Request Body** : Identique à `/api/public/patients/register` + champs optionnels :
```json
{
  "firstName": "Ibrahim",
  "lastName": "Koné",
  "dateOfBirth": "2015-01-10",
  "gender": 0,
  "phoneNumber": "+221770000000",
  "bloodType": "A+",
  "allergies": "Pénicilline",
  "chronicDiseases": null
}
```

**Response 201** : Identique à la route publique

---

### 3.3 Recherche patients

#### `GET /api/staff/patients`

**Description** : Recherche et pagination patients

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Query Parameters** :
```
?search=Diallo
&gender=1
&page=1
&pageSize=20
&sortBy=createdAt
&sortOrder=desc
```

**Response 200** :
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
        "patientNumber": "BM-2026-00042",
        "firstName": "Fatou",
        "lastName": "Diallo",
        "dateOfBirth": "1990-07-22",
        "gender": 1,
        "phoneNumber": "+221771234567",
        "age": 35,
        "lastConsultationDate": "2026-01-20T14:30:00Z",
        "isActive": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 142,
      "totalPages": 8
    }
  }
}
```

---

#### `GET /api/staff/patients/{id}`

**Description** : Détails complets d'un patient

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Response 200** :
```json
{
  "success": true,
  "data": {
    "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "patientNumber": "BM-2026-00042",
    "firstName": "Fatou",
    "lastName": "Diallo",
    "dateOfBirth": "1990-07-22",
    "gender": 1,
    "phoneNumber": "+221771234567",
    "alternativePhone": null,
    "address": "Quartier Médina, Dakar",
    "city": "Dakar",
    "emergencyContact": "Amadou Diallo",
    "emergencyPhone": "+221779876543",
    "bloodType": "O+",
    "allergies": null,
    "chronicDiseases": null,
    "registrationSource": "SELF_ONBOARDING",
    "createdAt": "2026-01-15T08:00:00Z",
    "lastConsultation": {
      "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
      "date": "2026-01-20T14:30:00Z",
      "specialty": "Médecine Générale",
      "doctor": "Dr. Jean Dupont"
    }
  }
}
```

---

#### `PUT /api/staff/patients/{id}`

**Description** : Mise à jour informations patient

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN, ACCUEIL

**Request Body** : Champs modifiables uniquement
```json
{
  "phoneNumber": "+221771111111",
  "address": "Nouvelle adresse",
  "bloodType": "A+",
  "allergies": "Pénicilline, Aspirine"
}
```

**Response 200** : Patient mis à jour

---

#### `GET /api/patients/me`

**Description** : Consultation dossier par le patient (sans compte)

**Authentification** : 🔑 Token patient (query param ou header)

**Query Parameters** :
```
?token=pt_2026_b2c3d4e5f6a78901
```

**OU Header** :
```
X-Patient-Token: pt_2026_b2c3d4e5f6a78901
```

**Response 200** : Données patient + consultations récentes (lecture seule)

---

### 3.4 Gestion tokens patient

#### `POST /api/staff/patients/{id}/tokens`

**Description** : Génération nouveau token patient

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN, ACCUEIL

**Request Body** :
```json
{
  "expiresInDays": 30
}
```

**Response 201** :
```json
{
  "success": true,
  "data": {
    "token": "pt_2026_newtoken123456",
    "expiresAt": "2026-02-24T10:00:00Z",
    "qrCodeDataUrl": "data:image/png;base64,..."
  }
}
```

**Limitation** : Max 3 tokens actifs par patient (ancien auto-révoqué si dépassement)

---

#### `DELETE /api/staff/patients/{id}/tokens/{tokenId}`

**Description** : Révocation token patient

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN

**Response 204** : No Content

---

## 4. CONSTANTES VITALES

#### `POST /api/staff/patients/{patientId}/vital-signs`

**Description** : Enregistrement constantes vitales

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ACCUEIL, MEDECIN

**Request Body** :
```json
{
  "weight": 68.5,
  "height": 165,
  "temperature": 37.2,
  "bloodPressureSystolic": 120,
  "bloodPressureDiastolic": 80,
  "heartRate": 72,
  "respiratoryRate": 18,
  "oxygenSaturation": 98
}
```

**Response 201** :
```json
{
  "success": true,
  "data": {
    "id": "d4e5f6a7-b8c9-0123-def0-123456789abc",
    "patientId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    "weight": 68.5,
    "height": 165,
    "bmi": 25.2,
    "temperature": 37.2,
    "bloodPressure": "120/80",
    "heartRate": 72,
    "measuredAt": "2026-01-24T09:15:00Z",
    "measuredBy": {
      "id": "user-id",
      "name": "Infirmière Aminata Sow"
    }
  }
}
```

**Calculs automatiques** :
- BMI = weight / (height/100)²

---

#### `GET /api/staff/patients/{patientId}/vital-signs`

**Description** : Historique constantes vitales

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Query Parameters** :
```
?limit=10
&from=2026-01-01
&to=2026-01-31
```

**Response 200** : Liste des constantes avec pagination

---

## 5. CONSULTATIONS

#### `POST /api/staff/consultations`

**Description** : Création nouvelle consultation

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : MEDECIN

**Request Body** :
```json
{
  "patientId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "specialtyId": 1,
  "chiefComplaint": "Fièvre et toux depuis 3 jours",
  "history": "Pas d'antécédents particuliers. Début brutal.",
  "physicalExamination": "T°38.5°C, auscultation pulmonaire normale",
  "treatmentPlan": "Repos, hydratation, paracétamol"
}
```

**Response 201** :
```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "patientNumber": "BM-2026-00042",
    "patientName": "Fatou Diallo",
    "specialty": "Médecine Générale",
    "doctor": "Dr. Jean Dupont",
    "consultationDate": "2026-01-24T10:00:00Z",
    "status": "IN_PROGRESS"
  }
}
```

---

#### `PUT /api/staff/consultations/{id}`

**Description** : Mise à jour consultation

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : MEDECIN (créateur uniquement)

**Request Body** : Champs modifiables
```json
{
  "physicalExamination": "Ajout : râles crépitants base droite",
  "treatmentPlan": "Ajout antibiotique",
  "notes": "À revoir dans 48h si pas d'amélioration"
}
```

**Response 200** : Consultation mise à jour

---

#### `POST /api/staff/consultations/{id}/complete`

**Description** : Clôture consultation

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : MEDECIN (créateur uniquement)

**Response 200** :
```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "status": "COMPLETED",
    "completedAt": "2026-01-24T10:45:00Z"
  }
}
```

---

#### `GET /api/staff/consultations`

**Description** : Liste consultations (file d'attente)

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Query Parameters** :
```
?status=IN_PROGRESS
&specialtyId=1
&doctorId={userId}
&date=2026-01-24
&page=1
&pageSize=20
```

**Response 200** : Liste paginée avec infos patient

---

#### `GET /api/staff/consultations/{id}`

**Description** : Détails consultation

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Response 200** :
```json
{
  "success": true,
  "data": {
    "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "patient": {
      "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
      "patientNumber": "BM-2026-00042",
      "name": "Fatou Diallo",
      "age": 35,
      "gender": 1
    },
    "specialty": "Médecine Générale",
    "doctor": {
      "id": "doctor-id",
      "name": "Dr. Jean Dupont"
    },
    "consultationDate": "2026-01-24T10:00:00Z",
    "chiefComplaint": "Fièvre et toux depuis 3 jours",
    "history": "...",
    "physicalExamination": "...",
    "vitalSigns": {
      "temperature": 38.5,
      "bloodPressure": "120/80",
      "heartRate": 78
    },
    "diagnoses": [
      {
        "id": "diag-id",
        "name": "Infection respiratoire haute",
        "isPrimary": true
      }
    ],
    "prescriptions": [],
    "labTests": [],
    "status": "IN_PROGRESS",
    "createdAt": "2026-01-24T10:00:00Z"
  }
}
```

---

## 6. DIAGNOSTICS

#### `POST /api/staff/consultations/{consultationId}/diagnoses`

**Description** : Ajout diagnostic à une consultation

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : MEDECIN

**Request Body** :
```json
{
  "diagnosisCode": "J06.9",
  "diagnosisName": "Infection respiratoire haute",
  "isPrimary": true,
  "severity": "MODERATE",
  "notes": "Évolution favorable probable"
}
```

**Response 201** :
```json
{
  "success": true,
  "data": {
    "id": "diag-id",
    "consultationId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "diagnosisCode": "J06.9",
    "diagnosisName": "Infection respiratoire haute",
    "isPrimary": true,
    "severity": "MODERATE"
  }
}
```

---

#### `GET /api/staff/consultations/{consultationId}/diagnoses`

**Description** : Liste diagnostics d'une consultation

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Response 200** : Liste des diagnostics

---

## 7. EXAMENS PARACLINIQUES

#### `POST /api/staff/consultations/{consultationId}/lab-tests`

**Description** : Prescription examen paraclinique

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : MEDECIN

**Request Body** :
```json
{
  "labTestTypeId": 1,
  "urgency": "ROUTINE",
  "clinicalIndication": "Suspicion anémie"
}
```

**Response 201** :
```json
{
  "success": true,
  "data": {
    "id": "lab-test-id",
    "consultationId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "testType": "Numération Formule Sanguine (NFS)",
    "status": "PENDING",
    "prescribedBy": "Dr. Jean Dupont",
    "prescribedAt": "2026-01-24T10:30:00Z"
  }
}
```

---

#### `GET /api/staff/lab-tests`

**Description** : File d'attente examens laboratoire

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Query Parameters** :
```
?status=PENDING
&date=2026-01-24
```

**Response 200** : Liste examens en attente

---

#### `PUT /api/staff/lab-tests/{id}/start`

**Description** : Démarrage réalisation examen

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : LABORANTIN

**Response 200** :
```json
{
  "success": true,
  "data": {
    "id": "lab-test-id",
    "status": "IN_PROGRESS",
    "performedBy": "Technicien Moussa Ba",
    "performedAt": "2026-01-24T11:00:00Z"
  }
}
```

---

#### `POST /api/staff/lab-tests/{id}/results`

**Description** : Saisie résultats examen

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : LABORANTIN

**Request Body** :
```json
{
  "results": [
    {
      "parameterName": "Hémoglobine",
      "value": "12.5",
      "unit": "g/dL",
      "referenceRange": "12-16 g/dL",
      "isAbnormal": false
    },
    {
      "parameterName": "Leucocytes",
      "value": "15000",
      "unit": "/mm³",
      "referenceRange": "4000-10000 /mm³",
      "isAbnormal": true,
      "notes": "Leucocytose modérée"
    }
  ]
}
```

**Response 201** :
```json
{
  "success": true,
  "data": {
    "labTestId": "lab-test-id",
    "status": "COMPLETED",
    "completedAt": "2026-01-24T11:30:00Z",
    "resultsCount": 2
  }
}
```

---

#### `GET /api/staff/lab-tests/{id}`

**Description** : Détails examen avec résultats

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Response 200** :
```json
{
  "success": true,
  "data": {
    "id": "lab-test-id",
    "patient": {
      "patientNumber": "BM-2026-00042",
      "name": "Fatou Diallo"
    },
    "testType": "Numération Formule Sanguine (NFS)",
    "status": "COMPLETED",
    "prescribedBy": "Dr. Jean Dupont",
    "prescribedAt": "2026-01-24T10:30:00Z",
    "performedBy": "Technicien Moussa Ba",
    "performedAt": "2026-01-24T11:00:00Z",
    "completedAt": "2026-01-24T11:30:00Z",
    "results": [
      {
        "parameterName": "Hémoglobine",
        "value": "12.5",
        "unit": "g/dL",
        "referenceRange": "12-16 g/dL",
        "isAbnormal": false
      }
    ]
  }
}
```

---

## 8. PRESCRIPTIONS & PHARMACIE

#### `POST /api/staff/consultations/{consultationId}/prescriptions`

**Description** : Création ordonnance

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : MEDECIN

**Request Body** :
```json
{
  "notes": "À prendre après les repas",
  "items": [
    {
      "medicationId": "med-id-1",
      "quantity": 20,
      "dosage": "1 comprimé x 2 par jour",
      "duration": "10 jours",
      "instructions": "Matin et soir"
    },
    {
      "medicationId": "med-id-2",
      "quantity": 1,
      "dosage": "1 cuillère à soupe x 3 par jour",
      "duration": "7 jours",
      "instructions": null
    }
  ]
}
```

**Response 201** :
```json
{
  "success": true,
  "data": {
    "id": "prescription-id",
    "consultationId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
    "prescribedBy": "Dr. Jean Dupont",
    "prescribedAt": "2026-01-24T10:45:00Z",
    "status": "PENDING",
    "itemsCount": 2
  }
}
```

---

#### `GET /api/staff/prescriptions`

**Description** : File d'attente pharmacie

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Query Parameters** :
```
?status=PENDING
&date=2026-01-24
```

**Response 200** :
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "prescription-id",
        "patient": {
          "patientNumber": "BM-2026-00042",
          "name": "Fatou Diallo"
        },
        "prescribedBy": "Dr. Jean Dupont",
        "prescribedAt": "2026-01-24T10:45:00Z",
        "itemsCount": 2,
        "status": "PENDING"
      }
    ]
  }
}
```

---

#### `GET /api/staff/prescriptions/{id}`

**Description** : Détails ordonnance

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Response 200** :
```json
{
  "success": true,
  "data": {
    "id": "prescription-id",
    "patient": {
      "patientNumber": "BM-2026-00042",
      "name": "Fatou Diallo",
      "age": 35
    },
    "prescribedBy": "Dr. Jean Dupont",
    "prescribedAt": "2026-01-24T10:45:00Z",
    "status": "PENDING",
    "notes": "À prendre après les repas",
    "items": [
      {
        "id": "item-id-1",
        "medication": {
          "id": "med-id-1",
          "name": "Paracétamol 500mg",
          "form": "TABLET"
        },
        "quantity": 20,
        "dosage": "1 comprimé x 2 par jour",
        "duration": "10 jours",
        "instructions": "Matin et soir",
        "quantityDispensed": 0,
        "quantityRemaining": 20
      }
    ]
  }
}
```

---

#### `POST /api/staff/prescriptions/{id}/dispense`

**Description** : Délivrance médicaments

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : PHARMACIEN

**Request Body** :
```json
{
  "dispensations": [
    {
      "prescriptionItemId": "item-id-1",
      "medicationStockId": "stock-id-1",
      "quantityDispensed": 20,
      "notes": null
    },
    {
      "prescriptionItemId": "item-id-2",
      "medicationStockId": "stock-id-2",
      "quantityDispensed": 1,
      "notes": "Stock faible, dernière unité"
    }
  ]
}
```

**Response 201** :
```json
{
  "success": true,
  "data": {
    "prescriptionId": "prescription-id",
    "status": "DISPENSED",
    "dispensedAt": "2026-01-24T12:00:00Z",
    "dispensedBy": "Pharmacien Aissatou Kane",
    "dispensations": [
      {
        "medication": "Paracétamol 500mg",
        "quantityDispensed": 20,
        "stockRemaining": 480
      }
    ]
  }
}
```

**Logique métier** :
1. Vérification stock disponible
2. Déduction automatique : `MedicationStock.CurrentQuantity -= QuantityDispensed`
3. Si stock < MinimumThreshold → Warning retourné
4. Mise à jour statut prescription (DISPENSED ou PARTIALLY_DISPENSED)

---

#### `GET /api/staff/medications`

**Description** : Référentiel médicaments

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Query Parameters** :
```
?search=paracetamol
&form=TABLET
&isActive=true
```

**Response 200** :
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "med-id-1",
        "name": "Paracétamol 500mg",
        "genericName": "Paracétamol",
        "form": "TABLET",
        "dosage": "500mg",
        "unit": "comprimé",
        "currentStock": 500,
        "minimumThreshold": 100,
        "stockStatus": "OK"
      }
    ]
  }
}
```

---

#### `POST /api/staff/medications`

**Description** : Ajout médicament au référentiel

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN, PHARMACIEN

**Request Body** :
```json
{
  "name": "Amoxicilline 500mg",
  "genericName": "Amoxicilline",
  "form": "TABLET",
  "dosage": "500mg",
  "unit": "comprimé"
}
```

**Response 201** : Médicament créé

---

#### `POST /api/staff/medications/{id}/stock`

**Description** : Ajout stock médicament

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN, PHARMACIEN

**Request Body** :
```json
{
  "batchNumber": "LOT2026-001",
  "expiryDate": "2028-12-31",
  "initialQuantity": 1000,
  "minimumThreshold": 100
}
```

**Response 201** :
```json
{
  "success": true,
  "data": {
    "id": "stock-id",
    "medicationId": "med-id-1",
    "batchNumber": "LOT2026-001",
    "expiryDate": "2028-12-31",
    "initialQuantity": 1000,
    "currentQuantity": 1000,
    "minimumThreshold": 100
  }
}
```

---

#### `GET /api/staff/medications/stock/alerts`

**Description** : Alertes stock (faible/périmé)

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Response 200** :
```json
{
  "success": true,
  "data": {
    "lowStock": [
      {
        "medication": "Paracétamol 500mg",
        "currentQuantity": 80,
        "minimumThreshold": 100
      }
    ],
    "expiringSoon": [
      {
        "medication": "Amoxicilline 500mg",
        "batchNumber": "LOT2025-050",
        "expiryDate": "2026-03-15",
        "daysRemaining": 50
      }
    ]
  }
}
```

---

## 9. GESTION STAFF (ADMIN)

#### `POST /api/staff/users`

**Description** : Création compte staff

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN

**Request Body** :
```json
{
  "username": "dr.aminata.fall",
  "email": "aminata.fall@brigade.org",
  "password": "TempP@ssw0rd",
  "firstName": "Aminata",
  "lastName": "Fall",
  "phoneNumber": "+221770123456",
  "roleIds": [3]
}
```

**Response 201** :
```json
{
  "success": true,
  "data": {
    "id": "new-user-id",
    "username": "dr.aminata.fall",
    "email": "aminata.fall@brigade.org",
    "firstName": "Aminata",
    "lastName": "Fall",
    "roles": ["MEDECIN"],
    "isActive": true,
    "createdAt": "2026-01-24T13:00:00Z"
  },
  "message": "Utilisateur créé. Mot de passe temporaire à changer à la première connexion."
}
```

---

#### `GET /api/staff/users`

**Description** : Liste utilisateurs staff

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN, SUPERVISEUR

**Query Parameters** :
```
?roleId=3
&isActive=true
&search=fall
```

**Response 200** : Liste paginée utilisateurs

---

#### `PUT /api/staff/users/{id}`

**Description** : Modification utilisateur

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN

**Request Body** : Champs modifiables (email, rôles, statut)

**Response 200** : Utilisateur mis à jour

---

#### `DELETE /api/staff/users/{id}`

**Description** : Désactivation utilisateur (soft delete)

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN

**Response 204** : No Content

---

## 10. STATISTIQUES & RAPPORTS

#### `GET /api/staff/statistics/dashboard`

**Description** : Statistiques temps réel

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Query Parameters** :
```
?date=2026-01-24
```

**Response 200** :
```json
{
  "success": true,
  "data": {
    "date": "2026-01-24",
    "patients": {
      "totalRegistered": 142,
      "newToday": 8,
      "activeConsultations": 5
    },
    "consultations": {
      "total": 127,
      "completed": 85,
      "inProgress": 5,
      "bySpecialty": [
        {"specialty": "Médecine Générale", "count": 60},
        {"specialty": "Pédiatrie", "count": 35}
      ]
    },
    "laboratory": {
      "pending": 3,
      "inProgress": 2,
      "completed": 15
    },
    "pharmacy": {
      "pendingPrescriptions": 4,
      "dispensedToday": 72,
      "lowStockAlerts": 2
    }
  }
}
```

---

#### `GET /api/staff/statistics/reports`

**Description** : Génération rapport période

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN, SUPERVISEUR

**Query Parameters** :
```
?from=2026-01-01
&to=2026-01-31
&type=SUMMARY
&format=JSON
```

**Types** : SUMMARY, DETAILED, PATHOLOGIES, MEDICATIONS

**Formats** : JSON, PDF, EXCEL

**Response 200** : Données rapport ou fichier binaire

---

## 11. RÉFÉRENTIELS

#### `GET /api/staff/specialties`

**Description** : Liste spécialités médicales

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Response 200** :
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "Médecine Générale", "code": "MG"},
    {"id": 2, "name": "Pédiatrie", "code": "PED"},
    {"id": 3, "name": "Gynécologie", "code": "GYN"}
  ]
}
```

---

#### `GET /api/staff/lab-test-types`

**Description** : Types d'examens paracliniques

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : Tous

**Response 200** : Liste types examens

---

## 12. AUDIT & TRAÇABILITÉ

#### `GET /api/staff/audit/security`

**Description** : Logs sécurité (connexions, tokens...)

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN

**Query Parameters** :
```
?eventType=LOGIN
&userId={userId}
&from=2026-01-01
&to=2026-01-31
```

**Response 200** :
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 12345,
        "eventType": "LOGIN",
        "user": "dr.jean.dupont",
        "ipAddress": "192.168.1.10",
        "timestamp": "2026-01-24T08:00:00Z",
        "success": true
      }
    ]
  }
}
```

---

#### `GET /api/staff/audit/medical`

**Description** : Logs actions médicales

**Authentification** : ✅ JWT Bearer

**Rôles autorisés** : ADMIN, SUPERVISEUR

**Query Parameters** :
```
?entityType=CONSULTATION
&patientId={patientId}
&performedBy={userId}
&from=2026-01-01
&to=2026-01-31
```

**Response 200** :
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 67890,
        "entityType": "CONSULTATION",
        "action": "CREATE",
        "patient": "BM-2026-00042 - Fatou Diallo",
        "performedBy": "Dr. Jean Dupont",
        "role": "MEDECIN",
        "timestamp": "2026-01-24T10:00:00Z",
        "details": "Nouvelle consultation Médecine Générale"
      }
    ]
  }
}
```

---

## 13. SÉCURITÉ & RATE LIMITING

### 13.1 Rate Limiting par endpoint

| Endpoint | Limite | Fenêtre | Type |
|----------|--------|---------|------|
| `/api/auth/login` | 5 tentatives | 15 min | IP |
| `/api/auth/patient/verify` | 3 tentatives | 5 min | IP |
| `/api/public/patients/register` | 10 créations | 1 heure | IP |
| Routes `/api/staff/*` | 1000 requêtes | 1 heure | User |

**Réponse rate limit dépassé (429)** :
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Trop de tentatives. Réessayez dans 10 minutes.",
    "retryAfter": 600
  }
}
```

---

### 13.2 CORS Configuration

**Allowed Origins** :
- `https://app.brigade-medicale.org` (Angular frontend)
- `https://patient.brigade-medicale.org` (Onboarding public)

**Allowed Methods** : GET, POST, PUT, DELETE

**Allowed Headers** : Authorization, Content-Type, X-Patient-Token

---

## 14. VALIDATION & ERREURS

### 14.1 Codes d'erreur métier

| Code | Message | HTTP Status |
|------|---------|-------------|
| `VALIDATION_ERROR` | Champs invalides | 400 |
| `DUPLICATE_PATIENT` | Patient déjà existant | 409 |
| `INSUFFICIENT_STOCK` | Stock médicament insuffisant | 422 |
| `CONSULTATION_NOT_FOUND` | Consultation introuvable | 404 |
| `UNAUTHORIZED_ROLE` | Rôle insuffisant | 403 |
| `TOKEN_EXPIRED` | Token patient expiré | 401 |
| `TOKEN_REVOKED` | Token patient révoqué | 401 |
| `PATIENT_NOT_FOUND` | Patient introuvable | 404 |

---

### 14.2 Exemple validation échouée

**Request** :
```json
POST /api/public/patients/register
{
  "firstName": "",
  "phoneNumber": "invalid"
}
```

**Response 400** :
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Les données fournies sont invalides",
    "details": [
      {
        "field": "firstName",
        "message": "Le prénom est requis"
      },
      {
        "field": "lastName",
        "message": "Le nom est requis"
      },
      {
        "field": "dateOfBirth",
        "message": "La date de naissance est requise"
      },
      {
        "field": "phoneNumber",
        "message": "Le numéro de téléphone est invalide"
      }
    ]
  }
}
```

---

## 15. PAGINATION STANDARD

### Format pagination

**Query Parameters** :
```
?page=1
&pageSize=20
&sortBy=createdAt
&sortOrder=desc
```

**Response** :
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "pageSize": 20,
      "totalItems": 142,
      "totalPages": 8,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  }
}
```

**Limites** :
- `pageSize` max : 100
- `pageSize` par défaut : 20

---

## 16. VERSIONING & RÉTROCOMPATIBILITÉ

### Stratégie versioning

- Version actuelle : **v1**
- Breaking changes → nouvelle version (/v2)
- Dépréciations annoncées 6 mois avant suppression
- Header `X-API-Version` optionnel pour forcer version

**Exemple** :
```
GET /v1/api/staff/patients
X-API-Version: 1.0
```

---

## 17. HEALTHCHECK & MONITORING

#### `GET /health`

**Description** : Statut API

**Authentification** : ❌ Aucune

**Response 200** :
```json
{
  "status": "healthy",
  "timestamp": "2026-01-24T14:00:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "storage": "healthy"
  }
}
```

---

#### `GET /metrics`

**Description** : Métriques Prometheus (optionnel)

**Authentification** : ❌ Aucune (IP restreinte)

---

## ✅ CHECKLIST DE VALIDATION

- [x] Authentification JWT (Staff)
- [x] Tokens patient (téléphone+DDN, QR, révocation)
- [x] Self-onboarding public
- [x] CRUD Patients avec anti-doublon
- [x] Constantes vitales
- [x] Consultations complètes
- [x] Diagnostics
- [x] Examens paracliniques (prescription → résultats)
- [x] Prescriptions & délivrance pharmacie
- [x] Gestion stock automatique (côté applicatif)
- [x] Gestion staff (ADMIN)
- [x] Statistiques & rapports
- [x] Audits séparés (sécurité vs médical)
- [x] Rate limiting
- [x] Validation & erreurs standardisées
- [x] Pagination
- [x] PatientNumber format : BM-2026-00001
- [x] Gender Enum : 0/1/2
- [x] Limitation tokens actifs (max 3)

---

## 📋 PROCHAINE ÉTAPE

**LIVRABLE 4** : Système d'authentification détaillé (middleware, guards, RBAC)

---

**⏸️ EN ATTENTE DE VALIDATION CLIENT**

_Merci de valider ces spécifications API avant de poursuivre._
