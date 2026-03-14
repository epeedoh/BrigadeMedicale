namespace BrigadeMedicale.Domain.Entities;

/// <summary>
/// Training step entity - represents a single step/chapter within a training module
/// </summary>
public class TrainingStep : BaseEntity
{
    /// <summary>
    /// Unique identifier for the step (e.g., "admin-001-step-1")
    /// </summary>
    public string StepId { get; set; } = string.Empty;

    /// <summary>
    /// Module this step belongs to
    /// </summary>
    public Guid TrainingModuleId { get; set; }
    public TrainingModule TrainingModule { get; set; } = null!;

    /// <summary>
    /// Step title
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Step content (markdown supported)
    /// </summary>
    public string Content { get; set; } = string.Empty;

    /// <summary>
    /// Display order within the module
    /// </summary>
    public int Order { get; set; }

    /// <summary>
    /// Optional media URLs (comma-separated)
    /// </summary>
    public string Media { get; set; } = string.Empty;
}
