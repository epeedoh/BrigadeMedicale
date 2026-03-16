using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    /// Health check endpoint
    /// </summary>
    [HttpGet("health")]
    public IActionResult Health()
    {
        return Ok(new { status = "API is running", timestamp = DateTime.UtcNow });
    }
}
