using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Application.Interfaces.Repositories;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Infrastructure.Data.Repositories;

public class MedicationRepository : IMedicationRepository
{
    private readonly ApplicationDbContext _context;

    public MedicationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Medication?> GetByIdAsync(Guid id)
    {
        return await _context.Medications.FindAsync(id);
    }

    public async Task<Medication?> GetByNameAsync(string name)
    {
        return await _context.Medications
            .FirstOrDefaultAsync(m => m.Name.ToLower() == name.ToLower());
    }

    public async Task<IEnumerable<Medication>> SearchAsync(string? searchTerm, int page, int pageSize)
    {
        var query = _context.Medications.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(m =>
                m.Name.Contains(searchTerm) ||
                (m.GenericName != null && m.GenericName.Contains(searchTerm)));
        }

        return await query
            .Where(m => m.IsActive)
            .OrderBy(m => m.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> CountAsync()
    {
        return await _context.Medications.CountAsync(m => m.IsActive);
    }

    public async Task<int> CalculateCurrentStockAsync(Guid medicationId)
    {
        var entries = await _context.StockMovements
            .Where(sm => sm.MedicationId == medicationId)
            .SumAsync(sm => sm.MovementType == MovementType.Entry ? sm.Quantity : -sm.Quantity);

        return entries;
    }

    public async Task AddAsync(Medication medication)
    {
        await _context.Medications.AddAsync(medication);
    }

    public void Update(Medication medication)
    {
        _context.Medications.Update(medication);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}
