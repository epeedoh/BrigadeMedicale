using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.Interfaces.Repositories;

public interface IStockMovementRepository
{
    Task<IEnumerable<StockMovement>> GetByMedicationIdAsync(Guid medicationId, int page, int pageSize);
    Task<IEnumerable<StockMovement>> GetByTypeAsync(MovementType type, DateTime from, DateTime to);
    Task AddAsync(StockMovement movement);
    Task<int> SaveChangesAsync();
}
