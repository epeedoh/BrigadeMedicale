using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BrigadeMedicale.Application.DTOs.Triage;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Domain.Enums;
using System.Security.Claims;

namespace BrigadeMedicale.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN,INFIRMIER")]
public class TriageController : ControllerBase
{
    private readonly ITriageService _triageService;

    public TriageController(ITriageService triageService)
    {
        _triageService = triageService;
    }

    /// <summary>
    /// Créer un nouveau triage (prise de constantes)
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "ADMIN,INFIRMIER")]
    public async Task<IActionResult> Create([FromBody] CreateTriageDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var infirmierId))
        {
            return BadRequest(new { success = false, message = "User ID not found in token" });
        }

        var result = await _triageService.CreateTriageAsync(dto, infirmierId);

        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            new { success = true, data = result, message = "Triage créé avec succès" });
    }

    /// <summary>
    /// Récupérer un triage par ID
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _triageService.GetByIdAsync(id);
        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Mettre à jour un triage
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN,INFIRMIER")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateTriageDto dto)
    {
        var result = await _triageService.UpdateTriageAsync(id, dto);
        return Ok(new { success = true, data = result, message = "Triage mis à jour" });
    }

    /// <summary>
    /// Récupérer le dernier triage d'un patient
    /// </summary>
    [HttpGet("latest")]
    [AllowAnonymous]
    public async Task<IActionResult> GetLatest([FromQuery] Guid patientId)
    {
        if (patientId == Guid.Empty)
        {
            return BadRequest(new { success = false, message = "Patient ID is required" });
        }

        var result = await _triageService.GetLatestByPatientIdAsync(patientId);
        if (result == null)
        {
            return Ok(new { success = true, data = (object?)null });
        }

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Récupérer le triage lié à une consultation
    /// </summary>
    [HttpGet("consultation/{consultationId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByConsultation(Guid consultationId)
    {
        var result = await _triageService.GetByConsultationIdAsync(consultationId);
        if (result == null)
        {
            return Ok(new { success = true, data = (object?)null });
        }

        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Récupérer les triages du jour
    /// </summary>
    [HttpGet("today")]
    [Authorize(Roles = "ADMIN,INFIRMIER")]
    public async Task<IActionResult> GetToday()
    {
        var result = await _triageService.GetTodayTriagesAsync();
        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Récupérer l'historique de triages d'un patient
    /// </summary>
    [HttpGet("patient/{patientId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPatientHistory(Guid patientId, [FromQuery] int days = 30)
    {
        var result = await _triageService.GetPatientTriagesAsync(patientId, days);
        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Récupérer les triages par statut avec pagination
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "ADMIN,INFIRMIER")]
    public async Task<IActionResult> GetByStatus(
        [FromQuery] TriageStatus status = TriageStatus.Completed,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _triageService.GetByStatusAsync(status, page, pageSize);
        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Supprimer un triage
    /// </summary>
    [HttpDelete("{id}")]
    [Authorize(Roles = "ADMIN,INFIRMIER")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _triageService.DeleteAsync(id);
        return Ok(new { success = true, message = "Triage supprimé" });
    }
}
