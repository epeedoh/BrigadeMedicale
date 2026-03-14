using System.ComponentModel.DataAnnotations;

namespace BrigadeMedicale.Application.DTOs.Consultation;

public class UpdateConsultationDto
{
    [MaxLength(500)]
    public string? ChiefComplaint { get; set; }

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
