using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Domain.Entities;

public class Patient : BaseEntity
{
    public string PatientNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? AlternativePhone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? EmergencyContact { get; set; }
    public string? EmergencyPhone { get; set; }
    public string? BloodType { get; set; }
    public string? Allergies { get; set; }
    public string? ChronicDiseases { get; set; }

    // Nouveaux champs - Secteur et Église
    public string? Sector { get; set; }
    public bool IsFromChurch { get; set; } = false;
    public string? ChurchSector { get; set; }

    public string RegistrationSource { get; set; } = "ACCUEIL";
    public bool IsActive { get; set; } = true;

    public Guid? CreatedBy { get; set; }
    public Guid? UpdatedBy { get; set; }

    // Calculated property
    public int Age => DateTime.UtcNow.Year - DateOfBirth.Year;
}

public class PatientAccessToken : BaseEntity
{
    public Guid PatientId { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime? RevokedAt { get; set; }
    public Guid? RevokedBy { get; set; }
}
