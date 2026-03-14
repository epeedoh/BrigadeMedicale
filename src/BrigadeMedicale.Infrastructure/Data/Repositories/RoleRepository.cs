using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Application.Interfaces.Repositories;

namespace BrigadeMedicale.Infrastructure.Data.Repositories;

public class RoleRepository : IRoleRepository
{
    private readonly ApplicationDbContext _context;

    public RoleRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<List<Role>> GetAllAsync()
    {
        return await _context.Roles.OrderBy(r => r.Name).ToListAsync();
    }

    public async Task<Role?> GetByIdAsync(int id)
    {
        return await _context.Roles.FindAsync(id);
    }

    public async Task<List<Role>> GetByIdsAsync(List<int> ids)
    {
        return await _context.Roles
            .Where(r => ids.Contains(r.Id))
            .ToListAsync();
    }
}
