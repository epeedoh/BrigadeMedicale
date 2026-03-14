using System.Diagnostics;
using System.Windows.Input;
using BrigadeMedicale.Patient.Mobile.Core.ViewModels;
using BrigadeMedicale.Patient.Mobile.Features.Auth.Services;

namespace BrigadeMedicale.Patient.Mobile.Features.Onboarding.ViewModels;

/// <summary>
/// ViewModel pour l'écran de succès d'enregistrement
/// </summary>
public class SuccessViewModel : BaseViewModel
{
    private readonly ITokenService _tokenService;
    private string? _patientNumber;
    private string? _qrCode;
    private bool _isLoading = false;

    public string? PatientNumber
    {
        get => _patientNumber;
        set => SetProperty(ref _patientNumber, value);
    }

    public string? QrCode
    {
        get => _qrCode;
        set => SetProperty(ref _qrCode, value);
    }

    public bool IsLoading
    {
        get => _isLoading;
        set => SetProperty(ref _isLoading, value);
    }

    public ICommand AccessHealthRecordCommand { get; }
    public ICommand ShareQrCommand { get; }

    public SuccessViewModel(ITokenService tokenService)
    {
        _tokenService = tokenService;
        AccessHealthRecordCommand = new Command(AccessHealthRecord);
        ShareQrCommand = new Command(ShareQr);
    }

    public async void OnAppearing()
    {
        IsLoading = true;
        try
        {
            PatientNumber = await _tokenService.GetPatientNumberAsync();
            QrCode = await _tokenService.GetQrCodeAsync();
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error loading patient data: {ex}");
        }
        finally
        {
            IsLoading = false;
        }
    }

    private void AccessHealthRecord()
    {
        MainThread.BeginInvokeOnMainThread(async () =>
        {
            // Phase 2: Navigate to health record when implemented
            // For now, return to main page
            await Shell.Current.GoToAsync("///main");
        });
    }

    private async void ShareQr()
    {
        if (string.IsNullOrEmpty(QrCode))
            return;

        try
        {
            var filename = Path.Combine(FileSystem.CacheDirectory, "patient_qr.txt");
            File.WriteAllText(filename, QrCode);

            await Share.RequestAsync(new ShareFileRequest
            {
                Title = "Mon QR Code Brigade Médicale",
                File = new ShareFile(filename)
            });
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error sharing QR: {ex}");
        }
    }
}
