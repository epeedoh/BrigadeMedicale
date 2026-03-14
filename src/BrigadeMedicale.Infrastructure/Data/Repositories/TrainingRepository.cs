using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;
using BrigadeMedicale.Application.Interfaces;

namespace BrigadeMedicale.Infrastructure.Data.Repositories;

public class TrainingRepository : ITrainingRepository
{
    private readonly ApplicationDbContext _context;

    public TrainingRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    // ===================== Module Operations =====================

    public async Task<TrainingModule?> GetModuleByIdAsync(Guid id)
    {
        return await _context.TrainingModules
            .Include(m => m.Steps)
            .Include(m => m.Quiz)
            .FirstOrDefaultAsync(m => m.Id == id);
    }

    public async Task<TrainingModule?> GetModuleByTrainingIdAsync(string trainingId)
    {
        return await _context.TrainingModules
            .Include(m => m.Steps)
            .Include(m => m.Quiz)
            .FirstOrDefaultAsync(m => m.TrainingId == trainingId);
    }

    public async Task<List<TrainingModule>> GetModulesByAudienceAsync(TrainingAudience audience)
    {
        return await _context.TrainingModules
            .Where(m => m.Audience == audience)
            .Include(m => m.Steps)
            .Include(m => m.Quiz)
            .OrderBy(m => m.Order)
            .ToListAsync();
    }

    public async Task<List<TrainingModule>> GetAllModulesAsync()
    {
        return await _context.TrainingModules
            .Include(m => m.Steps)
            .Include(m => m.Quiz)
            .OrderBy(m => m.Order)
            .ToListAsync();
    }

    public async Task<TrainingModule> CreateModuleAsync(TrainingModule module)
    {
        _context.TrainingModules.Add(module);
        await _context.SaveChangesAsync();
        return module;
    }

    public async Task<TrainingModule> UpdateModuleAsync(TrainingModule module)
    {
        _context.TrainingModules.Update(module);
        await _context.SaveChangesAsync();
        return module;
    }

    public async Task DeleteModuleAsync(Guid id)
    {
        var module = await GetModuleByIdAsync(id);
        if (module != null)
        {
            _context.TrainingModules.Remove(module);
            await _context.SaveChangesAsync();
        }
    }

    // ===================== Progress Operations =====================

    public async Task<TrainingProgress?> GetProgressAsync(Guid userId, Guid moduleId)
    {
        return await _context.TrainingProgress
            .FirstOrDefaultAsync(p => p.UserId == userId && p.TrainingModuleId == moduleId);
    }

    public async Task<List<TrainingProgress>> GetUserProgressAsync(Guid userId)
    {
        return await _context.TrainingProgress
            .Where(p => p.UserId == userId)
            .Include(p => p.TrainingModule)
            .OrderByDescending(p => p.UpdatedAt)
            .ToListAsync();
    }

    public async Task<List<TrainingProgress>> GetModuleProgressAsync(Guid moduleId)
    {
        return await _context.TrainingProgress
            .Where(p => p.TrainingModuleId == moduleId)
            .Include(p => p.User)
            .ToListAsync();
    }

    public async Task<TrainingProgress> SaveProgressAsync(TrainingProgress progress)
    {
        var existing = await GetProgressAsync(progress.UserId, progress.TrainingModuleId);

        if (existing != null)
        {
            existing.Status = progress.Status;
            existing.StartedAt = progress.StartedAt;
            existing.CompletedAt = progress.CompletedAt;
            existing.QuizScore = progress.QuizScore;
            existing.CompletedSteps = progress.CompletedSteps;
            existing.CurrentStepIndex = progress.CurrentStepIndex;
            existing.UpdatedAt = DateTime.UtcNow;

            _context.TrainingProgress.Update(existing);
        }
        else
        {
            progress.CreatedAt = DateTime.UtcNow;
            progress.UpdatedAt = DateTime.UtcNow;
            _context.TrainingProgress.Add(progress);
        }

        await _context.SaveChangesAsync();
        return progress;
    }

    // ===================== Stats =====================

    public async Task<(int Completed, int InProgress, int NotStarted)> GetUserStatsAsync(Guid userId)
    {
        var completed = await _context.TrainingProgress
            .CountAsync(p => p.UserId == userId && p.Status == "COMPLETED");

        var inProgress = await _context.TrainingProgress
            .CountAsync(p => p.UserId == userId && p.Status == "IN_PROGRESS");

        var notStarted = await _context.TrainingProgress
            .CountAsync(p => p.UserId == userId && p.Status == "NOT_STARTED");

        return (completed, inProgress, notStarted);
    }
}
