using System.Collections.ObjectModel;
using System.Windows.Input;
using BrigadeMedicale.Patient.Mobile.Core.Models;
using BrigadeMedicale.Patient.Mobile.Core.ViewModels;
using BrigadeMedicale.Patient.Mobile.Features.Triage.Services;

namespace BrigadeMedicale.Patient.Mobile.Features.Triage.ViewModels;

/// <summary>
/// ViewModel pour le tableau de bord des triages
/// </summary>
public partial class TriageDashboardViewModel : BaseViewModel
{
    private readonly ITriageService _triageService;

    [ObservableProperty]
    private ObservableCollection<TriageRecordDto> triages = new();

    [ObservableProperty]
    private bool isLoading;

    [ObservableProperty]
    private bool isRefreshing;

    [ObservableProperty]
    private int totalCount;

    [ObservableProperty]
    private int completedCount;

    [ObservableProperty]
    private int pendingCount;

    public ICommand LoadTriagesCommand { get; }
    public ICommand RefreshCommand { get; }
    public ICommand NewTriageCommand { get; }
    public ICommand SelectTriageCommand { get; }

    public TriageDashboardViewModel(ITriageService triageService)
    {
        _triageService = triageService;

        LoadTriagesCommand = new AsyncRelayCommand(LoadTriagesAsync);
        RefreshCommand = new AsyncRelayCommand(RefreshAsync);
        NewTriageCommand = new AsyncRelayCommand(NewTriageAsync);
        SelectTriageCommand = new AsyncRelayCommand<TriageRecordDto>(SelectTriageAsync);
    }

    /// <summary>
    /// Charge les triages du jour
    /// </summary>
    private async Task LoadTriagesAsync()
    {
        try
        {
            IsLoading = true;
            var triages = await _triageService.GetTodayTriagesAsync();

            MainThread.BeginInvokeOnMainThread(() =>
            {
                Triages.Clear();
                foreach (var triage in triages)
                {
                    Triages.Add(triage);
                }
                UpdateCounts();
                IsLoading = false;
            });
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error loading triages: {ex.Message}");
            IsLoading = false;
            await Shell.Current.DisplayAlert("Erreur", "Erreur lors du chargement des triages", "OK");
        }
    }

    /// <summary>
    /// Actualise la liste des triages
    /// </summary>
    private async Task RefreshAsync()
    {
        IsRefreshing = true;
        await LoadTriagesAsync();
        IsRefreshing = false;
    }

    /// <summary>
    /// Navigue vers un nouveau triage
    /// </summary>
    private async Task NewTriageAsync()
    {
        await Shell.Current.GoToAsync($"//triage");
    }

    /// <summary>
    /// Navigue vers le détail d'un triage
    /// </summary>
    private async Task SelectTriageAsync(TriageRecordDto triage)
    {
        if (triage != null)
        {
            // Navigue vers la page de détail (à implémenter)
            await Shell.Current.DisplayAlert("Info", $"Triage de {triage.PatientName} - {triage.Complaint}", "OK");
        }
    }

    /// <summary>
    /// Met à jour les compteurs de statistiques
    /// </summary>
    private void UpdateCounts()
    {
        TotalCount = Triages.Count;
        CompletedCount = Triages.Count(t => t.Status == 1); // TriageStatus.COMPLETED = 1
        PendingCount = Triages.Count(t => t.Status == 0); // TriageStatus.PENDING = 0
    }

    public bool HasTriages => Triages.Count > 0;
    public bool IsEmpty => !HasTriages && !IsLoading;
}

/// <summary>
/// DTO pour l'affichage d'un enregistrement de triage
/// </summary>
public class TriageRecordDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientNumber { get; set; } = string.Empty;
    public Guid? InfirmierId { get; set; }
    public string InfirmierName { get; set; } = string.Empty;
    public DateTime RecordedAt { get; set; }

    // Constantes vitales
    public double Temperature { get; set; }
    public int Pulse { get; set; }
    public int SystolicBP { get; set; }
    public int DiastolicBP { get; set; }
    public double Weight { get; set; }
    public int Height { get; set; }
    public int? SpO2 { get; set; }
    public int? RespiratoryRate { get; set; }
    public double? BMI { get; set; }

    // Triage info
    public string Complaint { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public int UrgencyLevel { get; set; } // 0=Green, 1=Yellow, 2=Red
    public int Status { get; set; } // 0=Pending, 1=Completed, 2=Cancelled
}
