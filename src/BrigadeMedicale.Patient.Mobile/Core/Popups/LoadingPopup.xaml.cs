using CommunityToolkit.Maui.Views;

namespace BrigadeMedicale.Patient.Mobile.Core.Popups;

public partial class LoadingPopup : Popup
{
	public LoadingPopup(string message = "Chargement...")
	{
		InitializeComponent();
		MessageLabel.Text = message;
	}
}
