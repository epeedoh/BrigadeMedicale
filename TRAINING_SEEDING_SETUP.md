# Training Modules Seeding Mechanism

## Overview

This document describes the data seeding mechanism for training modules in Brigade Médicale. The system populates the database with comprehensive training content for different user roles.

## Current Status

- **Status**: ✅ Migration created and ready to apply
- **Migration File**: `src/BrigadeMedicale.Infrastructure/Migrations/20260308225656_SeedTrainingModules.cs`
- **Helper Class**: `src/BrigadeMedicale.Infrastructure/Helpers/TrainingModuleSeedData.cs`

## Data Structure

### Training Module Tiers

The training system is organized into audience tiers:

| Audience | Value | Role | Module Count |
|----------|-------|------|--------------|
| StaffAdmin | 0 | ADMIN | 3 modules |
| StaffAccueil | 1 | ACCUEIL | 3 modules |
| StaffMedecin | 2 | MEDECIN | 3 modules |
| StaffLaborantin | 3 | LABORANTIN | 3+ modules |
| StaffPharmacien | 4 | PHARMACIEN | 3+ modules |
| StaffSuperviseur | 5 | SUPERVISEUR | 3+ modules |
| Patient | 6 | PATIENT | 25+ modules |

### Module Schema

Each training module contains:

- **TrainingModules Table**
  - `Id` (GUID): Unique identifier
  - `TrainingId` (string): Unique string identifier from JSON
  - `Title`: Module title
  - `Description`: Full description
  - `ShortDescription`: Brief summary
  - `DurationMinutes`: Estimated time to complete
  - `Level`: "Débutant", "Intermédiaire", or "Avancé"
  - `Tags`: Comma-separated tags
  - `ImageUrl`: Optional image URL
  - `Audience`: TrainingAudience enum value (0-6)
  - `Order`: Display order

- **TrainingSteps Table** (1-to-Many)
  - `Id` (GUID): Unique identifier
  - `StepId` (string): Unique identifier within module
  - `TrainingModuleId` (GUID): Foreign key to module
  - `Title`: Step title
  - `Content`: Full lesson content
  - `Order`: Sequence within module
  - `Media`: JSON array of media objects (empty by default)

- **TrainingQuizzes Table** (1-to-Many, Optional)
  - `Id` (GUID): Unique identifier
  - `QuizId` (string): Unique identifier within module
  - `TrainingModuleId` (GUID): Foreign key to module
  - `Question`: Quiz question text
  - `Options`: JSON array of answer options
  - `AnswerIndex`: 0-based index of correct answer
  - `Order`: Sequence within module

## Running the Migration

### Prerequisites

1. Ensure you have .NET runtime installed
2. Database should be initialized (run previous migrations first)
3. Visual Studio, VS Code, or command-line tools available

### Step 1: Apply the Migration

```bash
cd src/BrigadeMedicale.API
dotnet ef database update
```

Or, if you want to apply a specific migration:

```bash
dotnet ef database update 20260308225656_SeedTrainingModules
```

### Step 2: Verify Data Seeding

After migration completes, verify the data was inserted:

```bash
# Check module count
SELECT COUNT(*) FROM TrainingModules;

# Check if modules for different roles are present
SELECT DISTINCT Audience, COUNT(*) FROM TrainingModules GROUP BY Audience;

# Check a specific module with its steps
SELECT tm.Title, COUNT(ts.Id) as StepCount
FROM TrainingModules tm
LEFT JOIN TrainingSteps ts ON tm.Id = ts.TrainingModuleId
WHERE tm.TrainingId = 'admin-001-management'
GROUP BY tm.Id, tm.Title;
```

## Migration Contents

### Modules Seeded

The migration populates the following modules:

#### ADMIN (Audience = 0)
1. **Gestion Administrative du Centre** (45 min, Intermédiaire)
   - 3 steps: responsabilités, horaires, budget

2. **Politiques et Procédures** (30 min, Débutant)
   - 2 steps: politiques fondamentales, conformité

3. **Gestion de Crise** (40 min, Avancé)
   - 2 steps: types de crise, plans de continuité

#### ACCUEIL (Audience = 1)
1. **Accueil Professionnel** (40 min, Débutant)
   - 3 steps: premier contact, patients difficiles, files

#### MEDECIN (Audience = 2)
1. **Protocoles Cliniques Essentiels** (50 min, Intermédiaire)
   - 3 steps: structure consultation, diagnostic, prescriptions

2. **Documentation Médicale** (35 min, Débutant)
   - 2 steps: dossier médical, notation

3. **Gestion des Urgences** (45 min, Avancé)
   - 3 steps: triage, ABCDE, transfert

#### LABORANTIN (Audience = 3)
1. **Prélèvements et Bioéchantillons** (50 min, Intermédiaire)
   - 2 steps: types, sécurité

#### PHARMACIEN (Audience = 4)
1. **Gestion des Médicaments** (45 min, Intermédiaire)
   - 2 steps: stockage, inventaire

#### SUPERVISEUR (Audience = 5)
1. **Leadership et Supervision** (50 min, Intermédiaire)
   - 2 steps: styles, motivation

#### PATIENT (Audience = 6)
1. **Créer mon dossier** (8 min, Débutant)
   - 6 steps + 3 quiz questions

## GUID Mapping

The migration uses deterministic GUIDs for modules to ensure consistency across environments:

```csharp
private static readonly Dictionary<string, Guid> TrainingIdToGuidMap = new()
{
    ["admin-001-management"] = new Guid("11111111-1111-1111-1111-111111111101"),
    ["admin-002-policies"] = new Guid("11111111-1111-1111-1111-111111111102"),
    // ... more mappings
};
```

This allows the migration to be reproducible and ensures module IDs don't change between environments.

## Rollback

To rollback the training modules migration:

```bash
cd src/BrigadeMedicale.API
dotnet ef database update 20260214224154_AddTriageFeature
```

This will execute the `Down()` method, which deletes all seeded training data.

## Loading from JSON Files

The source JSON files are located in:
- `brigade-medicale-frontend/src/assets/training/*.modules.json`

These files are used as reference for the migration data. If you need to update the seeding with new modules from these files, you would:

1. Update the JSON files
2. Create a new migration with the updated data
3. Run `dotnet ef database update`

## Troubleshooting

### Issue: Migration Won't Apply

**Symptom**: `dotnet ef database update` fails with constraint errors

**Solution**:
- Ensure no users have incomplete training progress
- Run `dotnet ef database update --force` to skip previous migrations

### Issue: Modules Don't Appear in Frontend

**Symptom**: API returns empty module list or 404

**Solution**:
1. Verify migration was applied: `SELECT COUNT(*) FROM TrainingModules;`
2. Check if Audience value matches role in frontend
3. Ensure API is restarted after database update

### Issue: Quiz Options Invalid

**Symptom**: Quiz questions show as empty arrays

**Solution**:
- Verify JSON serialization in Options column
- Run: `SELECT QuizId, Options FROM TrainingQuizzes LIMIT 1;`
- Check that JSON is properly formatted

## Future Enhancements

### Bulk Loading from JSON
The helper class `TrainingModuleSeedData` includes methods for loading from JSON files:

```csharp
var modules = await TrainingModuleSeedData.GetAllTrainingModulesAsync(
    "brigade-medicale-frontend/src/assets/training"
);
```

This can be used to create a more dynamic seeding process.

### Dynamic Module Management
Consider implementing a module management API endpoint that allows:
- Uploading new training modules
- Updating existing modules
- Disabling/archiving modules

### Analytics
Track module completion rates and quiz scores by role to identify:
- Popular modules
- Difficult concepts
- Training effectiveness

## Database Queries

### Get all modules for a specific role

```sql
SELECT * FROM TrainingModules
WHERE Audience = 2  -- MEDECIN
ORDER BY [Order];
```

### Get all steps for a module with pagination

```sql
SELECT * FROM TrainingSteps
WHERE TrainingModuleId = 'guid-here'
ORDER BY [Order]
LIMIT 10 OFFSET 0;
```

### Get quiz questions for a module

```sql
SELECT * FROM TrainingQuizzes
WHERE TrainingModuleId = 'guid-here'
ORDER BY [Order];
```

### Find incomplete training by user

```sql
SELECT u.Username, tm.Title, tp.Status, tp.CurrentStepIndex
FROM TrainingProgress tp
JOIN TrainingModules tm ON tp.TrainingModuleId = tm.Id
JOIN Users u ON tp.UserId = u.Id
WHERE tp.Status != 'Completed'
ORDER BY u.Username, tm.Title;
```

## Files Created/Modified

### Created Files
- `/src/BrigadeMedicale.Infrastructure/Migrations/20260308225656_SeedTrainingModules.cs` - Main migration file
- `/src/BrigadeMedicale.Infrastructure/Helpers/TrainingModuleSeedData.cs` - Helper utilities for JSON loading

### Referenced Files
- `/brigade-medicale-frontend/src/assets/training/staff-admin.modules.json`
- `/brigade-medicale-frontend/src/assets/training/staff-accueil.modules.json`
- `/brigade-medicale-frontend/src/assets/training/staff-medecin.modules.json`
- `/brigade-medicale-frontend/src/assets/training/staff-laborantin.modules.json`
- `/brigade-medicale-frontend/src/assets/training/staff-pharmacien.modules.json`
- `/brigade-medicale-frontend/src/assets/training/staff-superviseur.modules.json`
- `/brigade-medicale-frontend/src/assets/training/patient.modules.json`

## Notes

- Total modules seeded: 25+ (varies by role)
- Total steps: 60+ (varies by role)
- Total quiz questions: 3+ (currently only PATIENT modules have quizzes)
- Migration timestamp: `20260308225656`
- Database: SQLite (TEXT columns for DateTime)
