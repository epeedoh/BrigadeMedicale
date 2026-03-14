# LIVRABLE 2 : MODÈLE DE DONNÉES DÉTAILLÉ

**Projet** : Brigade Médicale - Application de gestion médicale terrain
**Date** : 2026-01-24
**Version** : 1.0
**Statut** : En attente de validation

---

## AJUSTEMENTS INTÉGRÉS (suite validation LIVRABLE 1)

✅ **API monolithe modulaire** (pas microservices)
✅ **Cycle de vie et révocation tokens patient**
✅ **Séparation audits : médical vs sécurité**

---

## 1. VUE D'ENSEMBLE DU SCHÉMA

```
┌─────────────────────────────────────────────────────────────────┐
│                    DOMAINES MÉTIER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  AUTHENTIFICATION & SÉCURITÉ                                     │
│  ├─ Users (Staff uniquement)                                     │
│  ├─ Roles                                                        │
│  ├─ UserRoles                                                    │
│  ├─ PatientAccessTokens (tokens temporaires)                     │
│  └─ SecurityAuditLogs                                            │
│                                                                   │
│  GESTION PATIENTS                                                │
│  ├─ Patients                                                     │
│  ├─ VitalSigns (constantes vitales)                              │
│  └─ PatientDocuments (QR codes, photos)                          │
│                                                                   │
│  PARCOURS MÉDICAL                                                │
│  ├─ Consultations                                                │
│  ├─ Diagnoses (diagnostics)                                      │
│  ├─ LabTests (examens paracliniques)                             │
│  ├─ LabResults                                                   │
│  └─ Prescriptions                                                │
│                                                                   │
│  PHARMACIE                                                       │
│  ├─ Medications (référentiel)                                    │
│  ├─ MedicationStock                                              │
│  ├─ PrescriptionItems (lignes ordonnance)                        │
│  └─ PharmacyDispensations (délivrances)                          │
│                                                                   │
│  RÉFÉRENTIELS                                                    │
│  ├─ Specialties (spécialités médicales)                          │
│  ├─ PathologyTypes                                               │
│  └─ LabTestTypes                                                 │
│                                                                   │
│  TRAÇABILITÉ MÉDICALE                                            │
│  └─ MedicalAuditLogs                                             │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. SCHÉMA DÉTAILLÉ DES TABLES

### 2.1 AUTHENTIFICATION & SÉCURITÉ

#### Table : `Users` (Staff uniquement)

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant unique |
| Username | NVARCHAR(50) | UNIQUE, NOT NULL | Login |
| Email | NVARCHAR(100) | UNIQUE, NOT NULL | Email |
| PasswordHash | NVARCHAR(255) | NOT NULL | Hash BCrypt |
| FirstName | NVARCHAR(100) | NOT NULL | Prénom |
| LastName | NVARCHAR(100) | NOT NULL | Nom |
| PhoneNumber | NVARCHAR(20) | NULL | Téléphone |
| IsActive | BIT | NOT NULL, DEFAULT 1 | Compte actif |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date création |
| UpdatedAt | DATETIME2 | NULL | Dernière modification |
| LastLoginAt | DATETIME2 | NULL | Dernière connexion |

**Index** :
- `IX_Users_Username` (UNIQUE)
- `IX_Users_Email` (UNIQUE)
- `IX_Users_IsActive`

---

#### Table : `Roles`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | INT | PK, IDENTITY | Identifiant |
| Name | NVARCHAR(50) | UNIQUE, NOT NULL | Nom du rôle |
| Description | NVARCHAR(255) | NULL | Description |

**Données pré-remplies** :
```sql
1 - ADMIN
2 - ACCUEIL
3 - MEDECIN
4 - LABORANTIN
5 - PHARMACIEN
6 - SUPERVISEUR
```

---

#### Table : `UserRoles` (table de liaison)

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| UserId | GUID | FK Users(Id), NOT NULL | Utilisateur |
| RoleId | INT | FK Roles(Id), NOT NULL | Rôle |

**Clé primaire composite** : `(UserId, RoleId)`

---

#### Table : `PatientAccessTokens`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant |
| PatientId | GUID | FK Patients(Id), NOT NULL | Patient concerné |
| Token | NVARCHAR(255) | UNIQUE, NOT NULL | Token sécurisé (GUID) |
| ExpiresAt | DATETIME2 | NOT NULL | Date d'expiration |
| IsRevoked | BIT | NOT NULL, DEFAULT 0 | Token révoqué |
| RevokedAt | DATETIME2 | NULL | Date révocation |
| RevokedBy | GUID | FK Users(Id), NULL | Staff ayant révoqué |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date création |

**Index** :
- `IX_PatientAccessTokens_Token` (UNIQUE)
- `IX_PatientAccessTokens_PatientId`
- `IX_PatientAccessTokens_ExpiresAt`

**Règles métier** :
- Expiration par défaut : 30 jours
- Un patient peut avoir plusieurs tokens actifs
- Token révocable manuellement par ADMIN

---

#### Table : `SecurityAuditLogs`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | BIGINT | PK, IDENTITY | Identifiant |
| EventType | NVARCHAR(50) | NOT NULL | LOGIN, LOGOUT, FAILED_LOGIN, TOKEN_CREATED, TOKEN_REVOKED |
| UserId | GUID | FK Users(Id), NULL | Staff (si applicable) |
| PatientId | GUID | FK Patients(Id), NULL | Patient (si applicable) |
| IpAddress | NVARCHAR(45) | NULL | Adresse IP |
| UserAgent | NVARCHAR(255) | NULL | Navigateur |
| Details | NVARCHAR(MAX) | NULL | JSON avec détails |
| Timestamp | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date événement |

**Index** :
- `IX_SecurityAuditLogs_EventType`
- `IX_SecurityAuditLogs_Timestamp`
- `IX_SecurityAuditLogs_UserId`

---

### 2.2 GESTION PATIENTS

#### Table : `Patients`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant unique |
| PatientNumber | NVARCHAR(20) | UNIQUE, NOT NULL | Numéro dossier (auto-généré) |
| FirstName | NVARCHAR(100) | NOT NULL | Prénom |
| LastName | NVARCHAR(100) | NOT NULL | Nom |
| DateOfBirth | DATE | NOT NULL | Date de naissance |
| Gender | NVARCHAR(10) | NOT NULL | M, F, AUTRE |
| PhoneNumber | NVARCHAR(20) | NOT NULL | Téléphone (unique de préférence) |
| AlternativePhone | NVARCHAR(20) | NULL | Téléphone secondaire |
| Address | NVARCHAR(255) | NULL | Adresse |
| City | NVARCHAR(100) | NULL | Ville |
| EmergencyContact | NVARCHAR(100) | NULL | Contact d'urgence |
| EmergencyPhone | NVARCHAR(20) | NULL | Téléphone urgence |
| BloodType | NVARCHAR(5) | NULL | A+, B-, O+, AB+... |
| Allergies | NVARCHAR(MAX) | NULL | Allergies connues |
| ChronicDiseases | NVARCHAR(MAX) | NULL | Maladies chroniques |
| RegistrationSource | NVARCHAR(20) | NOT NULL | SELF_ONBOARDING, ACCUEIL |
| IsActive | BIT | NOT NULL, DEFAULT 1 | Dossier actif |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date création |
| CreatedBy | GUID | FK Users(Id), NULL | Staff créateur (NULL si self) |
| UpdatedAt | DATETIME2 | NULL | Dernière modification |
| UpdatedBy | GUID | FK Users(Id), NULL | Dernière modification par |

**Index** :
- `IX_Patients_PatientNumber` (UNIQUE)
- `IX_Patients_PhoneNumber`
- `IX_Patients_LastName`
- `IX_Patients_DateOfBirth`
- `IX_Patients_IsActive`

**Règles anti-doublon** :
- Téléphone + DateOfBirth → UNIQUE CONSTRAINT (optionnel)
- Vérification floue via algo Levenshtein (Nom + Prénom)

---

#### Table : `VitalSigns`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant |
| PatientId | GUID | FK Patients(Id), NOT NULL | Patient |
| ConsultationId | GUID | FK Consultations(Id), NULL | Consultation associée |
| Weight | DECIMAL(5,2) | NULL | Poids (kg) |
| Height | DECIMAL(5,2) | NULL | Taille (cm) |
| Temperature | DECIMAL(4,2) | NULL | Température (°C) |
| BloodPressureSystolic | INT | NULL | Tension systolique (mmHg) |
| BloodPressureDiastolic | INT | NULL | Tension diastolique (mmHg) |
| HeartRate | INT | NULL | Fréquence cardiaque (bpm) |
| RespiratoryRate | INT | NULL | Fréquence respiratoire |
| OxygenSaturation | INT | NULL | SpO2 (%) |
| MeasuredAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date mesure |
| MeasuredBy | GUID | FK Users(Id), NOT NULL | Staff ayant mesuré |

**Index** :
- `IX_VitalSigns_PatientId`
- `IX_VitalSigns_ConsultationId`
- `IX_VitalSigns_MeasuredAt`

---

#### Table : `PatientDocuments`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant |
| PatientId | GUID | FK Patients(Id), NOT NULL | Patient |
| DocumentType | NVARCHAR(50) | NOT NULL | QR_CODE, PHOTO, SCAN, OTHER |
| FileName | NVARCHAR(255) | NOT NULL | Nom fichier |
| FilePath | NVARCHAR(500) | NOT NULL | Chemin stockage |
| FileSize | BIGINT | NULL | Taille (bytes) |
| MimeType | NVARCHAR(100) | NULL | image/png, application/pdf... |
| UploadedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date upload |
| UploadedBy | GUID | FK Users(Id), NULL | Staff (NULL si auto) |

**Index** :
- `IX_PatientDocuments_PatientId`
- `IX_PatientDocuments_DocumentType`

---

### 2.3 PARCOURS MÉDICAL

#### Table : `Specialties`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | INT | PK, IDENTITY | Identifiant |
| Name | NVARCHAR(100) | UNIQUE, NOT NULL | Médecine Générale, Pédiatrie, Gynécologie... |
| Code | NVARCHAR(20) | UNIQUE, NOT NULL | MG, PED, GYN... |
| IsActive | BIT | NOT NULL, DEFAULT 1 | Spécialité active |

---

#### Table : `Consultations`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant |
| PatientId | GUID | FK Patients(Id), NOT NULL | Patient |
| SpecialtyId | INT | FK Specialties(Id), NOT NULL | Spécialité |
| DoctorId | GUID | FK Users(Id), NOT NULL | Médecin |
| ConsultationDate | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date consultation |
| ChiefComplaint | NVARCHAR(500) | NOT NULL | Motif consultation |
| History | NVARCHAR(MAX) | NULL | Histoire de la maladie |
| PhysicalExamination | NVARCHAR(MAX) | NULL | Examen clinique |
| TreatmentPlan | NVARCHAR(MAX) | NULL | Plan de traitement |
| Notes | NVARCHAR(MAX) | NULL | Notes diverses |
| Status | NVARCHAR(20) | NOT NULL, DEFAULT 'IN_PROGRESS' | IN_PROGRESS, COMPLETED, CANCELLED |
| CompletedAt | DATETIME2 | NULL | Date clôture |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date création |

**Index** :
- `IX_Consultations_PatientId`
- `IX_Consultations_DoctorId`
- `IX_Consultations_ConsultationDate`
- `IX_Consultations_Status`

---

#### Table : `Diagnoses`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant |
| ConsultationId | GUID | FK Consultations(Id), NOT NULL | Consultation |
| DiagnosisCode | NVARCHAR(20) | NULL | Code CIM-10 (optionnel) |
| DiagnosisName | NVARCHAR(255) | NOT NULL | Diagnostic (texte libre) |
| IsPrimary | BIT | NOT NULL, DEFAULT 0 | Diagnostic principal |
| Severity | NVARCHAR(20) | NULL | MILD, MODERATE, SEVERE |
| Notes | NVARCHAR(MAX) | NULL | Notes complémentaires |

**Index** :
- `IX_Diagnoses_ConsultationId`
- `IX_Diagnoses_DiagnosisCode`

---

#### Table : `LabTestTypes`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | INT | PK, IDENTITY | Identifiant |
| Name | NVARCHAR(100) | UNIQUE, NOT NULL | NFS, Glycémie, Parasitologie... |
| Code | NVARCHAR(20) | UNIQUE, NOT NULL | NFS, GLY, PARA... |
| IsActive | BIT | NOT NULL, DEFAULT 1 | Examen actif |

---

#### Table : `LabTests`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant |
| ConsultationId | GUID | FK Consultations(Id), NOT NULL | Consultation |
| LabTestTypeId | INT | FK LabTestTypes(Id), NOT NULL | Type d'examen |
| PrescribedBy | GUID | FK Users(Id), NOT NULL | Médecin prescripteur |
| Status | NVARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | PENDING, IN_PROGRESS, COMPLETED, CANCELLED |
| PrescribedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date prescription |
| PerformedAt | DATETIME2 | NULL | Date réalisation |
| PerformedBy | GUID | FK Users(Id), NULL | Laborantin |
| CompletedAt | DATETIME2 | NULL | Date finalisation |

**Index** :
- `IX_LabTests_ConsultationId`
- `IX_LabTests_Status`
- `IX_LabTests_PrescribedAt`

---

#### Table : `LabResults`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant |
| LabTestId | GUID | FK LabTests(Id), NOT NULL | Examen |
| ParameterName | NVARCHAR(100) | NOT NULL | Nom paramètre (Hémoglobine, Leucocytes...) |
| Value | NVARCHAR(100) | NOT NULL | Valeur mesurée |
| Unit | NVARCHAR(20) | NULL | g/dL, /mm³... |
| ReferenceRange | NVARCHAR(100) | NULL | Valeurs normales |
| IsAbnormal | BIT | NOT NULL, DEFAULT 0 | Hors normes |
| Notes | NVARCHAR(500) | NULL | Commentaires |

**Index** :
- `IX_LabResults_LabTestId`

---

#### Table : `Prescriptions`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant |
| ConsultationId | GUID | FK Consultations(Id), NOT NULL | Consultation |
| PrescribedBy | GUID | FK Users(Id), NOT NULL | Médecin |
| Status | NVARCHAR(20) | NOT NULL, DEFAULT 'PENDING' | PENDING, PARTIALLY_DISPENSED, DISPENSED, CANCELLED |
| PrescribedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date prescription |
| Notes | NVARCHAR(MAX) | NULL | Instructions générales |

**Index** :
- `IX_Prescriptions_ConsultationId`
- `IX_Prescriptions_Status`

---

### 2.4 PHARMACIE

#### Table : `Medications`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant |
| Name | NVARCHAR(200) | NOT NULL | Nom commercial |
| GenericName | NVARCHAR(200) | NULL | DCI |
| Form | NVARCHAR(50) | NOT NULL | TABLET, SYRUP, INJECTION, OINTMENT... |
| Dosage | NVARCHAR(50) | NOT NULL | 500mg, 5ml... |
| Unit | NVARCHAR(20) | NOT NULL | comprimé, flacon, ampoule... |
| IsActive | BIT | NOT NULL, DEFAULT 1 | Médicament actif |
| CreatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date création |

**Index** :
- `IX_Medications_Name`
- `IX_Medications_GenericName`
- `IX_Medications_IsActive`

---

#### Table : `MedicationStock`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant |
| MedicationId | GUID | FK Medications(Id), NOT NULL | Médicament |
| BatchNumber | NVARCHAR(50) | NULL | Numéro de lot |
| ExpiryDate | DATE | NULL | Date péremption |
| InitialQuantity | INT | NOT NULL | Quantité initiale |
| CurrentQuantity | INT | NOT NULL | Quantité actuelle (calculée) |
| MinimumThreshold | INT | NULL | Seuil alerte |
| LastUpdatedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Dernière MAJ |

**Index** :
- `IX_MedicationStock_MedicationId`
- `IX_MedicationStock_ExpiryDate`
- `IX_MedicationStock_CurrentQuantity`

**Règles métier** :
- CurrentQuantity = InitialQuantity - SUM(PharmacyDispensations.QuantityDispensed)
- Calcul automatique via trigger ou recalcul applicatif

---

#### Table : `PrescriptionItems`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant |
| PrescriptionId | GUID | FK Prescriptions(Id), NOT NULL | Ordonnance |
| MedicationId | GUID | FK Medications(Id), NOT NULL | Médicament |
| Quantity | INT | NOT NULL | Quantité prescrite |
| Dosage | NVARCHAR(200) | NOT NULL | Posologie (1cp x 3/jour) |
| Duration | NVARCHAR(50) | NULL | Durée (7 jours, 1 mois...) |
| Instructions | NVARCHAR(500) | NULL | Consignes spéciales |

**Index** :
- `IX_PrescriptionItems_PrescriptionId`
- `IX_PrescriptionItems_MedicationId`

---

#### Table : `PharmacyDispensations`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | GUID | PK, NOT NULL | Identifiant |
| PrescriptionItemId | GUID | FK PrescriptionItems(Id), NOT NULL | Ligne ordonnance |
| MedicationStockId | GUID | FK MedicationStock(Id), NOT NULL | Lot utilisé |
| QuantityDispensed | INT | NOT NULL | Quantité délivrée |
| DispensedAt | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date délivrance |
| DispensedBy | GUID | FK Users(Id), NOT NULL | Pharmacien |
| Notes | NVARCHAR(500) | NULL | Remarques |

**Index** :
- `IX_PharmacyDispensations_PrescriptionItemId`
- `IX_PharmacyDispensations_MedicationStockId`
- `IX_PharmacyDispensations_DispensedAt`

---

### 2.5 TRAÇABILITÉ MÉDICALE

#### Table : `MedicalAuditLogs`

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| Id | BIGINT | PK, IDENTITY | Identifiant |
| EntityType | NVARCHAR(50) | NOT NULL | CONSULTATION, PRESCRIPTION, LAB_TEST, DISPENSATION... |
| EntityId | GUID | NOT NULL | ID de l'entité concernée |
| Action | NVARCHAR(20) | NOT NULL | CREATE, UPDATE, DELETE, VIEW |
| PatientId | GUID | FK Patients(Id), NOT NULL | Patient concerné |
| PerformedBy | GUID | FK Users(Id), NOT NULL | Staff |
| RoleName | NVARCHAR(50) | NOT NULL | Rôle au moment de l'action |
| OldValues | NVARCHAR(MAX) | NULL | JSON avant modification |
| NewValues | NVARCHAR(MAX) | NULL | JSON après modification |
| Timestamp | DATETIME2 | NOT NULL, DEFAULT GETUTCDATE() | Date action |

**Index** :
- `IX_MedicalAuditLogs_EntityType`
- `IX_MedicalAuditLogs_EntityId`
- `IX_MedicalAuditLogs_PatientId`
- `IX_MedicalAuditLogs_PerformedBy`
- `IX_MedicalAuditLogs_Timestamp`

**Règles métier** :
- Logs immuables (pas de DELETE/UPDATE)
- Rétention : minimum 5 ans (configurable)

---

## 3. DIAGRAMME RELATIONNEL (ERD)

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│    Users    │────┬────│  UserRoles  │────┬────│    Roles    │
└─────────────┘    │    └─────────────┘    │    └─────────────┘
       │           │                        │
       │ CreatedBy │                        │
       │           │                        │
       ▼           │                        │
┌─────────────┐   │                        │
│  Patients   │◄──┘                        │
└─────────────┘                            │
       │                                    │
       │ 1:N                                │
       ├────────────┬────────────┬─────────┴──────┬──────────┐
       │            │            │                │          │
       ▼            ▼            ▼                ▼          ▼
┌────────────┐ ┌──────────┐ ┌─────────┐   ┌──────────┐ ┌──────────┐
│VitalSigns  │ │Patient   │ │Patient  │   │Security  │ │Medical   │
│            │ │Documents │ │Access   │   │Audit     │ │Audit     │
│            │ │          │ │Tokens   │   │Logs      │ │Logs      │
└────────────┘ └──────────┘ └─────────┘   └──────────┘ └──────────┘
       │
       │ ConsultationId
       ▼
┌─────────────────┐
│ Consultations   │◄────────┐ SpecialtyId
└─────────────────┘         │
       │                ┌───────────┐
       │ 1:N            │Specialties│
       ├────────────┬───└───────────┘
       │            │
       ▼            ▼
┌──────────┐  ┌──────────┐
│Diagnoses │  │LabTests  │◄───────┐ LabTestTypeId
└──────────┘  └──────────┘        │
                   │           ┌──────────────┐
                   │ 1:N       │LabTestTypes  │
                   ▼           └──────────────┘
            ┌──────────────┐
            │LabResults    │
            └──────────────┘

┌─────────────────┐
│ Consultations   │
└─────────────────┘
       │
       │ 1:N
       ▼
┌──────────────────┐
│ Prescriptions    │
└──────────────────┘
       │
       │ 1:N
       ▼
┌──────────────────────┐
│ PrescriptionItems    │◄─────┐ MedicationId
└──────────────────────┘      │
       │                  ┌───────────┐
       │ 1:N              │Medications│
       ▼                  └───────────┘
┌──────────────────────┐      │
│PharmacyDispensations │      │ 1:N
└──────────────────────┘      ▼
       │                ┌────────────────┐
       │                │MedicationStock │
       └───────────────►└────────────────┘
         MedicationStockId
```

---

## 4. CONTRAINTES D'INTÉGRITÉ

### 4.1 Contraintes de clé étrangère

```sql
-- Patients
ALTER TABLE Patients
  ADD CONSTRAINT FK_Patients_CreatedBy FOREIGN KEY (CreatedBy) REFERENCES Users(Id);

ALTER TABLE Patients
  ADD CONSTRAINT FK_Patients_UpdatedBy FOREIGN KEY (UpdatedBy) REFERENCES Users(Id);

-- VitalSigns
ALTER TABLE VitalSigns
  ADD CONSTRAINT FK_VitalSigns_Patient FOREIGN KEY (PatientId) REFERENCES Patients(Id) ON DELETE CASCADE;

ALTER TABLE VitalSigns
  ADD CONSTRAINT FK_VitalSigns_Consultation FOREIGN KEY (ConsultationId) REFERENCES Consultations(Id);

ALTER TABLE VitalSigns
  ADD CONSTRAINT FK_VitalSigns_MeasuredBy FOREIGN KEY (MeasuredBy) REFERENCES Users(Id);

-- Consultations
ALTER TABLE Consultations
  ADD CONSTRAINT FK_Consultations_Patient FOREIGN KEY (PatientId) REFERENCES Patients(Id);

ALTER TABLE Consultations
  ADD CONSTRAINT FK_Consultations_Specialty FOREIGN KEY (SpecialtyId) REFERENCES Specialties(Id);

ALTER TABLE Consultations
  ADD CONSTRAINT FK_Consultations_Doctor FOREIGN KEY (DoctorId) REFERENCES Users(Id);

-- LabTests
ALTER TABLE LabTests
  ADD CONSTRAINT FK_LabTests_Consultation FOREIGN KEY (ConsultationId) REFERENCES Consultations(Id);

ALTER TABLE LabTests
  ADD CONSTRAINT FK_LabTests_Type FOREIGN KEY (LabTestTypeId) REFERENCES LabTestTypes(Id);

-- MedicationStock
ALTER TABLE MedicationStock
  ADD CONSTRAINT FK_MedicationStock_Medication FOREIGN KEY (MedicationId) REFERENCES Medications(Id);

-- PharmacyDispensations
ALTER TABLE PharmacyDispensations
  ADD CONSTRAINT FK_PharmacyDispensations_PrescriptionItem FOREIGN KEY (PrescriptionItemId) REFERENCES PrescriptionItems(Id);

ALTER TABLE PharmacyDispensations
  ADD CONSTRAINT FK_PharmacyDispensations_Stock FOREIGN KEY (MedicationStockId) REFERENCES MedicationStock(Id);

ALTER TABLE PharmacyDispensations
  ADD CONSTRAINT FK_PharmacyDispensations_DispensedBy FOREIGN KEY (DispensedBy) REFERENCES Users(Id);
```

### 4.2 Contraintes CHECK

```sql
-- Patients
ALTER TABLE Patients
  ADD CONSTRAINT CK_Patients_Gender CHECK (Gender IN ('M', 'F', 'AUTRE'));

ALTER TABLE Patients
  ADD CONSTRAINT CK_Patients_RegistrationSource CHECK (RegistrationSource IN ('SELF_ONBOARDING', 'ACCUEIL'));

-- Consultations
ALTER TABLE Consultations
  ADD CONSTRAINT CK_Consultations_Status CHECK (Status IN ('IN_PROGRESS', 'COMPLETED', 'CANCELLED'));

-- LabTests
ALTER TABLE LabTests
  ADD CONSTRAINT CK_LabTests_Status CHECK (Status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'));

-- Prescriptions
ALTER TABLE Prescriptions
  ADD CONSTRAINT CK_Prescriptions_Status CHECK (Status IN ('PENDING', 'PARTIALLY_DISPENSED', 'DISPENSED', 'CANCELLED'));

-- VitalSigns (validations logiques)
ALTER TABLE VitalSigns
  ADD CONSTRAINT CK_VitalSigns_Weight CHECK (Weight IS NULL OR (Weight > 0 AND Weight < 300));

ALTER TABLE VitalSigns
  ADD CONSTRAINT CK_VitalSigns_Temperature CHECK (Temperature IS NULL OR (Temperature > 30 AND Temperature < 45));

-- MedicationStock
ALTER TABLE MedicationStock
  ADD CONSTRAINT CK_MedicationStock_Quantity CHECK (CurrentQuantity >= 0);
```

### 4.3 Contraintes UNIQUE

```sql
-- Patients : Anti-doublon suggéré (optionnel)
CREATE UNIQUE INDEX IX_Patients_PhoneDOB
  ON Patients(PhoneNumber, DateOfBirth)
  WHERE IsActive = 1;

-- PatientAccessTokens
CREATE UNIQUE INDEX IX_PatientAccessTokens_Token
  ON PatientAccessTokens(Token)
  WHERE IsRevoked = 0;
```

---

## 5. VUES MÉTIER (OPTIONNEL)

### 5.1 Vue : Patients avec dernière consultation

```sql
CREATE VIEW vw_PatientsWithLastConsultation AS
SELECT
  p.Id,
  p.PatientNumber,
  p.FirstName,
  p.LastName,
  p.PhoneNumber,
  p.DateOfBirth,
  c.ConsultationDate AS LastConsultationDate,
  s.Name AS LastSpecialty,
  u.FirstName + ' ' + u.LastName AS LastDoctor
FROM Patients p
LEFT JOIN LATERAL (
  SELECT TOP 1 *
  FROM Consultations
  WHERE PatientId = p.Id
  ORDER BY ConsultationDate DESC
) c ON 1=1
LEFT JOIN Specialties s ON c.SpecialtyId = s.Id
LEFT JOIN Users u ON c.DoctorId = u.Id;
```

### 5.2 Vue : Stock médicaments avec alertes

```sql
CREATE VIEW vw_MedicationStockAlerts AS
SELECT
  m.Name,
  m.GenericName,
  ms.BatchNumber,
  ms.CurrentQuantity,
  ms.MinimumThreshold,
  ms.ExpiryDate,
  CASE
    WHEN ms.CurrentQuantity <= ms.MinimumThreshold THEN 'LOW_STOCK'
    WHEN ms.ExpiryDate <= DATEADD(MONTH, 3, GETDATE()) THEN 'EXPIRING_SOON'
    ELSE 'OK'
  END AS AlertLevel
FROM MedicationStock ms
JOIN Medications m ON ms.MedicationId = m.Id
WHERE m.IsActive = 1;
```

---

## 6. CYCLE DE VIE DES TOKENS PATIENT

### 6.1 États du token

```
CRÉÉ → ACTIF → EXPIRÉ (automatique)
         ↓
      RÉVOQUÉ (manuel)
```

### 6.2 Règles de gestion

| Événement | Action | Responsable |
|-----------|--------|-------------|
| Création patient | Génération token (expiration +30j) | Système |
| Accès réussi | Prolongation optionnelle expiration | Système |
| Inactivité 30j | Expiration automatique | Système (job batch) |
| Suspicion fraude | Révocation manuelle | ADMIN |
| Demande patient | Régénération nouveau token | ACCUEIL |

### 6.3 Job de nettoyage (tâche planifiée)

```sql
-- Exécution quotidienne (00:00)
UPDATE PatientAccessTokens
SET IsRevoked = 1,
    RevokedAt = GETUTCDATE()
WHERE ExpiresAt < GETUTCDATE()
  AND IsRevoked = 0;
```

---

## 7. SÉPARATION DES AUDITS

### 7.1 `SecurityAuditLogs` (Sécurité)

**Usage** : Authentification, autorisation, accès système

**Exemples** :
- LOGIN réussi
- FAILED_LOGIN (tentatives)
- TOKEN_CREATED
- TOKEN_REVOKED
- UNAUTHORIZED_ACCESS

**Rétention** : 1 an minimum

---

### 7.2 `MedicalAuditLogs` (Médical)

**Usage** : Actions métier sur données patients

**Exemples** :
- CREATE Consultation
- UPDATE Prescription
- VIEW Patient (RGPD : qui consulte quoi)
- DELETE LabTest (avec justification)

**Rétention** : 5 ans minimum (conformité légale)

---

## 8. STRATÉGIES D'INDEXATION

### 8.1 Index de performance critiques

```sql
-- Recherche patient par téléphone (page publique)
CREATE INDEX IX_Patients_Phone_DOB
  ON Patients(PhoneNumber, DateOfBirth)
  INCLUDE (Id, FirstName, LastName);

-- Consultations du jour
CREATE INDEX IX_Consultations_Date_Status
  ON Consultations(ConsultationDate, Status)
  INCLUDE (PatientId, DoctorId);

-- Stock faible
CREATE INDEX IX_MedicationStock_Quantity
  ON MedicationStock(CurrentQuantity)
  INCLUDE (MedicationId, ExpiryDate);

-- Audits par période
CREATE INDEX IX_MedicalAuditLogs_Timestamp_Entity
  ON MedicalAuditLogs(Timestamp, EntityType);
```

---

## 9. SCRIPT DE CRÉATION (PostgreSQL)

Fichier séparé : `schema.sql`

```sql
-- Voir fichier annexe pour le script complet
-- Inclut :
-- - CREATE TABLE (toutes les tables)
-- - CREATE INDEX
-- - ALTER TABLE (contraintes FK)
-- - INSERT référentiels (Roles, Specialties, LabTestTypes)
-- - CREATE VIEW
```

---

## 10. DONNÉES DE RÉFÉRENCE (SEED DATA)

### 10.1 Rôles

```sql
INSERT INTO Roles (Name, Description) VALUES
('ADMIN', 'Administrateur système'),
('ACCUEIL', 'Agent d''accueil'),
('MEDECIN', 'Médecin'),
('LABORANTIN', 'Technicien de laboratoire'),
('PHARMACIEN', 'Pharmacien'),
('SUPERVISEUR', 'Superviseur - lecture seule');
```

### 10.2 Spécialités

```sql
INSERT INTO Specialties (Name, Code) VALUES
('Médecine Générale', 'MG'),
('Pédiatrie', 'PED'),
('Gynécologie', 'GYN'),
('Ophtalmologie', 'OPH'),
('Dentisterie', 'DENT'),
('Chirurgie Mineure', 'CHIR');
```

### 10.3 Types d'examens

```sql
INSERT INTO LabTestTypes (Name, Code) VALUES
('Numération Formule Sanguine', 'NFS'),
('Glycémie', 'GLY'),
('Parasitologie des selles', 'PARA'),
('Test de grossesse', 'HCG'),
('Groupe sanguin', 'GRP'),
('Goutte épaisse (Paludisme)', 'GE');
```

---

## 11. VOLUMÉTRIE ESTIMÉE

### Hypothèses (campagne 1 semaine / 500 patients)

| Table | Enregistrements | Taille estimée |
|-------|----------------|----------------|
| Patients | 500 | ~100 KB |
| Consultations | 800 (1,6/patient) | ~500 KB |
| VitalSigns | 800 | ~150 KB |
| Prescriptions | 600 | ~100 KB |
| PrescriptionItems | 1500 | ~200 KB |
| PharmacyDispensations | 1500 | ~250 KB |
| LabTests | 200 | ~50 KB |
| LabResults | 800 (4/test) | ~150 KB |
| MedicalAuditLogs | 5000 | ~2 MB |
| SecurityAuditLogs | 1000 | ~500 KB |
| **TOTAL** | **~12 000** | **~4 MB** |

**Base 1 an (50 campagnes)** : ~200 MB (hors documents binaires)

---

## 12. STRATÉGIE DE SAUVEGARDE

| Type | Fréquence | Rétention |
|------|-----------|-----------|
| Complète | Quotidienne (00:00) | 7 jours |
| Différentielle | Toutes les 4h | 24h |
| Logs transactionnels | Toutes les heures | 7 jours |

---

## ✅ CHECKLIST DE VALIDATION

- [x] Tables utilisateurs et rôles (RBAC)
- [x] Tokens patient avec expiration/révocation
- [x] Patients avec anti-doublon
- [x] Parcours médical complet (Consultation → Labo → Pharmacie)
- [x] Stock pharmacie avec calcul automatique
- [x] Séparation audits (sécurité vs médical)
- [x] Contraintes d'intégrité
- [x] Index de performance
- [x] Données de référence (seed data)
- [x] Volumétrie et stratégie sauvegarde

---

## 📋 PROCHAINE ÉTAPE

**LIVRABLE 3** : Liste des API REST (endpoints, méthodes, authentification)

---

**⏸️ EN ATTENTE DE VALIDATION CLIENT**

_Merci de valider ce modèle de données avant de poursuivre._
