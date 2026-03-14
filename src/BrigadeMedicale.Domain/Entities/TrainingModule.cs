using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Domain.Entities;

/// <summary>
/// Training module entity - represents a single training course
/// Each module has multiple steps and is assigned to specific audience(s)
/// </summary>
public class TrainingModule : BaseEntity
{
    /// <summary>
    /// Unique identifier for the module (e.g., "admin-001-management")
    /// </summary>
    public string TrainingId { get; set; } = string.Empty;

    /// <summary>
    /// Module title
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Long description of the module
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Short description (for preview/cards)
    /// </summary>
    public string ShortDescription { get; set; } = string.Empty;

    /// <summary>
    /// Duration in minutes
    /// </summary>
    public int DurationMinutes { get; set; }

    /// <summary>
    /// Difficulty level (e.g., "Débutant", "Intermédiaire", "Avancé")
    /// </summary>
    public string Level { get; set; } = "Débutant";

    /// <summary>
    /// Comma-separated tags for search/filtering
    /// </summary>
    public string Tags { get; set; } = string.Empty;

    /// <summary>
    /// URL to module image (optional)
    /// </summary>
    public string? ImageUrl { get; set; }

    /// <summary>
    /// Audience this module is assigned to
    /// </summary>
    public TrainingAudience Audience { get; set; }

    /// <summary>
    /// Display order in the catalog
    /// </summary>
    public int Order { get; set; }

    /// <summary>
    /// Navigation property - module steps
    /// </summary>
    public List<TrainingStep> Steps { get; set; } = [];

    /// <summary>
    /// Navigation property - quiz questions
    /// </summary>
    public List<TrainingQuiz> Quiz { get; set; } = [];

    /// <summary>
    /// Navigation property - user progress tracking
    /// </summary>
    public List<TrainingProgress> UserProgress { get; set; } = [];
}
