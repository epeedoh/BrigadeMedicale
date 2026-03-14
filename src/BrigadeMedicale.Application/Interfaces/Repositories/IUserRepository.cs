using BrigadeMedicale.Domain.Entities;

namespace BrigadeMedicale.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(Guid id);
    Task<User?> GetByIdWithRolesAsync(Guid id);
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByUsernameWithRolesAsync(string username);
    Task<(List<User> items, int totalCount)> SearchAsync(string? search, int page, int pageSize);
    Task AddAsync(User user);
    void Update(User user);
    void Delete(User user);
    Task<int> SaveChangesAsync();
}
