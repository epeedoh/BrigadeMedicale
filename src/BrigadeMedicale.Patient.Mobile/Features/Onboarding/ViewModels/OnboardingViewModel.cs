using System.Diagnostics;
using System.Windows.Input;
using BrigadeMedicale.Patient.Mobile.Core.Models;
using BrigadeMedicale.Patient.Mobile.Core.ViewModels;
using BrigadeMedicale.Patient.Mobile.Features.Auth.Services;

namespace BrigadeMedicale.Patient.Mobile.Features.Onboarding.ViewModels;

/// <summary>
/// ViewModel pour l'onboarding 2 étapes des patients
/// </summary>
public class OnboardingViewModel : BaseViewModel
{
    private readonly ITokenService _tokenService;
    private int _currentStep = 1;
    private string _statusMessage = string.Empty;
    private bool _isLoading = false;
    private string? _qrCode;
    private string? _patientNumber;

    // Étape 1 - Identité
    private string _firstName = string.Empty;
    private string _lastName = string.Empty;
    private DateTime _dateOfBirth = DateTime.Now.AddYears(-30);
    private Gender _selectedGender = Gender.Male;
    private string _phoneNumber = string.Empty;
    private string _selectedSector = string.Empty;

    // Étape 2 - Santé
    private bool _isFromChurch = false;
    private string _selectedChurchSector = string.Empty;
    private string _address = string.Empty;
    private string _city = string.Empty;
    private string _bloodType = string.Empty;
    private string _allergies = string.Empty;
    private string _chronicDiseases = string.Empty;

    // Étape 1 - Identity Properties
    public string FirstName
    {
        get => _firstName;
        set => SetProperty(ref _firstName, value);
    }

    public string LastName
    {
        get => _lastName;
        set => SetProperty(ref _lastName, value);
    }

    public DateTime DateOfBirth
    {
        get => _dateOfBirth;
        set => SetProperty(ref _dateOfBirth, value);
    }

    public Gender SelectedGender
    {
        get => _selectedGender;
        set => SetProperty(ref _selectedGender, value);
    }

    public string PhoneNumber
    {
        get => _phoneNumber;
        set => SetProperty(ref _phoneNumber, value);
    }

    public string SelectedSector
    {
        get => _selectedSector;
        set => SetProperty(ref _selectedSector, value);
    }

    // Étape 2 - Health Properties
    public bool IsFromChurch
    {
        get => _isFromChurch;
        set => SetProperty(ref _isFromChurch, value);
    }

    public string SelectedChurchSector
    {
        get => _selectedChurchSector;
        set => SetProperty(ref _selectedChurchSector, value);
    }

    public string Address
    {
        get => _address;
        set => SetProperty(ref _address, value);
    }

    public string City
    {
        get => _city;
        set => SetProperty(ref _city, value);
    }

    public string BloodType
    {
        get => _bloodType;
        set => SetProperty(ref _bloodType, value);
    }

    public string Allergies
    {
        get => _allergies;
        set => SetProperty(ref _allergies, value);
    }

    public string ChronicDiseases
    {
        get => _chronicDiseases;
        set => SetProperty(ref _chronicDiseases, value);
    }

    // Properties bindables
    public int CurrentStep
    {
        get => _currentStep;
        set => SetProperty(ref _currentStep, value);
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

    public string? QrCode
    {
        get => _qrCode;
        set => SetProperty(ref _qrCode, value);
    }

    public string? PatientNumber
    {
        get => _patientNumber;
        set => SetProperty(ref _patientNumber, value);
    }

    public ICommand NextStepCommand { get; }
    public ICommand PreviousStepCommand { get; }
    public ICommand RegisterCommand { get; }

    public OnboardingViewModel(ITokenService tokenService)
    {
        _tokenService = tokenService;
        NextStepCommand = new Command(NextStep);
        PreviousStepCommand = new Command(PreviousStep);
        RegisterCommand = new Command(Register);
    }

    private void NextStep()
    {
        if (CurrentStep == 1)
        {
            if (!ValidateStep1())
                return;

            CurrentStep = 2;
            StatusMessage = string.Empty;
        }
    }

    private void PreviousStep()
    {
        if (CurrentStep > 1)
        {
            CurrentStep--;
            StatusMessage = string.Empty;
        }
    }

    private async void Register()
    {
        if (!ValidateStep2())
            return;

        IsLoading = true;
        StatusMessage = "Enregistrement en cours...";

        try
        {
            var patient = new CreatePatientDto
            {
                FirstName = FirstName,
                LastName = LastName,
                DateOfBirth = DateOfBirth,
                Gender = SelectedGender,
                PhoneNumber = PhoneNumber,
                Sector = SelectedSector,
                IsFromChurch = IsFromChurch,
                ChurchSector = IsFromChurch ? SelectedChurchSector : null,
                Address = Address,
                City = City,
                BloodType = BloodType,
                Allergies = Allergies,
                ChronicDiseases = ChronicDiseases
            };

            var success = await _tokenService.RegisterPatientAsync(patient);

            if (success)
            {
                PatientNumber = await _tokenService.GetPatientNumberAsync();
                QrCode = await _tokenService.GetQrCodeAsync();
                StatusMessage = "Inscription réussie !";
                MainThread.BeginInvokeOnMainThread(async () =>
                {
                    await Shell.Current.GoToAsync("///success");
                });
            }
            else
            {
                StatusMessage = "Erreur lors de l'inscription. Veuillez réessayer.";
            }
        }
        catch (Exception ex)
        {
            StatusMessage = $"Erreur: {ex.Message}";
            Debug.WriteLine($"Registration error: {ex}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    private bool ValidateStep1()
    {
        if (string.IsNullOrWhiteSpace(FirstName))
        {
            StatusMessage = "Le prénom est requis.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(LastName))
        {
            StatusMessage = "Le nom est requis.";
            return false;
        }

        if (DateOfBirth >= DateTime.Now)
        {
            StatusMessage = "La date de naissance doit être dans le passé.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(PhoneNumber) || PhoneNumber.Length < 10)
        {
            StatusMessage = "Le numéro de téléphone doit avoir au moins 10 chiffres.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(SelectedSector))
        {
            StatusMessage = "Veuillez sélectionner un secteur.";
            return false;
        }

        return true;
    }

    private bool ValidateStep2()
    {
        if (IsFromChurch && string.IsNullOrWhiteSpace(SelectedChurchSector))
        {
            StatusMessage = "Veuillez sélectionner un secteur d'église.";
            return false;
        }

        return true;
    }

    // Propriétés pour les listes
    public IEnumerable<string> Sectors => SectorsList.All;
    public IEnumerable<string> ChurchSectors => ChurchSectorsList.All;
    public IEnumerable<Gender> Genders => Enum.GetValues(typeof(Gender)).Cast<Gender>();
}
