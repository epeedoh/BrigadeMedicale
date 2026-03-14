using BrigadeMedicale.Patient.Mobile.Features.Onboarding.ViewModels;

namespace BrigadeMedicale.Patient.Mobile.Features.Onboarding.Pages;

public partial class SuccessPage : ContentPage
{
	private readonly SuccessViewModel _viewModel;

	public SuccessPage(SuccessViewModel viewModel)
	{
		InitializeComponent();
		_viewModel = viewModel;
		BindingContext = _viewModel;
	}

	/// <summary>
	/// Charge les données du patient lors de l'apparition de la page
	/// </summary>
	protected override void OnAppearing()
	{
		base.OnAppearing();
		_viewModel.OnAppearing();
	}
}
