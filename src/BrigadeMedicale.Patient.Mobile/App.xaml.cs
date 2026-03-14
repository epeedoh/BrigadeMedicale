using Microsoft.Extensions.DependencyInjection;
using BrigadeMedicale.Patient.Mobile.Core.Converters;

namespace BrigadeMedicale.Patient.Mobile;

public partial class App : Application
{
	public App()
	{
		try
		{
			InitializeComponent();
		}
		catch (Exception ex)
		{
			System.Diagnostics.Debug.WriteLine($"App initialization error: {ex}");
		}
	}

	protected override Window CreateWindow(IActivationState? activationState)
	{
		try
		{
			return new Window(new AppShell());
		}
		catch (Exception ex)
		{
			System.Diagnostics.Debug.WriteLine($"AppShell creation error: {ex}");
			throw; // Re-throw to show meaningful error
		}
	}
}