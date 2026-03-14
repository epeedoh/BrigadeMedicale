using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.Interfaces.Repositories;

public interface ILabTestRequestRepository
{
    Task<LabTestRequest?> GetByIdAsync(Guid id);
    Task<LabTestRequest?> GetByIdWithDetailsAsync(Guid id);
    Task<IEnumerable<LabTestRequest>> GetByConsultationIdAsync(Guid consultationId);
    Task<IEnumerable<LabTestRequest>> GetByStatusAsync(LabTestStatus status, int page, int pageSize);
    Task<int> CountByStatusAsync(LabTestStatus status);
    Task AddAsync(LabTestRequest labTestRequest);
    void Update(LabTestRequest labTestRequest);
    Task<int> SaveChangesAsync();
}
