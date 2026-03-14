using System.Globalization;
using BrigadeMedicale.Patient.Mobile.Features.Triage.ViewModels;
using Microsoft.Maui.Controls;

namespace BrigadeMedicale.Patient.Mobile.Features.Triage.Converters;

/// <summary>
/// Convertisseur pour la couleur du badge d'urgence
/// </summary>
public class UrgencyLevelColorConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is TriageRecordDto triage)
        {
            return triage.UrgencyLevel switch
            {
                0 => Color.FromArgb("#4CAF50"), // Green
                1 => Color.FromArgb("#FFC107"), // Yellow
                2 => Color.FromArgb("#F44336"), // Red
                _ => Color.FromArgb("#9E9E9E")  // Gray
            };
        }
        return Color.FromArgb("#9E9E9E");
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

/// <summary>
/// Convertisseur pour le label d'urgence
/// </summary>
public class UrgencyLevelLabelConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is TriageRecordDto triage)
        {
            return triage.UrgencyLevel switch
            {
                0 => "🟢 Vert",
                1 => "🟡 Jaune",
                2 => "🔴 Rouge",
                _ => "-"
            };
        }
        return "-";
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

/// <summary>
/// Convertisseur pour le badge de statut
/// </summary>
public class StatusBadgeConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is TriageRecordDto triage)
        {
            return triage.Status switch
            {
                0 => "⏳ En attente",
                1 => "✓ Complété",
                2 => "✕ Annulé",
                _ => "-"
            };
        }
        return "-";
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

/// <summary>
/// Convertisseur pour la couleur du statut
/// </summary>
public class StatusColorConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is TriageRecordDto triage)
        {
            return triage.Status switch
            {
                0 => Color.FromArgb("#FF9800"), // Orange - Pending
                1 => Color.FromArgb("#4CAF50"), // Green - Completed
                2 => Color.FromArgb("#F44336"), // Red - Cancelled
                _ => Color.FromArgb("#999999")  // Gray
            };
        }
        return Color.FromArgb("#999999");
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

/// <summary>
/// Convertisseur pour afficher les signes vitaux
/// </summary>
public class VitalSignsConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is TriageRecordDto triage)
        {
            return $"🌡️ {triage.Temperature}°C | 💓 {triage.Pulse} bpm | 📊 {triage.SystolicBP}/{triage.DiastolicBP}";
        }
        return "-";
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

/// <summary>
/// Convertisseur pour inverser un booléen
/// </summary>
public class InvertedBoolConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return !(bool)(value ?? false);
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return !(bool)(value ?? false);
    }
}

/// <summary>
/// Convertisseur pour convertir un entier en booléen
/// </summary>
public class IntToBoolConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return value is int i && i > 0;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}
