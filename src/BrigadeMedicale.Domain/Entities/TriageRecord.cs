using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Domain.Entities;

public class TriageRecord : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public Guid InfirmierId { get; set; }
    public User Infirmier { get; set; } = null!;

    // Vital Signs
    public decimal Temperature { get; set; }  // °C
    public int Pulse { get; set; }            // bpm
    public int SystolicBP { get; set; }       // mmHg
    public int DiastolicBP { get; set; }      // mmHg
    public decimal Weight { get; set; }       // kg
    public decimal Height { get; set; }       // cm
    public int? SpO2 { get; set; }            // % (optional)
    public int? RespiratoryRate { get; set; } // respirations/min (optional)

    // Chief Complaint & Assessment
    public string Complaint { get; set; } = string.Empty;  // Motif de consultation
    public UrgencyLevel UrgencyLevel { get; set; }
    public string? Notes { get; set; }

    // Status
    public TriageStatus Status { get; set; } = TriageStatus.Completed;
    public DateTime RecordedAt { get; set; }

    // Link to Consultation (optional)
    public Guid? ConsultationId { get; set; }
    public Consultation? Consultation { get; set; }

    /// <summary>
    /// Calculated BMI: Weight (kg) / (Height (m))²
    /// </summary>
    public decimal? CalculatedBMI => Height > 0 ? Weight / ((Height / 100) * (Height / 100)) : null;
}
