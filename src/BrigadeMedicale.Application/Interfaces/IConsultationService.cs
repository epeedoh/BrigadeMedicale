using BrigadeMedicale.Application.DTOs.Consultation;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.Interfaces;

public interface IConsultationService
{
    Task<ConsultationDto> CreateConsultationAsync(CreateConsultationDto dto, Guid doctorId);
    Task<ConsultationDto> GetByIdAsync(Guid id);
    Task<ConsultationDto> UpdateConsultationAsync(Guid id, UpdateConsultationDto dto);
    Task<ConsultationDto> CloseConsultationAsync(Guid id);
    Task<(List<ConsultationDto> Items, int TotalCount)> GetByStatusAsync(ConsultationStatus status, int page, int pageSize);
    Task<List<ConsultationDto>> GetPatientHistoryAsync(Guid patientId);
}
