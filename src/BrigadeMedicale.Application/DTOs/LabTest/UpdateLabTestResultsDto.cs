using System.ComponentModel.DataAnnotations;

namespace BrigadeMedicale.Application.DTOs.LabTest;

public class UpdateLabTestResultsDto
{
    [Required(ErrorMessage = "Les résultats sont requis")]
    [MaxLength(5000)]
    public string Results { get; set; } = string.Empty;
}
