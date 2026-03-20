using Microsoft.EntityFrameworkCore;

namespace BrigadeMedicale.Infrastructure.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext context)
    {
        Console.WriteLine("🔍 Starting database initialization...");

        try
        {
            var connection = context.Database.GetDbConnection();
            Console.WriteLine($"📡 Database: {connection.Database}");
            Console.WriteLine($"📡 Connection type: {connection.GetType().Name}");

            if (connection.State != System.Data.ConnectionState.Open)
            {
                Console.WriteLine("🔗 Opening connection...");
                await connection.OpenAsync();
            }

            // Execute all SQL commands
            await ExecuteSqlAsync(connection, GetCreateTablesSql());
            Console.WriteLine("✓ Database schema created successfully");

            // Seed data
            await ExecuteSqlAsync(connection, GetSeedDataSql());
            Console.WriteLine("✓ Seed data inserted");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"✗ Database initialization error: {ex.Message}");
            Console.WriteLine($"Details: {ex}");
            throw;
        }
    }

    private static async Task ExecuteSqlAsync(System.Data.Common.DbConnection connection, string sql)
    {
        using (var command = connection.CreateCommand())
        {
            command.CommandText = sql;
            command.CommandTimeout = 30;
            try
            {
                await command.ExecuteNonQueryAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"SQL Error: {ex.Message}");
                throw;
            }
        }
    }

    private static string GetCreateTablesSql()
    {
        return @"
-- Create Roles table
CREATE TABLE IF NOT EXISTS ""Roles"" (
    ""Id"" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    ""Name"" VARCHAR(50) NOT NULL UNIQUE,
    ""Description"" TEXT,
    ""CreatedAt"" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ""UpdatedAt"" TIMESTAMP
);

-- Create Users table
CREATE TABLE IF NOT EXISTS ""Users"" (
    ""Id"" UUID PRIMARY KEY,
    ""Username"" VARCHAR(50) NOT NULL UNIQUE,
    ""Email"" VARCHAR(100) NOT NULL UNIQUE,
    ""PasswordHash"" TEXT NOT NULL,
    ""FirstName"" VARCHAR(100),
    ""LastName"" VARCHAR(100),
    ""PhoneNumber"" VARCHAR(20),
    ""Address"" TEXT,
    ""IsActive"" BOOLEAN DEFAULT TRUE,
    ""LastLoginAt"" TIMESTAMP,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    ""UpdatedAt"" TIMESTAMP
);

-- Create UserRoles table
CREATE TABLE IF NOT EXISTS ""UserRoles"" (
    ""UserId"" UUID NOT NULL,
    ""RoleId"" INTEGER NOT NULL,
    PRIMARY KEY (""UserId"", ""RoleId""),
    FOREIGN KEY (""UserId"") REFERENCES ""Users""(""Id"") ON DELETE CASCADE,
    FOREIGN KEY (""RoleId"") REFERENCES ""Roles""(""Id"") ON DELETE CASCADE
);

-- Create RefreshTokens table
CREATE TABLE IF NOT EXISTS ""RefreshTokens"" (
    ""Id"" UUID PRIMARY KEY,
    ""UserId"" UUID NOT NULL,
    ""Token"" TEXT NOT NULL,
    ""ExpiresAt"" TIMESTAMP NOT NULL,
    ""IsRevoked"" BOOLEAN DEFAULT FALSE,
    ""RevokedAt"" TIMESTAMP,
    ""RevokedReason"" TEXT,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    ""UpdatedAt"" TIMESTAMP,
    FOREIGN KEY (""UserId"") REFERENCES ""Users""(""Id"") ON DELETE CASCADE
);

-- Create Patients table
CREATE TABLE IF NOT EXISTS ""Patients"" (
    ""Id"" UUID PRIMARY KEY,
    ""PatientNumber"" VARCHAR(20) NOT NULL UNIQUE,
    ""FirstName"" VARCHAR(100) NOT NULL,
    ""LastName"" VARCHAR(100) NOT NULL,
    ""DateOfBirth"" DATE NOT NULL,
    ""Gender"" SMALLINT NOT NULL,
    ""PhoneNumber"" VARCHAR(20) NOT NULL,
    ""AlternativePhone"" VARCHAR(20),
    ""Address"" TEXT,
    ""City"" VARCHAR(50),
    ""EmergencyContact"" VARCHAR(100),
    ""EmergencyPhone"" VARCHAR(20),
    ""BloodType"" VARCHAR(10),
    ""Allergies"" TEXT,
    ""ChronicDiseases"" TEXT,
    ""Sector"" VARCHAR(50),
    ""IsFromChurch"" BOOLEAN DEFAULT FALSE,
    ""ChurchSector"" VARCHAR(100),
    ""RegistrationSource"" VARCHAR(50) DEFAULT 'ACCUEIL',
    ""CreatedBy"" UUID,
    ""UpdatedBy"" UUID,
    ""IsActive"" BOOLEAN DEFAULT TRUE,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    ""UpdatedAt"" TIMESTAMP
);

-- Create PatientTokens table
CREATE TABLE IF NOT EXISTS ""PatientTokens"" (
    ""Id"" UUID PRIMARY KEY,
    ""PatientId"" UUID NOT NULL,
    ""Token"" TEXT NOT NULL,
    ""ExpiresAt"" TIMESTAMP NOT NULL,
    ""IsRevoked"" BOOLEAN DEFAULT FALSE,
    ""RevokedAt"" TIMESTAMP,
    ""LastUsedAt"" TIMESTAMP,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    ""UpdatedAt"" TIMESTAMP,
    FOREIGN KEY (""PatientId"") REFERENCES ""Patients""(""Id"") ON DELETE CASCADE
);

-- Create Consultations table
CREATE TABLE IF NOT EXISTS ""Consultations"" (
    ""Id"" UUID PRIMARY KEY,
    ""PatientId"" UUID NOT NULL,
    ""DoctorId"" UUID,
    ""ChiefComplaint"" TEXT,
    ""History"" TEXT,
    ""PhysicalExam"" TEXT,
    ""VitalSigns"" TEXT,
    ""Diagnosis"" TEXT,
    ""Treatment"" TEXT,
    ""Notes"" TEXT,
    ""Status"" SMALLINT DEFAULT 0,
    ""ConsultationDate"" TIMESTAMP,
    ""ClosedAt"" TIMESTAMP,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    ""UpdatedAt"" TIMESTAMP,
    FOREIGN KEY (""PatientId"") REFERENCES ""Patients""(""Id"") ON DELETE CASCADE,
    FOREIGN KEY (""DoctorId"") REFERENCES ""Users""(""Id"") ON DELETE SET NULL
);

-- Create TriageRecords table
CREATE TABLE IF NOT EXISTS ""TriageRecords"" (
    ""Id"" UUID PRIMARY KEY,
    ""PatientId"" UUID NOT NULL,
    ""InfirmierId"" UUID,
    ""Status"" SMALLINT NOT NULL DEFAULT 0,
    ""Temperature"" NUMERIC(5,2),
    ""TemperatureCelsius"" NUMERIC(5,2),
    ""Pulse"" SMALLINT,
    ""SystolicBP"" SMALLINT,
    ""DiastolicBP"" SMALLINT,
    ""BloodPressure"" VARCHAR(20),
    ""SpO2"" SMALLINT,
    ""RespiratoryRate"" SMALLINT,
    ""Weight"" NUMERIC(6,2),
    ""Height"" NUMERIC(5,2),
    ""Complaint"" TEXT,
    ""ChiefComplaint"" TEXT,
    ""UrgencyLevel"" SMALLINT,
    ""Notes"" TEXT,
    ""RecordedAt"" TIMESTAMP,
    ""ConsultationId"" UUID,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    ""UpdatedAt"" TIMESTAMP,
    FOREIGN KEY (""PatientId"") REFERENCES ""Patients""(""Id"") ON DELETE CASCADE,
    FOREIGN KEY (""InfirmierId"") REFERENCES ""Users""(""Id"") ON DELETE SET NULL,
    FOREIGN KEY (""ConsultationId"") REFERENCES ""Consultations""(""Id"") ON DELETE SET NULL
);

-- Create Medications table
CREATE TABLE IF NOT EXISTS ""Medications"" (
    ""Id"" UUID PRIMARY KEY,
    ""Name"" VARCHAR(200) NOT NULL,
    ""GenericName"" VARCHAR(200),
    ""Form"" VARCHAR(100),
    ""Strength"" VARCHAR(50),
    ""Unit"" VARCHAR(20),
    ""IsActive"" BOOLEAN DEFAULT TRUE,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    ""UpdatedAt"" TIMESTAMP
);

-- Create Prescriptions table
CREATE TABLE IF NOT EXISTS ""Prescriptions"" (
    ""Id"" UUID PRIMARY KEY,
    ""ConsultationId"" UUID NOT NULL,
    ""MedicationId"" UUID NOT NULL,
    ""QuantityPrescribed"" SMALLINT,
    ""QuantityDispensed"" SMALLINT,
    ""Dosage"" VARCHAR(100),
    ""Instructions"" TEXT,
    ""Frequency"" VARCHAR(100),
    ""Duration"" VARCHAR(100),
    ""Notes"" TEXT,
    ""Status"" SMALLINT DEFAULT 0,
    ""DispensedAt"" TIMESTAMP,
    ""DispensedBy"" UUID,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    ""UpdatedAt"" TIMESTAMP,
    FOREIGN KEY (""ConsultationId"") REFERENCES ""Consultations""(""Id"") ON DELETE CASCADE,
    FOREIGN KEY (""MedicationId"") REFERENCES ""Medications""(""Id"") ON DELETE RESTRICT,
    FOREIGN KEY (""DispensedBy"") REFERENCES ""Users""(""Id"") ON DELETE SET NULL
);

-- Create StockMovements table
CREATE TABLE IF NOT EXISTS ""StockMovements"" (
    ""Id"" UUID PRIMARY KEY,
    ""MedicationId"" UUID NOT NULL,
    ""MovementType"" SMALLINT NOT NULL,
    ""Quantity"" SMALLINT NOT NULL,
    ""LotNumber"" VARCHAR(100),
    ""ExpiryDate"" DATE,
    ""Reason"" TEXT,
    ""UserId"" UUID,
    ""PrescriptionId"" UUID,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    ""UpdatedAt"" TIMESTAMP,
    FOREIGN KEY (""MedicationId"") REFERENCES ""Medications""(""Id"") ON DELETE CASCADE,
    FOREIGN KEY (""UserId"") REFERENCES ""Users""(""Id"") ON DELETE SET NULL
);

-- Create LabTestRequests table
CREATE TABLE IF NOT EXISTS ""LabTestRequests"" (
    ""Id"" UUID PRIMARY KEY,
    ""ConsultationId"" UUID NOT NULL,
    ""TestName"" VARCHAR(200) NOT NULL,
    ""Instructions"" TEXT,
    ""Result"" TEXT,
    ""Results"" TEXT,
    ""Status"" SMALLINT NOT NULL DEFAULT 0,
    ""RequestedAt"" TIMESTAMP NOT NULL,
    ""CompletedAt"" TIMESTAMP,
    ""CompletedBy"" UUID,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    ""UpdatedAt"" TIMESTAMP,
    FOREIGN KEY (""ConsultationId"") REFERENCES ""Consultations""(""Id"") ON DELETE CASCADE,
    FOREIGN KEY (""CompletedBy"") REFERENCES ""Users""(""Id"") ON DELETE SET NULL
);

-- Create TrainingModules table
CREATE TABLE IF NOT EXISTS ""TrainingModules"" (
    ""Id"" UUID PRIMARY KEY,
    ""Title"" VARCHAR(200) NOT NULL,
    ""Description"" TEXT,
    ""Audience"" VARCHAR(50) NOT NULL,
    ""IsActive"" BOOLEAN DEFAULT TRUE,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    ""UpdatedAt"" TIMESTAMP
);

-- Create TrainingSteps table
CREATE TABLE IF NOT EXISTS ""TrainingSteps"" (
    ""Id"" UUID PRIMARY KEY,
    ""ModuleId"" UUID NOT NULL,
    ""Title"" VARCHAR(200) NOT NULL,
    ""Content"" TEXT,
    ""OrderIndex"" SMALLINT,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    FOREIGN KEY (""ModuleId"") REFERENCES ""TrainingModules""(""Id"") ON DELETE CASCADE
);

-- Create TrainingQuizzes table
CREATE TABLE IF NOT EXISTS ""TrainingQuizzes"" (
    ""Id"" UUID PRIMARY KEY,
    ""ModuleId"" UUID NOT NULL,
    ""Question"" TEXT NOT NULL,
    ""Options"" TEXT,
    ""CorrectAnswer"" VARCHAR(500),
    ""Explanation"" TEXT,
    ""OrderIndex"" SMALLINT,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    FOREIGN KEY (""ModuleId"") REFERENCES ""TrainingModules""(""Id"") ON DELETE CASCADE
);

-- Create TrainingProgress table
CREATE TABLE IF NOT EXISTS ""TrainingProgress"" (
    ""Id"" UUID PRIMARY KEY,
    ""UserId"" UUID NOT NULL,
    ""ModuleId"" UUID NOT NULL,
    ""Status"" VARCHAR(50),
    ""CompletionPercentage"" NUMERIC(5,2),
    ""QuizScore"" NUMERIC(5,2),
    ""StartedAt"" TIMESTAMP,
    ""CompletedAt"" TIMESTAMP,
    ""CreatedAt"" TIMESTAMP NOT NULL,
    ""UpdatedAt"" TIMESTAMP,
    UNIQUE (""UserId"", ""ModuleId""),
    FOREIGN KEY (""UserId"") REFERENCES ""Users""(""Id"") ON DELETE CASCADE,
    FOREIGN KEY (""ModuleId"") REFERENCES ""TrainingModules""(""Id"") ON DELETE CASCADE
);";
    }

    private static string GetSeedDataSql()
    {
        return @"
-- Insert roles
INSERT INTO ""Roles"" (""Name"", ""Description"") VALUES
    ('ADMIN', 'Administrateur système'),
    ('ACCUEIL', 'Agent d''accueil'),
    ('INFIRMIER', 'Infirmier'),
    ('MEDECIN', 'Médecin'),
    ('LABORANTIN', 'Technicien de laboratoire'),
    ('PHARMACIEN', 'Pharmacien'),
    ('SUPERVISEUR', 'Superviseur')
ON CONFLICT (""Name"") DO NOTHING;

-- Insert admin user
INSERT INTO ""Users"" (""Id"", ""Username"", ""Email"", ""PasswordHash"", ""FirstName"", ""LastName"", ""IsActive"", ""CreatedAt"")
VALUES ('00000000-0000-0000-0000-000000000001'::UUID, 'admin', 'admin@brigade.com',
        '$2a$11$fXEIORWwGNdft//xGOI4melViISH3./sbEi2I5fVD/LX0HtBdtq8C', 'Admin', 'Système', TRUE, CURRENT_TIMESTAMP)
ON CONFLICT (""Username"") DO NOTHING;

-- Link admin to ADMIN and INFIRMIER roles
INSERT INTO ""UserRoles"" (""UserId"", ""RoleId"")
SELECT '00000000-0000-0000-0000-000000000001'::UUID, ""Id""
FROM ""Roles""
WHERE ""Name"" IN ('ADMIN', 'INFIRMIER')
ON CONFLICT DO NOTHING;";
    }
}
