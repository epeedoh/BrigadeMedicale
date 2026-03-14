using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.Interfaces.Repositories;

public interface ITriageRepository
{
    Task<TriageRecord?> GetByIdAsync(Guid id);
    Task<TriageRecord?> GetByIdWithDetailsAsync(Guid id);
    Task<TriageRecord?> GetLatestByPatientIdAsync(Guid patientId);
    Task<TriageRecord?> GetByConsultationIdAsync(Guid consultationId);
    Task<List<TriageRecord>> GetTodayTriagesAsync();
    Task<List<TriageRecord>> GetByPatientIdAsync(Guid patientId, int days = 30);
    Task<List<TriageRecord>> GetByStatusAsync(TriageStatus status, int page, int pageSize);
    Task<int> CountByStatusAsync(TriageStatus status);
    Task AddAsync(TriageRecord triage);
    void Update(TriageRecord triage);
    void Delete(TriageRecord triage);
    Task SaveChangesAsync();
}
