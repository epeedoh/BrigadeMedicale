using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Infrastructure.Data;

namespace BrigadeMedicale.API.Controllers;

/// <summary>
/// Contrôleur pour le portail patient (endpoints protégés par token patient)
/// Accepte le header X-Patient-Token pour l'authentification
/// </summary>
[ApiController]
[Route("api/patient")]
public class PatientPortalController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PatientPortalController(ApplicationDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Récupère le profil du patient connecté
    /// Authentification: Header X-Patient-Token
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        // Récupérer le token du header
        if (!Request.Headers.TryGetValue("X-Patient-Token", out var tokenValue))
        {
            return Unauthorized(new
            {
                success = false,
                message = "Token patient manquant"
            });
        }

        string token = tokenValue.ToString();

        // Chercher le PatientToken dans la BD
        var patientToken = await _context.PatientTokens
            .FirstOrDefaultAsync(pt => pt.Token == token && !pt.IsRevoked && pt.ExpiresAt > DateTime.UtcNow);

        if (patientToken == null)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Token invalide ou expiré"
            });
        }

        // Récupérer le patient avec toutes ses informations
        var patient = await _context.Patients
            .FirstOrDefaultAsync(p => p.Id == patientToken.PatientId);

        if (patient == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Patient introuvable"
            });
        }

        // Mettre à jour LastUsedAt
        patientToken.LastUsedAt = DateTime.UtcNow;
        _context.PatientTokens.Update(patientToken);
        await _context.SaveChangesAsync();

        // Retourner le profil au format attendu
        return Ok(new
        {
            success = true,
            data = new
            {
                id = patient.Id,
                patientNumber = patient.PatientNumber,
                firstName = patient.FirstName,
                lastName = patient.LastName,
                fullName = $"{patient.FirstName} {patient.LastName}",
                dateOfBirth = patient.DateOfBirth.ToString("yyyy-MM-dd"),
                age = CalculateAge(patient.DateOfBirth),
                gender = patient.Gender,
                phoneNumber = patient.PhoneNumber,
                address = patient.Address,
                city = patient.City,
                sector = patient.Sector,
                isFromChurch = patient.IsFromChurch,
                churchSector = patient.ChurchSector,
                bloodType = patient.BloodType,
                allergies = patient.Allergies,
                chronicDiseases = patient.ChronicDiseases,
                createdAt = patient.CreatedAt.ToString("o"),
                updatedAt = patient.UpdatedAt?.ToString("o")
            }
        });
    }

    /// <summary>
    /// Calcule l'âge à partir de la date de naissance
    /// </summary>
    private static int CalculateAge(DateTime dateOfBirth)
    {
        var today = DateTime.Today;
        var age = today.Year - dateOfBirth.Year;
        if (dateOfBirth.Date > today.AddYears(-age)) age--;
        return age;
    }
}
