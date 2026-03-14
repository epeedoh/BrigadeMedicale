using BrigadeMedicale.Application.DTOs;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.Interfaces;

public interface ITrainingService
{
    // Module operations
    Task<TrainingModuleDto?> GetModuleByIdAsync(Guid id);
    Task<TrainingModuleDto?> GetModuleByTrainingIdAsync(string trainingId);
    Task<List<TrainingModuleDto>> GetModulesByAudienceAsync(TrainingAudience audience);
    Task<List<TrainingModuleDto>> GetAllModulesAsync();
    Task<TrainingModuleDto> CreateModuleAsync(CreateTrainingModuleDto dto);
    Task UpdateModuleAsync(Guid id, CreateTrainingModuleDto dto);
    Task DeleteModuleAsync(Guid id);

    // Progress operations
    Task<TrainingProgressDto?> GetUserProgressAsync(Guid userId, Guid moduleId);
    Task<List<TrainingProgressDto>> GetUserAllProgressAsync(Guid userId);
    Task SaveProgressAsync(Guid userId, Guid moduleId, TrainingProgressDto progressDto);

    // Stats
    Task<(int Completed, int InProgress, int NotStarted)> GetUserStatsAsync(Guid userId);

    // Helper
    TrainingAudience RoleToAudience(string role);
}
