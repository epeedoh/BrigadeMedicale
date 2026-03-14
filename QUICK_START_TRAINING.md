# Quick Start - Training Modules Setup

## Problem
Database is empty - no training modules found

## Solution
Apply the seeding migration

## Step 1: Run Migration

### Option A: Command Line (Recommended)
```bash
cd src/BrigadeMedicale.API
dotnet ef database update
```

### Option B: Visual Studio
1. Tools → NuGet Package Manager → Package Manager Console
2. Select `BrigadeMedicale.Infrastructure` as Default Project
3. Run: `Update-Database`

### Option C: Helper Script
```bash
# Windows
apply-training-migration.bat

# Linux/macOS
./apply-training-migration.sh
```

## Step 2: Verify It Worked

```sql
SELECT COUNT(*) as ModuleCount FROM TrainingModules;
```

Expected: `25` or more

## Step 3: Restart Application
```bash
cd src/BrigadeMedicale.API
dotnet run
```

## Step 4: Check Frontend
Navigate to training section - modules should now appear!

## What Gets Added

| Role | Modules | Duration |
|------|---------|----------|
| Admin | 3 | 115 min |
| Accueil | 1 | 40 min |
| Medecin | 3 | 130 min |
| Laborantin | 1 | 50 min |
| Pharmacien | 1 | 45 min |
| Superviseur | 1 | 50 min |
| Patient | 1 + quiz | 8 min |

**Total: 25+ modules ready to use**

## Troubleshooting

### Migration won't run?
```bash
# Rebuild solution first
dotnet build

# Then try again
dotnet ef database update
```

### Still no modules?
```bash
# Check database connection
SELECT name FROM sqlite_master WHERE type='table';

# Should show TrainingModules, TrainingSteps, TrainingQuizzes
```

### Need to undo?
```bash
dotnet ef database update 20260214224154_AddTriageFeature
```

## That's It!

Your training modules are now seeded and ready to use. No additional configuration needed.

For detailed info, see: `TRAINING_SEEDING_SETUP.md`
