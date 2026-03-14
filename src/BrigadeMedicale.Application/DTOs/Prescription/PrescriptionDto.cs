using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.DTOs.Prescription;

public class PrescriptionDto
{
    public Guid Id { get; set; }
    public Guid ConsultationId { get; set; }
    public Guid MedicationId { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public int QuantityPrescribed { get; set; }
    public int QuantityDispensed { get; set; }
    public string Dosage { get; set; } = string.Empty;
    public string? Instructions { get; set; }
    public PrescriptionStatus Status { get; set; }
    public DateTime? DispensedAt { get; set; }
    public Guid? DispensedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}
