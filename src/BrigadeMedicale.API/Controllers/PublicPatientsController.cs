using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Application.Services;
using BrigadeMedicale.Application.DTOs.Patient;
using BrigadeMedicale.Application.Interfaces.Repositories;
using BrigadeMedicale.Domain.Exceptions;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Infrastructure.Data;
using System.Security.Cryptography;
using QRCoder;

namespace BrigadeMedicale.API.Controllers;

/// <summary>
/// Contrôleur public pour l'auto-enrôlement des patients (sans authentification requise)
/// </summary>
[ApiController]
[Route("api/public/patients")]
public class PublicPatientsController : ControllerBase
{
    private readonly IPatientService _patientService;
    private readonly IPatientRepository _patientRepository;
    private readonly ApplicationDbContext _context;

    public PublicPatientsController(
        IPatientService patientService,
        IPatientRepository patientRepository,
        ApplicationDbContext context)
    {
        _patientService = patientService;
        _patientRepository = patientRepository;
        _context = context;
    }

    /// <summary>
    /// Enregistrement d'un nouveau patient (auto-enrôlement)
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] CreatePatientDto dto)
    {
        try
        {
            // Créer le patient avec la source "SELF_REGISTRATION"
            var patient = await _patientService.CreatePatientAsync(dto, null, "SELF_REGISTRATION");

            // Générer un token d'accès patient simple
            var accessToken = GeneratePatientToken();

            // Sauvegarder le token dans la BD (valable 90 jours)
            var patientToken = new PatientToken
            {
                PatientId = patient.Id,
                Token = accessToken,
                ExpiresAt = DateTime.UtcNow.AddDays(90),
                IsRevoked = false
            };
            _context.PatientTokens.Add(patientToken);
            await _context.SaveChangesAsync();

            // Générer un QR code data URL (base64 SVG simple avec le numéro patient)
            var qrCodeDataUrl = GenerateQrCodeDataUrl(patient.PatientNumber);

            return Ok(new
            {
                success = true,
                data = new
                {
                    patientNumber = patient.PatientNumber,
                    accessToken = accessToken,
                    qrCodeDataUrl = qrCodeDataUrl,
                    message = "Inscription réussie ! Conservez votre numéro patient et QR code."
                }
            });
        }
        catch (DuplicateException ex)
        {
            return Conflict(new
            {
                success = false,
                message = ex.Message
            });
        }
    }

    /// <summary>
    /// Vérifier si un numéro de téléphone existe déjà
    /// </summary>
    [HttpGet("check-phone/{phone}")]
    public async Task<IActionResult> CheckPhone(string phone)
    {
        var exists = await _patientRepository.ExistsByPhoneAsync(phone);
        return Ok(new
        {
            success = true,
            data = new { exists }
        });
    }

    /// <summary>
    /// Connexion patient par token
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> LoginByToken([FromBody] PatientLoginByTokenDto dto)
    {
        // TODO: Implémenter la connexion par token
        // Pour l'instant, retourner une erreur 501
        return StatusCode(501, new
        {
            success = false,
            message = "Connexion par token non encore implémentée"
        });
    }

    /// <summary>
    /// Connexion patient par numéro patient + téléphone
    /// </summary>
    [HttpPost("login-phone")]
    public async Task<IActionResult> LoginByPhone([FromBody] PatientLoginByPhoneDto dto)
    {
        var patient = await _patientRepository.GetByPatientNumberAsync(dto.PatientNumber);

        if (patient == null)
        {
            return NotFound(new
            {
                success = false,
                message = "Patient introuvable"
            });
        }

        // Vérifier le numéro de téléphone
        if (patient.PhoneNumber != dto.PhoneNumber)
        {
            return Unauthorized(new
            {
                success = false,
                message = "Numéro de téléphone incorrect"
            });
        }

        // Générer un nouveau token
        var accessToken = GeneratePatientToken();

        // Sauvegarder le token dans la BD (valable 90 jours)
        var patientToken = new PatientToken
        {
            PatientId = patient.Id,
            Token = accessToken,
            ExpiresAt = DateTime.UtcNow.AddDays(90),
            IsRevoked = false
        };
        _context.PatientTokens.Add(patientToken);
        await _context.SaveChangesAsync();

        var qrCodeDataUrl = GenerateQrCodeDataUrl(patient.PatientNumber);

        return Ok(new
        {
            success = true,
            data = new
            {
                patientNumber = patient.PatientNumber,
                accessToken = accessToken,
                qrCodeDataUrl = qrCodeDataUrl,
                message = "Connexion réussie"
            }
        });
    }

    /// <summary>
    /// Génère un token simple pour le patient
    /// </summary>
    private static string GeneratePatientToken()
    {
        var tokenBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(tokenBytes);
        return Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }

    /// <summary>
    /// Génère un vrai QR code PNG en data URL avec QRCoder
    /// Le QR code encode le numéro patient
    /// </summary>
    private static string GenerateQrCodeDataUrl(string patientNumber)
    {
        using var qrGenerator = new QRCodeGenerator();
        var qrCodeData = qrGenerator.CreateQrCode(patientNumber, QRCodeGenerator.ECCLevel.Q);

        using var qrCode = new PngByteQRCode(qrCodeData);
        var qrCodeAsPngByteArr = qrCode.GetGraphic(10); // 10 pixels per module

        var base64 = Convert.ToBase64String(qrCodeAsPngByteArr);
        return $"data:image/png;base64,{base64}";
    }
}

// DTOs pour la connexion patient
public class PatientLoginByTokenDto
{
    public string Token { get; set; } = string.Empty;
}

public class PatientLoginByPhoneDto
{
    public string PatientNumber { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}
