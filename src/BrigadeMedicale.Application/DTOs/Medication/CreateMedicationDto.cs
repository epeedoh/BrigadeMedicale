using System.ComponentModel.DataAnnotations;

namespace BrigadeMedicale.Application.DTOs.Medication;

public class CreateMedicationDto
{
    [Required(ErrorMessage = "Le nom du médicament est requis")]
    [MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? GenericName { get; set; }

    [MaxLength(100)]
    public string? Form { get; set; }

    [MaxLength(50)]
    public string? Strength { get; set; }

    [MaxLength(20)]
    public string? Unit { get; set; }
}
