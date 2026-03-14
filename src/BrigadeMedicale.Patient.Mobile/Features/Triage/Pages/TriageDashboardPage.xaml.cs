using BrigadeMedicale.Patient.Mobile.Features.Triage.ViewModels;

namespace BrigadeMedicale.Patient.Mobile.Features.Triage.Pages;

public partial class TriageDashboardPage : ContentPage
{
    private readonly TriageDashboardViewModel _viewModel;

    public TriageDashboardPage(TriageDashboardViewModel viewModel)
    {
        InitializeComponent();
        _viewModel = viewModel;
        BindingContext = _viewModel;
    }

    protected override void OnAppearing()
    {
        base.OnAppearing();
        _viewModel.LoadTriagesCommand.Execute(null);
    }
}
