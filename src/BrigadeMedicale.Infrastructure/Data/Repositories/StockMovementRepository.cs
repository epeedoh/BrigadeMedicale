using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;
using BrigadeMedicale.Application.Interfaces.Repositories;

namespace BrigadeMedicale.Infrastructure.Data.Repositories;

public class StockMovementRepository : IStockMovementRepository
{
    private readonly ApplicationDbContext _context;

    public StockMovementRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<StockMovement>> GetByMedicationIdAsync(Guid medicationId, int page, int pageSize)
    {
        return await _context.StockMovements
            .Where(sm => sm.MedicationId == medicationId)
            .OrderByDescending(sm => sm.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<StockMovement>> GetByTypeAsync(MovementType type, DateTime from, DateTime to)
    {
        return await _context.StockMovements
            .Include(sm => sm.Medication)
            .Where(sm => sm.MovementType == type
                && sm.CreatedAt >= from
                && sm.CreatedAt <= to)
            .OrderByDescending(sm => sm.CreatedAt)
            .ToListAsync();
    }

    public async Task AddAsync(StockMovement movement)
    {
        await _context.StockMovements.AddAsync(movement);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}
