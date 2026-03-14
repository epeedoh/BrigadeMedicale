namespace BrigadeMedicale.Domain.Entities;

/// <summary>
/// Training quiz question entity - represents a single quiz question within a training module
/// </summary>
public class TrainingQuiz : BaseEntity
{
    /// <summary>
    /// Unique identifier for the quiz question (e.g., "q1-1")
    /// </summary>
    public string QuizId { get; set; } = string.Empty;

    /// <summary>
    /// Module this quiz belongs to
    /// </summary>
    public Guid TrainingModuleId { get; set; }
    public TrainingModule TrainingModule { get; set; } = null!;

    /// <summary>
    /// The question text
    /// </summary>
    public string Question { get; set; } = string.Empty;

    /// <summary>
    /// JSON array of answer options
    /// Example: ["Option 1", "Option 2", "Option 3"]
    /// </summary>
    public string Options { get; set; } = string.Empty;

    /// <summary>
    /// Index of the correct answer (0-based)
    /// </summary>
    public int AnswerIndex { get; set; }

    /// <summary>
    /// Display order in the quiz
    /// </summary>
    public int Order { get; set; }
}
