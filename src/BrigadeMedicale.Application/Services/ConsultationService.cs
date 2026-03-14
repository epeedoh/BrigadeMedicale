using BrigadeMedicale.Application.DTOs.Consultation;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Application.Interfaces.Repositories;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;
using BrigadeMedicale.Domain.Exceptions;

namespace BrigadeMedicale.Application.Services;

public class ConsultationService : IConsultationService
{
    private readonly IConsultationRepository _consultationRepository;
    private readonly IPatientRepository _patientRepository;
    private readonly IUserRepository _userRepository;

    public ConsultationService(
        IConsultationRepository consultationRepository,
        IPatientRepository patientRepository,
        IUserRepository userRepository)
    {
        _consultationRepository = consultationRepository;
        _patientRepository = patientRepository;
        _userRepository = userRepository;
    }

    public async Task<ConsultationDto> CreateConsultationAsync(CreateConsultationDto dto, Guid doctorId)
    {
        var patient = await _patientRepository.GetByIdAsync(dto.PatientId);
        if (patient == null || !patient.IsActive)
        {
            throw new NotFoundException("Patient introuvable");
        }

        var doctor = await _userRepository.GetByIdAsync(doctorId);
        if (doctor == null || !doctor.IsActive)
        {
            throw new NotFoundException("Médecin introuvable");
        }

        var consultation = new Consultation
        {
            Id = Guid.NewGuid(),
            PatientId = dto.PatientId,
            DoctorId = doctorId,
            ChiefComplaint = dto.ChiefComplaint,
            History = dto.History,
            PhysicalExam = dto.PhysicalExam,
            VitalSigns = dto.VitalSigns,
            Diagnosis = dto.Diagnosis,
            Treatment = dto.Treatment,
            Notes = dto.Notes,
            Status = ConsultationStatus.InProgress,
            ConsultationDate = DateTime.UtcNow
        };

        await _consultationRepository.AddAsync(consultation);
        await _consultationRepository.SaveChangesAsync();

        return new ConsultationDto
        {
            Id = consultation.Id,
            PatientId = consultation.PatientId,
            PatientName = $"{patient.FirstName} {patient.LastName}",
            PatientNumber = patient.PatientNumber,
            DoctorId = consultation.DoctorId,
            DoctorName = $"{doctor.FirstName} {doctor.LastName}",
            ChiefComplaint = consultation.ChiefComplaint,
            History = consultation.History,
            PhysicalExam = consultation.PhysicalExam,
            VitalSigns = consultation.VitalSigns,
            Diagnosis = consultation.Diagnosis,
            Treatment = consultation.Treatment,
            Notes = consultation.Notes,
            Status = consultation.Status,
            ConsultationDate = consultation.ConsultationDate,
            CreatedAt = consultation.CreatedAt
        };
    }

    public async Task<ConsultationDto> GetByIdAsync(Guid id)
    {
        var consultation = await _consultationRepository.GetByIdWithDetailsAsync(id);
        if (consultation == null)
        {
            throw new NotFoundException("Consultation introuvable");
        }

        return new ConsultationDto
        {
            Id = consultation.Id,
            PatientId = consultation.PatientId,
            PatientName = $"{consultation.Patient.FirstName} {consultation.Patient.LastName}",
            PatientNumber = consultation.Patient.PatientNumber,
            DoctorId = consultation.DoctorId,
            DoctorName = $"{consultation.Doctor.FirstName} {consultation.Doctor.LastName}",
            ChiefComplaint = consultation.ChiefComplaint,
            History = consultation.History,
            PhysicalExam = consultation.PhysicalExam,
            VitalSigns = consultation.VitalSigns,
            Diagnosis = consultation.Diagnosis,
            Treatment = consultation.Treatment,
            Notes = consultation.Notes,
            Status = consultation.Status,
            ConsultationDate = consultation.ConsultationDate,
            ClosedAt = consultation.ClosedAt,
            CreatedAt = consultation.CreatedAt
        };
    }

    public async Task<ConsultationDto> UpdateConsultationAsync(Guid id, UpdateConsultationDto dto)
    {
        var consultation = await _consultationRepository.GetByIdWithDetailsAsync(id);
        if (consultation == null)
        {
            throw new NotFoundException("Consultation introuvable");
        }

        if (consultation.Status == ConsultationStatus.Completed)
        {
            throw new BusinessException("Impossible de modifier une consultation terminée");
        }

        if (dto.ChiefComplaint != null) consultation.ChiefComplaint = dto.ChiefComplaint;
        if (dto.History != null) consultation.History = dto.History;
        if (dto.PhysicalExam != null) consultation.PhysicalExam = dto.PhysicalExam;
        if (dto.VitalSigns != null) consultation.VitalSigns = dto.VitalSigns;
        if (dto.Diagnosis != null) consultation.Diagnosis = dto.Diagnosis;
        if (dto.Treatment != null) consultation.Treatment = dto.Treatment;
        if (dto.Notes != null) consultation.Notes = dto.Notes;

        _consultationRepository.Update(consultation);
        await _consultationRepository.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<ConsultationDto> CloseConsultationAsync(Guid id)
    {
        var consultation = await _consultationRepository.GetByIdWithDetailsAsync(id);
        if (consultation == null)
        {
            throw new NotFoundException("Consultation introuvable");
        }

        if (consultation.Status == ConsultationStatus.Completed)
        {
            throw new BusinessException("La consultation est déjà terminée");
        }

        consultation.Status = ConsultationStatus.Completed;
        consultation.ClosedAt = DateTime.UtcNow;

        _consultationRepository.Update(consultation);
        await _consultationRepository.SaveChangesAsync();

        return await GetByIdAsync(id);
    }

    public async Task<(List<ConsultationDto> Items, int TotalCount)> GetByStatusAsync(
        ConsultationStatus status, int page, int pageSize)
    {
        var consultations = await _consultationRepository.GetByStatusAsync(status, page, pageSize);
        var totalCount = await _consultationRepository.CountByStatusAsync(status);

        var items = consultations.Select(c => new ConsultationDto
        {
            Id = c.Id,
            PatientId = c.PatientId,
            PatientName = $"{c.Patient.FirstName} {c.Patient.LastName}",
            PatientNumber = c.Patient.PatientNumber,
            DoctorId = c.DoctorId,
            DoctorName = $"{c.Doctor.FirstName} {c.Doctor.LastName}",
            ChiefComplaint = c.ChiefComplaint,
            Status = c.Status,
            ConsultationDate = c.ConsultationDate,
            ClosedAt = c.ClosedAt,
            CreatedAt = c.CreatedAt
        }).ToList();

        return (items, totalCount);
    }

    public async Task<List<ConsultationDto>> GetPatientHistoryAsync(Guid patientId)
    {
        var consultations = await _consultationRepository.GetByPatientIdAsync(patientId);

        return consultations.Select(c => new ConsultationDto
        {
            Id = c.Id,
            PatientId = c.PatientId,
            DoctorId = c.DoctorId,
            DoctorName = $"{c.Doctor.FirstName} {c.Doctor.LastName}",
            ChiefComplaint = c.ChiefComplaint,
            Diagnosis = c.Diagnosis,
            Status = c.Status,
            ConsultationDate = c.ConsultationDate,
            ClosedAt = c.ClosedAt,
            CreatedAt = c.CreatedAt
        }).ToList();
    }
}
