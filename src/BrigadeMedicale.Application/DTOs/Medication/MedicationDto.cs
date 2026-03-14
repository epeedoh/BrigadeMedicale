namespace BrigadeMedicale.Application.DTOs.Medication;

public class MedicationDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? GenericName { get; set; }
    public string? Form { get; set; }
    public string? Strength { get; set; }
    public string? Unit { get; set; }
    public int CurrentStock { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
