using BrigadeMedicale.Application.DTOs.LabTest;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.Interfaces;

public interface ILabTestService
{
    Task<LabTestRequestDto> CreateLabTestRequestAsync(CreateLabTestRequestDto dto);
    Task<LabTestRequestDto> GetByIdAsync(Guid id);
    Task<LabTestRequestDto> UpdateResultsAsync(Guid id, UpdateLabTestResultsDto dto, Guid technicianId);
    Task<(List<LabTestRequestDto> Items, int TotalCount)> GetByStatusAsync(LabTestStatus status, int page, int pageSize);
    Task<List<LabTestRequestDto>> GetByConsultationIdAsync(Guid consultationId);
}
