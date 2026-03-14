using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;
using BrigadeMedicale.Application.Interfaces.Repositories;

namespace BrigadeMedicale.Infrastructure.Data.Repositories;

public class LabTestRequestRepository : ILabTestRequestRepository
{
    private readonly ApplicationDbContext _context;

    public LabTestRequestRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<LabTestRequest?> GetByIdAsync(Guid id)
    {
        return await _context.LabTestRequests.FindAsync(id);
    }

    public async Task<LabTestRequest?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _context.LabTestRequests
            .Include(lt => lt.Consultation)
                .ThenInclude(c => c.Patient)
            .FirstOrDefaultAsync(lt => lt.Id == id);
    }

    public async Task<IEnumerable<LabTestRequest>> GetByConsultationIdAsync(Guid consultationId)
    {
        return await _context.LabTestRequests
            .Where(lt => lt.ConsultationId == consultationId)
            .OrderByDescending(lt => lt.CreatedAt)
            .ToListAsync();
    }

    public async Task<IEnumerable<LabTestRequest>> GetByStatusAsync(LabTestStatus status, int page, int pageSize)
    {
        return await _context.LabTestRequests
            .Include(lt => lt.Consultation)
                .ThenInclude(c => c.Patient)
            .Where(lt => lt.Status == status)
            .OrderBy(lt => lt.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> CountByStatusAsync(LabTestStatus status)
    {
        return await _context.LabTestRequests.CountAsync(lt => lt.Status == status);
    }

    public async Task AddAsync(LabTestRequest labTestRequest)
    {
        await _context.LabTestRequests.AddAsync(labTestRequest);
    }

    public void Update(LabTestRequest labTestRequest)
    {
        _context.LabTestRequests.Update(labTestRequest);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}
