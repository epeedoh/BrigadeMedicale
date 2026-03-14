namespace BrigadeMedicale.Application.DTOs;

/// <summary>
/// DTO for training step
/// </summary>
public class TrainingStepDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public int Order { get; set; }
    public List<string> Media { get; set; } = [];
}

/// <summary>
/// DTO for training quiz question
/// </summary>
public class TrainingQuizDto
{
    public string Id { get; set; } = string.Empty;
    public string Question { get; set; } = string.Empty;
    public List<string> Options { get; set; } = [];
    public int AnswerIndex { get; set; }
    public int Order { get; set; }
}

/// <summary>
/// DTO for training module (full response)
/// </summary>
public class TrainingModuleDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public string Level { get; set; } = string.Empty;
    public List<string> Tags { get; set; } = [];
    public string? ImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<TrainingStepDto> Steps { get; set; } = [];
    public List<TrainingQuizDto>? Quiz { get; set; } = [];
}

/// <summary>
/// DTO for creating a training module (admin only)
/// </summary>
public class CreateTrainingModuleDto
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string ShortDescription { get; set; } = string.Empty;
    public int DurationMinutes { get; set; }
    public string Level { get; set; } = "Débutant";
    public List<string> Tags { get; set; } = [];
    public string? ImageUrl { get; set; }
    public string Audience { get; set; } = string.Empty;
    public List<TrainingStepDto> Steps { get; set; } = [];
    public List<TrainingQuizDto>? Quiz { get; set; }
}

/// <summary>
/// DTO for training progress
/// </summary>
public class TrainingProgressDto
{
    public string ModuleId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime? StartedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public int? QuizScore { get; set; }
    public List<string> CompletedSteps { get; set; } = [];
    public int CurrentStepIndex { get; set; }
}
