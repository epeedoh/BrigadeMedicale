using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json;
using BrigadeMedicale.Patient.Mobile.Core.Models;
using BrigadeMedicale.Patient.Mobile.Core.Storage;

namespace BrigadeMedicale.Patient.Mobile.Core.Http;

/// <summary>
/// Client HTTP pour l'API Brigade Médicale avec gestion du token patient
/// </summary>
public interface IApiClient
{
    Task<ApiResponse<T>> PostAsync<T>(string endpoint, object? data = null);
    Task<ApiResponse<T>> GetAsync<T>(string endpoint);
    Task<string?> GetRawAsync(string endpoint);
    Task<bool> CheckConnectionAsync();
}

public class ApiClient : IApiClient
{
    private readonly HttpClient _httpClient;
    private readonly ITokenStorage _tokenStorage;
    private readonly string _baseUrl;
    private bool _useMockData;

    public ApiClient(HttpClient httpClient, ITokenStorage tokenStorage, string baseUrl = "http://localhost:5238", bool useMockData = false)
    {
        _httpClient = httpClient;
        _tokenStorage = tokenStorage;
        _baseUrl = baseUrl;
        _useMockData = useMockData;

        // Configure le timeout
        _httpClient.Timeout = TimeSpan.FromSeconds(30);
    }

    /// <summary>
    /// Effectue un POST vers l'API
    /// </summary>
    public async Task<ApiResponse<T>> PostAsync<T>(string endpoint, object? data = null)
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_baseUrl}/api{endpoint}");

            // Ajouter le token si c'est un endpoint protégé
            if (endpoint.StartsWith("/patient"))
            {
                var token = await _tokenStorage.GetTokenAsync();
                if (!string.IsNullOrEmpty(token))
                {
                    request.Headers.Add("X-Patient-Token", token);
                }
            }

            // Sérialiser le corps de la requête
            if (data != null)
            {
                var json = JsonSerializer.Serialize(data);
                request.Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
            }

            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrEmpty(content))
            {
                return new ApiResponse<T> { Success = false, Message = "Réponse vide du serveur" };
            }

            var result = JsonSerializer.Deserialize<ApiResponse<T>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result ?? new ApiResponse<T> { Success = false, Message = "Erreur lors du décodage" };
        }
        catch (HttpRequestException ex)
        {
            Debug.WriteLine($"HTTP Error: {ex.Message}");
            return new ApiResponse<T>
            {
                Success = false,
                Message = $"Erreur réseau: {ex.Message}"
            };
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error in PostAsync: {ex}");
            return new ApiResponse<T>
            {
                Success = false,
                Message = $"Erreur: {ex.Message}"
            };
        }
    }

    /// <summary>
    /// Effectue un GET vers l'API
    /// </summary>
    public async Task<ApiResponse<T>> GetAsync<T>(string endpoint)
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_baseUrl}/api{endpoint}");

            // Ajouter le token si c'est un endpoint protégé
            if (endpoint.StartsWith("/patient"))
            {
                var token = await _tokenStorage.GetTokenAsync();
                if (!string.IsNullOrEmpty(token))
                {
                    request.Headers.Add("X-Patient-Token", token);
                }
            }

            var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (string.IsNullOrEmpty(content))
            {
                return new ApiResponse<T> { Success = false, Message = "Réponse vide du serveur" };
            }

            var result = JsonSerializer.Deserialize<ApiResponse<T>>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result ?? new ApiResponse<T> { Success = false, Message = "Erreur lors du décodage" };
        }
        catch (HttpRequestException ex)
        {
            Debug.WriteLine($"HTTP Error: {ex.Message}");
            return new ApiResponse<T>
            {
                Success = false,
                Message = $"Erreur réseau: {ex.Message}"
            };
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error in GetAsync: {ex}");
            return new ApiResponse<T>
            {
                Success = false,
                Message = $"Erreur: {ex.Message}"
            };
        }
    }

    /// <summary>
    /// Effectue un GET et retourne le contenu brut (pour les images, QR codes, etc.)
    /// </summary>
    public async Task<string?> GetRawAsync(string endpoint)
    {
        try
        {
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_baseUrl}/api{endpoint}");

            var token = await _tokenStorage.GetTokenAsync();
            if (!string.IsNullOrEmpty(token))
            {
                request.Headers.Add("X-Patient-Token", token);
            }

            var response = await _httpClient.SendAsync(request);
            return await response.Content.ReadAsStringAsync();
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error in GetRawAsync: {ex}");
            return null;
        }
    }

    /// <summary>
    /// Vérifie la connexion à l'API
    /// </summary>
    public async Task<bool> CheckConnectionAsync()
    {
        try
        {
            var cts = new CancellationTokenSource(TimeSpan.FromSeconds(5));
            var request = new HttpRequestMessage(HttpMethod.Get, $"{_baseUrl}/api/public/patients/check-phone/test");
            var response = await _httpClient.SendAsync(request, cts.Token);
            return response.IsSuccessStatusCode;
        }
        catch
        {
            return false;
        }
    }
}

/// <summary>
/// Factory pour créer un ApiClient avec configuration
/// </summary>
public static class ApiClientFactory
{
    public static IApiClient CreateClient(ITokenStorage tokenStorage, string baseUrl = "http://localhost:5238", bool useMockData = false)
    {
        var httpClient = new HttpClient();
        return new ApiClient(httpClient, tokenStorage, baseUrl, useMockData);
    }
}
