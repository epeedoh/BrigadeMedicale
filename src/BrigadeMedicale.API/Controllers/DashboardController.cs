using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IConsultationService _consultationService;

    public DashboardController(IConsultationService consultationService)
    {
        _consultationService = consultationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboardData()
    {
        try
        {
            // Get pending consultations
            var result = await _consultationService.GetByStatusAsync(
                ConsultationStatus.InProgress, 1, 10);

            return Ok(new
            {
                success = true,
                data = new
                {
                    pendingConsultations = result.Items?.Count() ?? 0,
                    totalPatients = 0,
                    lastUpdated = DateTime.UtcNow
                }
            });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}
