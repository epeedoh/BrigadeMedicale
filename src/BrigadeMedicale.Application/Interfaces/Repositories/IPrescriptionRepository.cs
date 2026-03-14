using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.Interfaces.Repositories;

public interface IPrescriptionRepository
{
    Task<Prescription?> GetByIdAsync(Guid id);
    Task<Prescription?> GetByIdWithDetailsAsync(Guid id);
    Task<IEnumerable<Prescription>> GetByConsultationIdAsync(Guid consultationId);
    Task<IEnumerable<Prescription>> GetByStatusAsync(PrescriptionStatus status, int page, int pageSize);
    Task<int> CountByStatusAsync(PrescriptionStatus status);
    Task AddAsync(Prescription prescription);
    void Update(Prescription prescription);
    Task<int> SaveChangesAsync();
}
