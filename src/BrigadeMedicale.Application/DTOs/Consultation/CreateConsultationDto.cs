using System.ComponentModel.DataAnnotations;

namespace BrigadeMedicale.Application.DTOs.Consultation;

public class CreateConsultationDto
{
    [Required(ErrorMessage = "L'ID du patient est requis")]
    public Guid PatientId { get; set; }

    [Required(ErrorMessage = "Le motif de consultation est requis")]
    [MaxLength(500)]
    public string ChiefComplaint { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? History { get; set; }

    [MaxLength(2000)]
    public string? PhysicalExam { get; set; }

    [MaxLength(1000)]
    public string? VitalSigns { get; set; }

    [MaxLength(1000)]
    public string? Diagnosis { get; set; }

    [MaxLength(2000)]
    public string? Treatment { get; set; }

    [MaxLength(2000)]
    public string? Notes { get; set; }
}
