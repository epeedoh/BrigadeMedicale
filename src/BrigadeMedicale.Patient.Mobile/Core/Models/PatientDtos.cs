namespace BrigadeMedicale.Patient.Mobile.Core.Models;

/// <summary>
/// DTO pour la réponse API standard
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
}

/// <summary>
/// DTO de création patient (pour l'enregistrement)
/// </summary>
public class CreatePatientDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? BloodType { get; set; }
    public string? Allergies { get; set; }
    public string? ChronicDiseases { get; set; }
    public string? Sector { get; set; }
    public bool IsFromChurch { get; set; }
    public string? ChurchSector { get; set; }
}

/// <summary>
/// DTO pour l'enregistrement réussi
/// </summary>
public class RegisterResponseDto
{
    public string PatientNumber { get; set; } = string.Empty;
    public string AccessToken { get; set; } = string.Empty;
    public string QrCodeDataUrl { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
}

/// <summary>
/// DTO pour la connexion par téléphone
/// </summary>
public class PatientLoginByPhoneDto
{
    public string PatientNumber { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
}

/// <summary>
/// DTO pour la connexion par token
/// </summary>
public class PatientLoginByTokenDto
{
    public string Token { get; set; } = string.Empty;
}

/// <summary>
/// DTO du profil patient
/// </summary>
public class PatientDto
{
    public Guid Id { get; set; }
    public string PatientNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public int Age { get; set; }
    public Gender Gender { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? BloodType { get; set; }
    public string? Allergies { get; set; }
    public string? ChronicDiseases { get; set; }
    public string? Sector { get; set; }
    public bool IsFromChurch { get; set; }
    public string? ChurchSector { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}

/// <summary>
/// DTO d'une visite
/// </summary>
public class VisitDto
{
    public Guid Id { get; set; }
    public DateTime VisitDate { get; set; }
    public string? Reason { get; set; }
    public Guid? ConsultationId { get; set; }
    public bool HasConsultation { get; set; }
    public bool HasLabTests { get; set; }
    public bool HasPrescriptions { get; set; }
}

/// <summary>
/// DTO d'une consultation
/// </summary>
public class ConsultationDto
{
    public Guid Id { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string DoctorName { get; set; } = string.Empty;
    public string ChiefComplaint { get; set; } = string.Empty;
    public string? Diagnosis { get; set; }
    public ConsultationStatus Status { get; set; }
    public DateTime ConsultationDate { get; set; }
    public DateTime? ClosedAt { get; set; }
}

/// <summary>
/// DTO d'un test laboratoire
/// </summary>
public class LabTestDto
{
    public Guid Id { get; set; }
    public string TestName { get; set; } = string.Empty;
    public string? TestType { get; set; }
    public LabTestStatus Status { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public string? Results { get; set; }
    public string? NormalRange { get; set; }
}

/// <summary>
/// DTO d'une prescription
/// </summary>
public class PrescriptionDto
{
    public Guid Id { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public string? Dosage { get; set; }
    public int QuantityPrescribed { get; set; }
    public int QuantityDispensed { get; set; }
    public PrescriptionStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

/// <summary>
/// DTO d'une annonce
/// </summary>
public class AnnouncementDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public string? Category { get; set; }
}

/// <summary>
/// DTO pour créer un triage (prise de constantes)
/// </summary>
public class CreateTriageDto
{
    public Guid PatientId { get; set; }
    public double Temperature { get; set; }
    public int Systolic { get; set; }
    public int Diastolic { get; set; }
    public int Pulse { get; set; }
    public double Weight { get; set; }
    public int Height { get; set; }
    public int? SpO2 { get; set; }
    public string Complaint { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public UrgencyLevel UrgencyLevel { get; set; }
}

/// <summary>
/// DTO pour un enregistrement de triage
/// </summary>
public class TriageRecordDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? RecordedBy { get; set; }
    public DateTime RecordedAt { get; set; }
    public double Temperature { get; set; }
    public int Systolic { get; set; }
    public int Diastolic { get; set; }
    public int Pulse { get; set; }
    public double Weight { get; set; }
    public int Height { get; set; }
    public int? SpO2 { get; set; }
    public double? IMC { get; set; }
    public string Complaint { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public UrgencyLevel UrgencyLevel { get; set; }
    public TriageStatus Status { get; set; }
    public DateTime? CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
