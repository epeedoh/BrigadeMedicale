using BrigadeMedicale.Patient.Mobile.Core.Models;
using BrigadeMedicale.Patient.Mobile.Features.Triage.ViewModels;

namespace BrigadeMedicale.Patient.Mobile.Features.Triage.Pages;

public partial class TriagePage : ContentPage
{
    private readonly TriageViewModel _viewModel;

    public TriagePage(TriageViewModel viewModel)
    {
        InitializeComponent();
        _viewModel = viewModel;
        BindingContext = _viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();

        // Récupérer le patient depuis la navigation
        if (this.HasNavigationData())
        {
            var patient = this.GetNavigationData<PatientDto>();
            if (patient != null)
            {
                _viewModel.Initialize(patient);
                PatientNameLabel.Text = $"Patient: {patient.FirstName} {patient.LastName}";
            }
        }
    }
}

/// <summary>
/// Extensions de navigation
/// </summary>
public static class NavigationDataExtensions
{
    private const string NavigationDataKey = "navigationData";

    public static void SetNavigationData<T>(this Page page, T data) where T : class
    {
        if (Shell.Current?.CurrentPage is Page currentPage)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(data);
            Shell.Current.CurrentPage.GetType().BaseType?.GetProperty(NavigationDataKey)
                ?.SetValue(Shell.Current.CurrentPage, json);
        }
    }

    public static bool HasNavigationData(this Page page)
    {
        return Shell.Current?.CurrentPage?.GetHashCode() != 0;
    }

    public static T? GetNavigationData<T>(this Page page) where T : class
    {
        try
        {
            var navParams = Shell.Current?.CurrentPageRoute;
            if (navParams?.Contains("patient") == true)
            {
                // Extract patient ID from route
                var parts = navParams.Split('/');
                if (parts.Length > 0 && Guid.TryParse(parts[^1], out var patientId))
                {
                    // In a real app, you would fetch the patient from a service here
                    return null;
                }
            }
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"Error getting navigation data: {ex.Message}");
        }

        return null;
    }
}
