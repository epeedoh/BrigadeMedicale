using BrigadeMedicale.Patient.Mobile.Features.Auth.ViewModels;

namespace BrigadeMedicale.Patient.Mobile.Features.Auth.Pages;

public partial class LoginPage : ContentPage
{
	public LoginPage(LoginViewModel viewModel)
	{
		InitializeComponent();
		BindingContext = viewModel;
	}
}
