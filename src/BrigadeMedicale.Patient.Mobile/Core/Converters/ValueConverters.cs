using System.Globalization;

namespace BrigadeMedicale.Patient.Mobile.Core.Converters;

/// <summary>
/// Convertit une valeur booléenne en sa valeur inverse
/// </summary>
public class InvertedBoolConverter : IValueConverter
{
	public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
	{
		if (value is bool boolValue)
			return !boolValue;

		return false;
	}

	public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
	{
		if (value is bool boolValue)
			return !boolValue;

		return false;
	}
}

/// <summary>
/// Convertit une chaîne vide ou null en booléen
/// </summary>
public class StringNullOrEmptyBoolConverter : IValueConverter
{
	public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
	{
		if (value is string str)
			return !string.IsNullOrWhiteSpace(str);

		return false;
	}

	public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
	{
		throw new NotImplementedException();
	}
}

/// <summary>
/// Convertit un numéro d'étape en valeur de progression (0-1)
/// </summary>
public class ProgressConverter : IValueConverter
{
	public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
	{
		if (value is int step)
		{
			return (step - 1) / 2.0; // Pour 2 étapes: étape 1 = 0, étape 2 = 0.5
		}

		return 0.0;
	}

	public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
	{
		throw new NotImplementedException();
	}
}

/// <summary>
/// Convertit un numéro d'étape en booléen pour afficher/masquer une étape spécifique
/// </summary>
public class StepConverter : IValueConverter
{
	public object Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
	{
		if (value is int currentStep && parameter is string paramStep)
		{
			if (int.TryParse(paramStep, out int step))
			{
				return currentStep == step;
			}
		}

		return false;
	}

	public object ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
	{
		throw new NotImplementedException();
	}
}
