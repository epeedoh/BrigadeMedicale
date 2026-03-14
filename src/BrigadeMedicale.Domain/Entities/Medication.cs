namespace BrigadeMedicale.Domain.Entities;

public class Medication : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? GenericName { get; set; }
    public string? Form { get; set; }
    public string? Strength { get; set; }
    public string? Unit { get; set; }
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<StockMovement> StockMovements { get; set; } = new List<StockMovement>();
}
