using BrigadeMedicale.Domain.Entities;

namespace BrigadeMedicale.Application.Interfaces.Repositories;

public interface IRoleRepository
{
    Task<List<Role>> GetAllAsync();
    Task<Role?> GetByIdAsync(int id);
    Task<List<Role>> GetByIdsAsync(List<int> ids);
}
