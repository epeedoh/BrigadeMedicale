using System.Collections.ObjectModel;
using System.Windows.Input;
using BrigadeMedicale.Patient.Mobile.Core.Models;
using BrigadeMedicale.Patient.Mobile.Core.ViewModels;
using BrigadeMedicale.Patient.Mobile.Features.Triage.Services;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;

namespace BrigadeMedicale.Patient.Mobile.Features.Triage.ViewModels;

/// <summary>
/// ViewModel pour la prise de triage
/// </summary>
public partial class TriageViewModel : BaseViewModel
{
    private readonly ITriageService _triageService;

    [ObservableProperty]
    private string patientName = string.Empty;

    [ObservableProperty]
    private Guid patientId;

    [ObservableProperty]
    private double temperature;

    [ObservableProperty]
    private int pulse;

    [ObservableProperty]
    private int systolic;

    [ObservableProperty]
    private int diastolic;

    [ObservableProperty]
    private double weight;

    [ObservableProperty]
    private int height;

    [ObservableProperty]
    private int? spO2;

    [ObservableProperty]
    private double imc;

    [ObservableProperty]
    private string complaint = string.Empty;

    [ObservableProperty]
    private string notes = string.Empty;

    [ObservableProperty]
    private UrgencyLevel urgencyLevel = UrgencyLevel.Green;

    [ObservableProperty]
    private bool isOfflineMode;

    [ObservableProperty]
    private int queueLength;

    [ObservableProperty]
    private bool hasDraft;

    [ObservableProperty]
    private bool isSubmitting;

    public ICommand SubmitCommand { get; }
    public ICommand CalculateIMCCommand { get; }
    public ICommand SaveDraftCommand { get; }
    public ICommand LoadDraftCommand { get; }
    public ICommand ClearDraftCommand { get; }
    public ICommand SyncCommand { get; }

    public TriageViewModel(ITriageService triageService)
    {
        _triageService = triageService;

        SubmitCommand = new AsyncRelayCommand(SubmitAsync);
        CalculateIMCCommand = new RelayCommand(CalculateIMC);
        SaveDraftCommand = new AsyncRelayCommand(SaveDraftAsync);
        LoadDraftCommand = new AsyncRelayCommand(LoadDraftAsync);
        ClearDraftCommand = new AsyncRelayCommand(ClearDraftAsync);
        SyncCommand = new AsyncRelayCommand(SyncAsync);

        CheckOfflineMode();
        CheckForDraft();
        LoadConnectivityChanges();
    }

    /// <summary>
    /// Initialise le ViewModel avec un patient
    /// </summary>
    public void Initialize(PatientDto patient)
    {
        PatientId = patient.Id;
        PatientName = $"{patient.FirstName} {patient.LastName}";
    }

    /// <summary>
    /// Soumet le triage
    /// </summary>
    private async Task SubmitAsync()
    {
        if (!ValidateForm())
            return;

        IsSubmitting = true;

        try
        {
            var createTriageDto = new CreateTriageDto
            {
                PatientId = PatientId,
                Temperature = Temperature,
                Pulse = Pulse,
                Systolic = Systolic,
                Diastolic = Diastolic,
                Weight = Weight,
                Height = Height,
                SpO2 = SpO2,
                Complaint = Complaint,
                Notes = Notes,
                UrgencyLevel = UrgencyLevel
            };

            var response = await _triageService.CreateTriageAsync(createTriageDto);

            if (response.Success)
            {
                await Shell.Current.DisplayAlert("✓ Succès", "Triage enregistré avec succès", "OK");
                ResetForm();
                await Shell.Current.GoToAsync($"//patients/{PatientId}");
            }
            else
            {
                await Shell.Current.DisplayAlert("Erreur", response.Message ?? "Erreur lors de l'enregistrement", "OK");
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Erreur", $"Une erreur est survenue: {ex.Message}", "OK");
        }
        finally
        {
            IsSubmitting = false;
        }
    }

    /// <summary>
    /// Calcule l'IMC
    /// </summary>
    private void CalculateIMC()
    {
        if (Weight > 0 && Height > 0)
        {
            IMC = _triageService.CalculateIMC(Weight, Height);
        }
    }

    /// <summary>
    /// Sauvegarde un brouillon du formulaire
    /// </summary>
    private async Task SaveDraftAsync()
    {
        try
        {
            var draft = new CreateTriageDto
            {
                PatientId = PatientId,
                Temperature = Temperature,
                Pulse = Pulse,
                Systolic = Systolic,
                Diastolic = Diastolic,
                Weight = Weight,
                Height = Height,
                SpO2 = SpO2,
                Complaint = Complaint,
                Notes = Notes,
                UrgencyLevel = UrgencyLevel
            };

            _triageService.SaveDraft(draft);
            CheckForDraft();

            await Shell.Current.DisplayAlert("✓ Succès", "Brouillon sauvegardé localement", "OK");
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Erreur", $"Erreur lors de la sauvegarde: {ex.Message}", "OK");
        }
    }

    /// <summary>
    /// Charge le brouillon sauvegardé
    /// </summary>
    private async Task LoadDraftAsync()
    {
        try
        {
            var draft = _triageService.GetDraft();
            if (draft != null)
            {
                Temperature = draft.Temperature;
                Pulse = draft.Pulse;
                Systolic = draft.Systolic;
                Diastolic = draft.Diastolic;
                Weight = draft.Weight;
                Height = draft.Height;
                SpO2 = draft.SpO2;
                Complaint = draft.Complaint;
                Notes = draft.Notes;
                UrgencyLevel = draft.UrgencyLevel;
                CalculateIMC();

                await Shell.Current.DisplayAlert("✓ Succès", "Brouillon chargé", "OK");
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Erreur", $"Erreur lors du chargement: {ex.Message}", "OK");
        }
    }

    /// <summary>
    /// Efface le brouillon
    /// </summary>
    private async Task ClearDraftAsync()
    {
        try
        {
            _triageService.ClearDraft();
            CheckForDraft();
            await Shell.Current.DisplayAlert("✓ Succès", "Brouillon supprimé", "OK");
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Erreur", $"Erreur lors de la suppression: {ex.Message}", "OK");
        }
    }

    /// <summary>
    /// Synchronise la queue offline
    /// </summary>
    private async Task SyncAsync()
    {
        try
        {
            if (!IsOfflineMode)
            {
                await _triageService.SyncOfflineQueueAsync();
                UpdateQueueLength();
                await Shell.Current.DisplayAlert("✓ Succès", "Synchronisation terminée", "OK");
            }
            else
            {
                await Shell.Current.DisplayAlert("Info", "Mode offline - Impossible de synchroniser", "OK");
            }
        }
        catch (Exception ex)
        {
            await Shell.Current.DisplayAlert("Erreur", $"Erreur lors de la synchronisation: {ex.Message}", "OK");
        }
    }

    // ========== Private Methods ==========

    private bool ValidateForm()
    {
        if (PatientId == Guid.Empty)
        {
            MainThread.BeginInvokeOnMainThread(async () =>
            {
                await Shell.Current.DisplayAlert("Validation", "Patient non sélectionné", "OK");
            });
            return false;
        }

        if (Temperature < 35 || Temperature > 42)
        {
            MainThread.BeginInvokeOnMainThread(async () =>
            {
                await Shell.Current.DisplayAlert("Validation", "Température invalide (35-42°C)", "OK");
            });
            return false;
        }

        if (Pulse < 30 || Pulse > 200)
        {
            MainThread.BeginInvokeOnMainThread(async () =>
            {
                await Shell.Current.DisplayAlert("Validation", "Pouls invalide (30-200 bpm)", "OK");
            });
            return false;
        }

        if (Weight < 20 || Weight > 300)
        {
            MainThread.BeginInvokeOnMainThread(async () =>
            {
                await Shell.Current.DisplayAlert("Validation", "Poids invalide (20-300 kg)", "OK");
            });
            return false;
        }

        if (Height < 50 || Height > 250)
        {
            MainThread.BeginInvokeOnMainThread(async () =>
            {
                await Shell.Current.DisplayAlert("Validation", "Taille invalide (50-250 cm)", "OK");
            });
            return false;
        }

        if (string.IsNullOrWhiteSpace(Complaint))
        {
            MainThread.BeginInvokeOnMainThread(async () =>
            {
                await Shell.Current.DisplayAlert("Validation", "Motif de consultation obligatoire", "OK");
            });
            return false;
        }

        return true;
    }

    private void ResetForm()
    {
        Temperature = 0;
        Pulse = 0;
        Systolic = 0;
        Diastolic = 0;
        Weight = 0;
        Height = 0;
        SpO2 = null;
        IMC = 0;
        Complaint = string.Empty;
        Notes = string.Empty;
        UrgencyLevel = UrgencyLevel.Green;
    }

    private void CheckOfflineMode()
    {
        IsOfflineMode = Connectivity.Current.NetworkAccess != NetworkAccess.Internet;
        UpdateQueueLength();
    }

    private void CheckForDraft()
    {
        HasDraft = _triageService.GetDraft() != null;
    }

    private void UpdateQueueLength()
    {
        QueueLength = _triageService.GetQueueLength();
    }

    private void LoadConnectivityChanges()
    {
        Connectivity.ConnectivityChanged += (sender, args) =>
        {
            MainThread.BeginInvokeOnMainThread(() =>
            {
                bool isOnline = args.NetworkAccess == NetworkAccess.Internet;
                IsOfflineMode = !isOnline;

                if (isOnline && QueueLength > 0)
                {
                    MainThread.BeginInvokeOnMainThread(async () =>
                    {
                        bool shouldSync = await Shell.Current.DisplayAlert(
                            "Synchronisation",
                            $"Connexion rétablie. Synchroniser {QueueLength} triage(s) en attente?",
                            "Oui",
                            "Non"
                        );

                        if (shouldSync)
                        {
                            await SyncAsync();
                        }
                    });
                }
            });
        };
    }
}
