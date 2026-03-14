namespace BrigadeMedicale.Patient.Mobile.Core.Models;

/// <summary>
/// Genre du patient
/// </summary>
public enum Gender
{
    Male = 0,
    Female = 1,
    Other = 2
}

/// <summary>
/// Statut de consultation
/// </summary>
public enum ConsultationStatus
{
    InProgress = 0,
    Completed = 1,
    Cancelled = 2
}

/// <summary>
/// Statut de prescription
/// </summary>
public enum PrescriptionStatus
{
    Pending = 0,
    PartiallyDispensed = 1,
    Dispensed = 2,
    Cancelled = 3
}

/// <summary>
/// Statut de test laboratoire
/// </summary>
public enum LabTestStatus
{
    Requested = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3
}

/// <summary>
/// Secteurs disponibles
/// </summary>
public static class SectorsList
{
    public static readonly string[] All = new[]
    {
        "EST 1",
        "EST 2",
        "OUEST 1",
        "OUEST 2",
        "SUD 1",
        "SUD 2",
        "NORD 1"
    };
}

/// <summary>
/// Secteurs d'église
/// </summary>
public static class ChurchSectorsList
{
    public static readonly string[] All = new[]
    {
        "Église principale",
        "Église EST",
        "Église OUEST",
        "Église SUD",
        "Église NORD"
    };
}

/// <summary>
/// Niveau d'urgence du triage
/// </summary>
public enum UrgencyLevel
{
    Green = 0,     // Non urgent
    Yellow = 1,    // Peu urgent
    Red = 2        // Très urgent
}

/// <summary>
/// Statut du triage
/// </summary>
public enum TriageStatus
{
    Pending = 0,
    Completed = 1,
    Cancelled = 2
}
