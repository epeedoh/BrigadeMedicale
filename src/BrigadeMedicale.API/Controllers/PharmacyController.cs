using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BrigadeMedicale.Application.DTOs.Prescription;
using BrigadeMedicale.Application.DTOs.Medication;
using BrigadeMedicale.Application.DTOs.StockMovement;
using BrigadeMedicale.Application.Interfaces;

namespace BrigadeMedicale.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PharmacyController : ControllerBase
{
    private readonly IPharmacyService _pharmacyService;

    public PharmacyController(IPharmacyService pharmacyService)
    {
        _pharmacyService = pharmacyService;
    }

    // Prescriptions
    [HttpPost("prescriptions")]
    [Authorize(Roles = "MEDECIN")]
    public async Task<IActionResult> CreatePrescription([FromBody] CreatePrescriptionDto dto)
    {
        var result = await _pharmacyService.CreatePrescriptionAsync(dto);
        return Ok(new { success = true, data = result, message = "Prescription créée avec succès" });
    }

    [HttpPost("prescriptions/{id}/dispense")]
    [Authorize(Roles = "PHARMACIEN")]
    public async Task<IActionResult> DispensePrescription(Guid id, [FromBody] int quantity)
    {
        var pharmacistId = Guid.Parse(User.FindFirst("sub")?.Value ?? Guid.Empty.ToString());
        var result = await _pharmacyService.DispensePrescriptionAsync(id, quantity, pharmacistId);
        return Ok(new { success = true, data = result, message = "Médicament dispensé avec succès" });
    }

    [HttpGet("prescriptions/pending")]
    [Authorize(Roles = "PHARMACIEN,SUPERVISEUR")]
    public async Task<IActionResult> GetPendingPrescriptions(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _pharmacyService.GetPendingPrescriptionsAsync(page, pageSize);
        return Ok(new { success = true, data = result });
    }

    // Medications
    [HttpPost("medications")]
    [Authorize(Roles = "ADMIN,PHARMACIEN")]
    public async Task<IActionResult> CreateMedication([FromBody] CreateMedicationDto dto)
    {
        var result = await _pharmacyService.CreateMedicationAsync(dto);
        return CreatedAtAction(nameof(GetMedicationById), new { id = result.Id },
            new { success = true, data = result, message = "Médicament créé avec succès" });
    }

    [HttpGet("medications/{id}")]
    public async Task<IActionResult> GetMedicationById(Guid id)
    {
        var result = await _pharmacyService.GetMedicationByIdAsync(id);
        return Ok(new { success = true, data = result });
    }

    [HttpGet("medications")]
    public async Task<IActionResult> SearchMedications(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var result = await _pharmacyService.SearchMedicationsAsync(search, page, pageSize);
        return Ok(new { success = true, data = result });
    }

    // Stock
    [HttpPost("stock")]
    [Authorize(Roles = "ADMIN,PHARMACIEN")]
    public async Task<IActionResult> AddStockMovement([FromBody] CreateStockMovementDto dto)
    {
        var userId = Guid.Parse(User.FindFirst("sub")?.Value ?? Guid.Empty.ToString());
        await _pharmacyService.AddStockMovementAsync(dto, userId);
        return Ok(new { success = true, message = "Mouvement de stock enregistré" });
    }

    [HttpGet("stock/{medicationId}")]
    [Authorize(Roles = "PHARMACIEN,SUPERVISEUR")]
    public async Task<IActionResult> GetCurrentStock(Guid medicationId)
    {
        var stock = await _pharmacyService.GetCurrentStockAsync(medicationId);
        return Ok(new { success = true, data = new { medicationId, currentStock = stock } });
    }
}
