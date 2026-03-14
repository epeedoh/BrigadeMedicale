using BrigadeMedicale.Domain.Entities;

namespace BrigadeMedicale.Application.Interfaces.Repositories;

public interface IMedicationRepository
{
    Task<Medication?> GetByIdAsync(Guid id);
    Task<Medication?> GetByNameAsync(string name);
    Task<IEnumerable<Medication>> SearchAsync(string? searchTerm, int page, int pageSize);
    Task<int> CountAsync();
    Task<int> CalculateCurrentStockAsync(Guid medicationId);
    Task AddAsync(Medication medication);
    void Update(Medication medication);
    Task<int> SaveChangesAsync();
}
