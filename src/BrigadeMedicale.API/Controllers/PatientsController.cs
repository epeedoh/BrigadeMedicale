using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BrigadeMedicale.Application.Services;
using BrigadeMedicale.Application.DTOs.Patient;

namespace BrigadeMedicale.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PatientsController : ControllerBase
{
    private readonly IPatientService _patientService;

    public PatientsController(IPatientService patientService)
    {
        _patientService = patientService;
    }

    [HttpGet]
    public async Task<IActionResult> Search(
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var (items, totalCount) = await _patientService.SearchPatientsAsync(search, page, pageSize);

        return Ok(new
        {
            success = true,
            data = new
            {
                items = items,
                pagination = new
                {
                    currentPage = page,
                    pageSize = pageSize,
                    totalItems = totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                    hasNextPage = page * pageSize < totalCount,
                    hasPreviousPage = page > 1
                }
            }
        });
    }

    /// <summary>
    /// Endpoint de recherche rapide pour autocomplete
    /// Accepte le paramètre "query" pour chercher par Nom, Numéro ou Téléphone
    /// </summary>
    [HttpGet("search")]
    public async Task<IActionResult> SearchByQuery([FromQuery] string? query)
    {
        var (items, _) = await _patientService.SearchPatientsAsync(query, 1, 50);

        return Ok(new
        {
            success = true,
            data = items
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var result = await _patientService.GetByIdAsync(id);
        return Ok(new { success = true, data = result });
    }

    /// <summary>
    /// Obtient un patient par son numéro (ex: BM-2026-00002)
    /// Utilisé par le scanner QR code du formulaire de triage
    /// </summary>
    [HttpGet("by-number/{patientNumber}")]
    public async Task<IActionResult> GetByPatientNumber(string patientNumber)
    {
        var result = await _patientService.GetByPatientNumberAsync(patientNumber);

        if (result == null)
        {
            return NotFound(new { success = false, message = "Patient introuvable" });
        }

        return Ok(new { success = true, data = result });
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePatientDto dto)
    {
        var result = await _patientService.CreatePatientAsync(dto, null, "ACCUEIL");

        return CreatedAtAction(nameof(GetById), new { id = result.Id },
            new { success = true, data = result, message = "Patient créé avec succès" });
    }
}
