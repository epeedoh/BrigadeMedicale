using BrigadeMedicale.Application.DTOs.Patient;

namespace BrigadeMedicale.Application.Services;

public interface IPatientService
{
    Task<PatientDto> CreatePatientAsync(CreatePatientDto dto, Guid? createdBy, string source);
    Task<PatientDto?> GetByIdAsync(Guid id);
    Task<PatientDto?> GetByPatientNumberAsync(string patientNumber);
    Task<(List<PatientDto> Items, int TotalCount)> SearchPatientsAsync(string? searchTerm, int page, int pageSize);
}
