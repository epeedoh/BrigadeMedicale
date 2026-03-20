using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Infrastructure.Data;

namespace BrigadeMedicale.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // No authentication required for setup
public class SetupController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public SetupController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Initialize database schema and seed data (one-time setup)
    /// Call this endpoint once after deployment to create tables and admin user
    /// </summary>
    [HttpPost("seed")]
    public async Task<IActionResult> SeedDatabase()
    {
        try
        {
            Console.WriteLine("🔍 Setup: Starting database initialization...");
            await DatabaseInitializer.InitializeAsync(_context);
            Console.WriteLine("✅ Setup: Database initialized successfully");

            return Ok(new
            {
                success = true,
                message = "Database schema created and seed data inserted",
                credentials = new
                {
                    username = "admin",
                    password = "admin123"
                }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Setup Error: {ex.Message}");
            return BadRequest(new
            {
                success = false,
                error = ex.Message,
                details = ex.StackTrace
            });
        }
    }

    /// <summary>
    /// Reset database (DROP and recreate all tables)
    /// </summary>
    [HttpPost("reset")]
    public async Task<IActionResult> ResetDatabase()
    {
        try
        {
            Console.WriteLine("🔍 Setup: Resetting database...");

            var connection = _context.Database.GetDbConnection();
            if (connection.State != System.Data.ConnectionState.Open)
                await connection.OpenAsync();

            using (var command = connection.CreateCommand())
            {
                // Drop all tables (reverse order of dependencies)
                command.CommandText = @"
                    DROP TABLE IF EXISTS ""TrainingProgress"" CASCADE;
                    DROP TABLE IF EXISTS ""TrainingQuizzes"" CASCADE;
                    DROP TABLE IF EXISTS ""TrainingSteps"" CASCADE;
                    DROP TABLE IF EXISTS ""TrainingModules"" CASCADE;
                    DROP TABLE IF EXISTS ""LabTestRequests"" CASCADE;
                    DROP TABLE IF EXISTS ""StockMovements"" CASCADE;
                    DROP TABLE IF EXISTS ""Prescriptions"" CASCADE;
                    DROP TABLE IF EXISTS ""Medications"" CASCADE;
                    DROP TABLE IF EXISTS ""Consultations"" CASCADE;
                    DROP TABLE IF EXISTS ""TriageRecords"" CASCADE;
                    DROP TABLE IF EXISTS ""PatientTokens"" CASCADE;
                    DROP TABLE IF EXISTS ""Patients"" CASCADE;
                    DROP TABLE IF EXISTS ""RefreshTokens"" CASCADE;
                    DROP TABLE IF EXISTS ""UserRoles"" CASCADE;
                    DROP TABLE IF EXISTS ""Users"" CASCADE;
                    DROP TABLE IF EXISTS ""Roles"" CASCADE;
                ";
                await command.ExecuteNonQueryAsync();
            }

            // Reinitialize
            await DatabaseInitializer.InitializeAsync(_context);
            Console.WriteLine("✅ Setup: Database reset successfully");

            return Ok(new
            {
                success = true,
                message = "Database reset and reinitialized",
                credentials = new
                {
                    username = "admin",
                    password = "admin123"
                }
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Reset Error: {ex.Message}");
            return BadRequest(new
            {
                success = false,
                error = ex.Message,
                details = ex.StackTrace
            });
        }
    }

    /// <summary>
    /// Comprehensive fix: Add all missing columns to all tables based on entity definitions
    /// </summary>
    [HttpPost("fix-columns")]
    public async Task<IActionResult> FixMissingColumns()
    {
        try
        {
            Console.WriteLine("🔧 Adding all missing columns to match entity definitions...");

            var connection = _context.Database.GetDbConnection();
            if (connection.State != System.Data.ConnectionState.Open)
                await connection.OpenAsync();

            using (var command = connection.CreateCommand())
            {
                command.CommandText = @"
                    -- Users table
                    ALTER TABLE ""Users"" ADD COLUMN IF NOT EXISTS ""Address"" TEXT;

                    -- Patients table
                    ALTER TABLE ""Patients"" ADD COLUMN IF NOT EXISTS ""IsFromChurch"" BOOLEAN DEFAULT FALSE;
                    ALTER TABLE ""Patients"" ADD COLUMN IF NOT EXISTS ""ChurchSector"" VARCHAR(100);
                    ALTER TABLE ""Patients"" ADD COLUMN IF NOT EXISTS ""RegistrationSource"" VARCHAR(50) DEFAULT 'ACCUEIL';
                    ALTER TABLE ""Patients"" ADD COLUMN IF NOT EXISTS ""CreatedBy"" UUID;
                    ALTER TABLE ""Patients"" ADD COLUMN IF NOT EXISTS ""UpdatedBy"" UUID;

                    -- PatientTokens table
                    ALTER TABLE ""PatientTokens"" ADD COLUMN IF NOT EXISTS ""IsRevoked"" BOOLEAN DEFAULT FALSE;
                    ALTER TABLE ""PatientTokens"" ADD COLUMN IF NOT EXISTS ""LastUsedAt"" TIMESTAMP;
                    ALTER TABLE ""PatientTokens"" ADD COLUMN IF NOT EXISTS ""UpdatedAt"" TIMESTAMP;

                    -- TriageRecords table
                    ALTER TABLE ""TriageRecords"" ADD COLUMN IF NOT EXISTS ""InfirmierId"" UUID;
                    ALTER TABLE ""TriageRecords"" ADD COLUMN IF NOT EXISTS ""Pulse"" SMALLINT;
                    ALTER TABLE ""TriageRecords"" ADD COLUMN IF NOT EXISTS ""SystolicBP"" SMALLINT;
                    ALTER TABLE ""TriageRecords"" ADD COLUMN IF NOT EXISTS ""DiastolicBP"" SMALLINT;
                    ALTER TABLE ""TriageRecords"" ADD COLUMN IF NOT EXISTS ""SpO2"" SMALLINT;
                    ALTER TABLE ""TriageRecords"" ADD COLUMN IF NOT EXISTS ""Complaint"" TEXT;
                    ALTER TABLE ""TriageRecords"" ADD COLUMN IF NOT EXISTS ""UrgencyLevel"" SMALLINT;
                    ALTER TABLE ""TriageRecords"" ADD COLUMN IF NOT EXISTS ""Notes"" TEXT;
                    ALTER TABLE ""TriageRecords"" ADD COLUMN IF NOT EXISTS ""RecordedAt"" TIMESTAMP;
                    ALTER TABLE ""TriageRecords"" ADD COLUMN IF NOT EXISTS ""ConsultationId"" UUID;

                    -- Consultations table
                    ALTER TABLE ""Consultations"" ADD COLUMN IF NOT EXISTS ""PatientId"" UUID;
                    ALTER TABLE ""Consultations"" ADD COLUMN IF NOT EXISTS ""ChiefComplaint"" TEXT;
                    ALTER TABLE ""Consultations"" ADD COLUMN IF NOT EXISTS ""History"" TEXT;
                    ALTER TABLE ""Consultations"" ADD COLUMN IF NOT EXISTS ""PhysicalExam"" TEXT;
                    ALTER TABLE ""Consultations"" ADD COLUMN IF NOT EXISTS ""VitalSigns"" TEXT;
                    ALTER TABLE ""Consultations"" ADD COLUMN IF NOT EXISTS ""Treatment"" TEXT;
                    ALTER TABLE ""Consultations"" ADD COLUMN IF NOT EXISTS ""Status"" SMALLINT DEFAULT 0;
                    ALTER TABLE ""Consultations"" ADD COLUMN IF NOT EXISTS ""ConsultationDate"" TIMESTAMP;
                    ALTER TABLE ""Consultations"" ADD COLUMN IF NOT EXISTS ""ClosedAt"" TIMESTAMP;

                    -- Prescriptions table
                    ALTER TABLE ""Prescriptions"" ADD COLUMN IF NOT EXISTS ""QuantityPrescribed"" SMALLINT;
                    ALTER TABLE ""Prescriptions"" ADD COLUMN IF NOT EXISTS ""QuantityDispensed"" SMALLINT;
                    ALTER TABLE ""Prescriptions"" ADD COLUMN IF NOT EXISTS ""Instructions"" TEXT;
                    ALTER TABLE ""Prescriptions"" ADD COLUMN IF NOT EXISTS ""Status"" SMALLINT DEFAULT 0;
                    ALTER TABLE ""Prescriptions"" ADD COLUMN IF NOT EXISTS ""DispensedAt"" TIMESTAMP;
                    ALTER TABLE ""Prescriptions"" ADD COLUMN IF NOT EXISTS ""DispensedBy"" UUID;

                    -- StockMovements table
                    ALTER TABLE ""StockMovements"" ADD COLUMN IF NOT EXISTS ""LotNumber"" VARCHAR(100);
                    ALTER TABLE ""StockMovements"" ADD COLUMN IF NOT EXISTS ""ExpiryDate"" DATE;
                    ALTER TABLE ""StockMovements"" ADD COLUMN IF NOT EXISTS ""Reason"" TEXT;
                    ALTER TABLE ""StockMovements"" ADD COLUMN IF NOT EXISTS ""UserId"" UUID;
                    ALTER TABLE ""StockMovements"" ADD COLUMN IF NOT EXISTS ""PrescriptionId"" UUID;
                    ALTER TABLE ""StockMovements"" ADD COLUMN IF NOT EXISTS ""UpdatedAt"" TIMESTAMP;

                    -- LabTestRequests table
                    ALTER TABLE ""LabTestRequests"" ADD COLUMN IF NOT EXISTS ""Instructions"" TEXT;
                    ALTER TABLE ""LabTestRequests"" ADD COLUMN IF NOT EXISTS ""Results"" TEXT;
                    ALTER TABLE ""LabTestRequests"" ADD COLUMN IF NOT EXISTS ""CompletedBy"" UUID;

                    -- RefreshTokens table
                    ALTER TABLE ""RefreshTokens"" ADD COLUMN IF NOT EXISTS ""IsRevoked"" BOOLEAN DEFAULT FALSE;
                    ALTER TABLE ""RefreshTokens"" ADD COLUMN IF NOT EXISTS ""RevokedReason"" TEXT;
                    ALTER TABLE ""RefreshTokens"" ADD COLUMN IF NOT EXISTS ""UpdatedAt"" TIMESTAMP;
                ";
                await command.ExecuteNonQueryAsync();
            }

            Console.WriteLine("✅ All missing columns added successfully!");

            return Ok(new
            {
                success = true,
                message = "All missing columns added to all tables. Application should now work without column errors."
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Fix Error: {ex.Message}");
            return BadRequest(new
            {
                success = false,
                error = ex.Message,
                hint = "Some columns may have already existed or there may be constraint issues. Check the database manually."
            });
        }
    }

    /// <summary>
    /// Health check endpoint
    /// </summary>
    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "API is running", timestamp = DateTime.UtcNow });
    }
}
