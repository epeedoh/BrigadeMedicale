using BrigadeMedicale.Application.DTOs.Triage;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.Interfaces;

public interface ITriageService
{
    Task<TriageDto> CreateTriageAsync(CreateTriageDto dto, Guid infirmierId);
    Task<TriageDto> GetByIdAsync(Guid id);
    Task<TriageDto> UpdateTriageAsync(Guid id, UpdateTriageDto dto);
    Task<TriageDto?> GetLatestByPatientIdAsync(Guid patientId);
    Task<TriageDto?> GetByConsultationIdAsync(Guid consultationId);
    Task<List<TriageDto>> GetTodayTriagesAsync();
    Task<List<TriageDto>> GetPatientTriagesAsync(Guid patientId, int days = 30);
    Task<(List<TriageDto> Items, int TotalCount)> GetByStatusAsync(TriageStatus status, int page, int pageSize);
    Task DeleteAsync(Guid id);
}
