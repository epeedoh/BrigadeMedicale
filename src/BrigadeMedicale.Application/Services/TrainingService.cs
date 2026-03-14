using System.Text.Json;
using BrigadeMedicale.Application.DTOs;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.Services;

public class TrainingService : ITrainingService
{
    private readonly ITrainingRepository _repository;

    /// <summary>
    /// Mapping roles to training audiences
    /// </summary>
    private readonly Dictionary<string, TrainingAudience> _roleToAudienceMap = new()
    {
        { "ADMIN", TrainingAudience.StaffAdmin },
        { "ACCUEIL", TrainingAudience.StaffAccueil },
        { "MEDECIN", TrainingAudience.StaffMedecin },
        { "LABORANTIN", TrainingAudience.StaffLaborantin },
        { "PHARMACIEN", TrainingAudience.StaffPharmacien },
        { "SUPERVISEUR", TrainingAudience.StaffSuperviseur },
        { "PATIENT", TrainingAudience.Patient }
    };

    public TrainingService(ITrainingRepository repository)
    {
        _repository = repository;
    }

    // ===================== Module Operations =====================

    public async Task<TrainingModuleDto?> GetModuleByIdAsync(Guid id)
    {
        var module = await _repository.GetModuleByIdAsync(id);
        return module != null ? MapToDto(module) : null;
    }

    /// <summary>
    /// Get module by TrainingId (the string GUID returned in API responses)
    /// This is the correct method to use when looking up from frontend requests
    /// </summary>
    public async Task<TrainingModuleDto?> GetModuleByTrainingIdAsync(string trainingId)
    {
        var module = await _repository.GetModuleByTrainingIdAsync(trainingId);
        return module != null ? MapToDto(module) : null;
    }

    public async Task<List<TrainingModuleDto>> GetModulesByAudienceAsync(TrainingAudience audience)
    {
        var modules = await _repository.GetModulesByAudienceAsync(audience);
        return modules.Select(MapToDto).ToList();
    }

    public async Task<List<TrainingModuleDto>> GetAllModulesAsync()
    {
        var modules = await _repository.GetAllModulesAsync();
        return modules.Select(MapToDto).ToList();
    }

    public async Task<TrainingModuleDto> CreateModuleAsync(CreateTrainingModuleDto dto)
    {
        var audience = Enum.Parse<TrainingAudience>(
            dto.Audience.Replace("-", ""),
            ignoreCase: true
        );

        var module = new TrainingModule
        {
            TrainingId = Guid.NewGuid().ToString(),
            Title = dto.Title,
            Description = dto.Description,
            ShortDescription = dto.ShortDescription,
            DurationMinutes = dto.DurationMinutes,
            Level = dto.Level,
            Tags = string.Join(",", dto.Tags),
            ImageUrl = dto.ImageUrl,
            Audience = audience,
            Order = 0
        };

        // Add steps
        if (dto.Steps.Any())
        {
            module.Steps = dto.Steps.Select((step, index) => new TrainingStep
            {
                StepId = Guid.NewGuid().ToString(),
                Title = step.Title,
                Content = step.Content,
                Order = index + 1,
                Media = string.Join(",", step.Media)
            }).ToList();
        }

        // Add quiz
        if (dto.Quiz?.Any() == true)
        {
            module.Quiz = dto.Quiz.Select((quiz, index) => new TrainingQuiz
            {
                QuizId = Guid.NewGuid().ToString(),
                Question = quiz.Question,
                Options = JsonSerializer.Serialize(quiz.Options),
                AnswerIndex = quiz.AnswerIndex,
                Order = index + 1
            }).ToList();
        }

        var created = await _repository.CreateModuleAsync(module);
        return MapToDto(created);
    }

    public async Task UpdateModuleAsync(Guid id, CreateTrainingModuleDto dto)
    {
        var module = await _repository.GetModuleByIdAsync(id);
        if (module == null)
            throw new Exception($"Training module {id} not found");

        module.Title = dto.Title;
        module.Description = dto.Description;
        module.ShortDescription = dto.ShortDescription;
        module.DurationMinutes = dto.DurationMinutes;
        module.Level = dto.Level;
        module.Tags = string.Join(",", dto.Tags);
        module.ImageUrl = dto.ImageUrl;

        // Update steps and quiz...
        // Simplified for now - delete old and add new
        module.Steps.Clear();
        module.Quiz.Clear();

        if (dto.Steps.Any())
        {
            module.Steps = dto.Steps.Select((step, index) => new TrainingStep
            {
                StepId = Guid.NewGuid().ToString(),
                Title = step.Title,
                Content = step.Content,
                Order = index + 1,
                Media = string.Join(",", step.Media)
            }).ToList();
        }

        if (dto.Quiz?.Any() == true)
        {
            module.Quiz = dto.Quiz.Select((quiz, index) => new TrainingQuiz
            {
                QuizId = Guid.NewGuid().ToString(),
                Question = quiz.Question,
                Options = JsonSerializer.Serialize(quiz.Options),
                AnswerIndex = quiz.AnswerIndex,
                Order = index + 1
            }).ToList();
        }

        await _repository.UpdateModuleAsync(module);
    }

    public async Task DeleteModuleAsync(Guid id)
    {
        await _repository.DeleteModuleAsync(id);
    }

    // ===================== Progress Operations =====================

    public async Task<TrainingProgressDto?> GetUserProgressAsync(Guid userId, Guid moduleId)
    {
        var progress = await _repository.GetProgressAsync(userId, moduleId);
        return progress != null ? MapProgressToDto(progress) : null;
    }

    public async Task<List<TrainingProgressDto>> GetUserAllProgressAsync(Guid userId)
    {
        var progress = await _repository.GetUserProgressAsync(userId);
        return progress.Select(MapProgressToDto).ToList();
    }

    public async Task SaveProgressAsync(Guid userId, Guid moduleId, TrainingProgressDto progressDto)
    {
        var progress = new TrainingProgress
        {
            UserId = userId,
            TrainingModuleId = moduleId,
            Status = progressDto.Status,
            StartedAt = progressDto.StartedAt,
            CompletedAt = progressDto.CompletedAt,
            QuizScore = progressDto.QuizScore,
            CompletedSteps = JsonSerializer.Serialize(progressDto.CompletedSteps),
            CurrentStepIndex = progressDto.CurrentStepIndex
        };

        await _repository.SaveProgressAsync(progress);
    }

    // ===================== Stats =====================

    public async Task<(int Completed, int InProgress, int NotStarted)> GetUserStatsAsync(Guid userId)
    {
        return await _repository.GetUserStatsAsync(userId);
    }

    // ===================== Helper Methods =====================

    public TrainingAudience RoleToAudience(string role)
    {
        return _roleToAudienceMap.TryGetValue(role.ToUpper(), out var audience)
            ? audience
            : TrainingAudience.StaffAdmin;
    }

    private TrainingModuleDto MapToDto(TrainingModule module)
    {
        return new TrainingModuleDto
        {
            Id = module.TrainingId,
            Title = module.Title,
            Description = module.Description,
            ShortDescription = module.ShortDescription,
            DurationMinutes = module.DurationMinutes,
            Level = module.Level,
            Tags = module.Tags.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList(),
            ImageUrl = module.ImageUrl,
            CreatedAt = module.CreatedAt,
            UpdatedAt = module.UpdatedAt,
            Steps = module.Steps
                .OrderBy(s => s.Order)
                .Select(s => new TrainingStepDto
                {
                    Id = s.StepId,
                    Title = s.Title,
                    Content = s.Content,
                    Order = s.Order,
                    Media = s.Media.Split(",", StringSplitOptions.RemoveEmptyEntries).ToList()
                })
                .ToList(),
            Quiz = module.Quiz?
                .OrderBy(q => q.Order)
                .Select(q => new TrainingQuizDto
                {
                    Id = q.QuizId,
                    Question = q.Question,
                    Options = JsonSerializer.Deserialize<List<string>>(q.Options) ?? [],
                    AnswerIndex = q.AnswerIndex,
                    Order = q.Order
                })
                .ToList()
        };
    }

    private TrainingProgressDto MapProgressToDto(TrainingProgress progress)
    {
        return new TrainingProgressDto
        {
            ModuleId = progress.TrainingModuleId.ToString(),
            Status = progress.Status,
            StartedAt = progress.StartedAt,
            CompletedAt = progress.CompletedAt,
            QuizScore = progress.QuizScore,
            CompletedSteps = JsonSerializer.Deserialize<List<string>>(progress.CompletedSteps) ?? [],
            CurrentStepIndex = progress.CurrentStepIndex
        };
    }
}
