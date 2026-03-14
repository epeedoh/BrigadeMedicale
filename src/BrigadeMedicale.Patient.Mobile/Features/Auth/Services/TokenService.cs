using System.Security.Cryptography;
using BrigadeMedicale.Patient.Mobile.Core.Http;
using BrigadeMedicale.Patient.Mobile.Core.Models;
using BrigadeMedicale.Patient.Mobile.Core.Storage;

namespace BrigadeMedicale.Patient.Mobile.Features.Auth.Services;

/// <summary>
/// Service de gestion des tokens patient (authentification)
/// </summary>
public interface ITokenService
{
    Task<bool> RegisterPatientAsync(CreatePatientDto patient);
    Task<bool> LoginByPhoneAsync(string patientNumber, string phoneNumber);
    Task<bool> LoginByTokenAsync(string token);
    Task<bool> IsAuthenticatedAsync();
    Task<string?> GetTokenAsync();
    Task<string?> GetPatientNumberAsync();
    Task<string?> GetQrCodeAsync();
    Task LogoutAsync();
    string GenerateDevToken();
    string GenerateDevPatientNumber();
}

public class TokenService : ITokenService
{
    private readonly IApiClient _apiClient;
    private readonly ITokenStorage _tokenStorage;

    public TokenService(IApiClient apiClient, ITokenStorage tokenStorage)
    {
        _apiClient = apiClient;
        _tokenStorage = tokenStorage;
    }

    /// <summary>
    /// Enregistre un nouveau patient
    /// </summary>
    public async Task<bool> RegisterPatientAsync(CreatePatientDto patient)
    {
        var response = await _apiClient.PostAsync<RegisterResponseDto>("/public/patients/register", patient);

        if (response.Success && response.Data != null)
        {
            await _tokenStorage.SetTokenAsync(response.Data.AccessToken);
            await _tokenStorage.SetPatientNumberAsync(response.Data.PatientNumber);
            await _tokenStorage.SetQrCodeAsync(response.Data.QrCodeDataUrl);
            return true;
        }

        return false;
    }

    /// <summary>
    /// Se connecte avec le numéro patient et le téléphone
    /// </summary>
    public async Task<bool> LoginByPhoneAsync(string patientNumber, string phoneNumber)
    {
        var dto = new PatientLoginByPhoneDto
        {
            PatientNumber = patientNumber,
            PhoneNumber = phoneNumber
        };

        var response = await _apiClient.PostAsync<RegisterResponseDto>("/public/patients/login-phone", dto);

        if (response.Success && response.Data != null)
        {
            await _tokenStorage.SetTokenAsync(response.Data.AccessToken);
            await _tokenStorage.SetPatientNumberAsync(response.Data.PatientNumber);
            await _tokenStorage.SetQrCodeAsync(response.Data.QrCodeDataUrl);
            return true;
        }

        return false;
    }

    /// <summary>
    /// Se connecte avec un token patient
    /// </summary>
    public async Task<bool> LoginByTokenAsync(string token)
    {
        var dto = new PatientLoginByTokenDto { Token = token };
        var response = await _apiClient.PostAsync<RegisterResponseDto>("/public/patients/login", dto);

        if (response.Success && response.Data != null)
        {
            await _tokenStorage.SetTokenAsync(response.Data.AccessToken);
            await _tokenStorage.SetPatientNumberAsync(response.Data.PatientNumber);
            await _tokenStorage.SetQrCodeAsync(response.Data.QrCodeDataUrl);
            return true;
        }

        return false;
    }

    /// <summary>
    /// Vérifie si le patient est authentifié
    /// </summary>
    public async Task<bool> IsAuthenticatedAsync()
    {
        var token = await _tokenStorage.GetTokenAsync();
        return !string.IsNullOrEmpty(token);
    }

    /// <summary>
    /// Récupère le token actuel
    /// </summary>
    public async Task<string?> GetTokenAsync()
    {
        return await _tokenStorage.GetTokenAsync();
    }

    /// <summary>
    /// Récupère le numéro patient
    /// </summary>
    public async Task<string?> GetPatientNumberAsync()
    {
        return await _tokenStorage.GetPatientNumberAsync();
    }

    /// <summary>
    /// Récupère le code QR
    /// </summary>
    public async Task<string?> GetQrCodeAsync()
    {
        return await _tokenStorage.GetQrCodeAsync();
    }

    /// <summary>
    /// Déconnecte le patient
    /// </summary>
    public async Task LogoutAsync()
    {
        await _tokenStorage.ClearAllAsync();
    }

    /// <summary>
    /// Génère un token de développement (mode mock)
    /// </summary>
    public string GenerateDevToken()
    {
        var tokenBytes = new byte[32];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(tokenBytes);
        return Convert.ToBase64String(tokenBytes).Replace("+", "-").Replace("/", "_").TrimEnd('=');
    }

    /// <summary>
    /// Génère un numéro patient de développement (mode mock)
    /// </summary>
    public string GenerateDevPatientNumber()
    {
        var year = DateTime.Now.Year;
        var random = new Random();
        var number = random.Next(1, 99999).ToString().PadLeft(5, '0');
        return $"BM-{year}-{number}";
    }
}
