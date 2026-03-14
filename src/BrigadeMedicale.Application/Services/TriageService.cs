using BrigadeMedicale.Application.DTOs.Triage;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Application.Interfaces.Repositories;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;
using BrigadeMedicale.Domain.Exceptions;

namespace BrigadeMedicale.Application.Services;

public class TriageService : ITriageService
{
    private readonly ITriageRepository _triageRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IUserRepository _userRepository;

    public TriageService(
        ITriageRepository triageRepository,
        IPatientRepository patientRepository,
        IUserRepository userRepository)
    {
        _triageRepository = triageRepository;
        _patientRepository = patientRepository;
        _userRepository = userRepository;
    }

    public async Task<TriageDto> CreateTriageAsync(CreateTriageDto dto, Guid infirmierId)
    {
        var patient = await _patientRepository.GetByIdAsync(dto.PatientId);
        if (patient == null || !patient.IsActive)
        {
            throw new NotFoundException("Patient introuvable");
        }

        var infirmier = await _userRepository.GetByIdAsync(infirmierId);
        if (infirmier == null || !infirmier.IsActive)
        {
            throw new NotFoundException("Infirmier introuvable");
        }

        var triage = new TriageRecord
        {
            Id = Guid.NewGuid(),
            PatientId = dto.PatientId,
            InfirmierId = infirmierId,
            Temperature = dto.Temperature,
            Pulse = dto.Pulse,
            SystolicBP = dto.SystolicBP,
            DiastolicBP = dto.DiastolicBP,
            Weight = dto.Weight,
            Height = dto.Height,
            SpO2 = dto.SpO2,
            RespiratoryRate = dto.RespiratoryRate,
            Complaint = dto.Complaint,
            UrgencyLevel = dto.UrgencyLevel,
            Notes = dto.Notes,
            Status = TriageStatus.Completed,
            RecordedAt = DateTime.UtcNow,
            ConsultationId = dto.ConsultationId
        };

        await _triageRepository.AddAsync(triage);
        await _triageRepository.SaveChangesAsync();

        return MapToDto(triage, patient, infirmier);
    }

    public async Task<TriageDto> GetByIdAsync(Guid id)
    {
        var triage = await _triageRepository.GetByIdWithDetailsAsync(id);
        if (triage == null)
        {
            throw new NotFoundException("Triage introuvable");
        }

        return MapToDto(triage, triage.Patient, triage.Infirmier);
    }

    public async Task<TriageDto> UpdateTriageAsync(Guid id, UpdateTriageDto dto)
    {
        var triage = await _triageRepository.GetByIdWithDetailsAsync(id);
        if (triage == null)
        {
            throw new NotFoundException("Triage introuvable");
        }

        if (dto.Temperature.HasValue) triage.Temperature = dto.Temperature.Value;
        if (dto.Pulse.HasValue) triage.Pulse = dto.Pulse.Value;
        if (dto.SystolicBP.HasValue) triage.SystolicBP = dto.SystolicBP.Value;
        if (dto.DiastolicBP.HasValue) triage.DiastolicBP = dto.DiastolicBP.Value;
        if (dto.Weight.HasValue) triage.Weight = dto.Weight.Value;
        if (dto.Height.HasValue) triage.Height = dto.Height.Value;
        if (dto.SpO2.HasValue) triage.SpO2 = dto.SpO2.Value;
        if (dto.RespiratoryRate.HasValue) triage.RespiratoryRate = dto.RespiratoryRate.Value;
        if (dto.Complaint != null) triage.Complaint = dto.Complaint;
        if (dto.UrgencyLevel.HasValue) triage.UrgencyLevel = dto.UrgencyLevel.Value;
        if (dto.Notes != null) triage.Notes = dto.Notes;

        _triageRepository.Update(triage);
        await _triageRepository.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<TriageDto?> GetLatestByPatientIdAsync(Guid patientId)
    {
        var triage = await _triageRepository.GetLatestByPatientIdAsync(patientId);
        if (triage == null)
        {
            return null;
        }

        var patient = await _patientRepository.GetByIdAsync(triage.PatientId);
        var infirmier = await _userRepository.GetByIdAsync(triage.InfirmierId);

        return patient != null && infirmier != null ? MapToDto(triage, patient, infirmier) : null;
    }

    public async Task<TriageDto?> GetByConsultationIdAsync(Guid consultationId)
    {
        var triage = await _triageRepository.GetByConsultationIdAsync(consultationId);
        if (triage == null)
        {
            return null;
        }

        var patient = await _patientRepository.GetByIdAsync(triage.PatientId);
        var infirmier = await _userRepository.GetByIdAsync(triage.InfirmierId);

        return patient != null && infirmier != null ? MapToDto(triage, patient, infirmier) : null;
    }

    public async Task<List<TriageDto>> GetTodayTriagesAsync()
    {
        var triages = await _triageRepository.GetTodayTriagesAsync();
        return triages.Select(t => MapToDto(t, t.Patient, t.Infirmier)).ToList();
    }

    public async Task<List<TriageDto>> GetPatientTriagesAsync(Guid patientId, int days = 30)
    {
        var triages = await _triageRepository.GetByPatientIdAsync(patientId, days);
        return triages.Select(t => MapToDto(t, t.Patient, t.Infirmier)).ToList();
    }

    public async Task<(List<TriageDto> Items, int TotalCount)> GetByStatusAsync(TriageStatus status, int page, int pageSize)
    {
        var triages = await _triageRepository.GetByStatusAsync(status, page, pageSize);
        var totalCount = await _triageRepository.CountByStatusAsync(status);

        var items = triages.Select(t => MapToDto(t, t.Patient, t.Infirmier)).ToList();
        return (items, totalCount);
    }

    public async Task DeleteAsync(Guid id)
    {
        var triage = await _triageRepository.GetByIdAsync(id);
        if (triage == null)
        {
            throw new NotFoundException("Triage introuvable");
        }

        _triageRepository.Delete(triage);
        await _triageRepository.SaveChangesAsync();
    }

    private static TriageDto MapToDto(TriageRecord triage, Patient patient, User infirmier)
    {
        return new TriageDto
        {
            Id = triage.Id,
            PatientId = triage.PatientId,
            PatientName = $"{patient.FirstName} {patient.LastName}",
            PatientNumber = patient.PatientNumber,
            InfirmierId = triage.InfirmierId,
            InfirmierName = $"{infirmier.FirstName} {infirmier.LastName}",
            Temperature = triage.Temperature,
            Pulse = triage.Pulse,
            SystolicBP = triage.SystolicBP,
            DiastolicBP = triage.DiastolicBP,
            Weight = triage.Weight,
            Height = triage.Height,
            SpO2 = triage.SpO2,
            RespiratoryRate = triage.RespiratoryRate,
            BMI = triage.CalculatedBMI,
            Complaint = triage.Complaint,
            UrgencyLevel = triage.UrgencyLevel,
            Notes = triage.Notes,
            Status = triage.Status,
            RecordedAt = triage.RecordedAt,
            ConsultationId = triage.ConsultationId,
            CreatedAt = triage.CreatedAt
        };
    }
}
