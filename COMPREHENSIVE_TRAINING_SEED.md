# Seeding Comprehensive Training Data

## Endpoint Details

**URL:** `POST /api/training/seed-comprehensive-data`

**Authentication:** `AllowAnonymous` (no JWT required for convenience, can add `[Authorize]` if desired)

**Purpose:** Seeds all 7 comprehensive professional training modules into the database for all user roles

---

## Request

```bash
curl -X POST https://localhost:7288/api/training/seed-comprehensive-data
```

Or using PowerShell:

```powershell
$response = Invoke-RestMethod -Uri "https://localhost:7288/api/training/seed-comprehensive-data" `
    -Method Post `
    -ContentType "application/json"

$response | ConvertTo-Json
```

Or using Thunder Client / Postman:
1. Create new request
2. Method: **POST**
3. URL: `https://localhost:7288/api/training/seed-comprehensive-data`
4. Headers: `Content-Type: application/json`
5. Body: (empty)
6. Click **Send**

---

## Response (Success)

```json
{
  "success": true,
  "message": "Successfully seeded 7 out of 7 comprehensive training modules",
  "createdCount": 7,
  "totalCount": 7,
  "createdModules": [
    "Gestion Administrative Complète (StaffAdmin)",
    "Accueil et Enregistrement Patient (StaffAccueil)",
    "Consultation Médicale et Diagnostic (StaffMedecin)",
    "Analyse de Laboratoire et Sécurité Biologique (StaffLaborantin)",
    "Gestion Pharmacie et Dispensation (StaffPharmacien)",
    "Leadership et Supervision d'Équipe (StaffSuperviseur)",
    "Utiliser Brigade Médicale - Guide Patient (Patient)"
  ],
  "details": {
    "staffAdminModules": 1,
    "staffAccueilModules": 1,
    "staffMedecinModules": 1,
    "staffLaborantinModules": 1,
    "staffPharmacienModules": 1,
    "staffSuperviseurModules": 1,
    "patientModules": 1
  }
}
```

---

## What Gets Seeded

### 1. **StaffAdmin** - Gestion Administrative Complète (120 min)
- 7 steps covering administration, users, patients, finances, security, excellence
- 8 quiz questions
- Role-based access control

### 2. **StaffAccueil** - Accueil et Enregistrement Patient (90 min)
- 7 steps covering communication, registration, queue management, payments
- 8 quiz questions
- Patient-facing role guidance

### 3. **StaffMedecin** - Consultation Médicale et Diagnostic (120 min)
- 7 steps covering consultation structure, diagnosis, prescriptions, labs, emergencies
- 8 quiz questions
- Clinical excellence focus

### 4. **StaffLaborantin** - Analyse de Laboratoire (120 min)
- 7 steps covering safety, specimen collection, analyses, equipment, critical results
- 8 quiz questions
- Technical and safety focused

### 5. **StaffPharmacien** - Gestion Pharmacie et Dispensation (120 min)
- 7 steps covering dispensation, interactions, contraindications, stocks, counseling
- 8 quiz questions
- Patient safety emphasis

### 6. **StaffSuperviseur** - Leadership et Supervision (120 min)
- 7 steps covering team management, motivation, quality assurance, incident handling
- 8 quiz questions
- Leadership development

### 7. **Patient** - Utiliser Brigade Médicale (45 min)
- 5 steps covering onboarding, preparation, dossier access, treatments, health prevention
- 8 quiz questions
- Patient education focus

---

## After Seeding

Once seeded, access modules via:

```bash
# List all modules for a specific role
curl https://localhost:7288/api/training/modules?audience=StaffAdmin

# Get specific module detail
curl https://localhost:7288/api/training/modules/{trainingId}

# Get user progress
curl https://localhost:7288/api/training/progress/{moduleId} \
  -H "Authorization: Bearer {jwt-token}"

# Save user progress
curl -X POST https://localhost:7288/api/training/progress/{moduleId} \
  -H "Authorization: Bearer {jwt-token}" \
  -H "Content-Type: application/json" \
  -d '{"status":"IN_PROGRESS","completedSteps":[1,2],"currentStepIndex":3,"quizScore":85}'
```

---

## Notes

- **Idempotency:** Calling this endpoint multiple times will create duplicate modules. Delete existing modules first if re-seeding needed.
- **Database:** Requires database connection to be available
- **Logging:** All created modules are logged to application logs
- **Errors:** If any module fails to create, the endpoint continues and reports partial success

### To Delete All Training Modules (for re-seeding):

In SQL Server or your database:

```sql
DELETE FROM TrainingQuizzes;
DELETE FROM TrainingSteps;
DELETE FROM TrainingProgressRecords;
DELETE FROM TrainingModules;
```

Then call the seed endpoint again.

---

## Customization

To modify training content:
1. Edit `src/BrigadeMedicale.API/Helpers/ComprehensiveTrainingData.cs`
2. Modify the relevant `GetXxxModules()` method
3. Rebuild: `dotnet build`
4. Delete old modules from database (see SQL above)
5. Call the seed endpoint again

---

## Production Deployment

For production, consider:
1. Adding `[Authorize(Roles = "ADMIN")]` to restrict who can seed
2. Running this once on initial deployment, then removing the endpoint
3. Using a migration-based approach instead of runtime seeding

Example production change:

```csharp
[HttpPost("seed-comprehensive-data")]
[Authorize(Roles = "ADMIN")]  // Add this
public async Task<IActionResult> SeedComprehensiveData()
```

