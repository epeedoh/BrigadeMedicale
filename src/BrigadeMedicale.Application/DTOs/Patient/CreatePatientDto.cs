using System.ComponentModel.DataAnnotations;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.DTOs.Patient;

public class CreatePatientDto
{
    [Required(ErrorMessage = "Le prénom est requis")]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nom est requis")]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "La date de naissance est requise")]
    public DateTime DateOfBirth { get; set; }

    [Required(ErrorMessage = "Le sexe est requis")]
    public Gender Gender { get; set; }

    [Required(ErrorMessage = "Le numéro de téléphone est requis")]
    [Phone(ErrorMessage = "Le numéro de téléphone est invalide")]
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
}

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

    // Nouveaux champs - Secteur et Église
    public string? Sector { get; set; }
    public bool IsFromChurch { get; set; }
    public string? ChurchSector { get; set; }

    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}
