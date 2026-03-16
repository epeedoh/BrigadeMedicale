-- Brigade Médicale - PostgreSQL Schema Creation
-- Run this script directly in your PostgreSQL database on Render

-- 1. Create Roles table
CREATE TABLE IF NOT EXISTS "Roles" (
    "Id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "Name" VARCHAR(50) NOT NULL UNIQUE,
    "Description" TEXT,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP
);

-- 2. Create Users table
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" UUID PRIMARY KEY,
    "Username" VARCHAR(50) NOT NULL UNIQUE,
    "Email" VARCHAR(100) NOT NULL UNIQUE,
    "PasswordHash" TEXT NOT NULL,
    "FirstName" VARCHAR(100),
    "LastName" VARCHAR(100),
    "PhoneNumber" VARCHAR(20),
    "Address" TEXT,
    "IsActive" BOOLEAN DEFAULT TRUE,
    "LastLoginAt" TIMESTAMP,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP
);

-- 3. Create UserRoles table (junction)
CREATE TABLE IF NOT EXISTS "UserRoles" (
    "UserId" UUID NOT NULL,
    "RoleId" INTEGER NOT NULL,
    PRIMARY KEY ("UserId", "RoleId"),
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("RoleId") REFERENCES "Roles"("Id") ON DELETE CASCADE
);

-- 4. Create RefreshTokens table
CREATE TABLE IF NOT EXISTS "RefreshTokens" (
    "Id" UUID PRIMARY KEY,
    "UserId" UUID NOT NULL,
    "Token" TEXT NOT NULL,
    "ExpiresAt" TIMESTAMP NOT NULL,
    "IsRevoked" BOOLEAN DEFAULT FALSE,
    "RevokedAt" TIMESTAMP,
    "RevokedReason" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP,
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE
);

-- 5. Create Patients table
CREATE TABLE IF NOT EXISTS "Patients" (
    "Id" UUID PRIMARY KEY,
    "PatientNumber" VARCHAR(20) NOT NULL UNIQUE,
    "FirstName" VARCHAR(100) NOT NULL,
    "LastName" VARCHAR(100) NOT NULL,
    "DateOfBirth" DATE NOT NULL,
    "Gender" SMALLINT NOT NULL,
    "PhoneNumber" VARCHAR(20) NOT NULL,
    "AlternativePhone" VARCHAR(20),
    "Address" TEXT,
    "City" VARCHAR(50),
    "EmergencyContact" VARCHAR(100),
    "EmergencyPhone" VARCHAR(20),
    "BloodType" VARCHAR(10),
    "Allergies" TEXT,
    "ChronicDiseases" TEXT,
    "Sector" VARCHAR(50),
    "IsActive" BOOLEAN DEFAULT TRUE,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP
);

-- 6. Create PatientTokens table
CREATE TABLE IF NOT EXISTS "PatientTokens" (
    "Id" UUID PRIMARY KEY,
    "PatientId" UUID NOT NULL,
    "Token" TEXT NOT NULL,
    "ExpiresAt" TIMESTAMP NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL,
    "RevokedAt" TIMESTAMP,
    FOREIGN KEY ("PatientId") REFERENCES "Patients"("Id") ON DELETE CASCADE
);

-- 7. Create TriageRecords table
CREATE TABLE IF NOT EXISTS "TriageRecords" (
    "Id" UUID PRIMARY KEY,
    "PatientId" UUID NOT NULL,
    "Status" SMALLINT NOT NULL DEFAULT 0,
    "TemperatureCelsius" NUMERIC(5,2),
    "BloodPressure" VARCHAR(20),
    "HeartRate" SMALLINT,
    "RespiratoryRate" SMALLINT,
    "Weight" NUMERIC(6,2),
    "Height" NUMERIC(5,2),
    "ChiefComplaint" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP,
    FOREIGN KEY ("PatientId") REFERENCES "Patients"("Id") ON DELETE CASCADE
);

-- 8. Create Consultations table
CREATE TABLE IF NOT EXISTS "Consultations" (
    "Id" UUID PRIMARY KEY,
    "TriageRecordId" UUID NOT NULL,
    "DoctorId" UUID,
    "Diagnosis" TEXT,
    "Notes" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP,
    FOREIGN KEY ("TriageRecordId") REFERENCES "TriageRecords"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("DoctorId") REFERENCES "Users"("Id")
);

-- 9. Create Medications table
CREATE TABLE IF NOT EXISTS "Medications" (
    "Id" UUID PRIMARY KEY,
    "Name" VARCHAR(200) NOT NULL,
    "GenericName" VARCHAR(200),
    "Form" VARCHAR(100),
    "Strength" VARCHAR(50),
    "Unit" VARCHAR(20),
    "IsActive" BOOLEAN DEFAULT TRUE,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP
);

-- 10. Create Prescriptions table
CREATE TABLE IF NOT EXISTS "Prescriptions" (
    "Id" UUID PRIMARY KEY,
    "ConsultationId" UUID NOT NULL,
    "MedicationId" UUID NOT NULL,
    "Dosage" VARCHAR(100),
    "Frequency" VARCHAR(100),
    "Duration" VARCHAR(100),
    "Notes" TEXT,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP,
    FOREIGN KEY ("ConsultationId") REFERENCES "Consultations"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("MedicationId") REFERENCES "Medications"("Id")
);

-- 11. Create StockMovements table
CREATE TABLE IF NOT EXISTS "StockMovements" (
    "Id" UUID PRIMARY KEY,
    "MedicationId" UUID NOT NULL,
    "MovementType" SMALLINT NOT NULL,
    "Quantity" SMALLINT NOT NULL,
    "CreatedAt" TIMESTAMP NOT NULL,
    FOREIGN KEY ("MedicationId") REFERENCES "Medications"("Id") ON DELETE CASCADE
);

-- 12. Create LabTestRequests table
CREATE TABLE IF NOT EXISTS "LabTestRequests" (
    "Id" UUID PRIMARY KEY,
    "ConsultationId" UUID NOT NULL,
    "TestName" VARCHAR(200) NOT NULL,
    "Result" TEXT,
    "Status" SMALLINT NOT NULL DEFAULT 0,
    "RequestedAt" TIMESTAMP NOT NULL,
    "CompletedAt" TIMESTAMP,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP,
    FOREIGN KEY ("ConsultationId") REFERENCES "Consultations"("Id") ON DELETE CASCADE
);

-- 13. Create TrainingModules table
CREATE TABLE IF NOT EXISTS "TrainingModules" (
    "Id" UUID PRIMARY KEY,
    "Title" VARCHAR(200) NOT NULL,
    "Description" TEXT,
    "Audience" VARCHAR(50) NOT NULL,
    "IsActive" BOOLEAN DEFAULT TRUE,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP
);

-- 14. Create TrainingSteps table
CREATE TABLE IF NOT EXISTS "TrainingSteps" (
    "Id" UUID PRIMARY KEY,
    "ModuleId" UUID NOT NULL,
    "Title" VARCHAR(200) NOT NULL,
    "Content" TEXT,
    "OrderIndex" SMALLINT,
    "CreatedAt" TIMESTAMP NOT NULL,
    FOREIGN KEY ("ModuleId") REFERENCES "TrainingModules"("Id") ON DELETE CASCADE
);

-- 15. Create TrainingQuizzes table
CREATE TABLE IF NOT EXISTS "TrainingQuizzes" (
    "Id" UUID PRIMARY KEY,
    "ModuleId" UUID NOT NULL,
    "Question" TEXT NOT NULL,
    "Options" TEXT,
    "CorrectAnswer" VARCHAR(500),
    "Explanation" TEXT,
    "OrderIndex" SMALLINT,
    "CreatedAt" TIMESTAMP NOT NULL,
    FOREIGN KEY ("ModuleId") REFERENCES "TrainingModules"("Id") ON DELETE CASCADE
);

-- 16. Create TrainingProgress table
CREATE TABLE IF NOT EXISTS "TrainingProgress" (
    "Id" UUID PRIMARY KEY,
    "UserId" UUID NOT NULL,
    "ModuleId" UUID NOT NULL,
    "Status" VARCHAR(50),
    "CompletionPercentage" NUMERIC(5,2),
    "QuizScore" NUMERIC(5,2),
    "StartedAt" TIMESTAMP,
    "CompletedAt" TIMESTAMP,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP,
    UNIQUE ("UserId", "ModuleId"),
    FOREIGN KEY ("UserId") REFERENCES "Users"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("ModuleId") REFERENCES "TrainingModules"("Id") ON DELETE CASCADE
);

-- 17. Create indexes for common queries
CREATE INDEX IF NOT EXISTS "IX_Users_Username" ON "Users"("Username");
CREATE INDEX IF NOT EXISTS "IX_Users_Email" ON "Users"("Email");
CREATE INDEX IF NOT EXISTS "IX_Patients_PatientNumber" ON "Patients"("PatientNumber");
CREATE INDEX IF NOT EXISTS "IX_TriageRecords_PatientId" ON "TriageRecords"("PatientId");
CREATE INDEX IF NOT EXISTS "IX_Consultations_TriageRecordId" ON "Consultations"("TriageRecordId");
CREATE INDEX IF NOT EXISTS "IX_Consultations_DoctorId" ON "Consultations"("DoctorId");
CREATE INDEX IF NOT EXISTS "IX_Prescriptions_ConsultationId" ON "Prescriptions"("ConsultationId");
CREATE INDEX IF NOT EXISTS "IX_Prescriptions_MedicationId" ON "Prescriptions"("MedicationId");
CREATE INDEX IF NOT EXISTS "IX_LabTestRequests_ConsultationId" ON "LabTestRequests"("ConsultationId");
CREATE INDEX IF NOT EXISTS "IX_TrainingSteps_ModuleId" ON "TrainingSteps"("ModuleId");
CREATE INDEX IF NOT EXISTS "IX_TrainingQuizzes_ModuleId" ON "TrainingQuizzes"("ModuleId");
CREATE INDEX IF NOT EXISTS "IX_TrainingProgress_UserId" ON "TrainingProgress"("UserId");

-- 18. Insert seed data (admin user + roles)
INSERT INTO "Roles" ("Name", "Description") VALUES
    ('ADMIN', 'Administrateur système'),
    ('ACCUEIL', 'Agent d''accueil'),
    ('INFIRMIER', 'Infirmier'),
    ('MEDECIN', 'Médecin'),
    ('LABORANTIN', 'Technicien de laboratoire'),
    ('PHARMACIEN', 'Pharmacien'),
    ('SUPERVISEUR', 'Superviseur')
ON CONFLICT ("Name") DO NOTHING;

-- Insert admin user (password: admin123, hash generated with BCrypt)
INSERT INTO "Users" ("Id", "Username", "Email", "PasswordHash", "FirstName", "LastName", "IsActive", "CreatedAt")
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'admin',
    'admin@brigade.com',
    '$2a$11$fXEIORWwGNdft//xGOI4melViISH3./sbEi2I5fVD/LX0HtBdtq8C',
    'Admin',
    'Système',
    TRUE,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("Username") DO NOTHING;

-- Link admin user to ADMIN and INFIRMIER roles
INSERT INTO "UserRoles" ("UserId", "RoleId")
SELECT
    '00000000-0000-0000-0000-000000000001'::UUID,
    "Id"
FROM "Roles"
WHERE "Name" IN ('ADMIN', 'INFIRMIER')
ON CONFLICT DO NOTHING;

COMMIT;
