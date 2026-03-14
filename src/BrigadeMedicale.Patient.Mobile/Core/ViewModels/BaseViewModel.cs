using System.Runtime.CompilerServices;
using CommunityToolkit.Mvvm.ComponentModel;

namespace BrigadeMedicale.Patient.Mobile.Core.ViewModels;

/// <summary>
/// Classe de base pour tous les ViewModels avec support MVVM
/// </summary>
public class BaseViewModel : ObservableObject
{
    protected bool SetProperty<T>(ref T backingStore, T value, [CallerMemberName] string propertyName = "")
    {
        if (EqualityComparer<T>.Default.Equals(backingStore, value))
            return false;

        backingStore = value;
        OnPropertyChanged(propertyName);
        return true;
    }
}
