namespace BrigadeMedicale.Patient.Mobile;

public partial class MainPage : ContentPage
{
	public MainPage()
	{
		InitializeComponent();
	}

	/// <summary>
	/// Navigue vers la page de connexion
	/// </summary>
	private async void OnLoginClicked(object? sender, EventArgs e)
	{
		try
		{
			await Shell.Current.GoToAsync("///login");
		}
		catch (Exception ex)
		{
			System.Diagnostics.Debug.WriteLine($"Navigation error: {ex}");
			await DisplayAlertAsync("Erreur", $"Impossible de naviguer: {ex.Message}", "OK");
		}
	}

	/// <summary>
	/// Navigue vers la page d'inscription
	/// </summary>
	private async void OnRegisterClicked(object? sender, EventArgs e)
	{
		try
		{
			await Shell.Current.GoToAsync("///onboarding");
		}
		catch (Exception ex)
		{
			System.Diagnostics.Debug.WriteLine($"Navigation error: {ex}");
			await DisplayAlertAsync("Erreur", $"Impossible de naviguer: {ex.Message}", "OK");
		}
	}
}
