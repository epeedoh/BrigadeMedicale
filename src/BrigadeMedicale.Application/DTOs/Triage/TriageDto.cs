using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.DTOs.Triage;

public class TriageDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string PatientName { get; set; } = string.Empty;
    public string PatientNumber { get; set; } = string.Empty;
    public Guid InfirmierId { get; set; }
    public string InfirmierName { get; set; } = string.Empty;

    public decimal Temperature { get; set; }
    public int Pulse { get; set; }
    public int SystolicBP { get; set; }
    public int DiastolicBP { get; set; }
    public decimal Weight { get; set; }
    public decimal Height { get; set; }
    public int? SpO2 { get; set; }
    public int? RespiratoryRate { get; set; }
    public decimal? BMI { get; set; }

    public string Complaint { get; set; } = string.Empty;
    public UrgencyLevel UrgencyLevel { get; set; }
    public string? Notes { get; set; }

    public TriageStatus Status { get; set; }
    public DateTime RecordedAt { get; set; }
    public Guid? ConsultationId { get; set; }
    public DateTime CreatedAt { get; set; }
}
