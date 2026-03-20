using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BrigadeMedicale.Application.Interfaces;
using System.Security.Claims;

namespace BrigadeMedicale.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IPatientRepository _patientRepository;
    private readonly IConsultationService _consultationService;
    private readonly ITriageRepository _triageRepository;

    public DashboardController(
        IPatientRepository patientRepository,
        IConsultationService consultationService,
        ITriageRepository triageRepository)
    {
        _patientRepository = patientRepository;
        _consultationService = consultationService;
        _triageRepository = triageRepository;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboardData()
    {
        try
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
            var userId = userIdClaim?.Value;

            // Get counts for dashboard
            var totalPatients = await _patientRepository.GetCountAsync();
            var recentConsultations = await _consultationService.GetByStatusAsync(
                BrigadeMedicale.Domain.Enums.ConsultationStatus.InProgress, 1, 10);
            var recentTriages = await _triageRepository.GetRecentAsync(10);

            return Ok(new
            {
                success = true,
                data = new
                {
                    totalPatients = totalPatients,
                    pendingConsultations = recentConsultations?.Count() ?? 0,
                    recentTriages = recentTriages?.Count() ?? 0,
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
