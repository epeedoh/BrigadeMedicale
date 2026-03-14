using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Domain.Entities;

public class Prescription : BaseEntity
{
    public Guid ConsultationId { get; set; }
    public Consultation Consultation { get; set; } = null!;

    public Guid MedicationId { get; set; }
    public Medication Medication { get; set; } = null!;

    public int QuantityPrescribed { get; set; }
    public int QuantityDispensed { get; set; } = 0;
    public string Dosage { get; set; } = string.Empty;
    public string? Instructions { get; set; }

    public PrescriptionStatus Status { get; set; }
    public DateTime? DispensedAt { get; set; }
    public Guid? DispensedBy { get; set; }
}
