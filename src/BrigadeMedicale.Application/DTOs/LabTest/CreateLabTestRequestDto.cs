using System.ComponentModel.DataAnnotations;

namespace BrigadeMedicale.Application.DTOs.LabTest;

public class CreateLabTestRequestDto
{
    [Required(ErrorMessage = "L'ID de la consultation est requis")]
    public Guid ConsultationId { get; set; }

    [Required(ErrorMessage = "Le nom du test est requis")]
    [MaxLength(200)]
    public string TestName { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Instructions { get; set; }
}
