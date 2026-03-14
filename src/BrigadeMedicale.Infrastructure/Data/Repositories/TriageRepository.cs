using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;
using BrigadeMedicale.Application.Interfaces.Repositories;

namespace BrigadeMedicale.Infrastructure.Data.Repositories;

public class TriageRepository : ITriageRepository
{
    private readonly ApplicationDbContext _context;

    public TriageRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<TriageRecord?> GetByIdAsync(Guid id)
    {
        return await _context.Set<TriageRecord>().FindAsync(id);
    }

    public async Task<TriageRecord?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _context.Set<TriageRecord>()
            .Include(t => t.Patient)
            .Include(t => t.Infirmier)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<TriageRecord?> GetLatestByPatientIdAsync(Guid patientId)
    {
        return await _context.Set<TriageRecord>()
            .Where(t => t.PatientId == patientId && t.Status == TriageStatus.Completed)
            .OrderByDescending(t => t.RecordedAt)
            .FirstOrDefaultAsync();
    }

    public async Task<TriageRecord?> GetByConsultationIdAsync(Guid consultationId)
    {
        return await _context.Set<TriageRecord>()
            .FirstOrDefaultAsync(t => t.ConsultationId == consultationId);
    }

    public async Task<List<TriageRecord>> GetTodayTriagesAsync()
    {
        var today = DateTime.UtcNow.Date;
        return await _context.Set<TriageRecord>()
            .Include(t => t.Patient)
            .Include(t => t.Infirmier)
            .Where(t => t.RecordedAt.Date == today && t.Status == TriageStatus.Completed)
            .OrderByDescending(t => t.RecordedAt)
            .ToListAsync();
    }

    public async Task<List<TriageRecord>> GetByPatientIdAsync(Guid patientId, int days = 30)
    {
        var since = DateTime.UtcNow.AddDays(-days);
        return await _context.Set<TriageRecord>()
            .Include(t => t.Patient)
            .Include(t => t.Infirmier)
            .Where(t => t.PatientId == patientId && t.RecordedAt >= since && t.Status == TriageStatus.Completed)
            .OrderByDescending(t => t.RecordedAt)
            .ToListAsync();
    }

    public async Task<List<TriageRecord>> GetByStatusAsync(TriageStatus status, int page, int pageSize)
    {
        return await _context.Set<TriageRecord>()
            .Include(t => t.Patient)
            .Include(t => t.Infirmier)
            .Where(t => t.Status == status)
            .OrderByDescending(t => t.RecordedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> CountByStatusAsync(TriageStatus status)
    {
        return await _context.Set<TriageRecord>().CountAsync(t => t.Status == status);
    }

    public async Task AddAsync(TriageRecord triage)
    {
        await _context.Set<TriageRecord>().AddAsync(triage);
    }

    public void Update(TriageRecord triage)
    {
        _context.Set<TriageRecord>().Update(triage);
    }

    public void Delete(TriageRecord triage)
    {
        _context.Set<TriageRecord>().Remove(triage);
    }

    public async Task SaveChangesAsync()
    {
        await _context.SaveChangesAsync();
    }
}
