using System.Text.Json;
using BrigadeMedicale.Patient.Mobile.Core.Http;
using BrigadeMedicale.Patient.Mobile.Core.Models;

namespace BrigadeMedicale.Patient.Mobile.Features.Triage.Services;

/// <summary>
/// Service pour gérer les triages (prise de constantes)
/// Supporte le mode offline avec queue de synchronisation
/// </summary>
public interface ITriageService
{
    Task<ApiResponse<TriageRecordDto>> CreateTriageAsync(CreateTriageDto dto);
    Task<ApiResponse<TriageRecordDto>> GetLatestTriageAsync(Guid patientId);
    Task<List<TriageRecordDto>> GetTodayTriagesAsync();
    void SaveDraft(CreateTriageDto draft);
    CreateTriageDto? GetDraft();
    void ClearDraft();
    int GetQueueLength();
    Task SyncOfflineQueueAsync();
    double CalculateIMC(double weight, int height);
}

public class TriageService : ITriageService
{
    private readonly IApiClient _apiClient;
    private readonly string _apiUrl = "/triage";
    private readonly string _draftKey = "triageDraft";
    private readonly string _queueKey = "triageOfflineQueue";
    private const int MaxRetries = 3;

    private bool _isSyncing = false;
    private List<QueuedTriage> _offlineQueue = new();

    public TriageService(IApiClient apiClient)
    {
        _apiClient = apiClient;
        LoadQueueFromStorage();
    }

    /// <summary>
    /// Crée un nouveau triage
    /// </summary>
    public async Task<ApiResponse<TriageRecordDto>> CreateTriageAsync(CreateTriageDto dto)
    {
        try
        {
            var response = await _apiClient.PostAsync<TriageRecordDto>(_apiUrl, dto);

            if (response.Success)
            {
                ClearDraft();
                return response;
            }

            // Si offline, ajouter à la queue
            if (!IsOnline())
            {
                return HandleOfflineCreate(dto);
            }

            return response;
        }
        catch (Exception ex)
        {
            MainThread.BeginInvokeOnMainThread(() =>
            {
                Application.Current?.MainPage?.DisplayAlert("Erreur", $"Erreur lors du triage: {ex.Message}", "OK");
            });

            // En cas d'erreur, ajouter à la queue si offline
            if (!IsOnline())
            {
                return HandleOfflineCreate(dto);
            }

            throw;
        }
    }

    /// <summary>
    /// Récupère le dernier triage d'un patient
    /// </summary>
    public async Task<ApiResponse<TriageRecordDto>> GetLatestTriageAsync(Guid patientId)
    {
        try
        {
            var url = $"{_apiUrl}/latest?patientId={patientId}";
            return await _apiClient.GetAsync<TriageRecordDto>(url);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error fetching latest triage: {ex.Message}");
            return new ApiResponse<TriageRecordDto>
            {
                Success = false,
                Message = "Impossible de récupérer le triage"
            };
        }
    }

    /// <summary>
    /// Récupère les triages du jour
    /// </summary>
    public async Task<List<TriageRecordDto>> GetTodayTriagesAsync()
    {
        try
        {
            var url = $"{_apiUrl}/today";
            var response = await _apiClient.GetAsync<List<TriageRecordDto>>(url);

            if (response.Success && response.Data != null)
            {
                return response.Data;
            }

            return new List<TriageRecordDto>();
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error fetching today's triages: {ex.Message}");
            return new List<TriageRecordDto>();
        }
    }

    /// <summary>
    /// Sauvegarde un brouillon de triage en local
    /// </summary>
    public void SaveDraft(CreateTriageDto draft)
    {
        try
        {
            var json = JsonSerializer.Serialize(draft);
            Preferences.Default.Set(_draftKey, json);
            Debug.WriteLine("✓ Triage en brouillon sauvegardé localement");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error saving draft: {ex.Message}");
        }
    }

    /// <summary>
    /// Récupère le brouillon sauvegardé
    /// </summary>
    public CreateTriageDto? GetDraft()
    {
        try
        {
            if (Preferences.Default.ContainsKey(_draftKey))
            {
                var json = Preferences.Default.Get(_draftKey, string.Empty);
                if (!string.IsNullOrEmpty(json))
                {
                    return JsonSerializer.Deserialize<CreateTriageDto>(json);
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error loading draft: {ex.Message}");
        }
        return null;
    }

    /// <summary>
    /// Efface le brouillon
    /// </summary>
    public void ClearDraft()
    {
        try
        {
            Preferences.Default.Remove(_draftKey);
            Debug.WriteLine("✓ Brouillon supprimé");
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error clearing draft: {ex.Message}");
        }
    }

    /// <summary>
    /// Obtient le nombre d'items en attente de synchronisation
    /// </summary>
    public int GetQueueLength()
    {
        return _offlineQueue.Count;
    }

    /// <summary>
    /// Synchronise la queue offline avec le serveur
    /// </summary>
    public async Task SyncOfflineQueueAsync()
    {
        if (_isSyncing || IsOnline() == false || _offlineQueue.Count == 0)
            return;

        _isSyncing = true;

        try
        {
            var itemsToSync = _offlineQueue.Where(item => item.Retries < MaxRetries).ToList();
            int completedRequests = 0;
            int totalRequests = itemsToSync.Count;

            Debug.WriteLine($"🔄 Synchronisation de la queue: {totalRequests} item(s)");

            foreach (var item in itemsToSync)
            {
                try
                {
                    var response = await _apiClient.PostAsync<TriageRecordDto>(_apiUrl, item.Data);

                    if (response.Success)
                    {
                        Debug.WriteLine($"✓ Triage {item.Id} synchronized successfully");
                        _offlineQueue.Remove(item);
                    }
                    else
                    {
                        item.Retries++;
                        if (item.Retries >= MaxRetries)
                        {
                            Debug.WriteLine($"❌ Sync failed for {item.Id} after {MaxRetries} retries");
                        }
                    }
                }
                catch (Exception ex)
                {
                    item.Retries++;
                    Debug.WriteLine($"⚠️ Sync failed for {item.Id}: {ex.Message}, retry {item.Retries}/{MaxRetries}");
                }

                completedRequests++;
            }

            SaveQueueToStorage();
            Debug.WriteLine($"✓ Synchronisation terminée: {_offlineQueue.Count} items restants");
        }
        finally
        {
            _isSyncing = false;
        }
    }

    /// <summary>
    /// Calcule l'IMC
    /// </summary>
    public double CalculateIMC(double weight, int height)
    {
        if (height <= 0) return 0;
        double heightM = height / 100.0;
        return Math.Round((weight / (heightM * heightM)) * 10) / 10;
    }

    // ========== Private Methods ==========

    private bool IsOnline() => Connectivity.Current.NetworkAccess == NetworkAccess.Internet;

    private ApiResponse<TriageRecordDto> HandleOfflineCreate(CreateTriageDto dto)
    {
        var queuedItem = new QueuedTriage
        {
            Id = Guid.NewGuid().ToString(),
            Data = dto,
            Retries = 0
        };

        _offlineQueue.Add(queuedItem);
        SaveQueueToStorage();

        Debug.WriteLine($"⚠️ Mode offline détecté → Triage ajouté à la queue ({_offlineQueue.Count} items)");

        return new ApiResponse<TriageRecordDto>
        {
            Success = true,
            Message = "[Mode offline] Triage en attente de synchronisation",
            Data = new TriageRecordDto
            {
                Id = Guid.Parse(queuedItem.Id),
                PatientId = dto.PatientId,
                RecordedAt = DateTime.Now,
                Temperature = dto.Temperature,
                Systolic = dto.Systolic,
                Diastolic = dto.Diastolic,
                Pulse = dto.Pulse,
                Weight = dto.Weight,
                Height = dto.Height,
                SpO2 = dto.SpO2,
                IMC = CalculateIMC(dto.Weight, dto.Height),
                Complaint = dto.Complaint,
                Notes = dto.Notes,
                UrgencyLevel = dto.UrgencyLevel,
                Status = TriageStatus.Pending
            }
        };
    }

    private void SaveQueueToStorage()
    {
        try
        {
            var json = JsonSerializer.Serialize(_offlineQueue);
            Preferences.Default.Set(_queueKey, json);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error saving queue: {ex.Message}");
        }
    }

    private void LoadQueueFromStorage()
    {
        try
        {
            if (Preferences.Default.ContainsKey(_queueKey))
            {
                var json = Preferences.Default.Get(_queueKey, string.Empty);
                if (!string.IsNullOrEmpty(json))
                {
                    _offlineQueue = JsonSerializer.Deserialize<List<QueuedTriage>>(json) ?? new();
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error loading queue: {ex.Message}");
        }
    }

    private class QueuedTriage
    {
        public string Id { get; set; } = string.Empty;
        public CreateTriageDto Data { get; set; } = new();
        public int Retries { get; set; }
        public DateTime LastRetry { get; set; }
    }
}
