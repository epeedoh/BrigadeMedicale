using Microsoft.EntityFrameworkCore;
using Npgsql;

namespace BrigadeMedicale.Infrastructure.Data;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(ApplicationDbContext context)
    {
        try
        {
            // Try to create database schema from DbContext
            await context.Database.EnsureDeletedAsync();
            await context.Database.EnsureCreatedAsync();

            // Seed data directly
            await SeedDataAsync(context);

            Console.WriteLine("✓ Database schema created successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"EnsureCreatedAsync failed: {ex.Message}");
            Console.WriteLine("Attempting raw SQL initialization...");

            try
            {
                await InitializeWithRawSqlAsync(context);
            }
            catch (Exception sqlEx)
            {
                Console.WriteLine($"✗ Database initialization error: {sqlEx.Message}");
                throw;
            }
        }
    }

    private static async Task InitializeWithRawSqlAsync(ApplicationDbContext context)
    {
        var connection = context.Database.GetDbConnection();

        if (connection.State != System.Data.ConnectionState.Open)
            await connection.OpenAsync();

        using (var command = connection.CreateCommand())
        {
            // Create Roles table
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""Roles"" (
                    ""Id"" INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
                    ""Name"" VARCHAR(50) NOT NULL UNIQUE,
                    ""Description"" TEXT,
                    ""CreatedAt"" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    ""UpdatedAt"" TIMESTAMP
                );";
            await command.ExecuteNonQueryAsync();

            // Create Users table
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""Users"" (
                    ""Id"" UUID PRIMARY KEY,
                    ""Username"" VARCHAR(50) NOT NULL UNIQUE,
                    ""Email"" VARCHAR(100) NOT NULL UNIQUE,
                    ""PasswordHash"" TEXT NOT NULL,
                    ""FirstName"" VARCHAR(100),
                    ""LastName"" VARCHAR(100),
                    ""IsActive"" BOOLEAN DEFAULT TRUE,
                    ""CreatedAt"" TIMESTAMP NOT NULL,
                    ""UpdatedAt"" TIMESTAMP
                );";
            await command.ExecuteNonQueryAsync();

            // Create UserRoles table
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""UserRoles"" (
                    ""UserId"" UUID NOT NULL,
                    ""RoleId"" INTEGER NOT NULL,
                    PRIMARY KEY (""UserId"", ""RoleId""),
                    FOREIGN KEY (""UserId"") REFERENCES ""Users""(""Id"") ON DELETE CASCADE,
                    FOREIGN KEY (""RoleId"") REFERENCES ""Roles""(""Id"") ON DELETE CASCADE
                );";
            await command.ExecuteNonQueryAsync();

            // Create RefreshTokens table
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""RefreshTokens"" (
                    ""Id"" UUID PRIMARY KEY,
                    ""UserId"" UUID NOT NULL,
                    ""Token"" TEXT NOT NULL,
                    ""ExpiresAt"" TIMESTAMP NOT NULL,
                    ""CreatedAt"" TIMESTAMP NOT NULL,
                    ""RevokedAt"" TIMESTAMP,
                    FOREIGN KEY (""UserId"") REFERENCES ""Users""(""Id"") ON DELETE CASCADE
                );";
            await command.ExecuteNonQueryAsync();

            // Create Patients table
            command.CommandText = @"
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
                    ""IsActive"" BOOLEAN DEFAULT TRUE,
                    ""CreatedAt"" TIMESTAMP NOT NULL,
                    ""UpdatedAt"" TIMESTAMP
                );";
            await command.ExecuteNonQueryAsync();

            // Create PatientTokens table
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""PatientTokens"" (
                    ""Id"" UUID PRIMARY KEY,
                    ""PatientId"" UUID NOT NULL,
                    ""Token"" TEXT NOT NULL,
                    ""ExpiresAt"" TIMESTAMP NOT NULL,
                    ""CreatedAt"" TIMESTAMP NOT NULL,
                    ""RevokedAt"" TIMESTAMP,
                    FOREIGN KEY (""PatientId"") REFERENCES ""Patients""(""Id"") ON DELETE CASCADE
                );";
            await command.ExecuteNonQueryAsync();

            // Create TriageRecords table
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""TriageRecords"" (
                    ""Id"" UUID PRIMARY KEY,
                    ""PatientId"" UUID NOT NULL,
                    ""Status"" SMALLINT NOT NULL DEFAULT 0,
                    ""TemperatureCelsius"" NUMERIC(5,2),
                    ""BloodPressure"" VARCHAR(20),
                    ""HeartRate"" SMALLINT,
                    ""RespiratoryRate"" SMALLINT,
                    ""Weight"" NUMERIC(6,2),
                    ""Height"" NUMERIC(5,2),
                    ""ChiefComplaint"" TEXT,
                    ""CreatedAt"" TIMESTAMP NOT NULL,
                    ""UpdatedAt"" TIMESTAMP,
                    FOREIGN KEY (""PatientId"") REFERENCES ""Patients""(""Id"") ON DELETE CASCADE
                );";
            await command.ExecuteNonQueryAsync();

            // Create Consultations table
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""Consultations"" (
                    ""Id"" UUID PRIMARY KEY,
                    ""TriageRecordId"" UUID NOT NULL,
                    ""DoctorId"" UUID,
                    ""Diagnosis"" TEXT,
                    ""Notes"" TEXT,
                    ""CreatedAt"" TIMESTAMP NOT NULL,
                    ""UpdatedAt"" TIMESTAMP,
                    FOREIGN KEY (""TriageRecordId"") REFERENCES ""TriageRecords""(""Id"") ON DELETE CASCADE,
                    FOREIGN KEY (""DoctorId"") REFERENCES ""Users""(""Id"")
                );";
            await command.ExecuteNonQueryAsync();

            // Create Medications table
            command.CommandText = @"
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
                );";
            await command.ExecuteNonQueryAsync();

            // Create Prescriptions table
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""Prescriptions"" (
                    ""Id"" UUID PRIMARY KEY,
                    ""ConsultationId"" UUID NOT NULL,
                    ""MedicationId"" UUID NOT NULL,
                    ""Dosage"" VARCHAR(100),
                    ""Frequency"" VARCHAR(100),
                    ""Duration"" VARCHAR(100),
                    ""Notes"" TEXT,
                    ""CreatedAt"" TIMESTAMP NOT NULL,
                    ""UpdatedAt"" TIMESTAMP,
                    FOREIGN KEY (""ConsultationId"") REFERENCES ""Consultations""(""Id"") ON DELETE CASCADE,
                    FOREIGN KEY (""MedicationId"") REFERENCES ""Medications""(""Id"")
                );";
            await command.ExecuteNonQueryAsync();

            // Create StockMovements table
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""StockMovements"" (
                    ""Id"" UUID PRIMARY KEY,
                    ""MedicationId"" UUID NOT NULL,
                    ""MovementType"" SMALLINT NOT NULL,
                    ""Quantity"" SMALLINT NOT NULL,
                    ""CreatedAt"" TIMESTAMP NOT NULL,
                    FOREIGN KEY (""MedicationId"") REFERENCES ""Medications""(""Id"") ON DELETE CASCADE
                );";
            await command.ExecuteNonQueryAsync();

            // Create LabTestRequests table
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""LabTestRequests"" (
                    ""Id"" UUID PRIMARY KEY,
                    ""ConsultationId"" UUID NOT NULL,
                    ""TestName"" VARCHAR(200) NOT NULL,
                    ""Result"" TEXT,
                    ""Status"" SMALLINT NOT NULL DEFAULT 0,
                    ""RequestedAt"" TIMESTAMP NOT NULL,
                    ""CompletedAt"" TIMESTAMP,
                    ""CreatedAt"" TIMESTAMP NOT NULL,
                    ""UpdatedAt"" TIMESTAMP,
                    FOREIGN KEY (""ConsultationId"") REFERENCES ""Consultations""(""Id"") ON DELETE CASCADE
                );";
            await command.ExecuteNonQueryAsync();

            // Create TrainingModules table
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""TrainingModules"" (
                    ""Id"" UUID PRIMARY KEY,
                    ""Title"" VARCHAR(200) NOT NULL,
                    ""Description"" TEXT,
                    ""Audience"" VARCHAR(50) NOT NULL,
                    ""IsActive"" BOOLEAN DEFAULT TRUE,
                    ""CreatedAt"" TIMESTAMP NOT NULL,
                    ""UpdatedAt"" TIMESTAMP
                );";
            await command.ExecuteNonQueryAsync();

            // Create TrainingSteps table
            command.CommandText = @"
                CREATE TABLE IF NOT EXISTS ""TrainingSteps"" (
                    ""Id"" UUID PRIMARY KEY,
                    ""ModuleId"" UUID NOT NULL,
                    ""Title"" VARCHAR(200) NOT NULL,
                    ""Content"" TEXT,
                    ""OrderIndex"" SMALLINT,
                    ""CreatedAt"" TIMESTAMP NOT NULL,
                    FOREIGN KEY (""ModuleId"") REFERENCES ""TrainingModules""(""Id"") ON DELETE CASCADE
                );";
            await command.ExecuteNonQueryAsync();

            // Create TrainingQuizzes table
            command.CommandText = @"
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
                );";
            await command.ExecuteNonQueryAsync();

            // Create TrainingProgress table
            command.CommandText = @"
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
            await command.ExecuteNonQueryAsync();
        }

        await SeedDataAsync(context);
        Console.WriteLine("✓ Database schema created with raw SQL");
    }

    private static async Task SeedDataAsync(ApplicationDbContext context)
    {
        try
        {
            var connection = context.Database.GetDbConnection();

            if (connection.State != System.Data.ConnectionState.Open)
                await connection.OpenAsync();

            using (var command = connection.CreateCommand())
            {
                // Insert roles
                command.CommandText = @"
                    INSERT INTO ""Roles"" (""Name"", ""Description"") VALUES
                        ('ADMIN', 'Administrateur système'),
                        ('ACCUEIL', 'Agent d''accueil'),
                        ('INFIRMIER', 'Infirmier'),
                        ('MEDECIN', 'Médecin'),
                        ('LABORANTIN', 'Technicien de laboratoire'),
                        ('PHARMACIEN', 'Pharmacien'),
                        ('SUPERVISEUR', 'Superviseur')
                    ON CONFLICT DO NOTHING;";
                await command.ExecuteNonQueryAsync();

                // Insert admin user
                command.CommandText = @"
                    INSERT INTO ""Users"" (""Id"", ""Username"", ""Email"", ""PasswordHash"", ""FirstName"", ""LastName"", ""IsActive"", ""CreatedAt"")
                    VALUES ('00000000-0000-0000-0000-000000000001'::UUID, 'admin', 'admin@brigade.com',
                            '$2a$11$fXEIORWwGNdft//xGOI4melViISH3./sbEi2I5fVD/LX0HtBdtq8C', 'Admin', 'Système', TRUE, CURRENT_TIMESTAMP)
                    ON CONFLICT DO NOTHING;";
                await command.ExecuteNonQueryAsync();

                // Link admin to ADMIN and INFIRMIER roles
                command.CommandText = @"
                    INSERT INTO ""UserRoles"" (""UserId"", ""RoleId"")
                    SELECT '00000000-0000-0000-0000-000000000001'::UUID, ""Id""
                    FROM ""Roles""
                    WHERE ""Name"" IN ('ADMIN', 'INFIRMIER')
                    ON CONFLICT DO NOTHING;";
                await command.ExecuteNonQueryAsync();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Seed data insertion warning (non-blocking): {ex.Message}");
        }
    }
}
