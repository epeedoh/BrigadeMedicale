using BrigadeMedicale.Application.DTOs.LabTest;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Application.Interfaces.Repositories;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;
using BrigadeMedicale.Domain.Exceptions;

namespace BrigadeMedicale.Application.Services;

public class LabTestService : ILabTestService
{
    private readonly ILabTestRequestRepository _labTestRequestRepository;

    public LabTestService(ILabTestRequestRepository labTestRequestRepository)
    {
        _labTestRequestRepository = labTestRequestRepository;
    }

    public async Task<LabTestRequestDto> CreateLabTestRequestAsync(CreateLabTestRequestDto dto)
    {
        var labTestRequest = new LabTestRequest
        {
            Id = Guid.NewGuid(),
            ConsultationId = dto.ConsultationId,
            TestName = dto.TestName,
            Instructions = dto.Instructions,
            Status = LabTestStatus.Requested
        };

        await _labTestRequestRepository.AddAsync(labTestRequest);
        await _labTestRequestRepository.SaveChangesAsync();

        return new LabTestRequestDto
        {
            Id = labTestRequest.Id,
            ConsultationId = labTestRequest.ConsultationId,
            TestName = labTestRequest.TestName,
            Instructions = labTestRequest.Instructions,
            Status = labTestRequest.Status,
            CreatedAt = labTestRequest.CreatedAt
        };
    }

    public async Task<LabTestRequestDto> GetByIdAsync(Guid id)
    {
        var labTest = await _labTestRequestRepository.GetByIdWithDetailsAsync(id);
        if (labTest == null)
        {
            throw new NotFoundException("Demande de test de laboratoire introuvable");
        }

        return new LabTestRequestDto
        {
            Id = labTest.Id,
            ConsultationId = labTest.ConsultationId,
            PatientName = $"{labTest.Consultation.Patient.FirstName} {labTest.Consultation.Patient.LastName}",
            PatientNumber = labTest.Consultation.Patient.PatientNumber,
            TestName = labTest.TestName,
            Instructions = labTest.Instructions,
            Status = labTest.Status,
            Results = labTest.Results,
            CompletedAt = labTest.CompletedAt,
            CompletedBy = labTest.CompletedBy,
            CreatedAt = labTest.CreatedAt
        };
    }

    public async Task<LabTestRequestDto> UpdateResultsAsync(Guid id, UpdateLabTestResultsDto dto, Guid technicianId)
    {
        var labTest = await _labTestRequestRepository.GetByIdWithDetailsAsync(id);
        if (labTest == null)
        {
            throw new NotFoundException("Demande de test de laboratoire introuvable");
        }

        if (labTest.Status == LabTestStatus.Completed)
        {
            throw new BusinessException("Les résultats ont déjà été saisis");
        }

        labTest.Results = dto.Results;
        labTest.Status = LabTestStatus.Completed;
        labTest.CompletedAt = DateTime.UtcNow;
        labTest.CompletedBy = technicianId;

        _labTestRequestRepository.Update(labTest);
        await _labTestRequestRepository.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<(List<LabTestRequestDto> Items, int TotalCount)> GetByStatusAsync(
        LabTestStatus status, int page, int pageSize)
    {
        var labTests = await _labTestRequestRepository.GetByStatusAsync(status, page, pageSize);
        var totalCount = await _labTestRequestRepository.CountByStatusAsync(status);

        var items = labTests.Select(lt => new LabTestRequestDto
        {
            Id = lt.Id,
            ConsultationId = lt.ConsultationId,
            PatientName = $"{lt.Consultation.Patient.FirstName} {lt.Consultation.Patient.LastName}",
            PatientNumber = lt.Consultation.Patient.PatientNumber,
            TestName = lt.TestName,
            Status = lt.Status,
            CreatedAt = lt.CreatedAt
        }).ToList();

        return (items, totalCount);
    }

    public async Task<List<LabTestRequestDto>> GetByConsultationIdAsync(Guid consultationId)
    {
        var labTests = await _labTestRequestRepository.GetByConsultationIdAsync(consultationId);

        return labTests.Select(lt => new LabTestRequestDto
        {
            Id = lt.Id,
            ConsultationId = lt.ConsultationId,
            TestName = lt.TestName,
            Instructions = lt.Instructions,
            Status = lt.Status,
            Results = lt.Results,
            CompletedAt = lt.CompletedAt,
            CompletedBy = lt.CompletedBy,
            CreatedAt = lt.CreatedAt
        }).ToList();
    }
}
