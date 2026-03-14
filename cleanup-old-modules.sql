-- Cleanup script: Delete old demo training modules
-- Keep only the comprehensive modules
-- Run this in your SQL Server database

-- List of old demo module titles to delete
DELETE FROM TrainingModules
WHERE Title IN (
    'Gestion Administrative',
    'Politique et Conformité',
    'Gestion de Crise',
    'Bienvenue et Accueil',
    'Enregistrement Patient',
    'Communication Efficace',
    'Protocoles Médicaux',
    'Documentation Médicale',
    'Gestion d''Urgence',
    'Prélèvement d''Échantillons',
    'Analyse de Laboratoire',
    'Sécurité Biologique',
    'Gestion Pharmacie',
    'Interactions Médicamenteuses',
    'Service Client Pharmacie',
    'Leadership et Supervision',
    'Assurance Qualité',
    'Gestion de Conflits',
    'Créer mon Dossier',
    'Mon Code QR',
    'Ma Consultation'
);

-- Verify remaining modules (should be the comprehensive ones)
SELECT
    Id,
    Title,
    Audience,
    DurationMinutes,
    (SELECT COUNT(*) FROM TrainingSteps ts WHERE ts.ModuleId = tm.Id) as StepCount
FROM TrainingModules tm
ORDER BY Audience, Title;

-- Show summary
PRINT 'Old demo modules cleaned up. Comprehensive training modules remain.';
SELECT 'Total Modules Remaining: ' + CAST(COUNT(*) AS NVARCHAR(10)) FROM TrainingModules;
