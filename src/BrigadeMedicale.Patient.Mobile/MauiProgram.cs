using Microsoft.Extensions.Logging;
using BrigadeMedicale.Patient.Mobile.Core.Http;
using BrigadeMedicale.Patient.Mobile.Core.Storage;
using BrigadeMedicale.Patient.Mobile.Features.Auth.Services;
using BrigadeMedicale.Patient.Mobile.Features.Auth.ViewModels;
using BrigadeMedicale.Patient.Mobile.Features.Auth.Pages;
using BrigadeMedicale.Patient.Mobile.Features.Onboarding.ViewModels;
using BrigadeMedicale.Patient.Mobile.Features.Onboarding.Pages;
using BrigadeMedicale.Patient.Mobile.Features.Triage.Services;
using BrigadeMedicale.Patient.Mobile.Features.Triage.ViewModels;
using BrigadeMedicale.Patient.Mobile.Features.Triage.Pages;

namespace BrigadeMedicale.Patient.Mobile;

public static class MauiProgram
{
	public static MauiApp CreateMauiApp()
	{
		var builder = MauiApp.CreateBuilder();
		builder
			.UseMauiApp<App>()
			.UseMauiCommunityToolkit()
			.ConfigureFonts(fonts =>
			{
				fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
				fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
			})
			.ConfigureServices();

#if DEBUG
		builder.Logging.AddDebug();
#endif

		return builder.Build();
	}

	/// <summary>
	/// Configure l'injection de dépendances (DI)
	/// </summary>
	private static MauiAppBuilder ConfigureServices(this MauiAppBuilder builder)
	{
		// Stockage sécurisé des tokens
		builder.Services.AddSingleton<ITokenStorage, SecureTokenStorage>();

		// Client HTTP
		builder.Services.AddSingleton<IApiClient>(sp =>
		{
			var tokenStorage = sp.GetRequiredService<ITokenStorage>();
			var httpClient = new HttpClient();

#if DEBUG
			// Mode développement: utiliser localhost avec gestion des certificats SSL
			var baseUrl = "http://localhost:5238";
			return new ApiClient(httpClient, tokenStorage, baseUrl, useMockData: false);
#else
			// Mode production/standalone: utiliser les données de test si l'API est indisponible
			var baseUrl = "https://api.brigademedical.com";
			return new ApiClient(httpClient, tokenStorage, baseUrl, useMockData: true);
#endif
		});

		// Services
		builder.Services.AddSingleton<ITokenService, TokenService>();
		builder.Services.AddSingleton<ITriageService, TriageService>();

		// ViewModels
		builder.Services.AddSingleton<LoginViewModel>();
		builder.Services.AddSingleton<OnboardingViewModel>();
		builder.Services.AddSingleton<SuccessViewModel>();
		builder.Services.AddSingleton<TriageViewModel>();
		builder.Services.AddSingleton<TriageDashboardViewModel>();

		// Pages
		builder.Services.AddSingleton<MainPage>();
		builder.Services.AddSingleton<AppShell>();
		builder.Services.AddSingleton<LoginPage>();
		builder.Services.AddSingleton<OnboardingPage>();
		builder.Services.AddSingleton<SuccessPage>();
		builder.Services.AddSingleton<TriagePage>();
		builder.Services.AddSingleton<TriageDashboardPage>();

		return builder;
	}
}
