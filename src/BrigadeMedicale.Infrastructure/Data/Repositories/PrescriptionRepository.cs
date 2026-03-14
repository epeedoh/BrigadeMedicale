using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;
using BrigadeMedicale.Application.Interfaces.Repositories;

namespace BrigadeMedicale.Infrastructure.Data.Repositories;

public class PrescriptionRepository : IPrescriptionRepository
{
    private readonly ApplicationDbContext _context;

    public PrescriptionRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Prescription?> GetByIdAsync(Guid id)
    {
        return await _context.Prescriptions.FindAsync(id);
    }

    public async Task<Prescription?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _context.Prescriptions
            .Include(p => p.Medication)
            .Include(p => p.Consultation)
                .ThenInclude(c => c.Patient)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task<IEnumerable<Prescription>> GetByConsultationIdAsync(Guid consultationId)
    {
        return await _context.Prescriptions
            .Include(p => p.Medication)
            .Where(p => p.ConsultationId == consultationId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Prescription>> GetByStatusAsync(PrescriptionStatus status, int page, int pageSize)
    {
        return await _context.Prescriptions
            .Include(p => p.Medication)
            .Include(p => p.Consultation)
                .ThenInclude(c => c.Patient)
            .Where(p => p.Status == status)
            .OrderBy(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> CountByStatusAsync(PrescriptionStatus status)
    {
        return await _context.Prescriptions.CountAsync(p => p.Status == status);
    }

    public async Task AddAsync(Prescription prescription)
    {
        await _context.Prescriptions.AddAsync(prescription);
    }

    public void Update(Prescription prescription)
    {
        _context.Prescriptions.Update(prescription);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}
