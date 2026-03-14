using CommunityToolkit.Maui.Views;

namespace BrigadeMedicale.Patient.Mobile.Core.Popups;

public partial class ConfirmRegistrationPopup : Popup
{
	public ConfirmRegistrationPopup(string name, string phone, string sector)
	{
		InitializeComponent();

		NameLabel.Text = name ?? "-";
		PhoneLabel.Text = phone ?? "-";
		SectorLabel.Text = sector ?? "-";
	}

	private void OnCancelClicked(object sender, EventArgs e)
	{
		Close(false);
	}

	private void OnConfirmClicked(object sender, EventArgs e)
	{
		Close(true);
	}
}
