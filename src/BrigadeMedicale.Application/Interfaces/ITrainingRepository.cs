using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.Interfaces;

public interface ITrainingRepository
{
    // Module operations
    Task<TrainingModule?> GetModuleByIdAsync(Guid id);
    Task<TrainingModule?> GetModuleByTrainingIdAsync(string trainingId);
    Task<List<TrainingModule>> GetModulesByAudienceAsync(TrainingAudience audience);
    Task<List<TrainingModule>> GetAllModulesAsync();
    Task<TrainingModule> CreateModuleAsync(TrainingModule module);
    Task<TrainingModule> UpdateModuleAsync(TrainingModule module);
    Task DeleteModuleAsync(Guid id);

    // Progress operations
    Task<TrainingProgress?> GetProgressAsync(Guid userId, Guid moduleId);
    Task<List<TrainingProgress>> GetUserProgressAsync(Guid userId);
    Task<List<TrainingProgress>> GetModuleProgressAsync(Guid moduleId);
    Task<TrainingProgress> SaveProgressAsync(TrainingProgress progress);

    // Stats
    Task<(int Completed, int InProgress, int NotStarted)> GetUserStatsAsync(Guid userId);
}
