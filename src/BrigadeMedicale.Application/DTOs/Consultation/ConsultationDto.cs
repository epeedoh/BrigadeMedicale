using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.DTOs.Consultation;

public class ConsultationDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientNumber { get; set; } = string.Empty;
    public Guid DoctorId { get; set; }
    public string DoctorName { get; set; } = string.Empty;
    public string ChiefComplaint { get; set; } = string.Empty;
    public string? History { get; set; }
    public string? PhysicalExam { get; set; }
    public string? VitalSigns { get; set; }
    public string? Diagnosis { get; set; }
    public string? Treatment { get; set; }
    public string? Notes { get; set; }
    public ConsultationStatus Status { get; set; }
    public DateTime ConsultationDate { get; set; }
    public DateTime? ClosedAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
