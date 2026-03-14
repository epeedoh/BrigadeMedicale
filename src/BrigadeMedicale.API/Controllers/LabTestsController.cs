using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BrigadeMedicale.Application.DTOs.LabTest;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.API.Controllers;

[ApiController]
[Route("api/staff/lab-tests")]
[Authorize]
public class LabTestsController : ControllerBase
{
    private readonly ILabTestService _labTestService;

    public LabTestsController(ILabTestService labTestService)
    {
        _labTestService = labTestService;
    }

    [HttpPost]
    [Authorize(Roles = "MEDECIN")]
    public async Task<IActionResult> Create([FromBody] CreateLabTestRequestDto dto)
    {
        var result = await _labTestService.CreateLabTestRequestAsync(dto);
        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            new { success = true, data = result, message = "Demande d'analyse créée avec succès" });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _labTestService.GetByIdAsync(id);
        return Ok(new { success = true, data = result });
    }

    [HttpPut("{id}/results")]
    [Authorize(Roles = "LABORANTIN")]
    public async Task<IActionResult> UpdateResults(Guid id, [FromBody] UpdateLabTestResultsDto dto)
    {
        var technicianId = Guid.Parse(User.FindFirst("sub")?.Value ?? Guid.Empty.ToString());
        var result = await _labTestService.UpdateResultsAsync(id, dto, technicianId);
        return Ok(new { success = true, data = result, message = "Résultats enregistrés avec succès" });
    }

    [HttpGet]
    [Authorize(Roles = "LABORANTIN,SUPERVISEUR")]
    public async Task<IActionResult> GetByStatus(
        [FromQuery] LabTestStatus status = LabTestStatus.Requested,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _labTestService.GetByStatusAsync(status, page, pageSize);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("consultation/{consultationId}")]
    public async Task<IActionResult> GetByConsultationId(Guid consultationId)
    {
        var result = await _labTestService.GetByConsultationIdAsync(consultationId);
        return Ok(new { success = true, data = result });
    }
}
