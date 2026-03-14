# Exemples de Code - Brigade Médicale Patient

## 1. Ajouter une Page au Projet

### Créer une nouvelle page

```csharp
// Features/[Feature]/Pages/MyPage.xaml.cs
using BrigadeMedicale.Patient.Mobile.Features.[Feature].ViewModels;

namespace BrigadeMedicale.Patient.Mobile.Features.[Feature].Pages;

public partial class MyPage : ContentPage
{
    public MyPage(MyViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}
```

### Enregistrer dans MauiProgram.cs

```csharp
// ViewModels
builder.Services.AddSingleton<MyViewModel>();

// Pages
builder.Services.AddSingleton<MyPage>();
```

### Ajouter route dans AppShell.xaml

```xaml
<ShellContent
    Title="My Page"
    ContentTemplate="{DataTemplate local:MyPage}"
    Route="my-page" />
```

## 2. Créer un ViewModel

```csharp
using System.Windows.Input;

namespace BrigadeMedicale.Patient.Mobile.Features.[Feature].ViewModels;

public class MyViewModel : BindableObject
{
    private string _statusMessage = string.Empty;
    private bool _isLoading = false;
    private string _myProperty = string.Empty;

    // Properties bindables
    public string StatusMessage
    {
        get => _statusMessage;
        set => SetProperty(ref _statusMessage, value);
    }

    public bool IsLoading
    {
        get => _isLoading;
        set => SetProperty(ref _isLoading, value);
    }

    public string MyProperty
    {
        get => _myProperty;
        set => SetProperty(ref _myProperty, value);
    }

    // Commands
    public ICommand MyCommand { get; }

    public MyViewModel()
    {
        MyCommand = new Command(DoSomething);
    }

    private async void DoSomething()
    {
        IsLoading = true;
        try
        {
            // Votre logique
            StatusMessage = "Success!";
        }
        catch (Exception ex)
        {
            StatusMessage = $"Error: {ex.Message}";
            Debug.WriteLine($"Error: {ex}");
        }
        finally
        {
            IsLoading = false;
        }
    }
}
```

## 3. Appeler l'API

### Configuration ApiClient

```csharp
// MauiProgram.cs
builder.Services.AddSingleton<IApiClient>(sp =>
{
    var tokenStorage = sp.GetRequiredService<ITokenStorage>();
    var httpClient = new HttpClient();
    var baseUrl = "http://localhost:5238";
    return new ApiClient(httpClient, tokenStorage, baseUrl);
});
```

### Utiliser dans un Service

```csharp
public class PatientService : IPatientService
{
    private readonly IApiClient _apiClient;

    public PatientService(IApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<PatientDto?> GetPatientAsync()
    {
        var response = await _apiClient.GetAsync<PatientDto>("/patient/profile");
        if (response.Success)
            return response.Data;

        return null;
    }

    public async Task<bool> UpdatePatientAsync(PatientDto patient)
    {
        var response = await _apiClient.PostAsync<bool>("/patient/update", patient);
        return response.Success;
    }
}
```

## 4. Validation de Formulaire

### Validation Simple

```xaml
<!-- XAML -->
<Entry
    Text="{Binding Email}"
    Placeholder="Email"
    Style="{StaticResource FormEntry}" />

<Label
    Text="{Binding ErrorMessage}"
    IsVisible="{Binding ErrorMessage, Converter={StaticResource StringNullOrEmptyBoolConverter}}"
    Style="{StaticResource ErrorText}" />

<Button
    Text="Submit"
    Command="{Binding SubmitCommand}"
    IsEnabled="{Binding IsLoading, Converter={StaticResource InvertedBoolConverter}}" />
```

### ViewModel avec Validation

```csharp
public class MyFormViewModel : BindableObject
{
    private string _email = string.Empty;
    private string _errorMessage = string.Empty;

    public string Email
    {
        get => _email;
        set => SetProperty(ref _email, value);
    }

    public string ErrorMessage
    {
        get => _errorMessage;
        set => SetProperty(ref _errorMessage, value);
    }

    public ICommand SubmitCommand { get; }

    public MyFormViewModel()
    {
        SubmitCommand = new Command(Submit);
    }

    private void Submit()
    {
        if (!Validate())
            return;

        // Process form
    }

    private bool Validate()
    {
        if (string.IsNullOrWhiteSpace(Email))
        {
            ErrorMessage = "Email is required";
            return false;
        }

        if (!Email.Contains("@"))
        {
            ErrorMessage = "Email format invalid";
            return false;
        }

        ErrorMessage = string.Empty;
        return true;
    }
}
```

## 5. Navigation

### Navigation Simple

```csharp
// Vers une page nommée
await Shell.Current.GoToAsync("login");

// Vers page avec paramètres
await Shell.Current.GoToAsync($"details?id={itemId}");

// Retour
await Shell.Current.GoToAsync("..");
```

### Navigation avec Paramètres

```xaml
<!-- AppShell.xaml -->
<ShellContent
    Title="Details"
    Route="details"
    ContentTemplate="{DataTemplate local:DetailsPage}" />
```

```csharp
// DetailsPage.xaml.cs
[QueryProperty(nameof(ItemId), "id")]
public partial class DetailsPage : ContentPage
{
    private string _itemId;

    public string ItemId
    {
        get => _itemId;
        set
        {
            _itemId = value;
            OnItemIdChanged();
        }
    }

    private void OnItemIdChanged()
    {
        // Handle ItemId change
    }
}
```

## 6. Stockage Local

### Stocker un Token

```csharp
public class AuthService
{
    private readonly ITokenStorage _tokenStorage;

    public AuthService(ITokenStorage tokenStorage)
    {
        _tokenStorage = tokenStorage;
    }

    public async Task SaveTokenAsync(string token)
    {
        await _tokenStorage.SetTokenAsync(token);
    }

    public async Task<string?> GetTokenAsync()
    {
        return await _tokenStorage.GetTokenAsync();
    }

    public async Task ClearTokenAsync()
    {
        await _tokenStorage.ClearAllAsync();
    }
}
```

### Utiliser Preferences

```csharp
// Stocker
Preferences.Set("user_name", "John Doe");
Preferences.Set("login_count", 5);

// Récupérer
string name = Preferences.Get("user_name", "Unknown");
int count = Preferences.Get("login_count", 0);

// Supprimer
Preferences.Remove("user_name");
Preferences.Clear();
```

## 7. Threading et Async

### Mettre à jour UI depuis Thread

```csharp
// Mauvais (crash possible)
private async void FetchData()
{
    var data = await GetDataFromApiAsync();
    MyLabel.Text = data.Name; // Peut crasher si pas sur main thread
}

// Bon
private async void FetchData()
{
    var data = await GetDataFromApiAsync();
    MainThread.BeginInvokeOnMainThread(() =>
    {
        MyLabel.Text = data.Name;
    });
}
```

## 8. Convertisseurs Personnalisés

### Créer un Convertisseur

```csharp
using System.Globalization;

public class DateToStringConverter : IValueConverter
{
    public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is DateTime date)
            return date.ToString("dd/MM/yyyy");

        return string.Empty;
    }

    public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is string str && DateTime.TryParse(str, out var date))
            return date;

        return DateTime.Now;
    }
}
```

### Enregistrer et Utiliser

```xaml
<!-- App.xaml -->
<ResourceDictionary>
    <local:DateToStringConverter x:Key="DateToStringConverter" />
</ResourceDictionary>

<!-- Utiliser -->
<Label Text="{Binding BirthDate, Converter={StaticResource DateToStringConverter}}" />
```

## 9. Styles Personnalisés

### Créer un Style

```xaml
<!-- Styles.xaml -->
<Style TargetType="Label" x:Key="WarningLabel">
    <Setter Property="TextColor" Value="{StaticResource Warning}" />
    <Setter Property="FontSize" Value="14" />
    <Setter Property="FontFamily" Value="OpenSansSemibold" />
    <Setter Property="Margin" Value="0,10,0,0" />
</Style>

<!-- Utiliser -->
<Label Text="Attention!" Style="{StaticResource WarningLabel}" />
```

## 10. Images et Ressources

### Ajouter une Image

```xaml
<!-- Depuis Resources/Images -->
<Image
    Source="dotnet_bot.png"
    WidthRequest="100"
    HeightRequest="100"
    Aspect="AspectFit" />

<!-- Depuis URL -->
<Image
    Source="https://example.com/image.png"
    WidthRequest="100"
    HeightRequest="100"
    Aspect="AspectFit" />

<!-- Depuis Base64 (QR Code) -->
<Image
    Source="{Binding QrCodeBase64String}"
    WidthRequest="200"
    HeightRequest="200" />
```

## 11. Platform-Specific Code

```csharp
#if __ANDROID__
    // Android specific code
    var androidVersion = DeviceInfo.Version;
#elif __IOS__
    // iOS specific code
    var iosVersion = DeviceInfo.Version;
#elif WINDOWS
    // Windows specific code
#endif
```

## 12. Débogage

### Logging Basique

```csharp
Debug.WriteLine($"Value: {myValue}");
Debug.WriteLine($"Exception: {ex}");

// Binding debug
{Binding PropertyName, Mode=TwoWay, UpdateSourceTrigger=PropertyChanged}
```

### Ajouter Breakpoint

1. Cliquer sur la ligne
2. F9 pour toggle breakpoint
3. F5 pour démarrer debug
4. F10/F11 pour step through

## 13. Partager du Contenu

```csharp
private async void ShareContent()
{
    // Partager texte
    await Share.RequestAsync(new ShareTextRequest
    {
        Text = "Check out this app!",
        Title = "Share App"
    });

    // Partager fichier
    await Share.RequestAsync(new ShareFileRequest
    {
        Title = "Share QR Code",
        File = new ShareFile("path/to/file.png")
    });
}
```

## 14. Notifications et Alerts

```csharp
// Simple Alert
await DisplayAlert("Title", "Message", "OK");

// Confirm Dialog
bool result = await DisplayAlert("Confirm", "Are you sure?", "Yes", "No");

// Action Sheet
string action = await DisplayActionSheet("Choose", "Cancel", null, "Option1", "Option2");

// Prompt (input)
string result = await DisplayPromptAsync("Input", "Enter value");
```

## 15. Tests Unitaires

### Tester un ViewModel

```csharp
[TestClass]
public class LoginViewModelTests
{
    [TestMethod]
    public void Login_WithEmptyEmail_ShowsError()
    {
        // Arrange
        var tokenService = new Mock<ITokenService>();
        var viewModel = new LoginViewModel(tokenService.Object);

        // Act
        viewModel.Email = string.Empty;
        viewModel.LoginCommand.Execute(null);

        // Assert
        Assert.AreEqual("Email is required", viewModel.ErrorMessage);
    }

    [TestMethod]
    public async Task Login_WithValidData_CallsService()
    {
        // Arrange
        var tokenService = new Mock<ITokenService>();
        tokenService.Setup(x => x.LoginAsync(It.IsAny<string>(), It.IsAny<string>()))
            .ReturnsAsync(true);

        var viewModel = new LoginViewModel(tokenService.Object);
        viewModel.Email = "test@example.com";
        viewModel.Password = "password123";

        // Act
        viewModel.LoginCommand.Execute(null);
        await Task.Delay(100);

        // Assert
        tokenService.Verify(x => x.LoginAsync("test@example.com", "password123"), Times.Once);
    }
}
```

## Ressources Utiles

- Microsoft Docs MAUI: https://learn.microsoft.com/dotnet/maui
- XAML Documentation: https://learn.microsoft.com/dotnet/maui/xaml
- Community Toolkit: https://github.com/CommunityToolkit/Maui
- NuGet Packages: https://www.nuget.org

---

**Besoin d'aide?** Consultez IMPLEMENTATION_GUIDE.md pour plus de détails.
