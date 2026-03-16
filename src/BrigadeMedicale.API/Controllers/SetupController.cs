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
    /// Fix missing LastLoginAt column
    /// </summary>
    [HttpPost("fix-column")]
    public async Task<IActionResult> FixMissingColumn()
    {
        try
        {
            Console.WriteLine("🔧 Fixing missing LastLoginAt column...");

            var connection = _context.Database.GetDbConnection();
            if (connection.State != System.Data.ConnectionState.Open)
                await connection.OpenAsync();

            using (var command = connection.CreateCommand())
            {
                command.CommandText = @"
                    ALTER TABLE ""Users""
                    ADD COLUMN IF NOT EXISTS ""LastLoginAt"" TIMESTAMP;
                ";
                await command.ExecuteNonQueryAsync();
            }

            Console.WriteLine("✅ Column fixed successfully");

            return Ok(new
            {
                success = true,
                message = "LastLoginAt column added to Users table"
            });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Fix Error: {ex.Message}");
            return BadRequest(new
            {
                success = false,
                error = ex.Message
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
