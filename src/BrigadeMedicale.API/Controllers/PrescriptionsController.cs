using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BrigadeMedicale.Application.DTOs.Prescription;
using BrigadeMedicale.Application.Interfaces;

namespace BrigadeMedicale.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PrescriptionsController : ControllerBase
{
    private readonly IPharmacyService _pharmacyService;

    public PrescriptionsController(IPharmacyService pharmacyService)
    {
        _pharmacyService = pharmacyService;
    }

    [HttpPost]
    [Authorize(Roles = "MEDECIN")]
    public async Task<IActionResult> Create([FromBody] CreatePrescriptionDto dto)
    {
        var result = await _pharmacyService.CreatePrescriptionAsync(dto);
        return Ok(new { success = true, data = result, message = "Prescription créée avec succès" });
    }

    [HttpPost("{id}/dispense")]
    [Authorize(Roles = "PHARMACIEN")]
    public async Task<IActionResult> Dispense(Guid id, [FromBody] int quantity)
    {
        var pharmacistId = Guid.Parse(User.FindFirst("sub")?.Value ?? Guid.Empty.ToString());
        var result = await _pharmacyService.DispensePrescriptionAsync(id, quantity, pharmacistId);
        return Ok(new { success = true, data = result, message = "Médicament dispensé avec succès" });
    }

    [HttpGet("pending")]
    [Authorize(Roles = "PHARMACIEN,SUPERVISEUR")]
    public async Task<IActionResult> GetPending(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _pharmacyService.GetPendingPrescriptionsAsync(page, pageSize);
        return Ok(new { success = true, data = result });
    }
}
