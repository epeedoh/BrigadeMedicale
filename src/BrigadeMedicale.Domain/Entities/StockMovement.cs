using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Domain.Entities;

public class StockMovement : BaseEntity
{
    public Guid MedicationId { get; set; }
    public Medication Medication { get; set; } = null!;

    public MovementType MovementType { get; set; }
    public int Quantity { get; set; }
    public string? LotNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Reason { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid? PrescriptionId { get; set; }
}
