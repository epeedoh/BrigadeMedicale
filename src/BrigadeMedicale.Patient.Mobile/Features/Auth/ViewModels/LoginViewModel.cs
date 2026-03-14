using System.Diagnostics;
using System.Windows.Input;
using BrigadeMedicale.Patient.Mobile.Core.ViewModels;
using BrigadeMedicale.Patient.Mobile.Features.Auth.Services;

namespace BrigadeMedicale.Patient.Mobile.Features.Auth.ViewModels;

/// <summary>
/// ViewModel pour la connexion patient
/// </summary>
public class LoginViewModel : BaseViewModel
{
    private readonly ITokenService _tokenService;
    private string _patientNumber = string.Empty;
    private string _phoneNumber = string.Empty;
    private string _statusMessage = string.Empty;
    private bool _isLoading = false;
    private bool _isError = false;

    public string PatientNumber
    {
        get => _patientNumber;
        set => SetProperty(ref _patientNumber, value);
    }

    public string PhoneNumber
    {
        get => _phoneNumber;
        set => SetProperty(ref _phoneNumber, value);
    }

    public string StatusMessage
    {
        get => _statusMessage;
        set => SetProperty(ref _statusMessage, value);
    }

    public bool IsLoading
    {
        get => _isLoading;
        set => SetProperty(ref _isLoading, value);
    }

    public bool IsError
    {
        get => _isError;
        set => SetProperty(ref _isError, value);
    }

    public ICommand LoginCommand { get; }
    public ICommand RegisterCommand { get; }

    public LoginViewModel(ITokenService tokenService)
    {
        _tokenService = tokenService;
        LoginCommand = new Command(Login);
        RegisterCommand = new Command(Register);
    }

    private async void Login()
    {
        if (!Validate())
            return;

        IsLoading = true;
        StatusMessage = "Connexion en cours...";

        try
        {
            var success = await _tokenService.LoginByPhoneAsync(PatientNumber, PhoneNumber);

            if (success)
            {
                IsError = false;
                StatusMessage = "Connexion réussie !";
                MainThread.BeginInvokeOnMainThread(async () =>
                {
                    // Phase 2: Navigate to health record when implemented
                    // For now, return to main page
                    await Shell.Current.GoToAsync("///main");
                });
            }
            else
            {
                IsError = true;
                StatusMessage = "Numéro de patient ou téléphone incorrect.";
            }
        }
        catch (Exception ex)
        {
            IsError = true;
            StatusMessage = $"Erreur: {ex.Message}";
            Debug.WriteLine($"Login error: {ex}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    private void Register()
    {
        MainThread.BeginInvokeOnMainThread(async () =>
        {
            await Shell.Current.GoToAsync("///onboarding");
        });
    }

    private bool Validate()
    {
        if (string.IsNullOrWhiteSpace(PatientNumber))
        {
            IsError = true;
            StatusMessage = "Veuillez entrer votre numéro de patient.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(PhoneNumber))
        {
            IsError = true;
            StatusMessage = "Veuillez entrer votre numéro de téléphone.";
            return false;
        }

        IsError = false;
        return true;
    }
}
