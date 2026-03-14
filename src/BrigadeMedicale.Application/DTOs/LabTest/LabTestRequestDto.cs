using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.DTOs.LabTest;

public class LabTestRequestDto
{
    public Guid Id { get; set; }
    public Guid ConsultationId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientNumber { get; set; } = string.Empty;
    public string TestName { get; set; } = string.Empty;
    public string? Instructions { get; set; }
    public LabTestStatus Status { get; set; }
    public string? Results { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid? CompletedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}
