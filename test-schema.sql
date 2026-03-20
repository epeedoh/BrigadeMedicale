-- Test SQL to verify the table creation order works correctly
-- This mimics the exact order and structure from DatabaseInitializer.cs

-- Create Roles table
CREATE TABLE IF NOT EXISTS "Roles" (
    "Id" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    "Name" VARCHAR(50) NOT NULL UNIQUE,
    "Description" TEXT,
    "CreatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "UpdatedAt" TIMESTAMP
);

-- Create Users table
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

-- Create Patients table
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
    "IsFromChurch" BOOLEAN DEFAULT FALSE,
    "ChurchSector" VARCHAR(100),
    "RegistrationSource" VARCHAR(50) DEFAULT 'ACCUEIL',
    "CreatedBy" UUID,
    "UpdatedBy" UUID,
    "IsActive" BOOLEAN DEFAULT TRUE,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP
);

-- Create Consultations table (WITHOUT TriageRecordId FK to avoid circular dependency)
CREATE TABLE IF NOT EXISTS "Consultations" (
    "Id" UUID PRIMARY KEY,
    "PatientId" UUID NOT NULL,
    "TriageRecordId" UUID,
    "DoctorId" UUID,
    "ChiefComplaint" TEXT,
    "History" TEXT,
    "PhysicalExam" TEXT,
    "VitalSigns" TEXT,
    "Diagnosis" TEXT,
    "Treatment" TEXT,
    "Notes" TEXT,
    "Status" SMALLINT DEFAULT 0,
    "ConsultationDate" TIMESTAMP,
    "ClosedAt" TIMESTAMP,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP,
    FOREIGN KEY ("PatientId") REFERENCES "Patients"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("DoctorId") REFERENCES "Users"("Id") ON DELETE SET NULL
);

-- Create TriageRecords table
CREATE TABLE IF NOT EXISTS "TriageRecords" (
    "Id" UUID PRIMARY KEY,
    "PatientId" UUID NOT NULL,
    "InfirmierId" UUID,
    "Status" SMALLINT NOT NULL DEFAULT 0,
    "Temperature" NUMERIC(5,2),
    "TemperatureCelsius" NUMERIC(5,2),
    "Pulse" SMALLINT,
    "SystolicBP" SMALLINT,
    "DiastolicBP" SMALLINT,
    "BloodPressure" VARCHAR(20),
    "SpO2" SMALLINT,
    "RespiratoryRate" SMALLINT,
    "Weight" NUMERIC(6,2),
    "Height" NUMERIC(5,2),
    "Complaint" TEXT,
    "ChiefComplaint" TEXT,
    "UrgencyLevel" SMALLINT,
    "Notes" TEXT,
    "RecordedAt" TIMESTAMP,
    "ConsultationId" UUID,
    "CreatedAt" TIMESTAMP NOT NULL,
    "UpdatedAt" TIMESTAMP,
    FOREIGN KEY ("PatientId") REFERENCES "Patients"("Id") ON DELETE CASCADE,
    FOREIGN KEY ("InfirmierId") REFERENCES "Users"("Id") ON DELETE SET NULL,
    FOREIGN KEY ("ConsultationId") REFERENCES "Consultations"("Id") ON DELETE SET NULL
);

-- Add circular FK constraint from Consultations to TriageRecords
ALTER TABLE "Consultations"
ADD CONSTRAINT "fk_consultations_triagerecords"
FOREIGN KEY ("TriageRecordId") REFERENCES "TriageRecords"("Id") ON DELETE SET NULL;

-- Cleanup
DROP TABLE IF EXISTS "TriageRecords" CASCADE;
DROP TABLE IF EXISTS "Consultations" CASCADE;
DROP TABLE IF EXISTS "Patients" CASCADE;
DROP TABLE IF EXISTS "Users" CASCADE;
DROP TABLE IF EXISTS "Roles" CASCADE;
