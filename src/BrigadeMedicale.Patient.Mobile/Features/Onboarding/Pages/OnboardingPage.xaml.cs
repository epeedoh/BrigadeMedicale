using BrigadeMedicale.Patient.Mobile.Features.Onboarding.ViewModels;
using BrigadeMedicale.Patient.Mobile.Core.Models;
using BrigadeMedicale.Patient.Mobile.Core.Popups;
using CommunityToolkit.Maui.Views;

namespace BrigadeMedicale.Patient.Mobile.Features.Onboarding.Pages;

public partial class OnboardingPage : ContentPage
{
	private OnboardingViewModel _viewModel = null!;

	public OnboardingPage(OnboardingViewModel viewModel)
	{
		InitializeComponent();
		_viewModel = viewModel;
		BindingContext = viewModel;
	}

	/// <summary>
	/// Fermer la page et retourner à l'accueil
	/// </summary>
	private async void OnCloseClicked(object? sender, EventArgs e)
	{
		await Shell.Current.GoToAsync("///main");
	}

	/// <summary>
	/// Retour à la page précédente (Étape 1)
	/// </summary>
	private async void OnBackClicked(object? sender, EventArgs e)
	{
		await Shell.Current.GoToAsync("..");
	}

	/// <summary>
	/// Sélectionner le secteur via ActionSheet
	/// </summary>
	private async void OnSectorClicked(object? sender, EventArgs e)
	{
		try
		{
			var sectors = _viewModel.Sectors.ToList();
			var result = await DisplayActionSheetAsync(
				"Sélectionner un secteur",
				"Annuler",
				null,
				sectors.ToArray());

			if (!string.IsNullOrEmpty(result) && result != "Annuler")
			{
				_viewModel.SelectedSector = result;
				if (sender is Button btn)
					btn.Text = result;
			}
		}
		catch (Exception ex)
		{
			System.Diagnostics.Debug.WriteLine($"Error in OnSectorClicked: {ex.Message}");
		}
	}

	/// <summary>
	/// Sélectionner le groupe sanguin via ActionSheet
	/// </summary>
	private async void OnBloodTypeClicked(object? sender, EventArgs e)
	{
		try
		{
			var bloodTypes = new[] { "O-", "O+", "A-", "A+", "B-", "B+", "AB-", "AB+" };
			var result = await DisplayActionSheetAsync(
				"Sélectionner votre groupe sanguin",
				"Annuler",
				null,
				bloodTypes);

			if (!string.IsNullOrEmpty(result) && result != "Annuler")
			{
				_viewModel.BloodType = result;
				if (sender is Button btn)
					btn.Text = result;
			}
		}
		catch (Exception ex)
		{
			System.Diagnostics.Debug.WriteLine($"Error in OnBloodTypeClicked: {ex.Message}");
		}
	}

	/// <summary>
	/// Sélectionner le secteur d'église via ActionSheet
	/// </summary>
	private async void OnChurchSectorClicked(object? sender, EventArgs e)
	{
		try
		{
			var churchSectors = _viewModel.ChurchSectors.ToList();
			var result = await DisplayActionSheetAsync(
				"Sélectionner un secteur d'église",
				"Annuler",
				null,
				churchSectors.ToArray());

			if (!string.IsNullOrEmpty(result) && result != "Annuler")
			{
				_viewModel.SelectedChurchSector = result;
				if (sender is Button btn)
					btn.Text = result;
			}
		}
		catch (Exception ex)
		{
			System.Diagnostics.Debug.WriteLine($"Error in OnChurchSectorClicked: {ex.Message}");
		}
	}

	/// <summary>
	/// Gestion des changements de RadioButton pour le genre
	/// </summary>
	private void OnGenderChanged(object? sender, CheckedChangedEventArgs e)
	{
		if (e.Value && sender is RadioButton radioButton)
		{
			if (radioButton.Value is Gender gender)
			{
				_viewModel.SelectedGender = gender;
			}
		}
	}

	/// <summary>
	/// Afficher la popup de confirmation avant inscription
	/// </summary>
	private async void OnRegisterClicked(object? sender, EventArgs e)
	{
		// Afficher popup de confirmation avec récapitulatif
		var fullName = $"{_viewModel.FirstName} {_viewModel.LastName}";
		var popup = new ConfirmRegistrationPopup(fullName, _viewModel.PhoneNumber, _viewModel.SelectedSector);

		var result = await this.ShowPopupAsync(popup);

		if (result is bool confirmed && confirmed)
		{
			// Afficher popup de chargement
			var loadingPopup = new LoadingPopup("Inscription en cours...");
			MainThread.BeginInvokeOnMainThread(async () =>
			{
				await this.ShowPopupAsync(loadingPopup);
			});

			// Exécuter la commande d'inscription
			if (_viewModel.RegisterCommand.CanExecute(null))
			{
				_viewModel.RegisterCommand.Execute(null);
			}

			// La popup de chargement sera fermée automatiquement lors de la navigation
		}
	}
}
