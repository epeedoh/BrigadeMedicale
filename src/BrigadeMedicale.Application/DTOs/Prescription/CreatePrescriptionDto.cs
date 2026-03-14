using System.ComponentModel.DataAnnotations;

namespace BrigadeMedicale.Application.DTOs.Prescription;

public class CreatePrescriptionDto
{
    [Required(ErrorMessage = "L'ID de la consultation est requis")]
    public Guid ConsultationId { get; set; }

    [Required(ErrorMessage = "L'ID du médicament est requis")]
    public Guid MedicationId { get; set; }

    [Required(ErrorMessage = "La quantité prescrite est requise")]
    [Range(1, int.MaxValue, ErrorMessage = "La quantité doit être supérieure à 0")]
    public int QuantityPrescribed { get; set; }

    [Required(ErrorMessage = "La posologie est requise")]
    [MaxLength(500)]
    public string Dosage { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Instructions { get; set; }
}
