using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Domain.Entities;

public class LabTestRequest : BaseEntity
{
    public Guid ConsultationId { get; set; }
    public Consultation Consultation { get; set; } = null!;

    public string TestName { get; set; } = string.Empty;
    public string? Instructions { get; set; }

    public LabTestStatus Status { get; set; }
    public string? Results { get; set; }
    public DateTime? CompletedAt { get; set; }
    public Guid? CompletedBy { get; set; }
}
