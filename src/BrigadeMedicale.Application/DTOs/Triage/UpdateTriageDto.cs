using System.ComponentModel.DataAnnotations;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.DTOs.Triage;

public class UpdateTriageDto
{
    [Range(35.0, 42.0, ErrorMessage = "La température doit être entre 35°C et 42°C")]
    public decimal? Temperature { get; set; }

    [Range(30, 200, ErrorMessage = "Le pouls doit être entre 30 et 200 bpm")]
    public int? Pulse { get; set; }

    [Range(70, 250, ErrorMessage = "La tension systolique doit être entre 70 et 250 mmHg")]
    public int? SystolicBP { get; set; }

    [Range(40, 150, ErrorMessage = "La tension diastolique doit être entre 40 et 150 mmHg")]
    public int? DiastolicBP { get; set; }

    [Range(1, 300, ErrorMessage = "Le poids doit être entre 1 et 300 kg")]
    public decimal? Weight { get; set; }

    [Range(50, 250, ErrorMessage = "La taille doit être entre 50 et 250 cm")]
    public decimal? Height { get; set; }

    [Range(80, 100, ErrorMessage = "SpO2 doit être entre 80 et 100%")]
    public int? SpO2 { get; set; }

    [Range(8, 30, ErrorMessage = "La fréquence respiratoire doit être entre 8 et 30")]
    public int? RespiratoryRate { get; set; }

    [MaxLength(500, ErrorMessage = "Le motif ne peut pas dépasser 500 caractères")]
    public string? Complaint { get; set; }

    public UrgencyLevel? UrgencyLevel { get; set; }

    [MaxLength(1000, ErrorMessage = "Les notes ne peuvent pas dépasser 1000 caractères")]
    public string? Notes { get; set; }
}
