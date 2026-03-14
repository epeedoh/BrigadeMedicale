namespace BrigadeMedicale.Domain.Entities;

/// <summary>
/// Training progress entity - tracks user's progress through a training module
/// </summary>
public class TrainingProgress : BaseEntity
{
    /// <summary>
    /// User who is taking the training
    /// </summary>
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    /// <summary>
    /// Training module being tracked
    /// </summary>
    public Guid TrainingModuleId { get; set; }
    public TrainingModule TrainingModule { get; set; } = null!;

    /// <summary>
    /// Progress status: NOT_STARTED, IN_PROGRESS, COMPLETED
    /// </summary>
    public string Status { get; set; } = "NOT_STARTED";

    /// <summary>
    /// When the training was started (null if not started)
    /// </summary>
    public DateTime? StartedAt { get; set; }

    /// <summary>
    /// When the training was completed (null if not completed)
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// Quiz score (0-100, null if no quiz taken)
    /// </summary>
    public int? QuizScore { get; set; }

    /// <summary>
    /// JSON array of completed step IDs
    /// Example: ["step-1", "step-2"]
    /// </summary>
    public string CompletedSteps { get; set; } = "[]";

    /// <summary>
    /// Current step index the user is on
    /// </summary>
    public int CurrentStepIndex { get; set; }
}
