using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BrigadeMedicale.Application.DTOs.Consultation;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Domain.Enums;
using System.Security.Claims;

namespace BrigadeMedicale.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "ADMIN,MEDECIN,SUPERVISEUR")]
public class ConsultationsController : ControllerBase
{
    private readonly IConsultationService _consultationService;

    public ConsultationsController(IConsultationService consultationService)
    {
        _consultationService = consultationService;
    }

    [HttpPost]
    [Authorize(Roles = "ADMIN,MEDECIN")]
    public async Task<IActionResult> Create([FromBody] CreateConsultationDto dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ?? User.FindFirst("sub");
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var doctorId))
        {
            return BadRequest(new { success = false, message = "User ID not found in token" });
        }

        var result = await _consultationService.CreateConsultationAsync(dto, doctorId);

        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            new { success = true, data = result, message = "Consultation créée avec succès" });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _consultationService.GetByIdAsync(id);
        return Ok(new { success = true, data = result });
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "ADMIN,MEDECIN")]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateConsultationDto dto)
    {
        var result = await _consultationService.UpdateConsultationAsync(id, dto);
        return Ok(new { success = true, data = result, message = "Consultation mise à jour" });
    }

    [HttpPost("{id}/close")]
    [Authorize(Roles = "ADMIN,MEDECIN")]
    public async Task<IActionResult> Close(Guid id)
    {
        var result = await _consultationService.CloseConsultationAsync(id);
        return Ok(new { success = true, data = result, message = "Consultation terminée" });
    }

    [HttpGet]
    public async Task<IActionResult> GetByStatus(
        [FromQuery] ConsultationStatus status = ConsultationStatus.InProgress,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _consultationService.GetByStatusAsync(status, page, pageSize);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("patient/{patientId}")]
    public async Task<IActionResult> GetPatientHistory(Guid patientId)
    {
        var result = await _consultationService.GetPatientHistoryAsync(patientId);
        return Ok(new { success = true, data = result });
    }
}
