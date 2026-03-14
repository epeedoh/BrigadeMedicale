using System.Diagnostics;

namespace BrigadeMedicale.Patient.Mobile.Core.Storage;

/// <summary>
/// Service de stockage sécurisé des tokens patient
/// </summary>
public interface ITokenStorage
{
    Task SetTokenAsync(string token);
    Task<string?> GetTokenAsync();
    Task SetPatientNumberAsync(string patientNumber);
    Task<string?> GetPatientNumberAsync();
    Task SetQrCodeAsync(string qrCode);
    Task<string?> GetQrCodeAsync();
    Task ClearAllAsync();
}

public class SecureTokenStorage : ITokenStorage
{
    private const string PatientTokenKey = "brigade_patient_token";
    private const string PatientNumberKey = "brigade_patient_number";
    private const string QrCodeKey = "brigade_patient_qr";

    /// <summary>
    /// Stocke le token d'accès patient
    /// </summary>
    public async Task SetTokenAsync(string token)
    {
        try
        {
            await SecureStorage.SetAsync(PatientTokenKey, token);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error storing token: {ex}");
            // Fallback to Preferences if SecureStorage not available
            Preferences.Set(PatientTokenKey, token);
        }
    }

    /// <summary>
    /// Récupère le token d'accès patient
    /// </summary>
    public async Task<string?> GetTokenAsync()
    {
        try
        {
            return await SecureStorage.GetAsync(PatientTokenKey);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error retrieving token: {ex}");
            return Preferences.Get(PatientTokenKey, null);
        }
    }

    /// <summary>
    /// Stocke le numéro patient
    /// </summary>
    public async Task SetPatientNumberAsync(string patientNumber)
    {
        await SecureStorage.SetAsync(PatientNumberKey, patientNumber);
    }

    /// <summary>
    /// Récupère le numéro patient
    /// </summary>
    public async Task<string?> GetPatientNumberAsync()
    {
        try
        {
            return await SecureStorage.GetAsync(PatientNumberKey);
        }
        catch
        {
            return Preferences.Get(PatientNumberKey, null);
        }
    }

    /// <summary>
    /// Stocke le code QR en base64
    /// </summary>
    public async Task SetQrCodeAsync(string qrCode)
    {
        Preferences.Set(QrCodeKey, qrCode);
    }

    /// <summary>
    /// Récupère le code QR
    /// </summary>
    public async Task<string?> GetQrCodeAsync()
    {
        return Preferences.Get(QrCodeKey, null);
    }

    /// <summary>
    /// Efface toutes les données stockées (déconnexion)
    /// </summary>
    public async Task ClearAllAsync()
    {
        try
        {
            SecureStorage.Remove(PatientTokenKey);
        }
        catch { }

        SecureStorage.Remove(PatientNumberKey);
        SecureStorage.Remove(QrCodeKey);

        Preferences.Remove(PatientTokenKey);
        Preferences.Remove(PatientNumberKey);
        Preferences.Remove(QrCodeKey);
    }
}
