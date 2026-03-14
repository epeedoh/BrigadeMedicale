using System.ComponentModel.DataAnnotations;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.DTOs.StockMovement;

public class CreateStockMovementDto
{
    [Required(ErrorMessage = "L'ID du médicament est requis")]
    public Guid MedicationId { get; set; }

    [Required(ErrorMessage = "Le type de mouvement est requis")]
    public MovementType MovementType { get; set; }

    [Required(ErrorMessage = "La quantité est requise")]
    [Range(1, int.MaxValue, ErrorMessage = "La quantité doit être supérieure à 0")]
    public int Quantity { get; set; }

    [MaxLength(100)]
    public string? LotNumber { get; set; }

    public DateTime? ExpiryDate { get; set; }

    [MaxLength(500)]
    public string? Reason { get; set; }
}
