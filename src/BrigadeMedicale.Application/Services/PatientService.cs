using BrigadeMedicale.Application.DTOs.Patient;
using BrigadeMedicale.Application.Helpers;
using BrigadeMedicale.Application.Interfaces.Repositories;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Exceptions;

namespace BrigadeMedicale.Application.Services;

public class PatientService : IPatientService
{
    private readonly IPatientRepository _patientRepository;

    public PatientService(IPatientRepository patientRepository)
    {
        _patientRepository = patientRepository;
    }

    public async Task<PatientDto> CreatePatientAsync(CreatePatientDto dto, Guid? createdBy, string source)
    {
        // Vérification anti-doublon
        var existingPatient = await _patientRepository.GetByPhoneAndDobAsync(dto.PhoneNumber, dto.DateOfBirth);

        if (existingPatient != null)
        {
            throw new DuplicateException(
                "Un patient avec ce numéro de téléphone et date de naissance existe déjà",
                new { existingPatient.PatientNumber, existingPatient.FirstName, existingPatient.LastName });
        }

        // Génération PatientNumber
        var patientNumber = await PatientNumberGenerator.GenerateAsync(_patientRepository, DateTime.UtcNow.Year);

        // Création entité
        var patient = new Patient
        {
            Id = Guid.NewGuid(),
            PatientNumber = patientNumber,
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            DateOfBirth = dto.DateOfBirth,
            Gender = dto.Gender,
            PhoneNumber = dto.PhoneNumber,
            AlternativePhone = dto.AlternativePhone,
            Address = dto.Address,
            City = dto.City,
            EmergencyContact = dto.EmergencyContact,
            EmergencyPhone = dto.EmergencyPhone,
            BloodType = dto.BloodType,
            Allergies = dto.Allergies,
            ChronicDiseases = dto.ChronicDiseases,
            Sector = dto.Sector,
            IsFromChurch = dto.IsFromChurch,
            ChurchSector = dto.ChurchSector,
            RegistrationSource = source,
            CreatedBy = createdBy,
            IsActive = true
        };

        await _patientRepository.AddAsync(patient);
        await _patientRepository.SaveChangesAsync();

        return new PatientDto
        {
            Id = patient.Id,
            PatientNumber = patient.PatientNumber,
            FirstName = patient.FirstName,
            LastName = patient.LastName,
            DateOfBirth = patient.DateOfBirth,
            Age = patient.Age,
            Gender = patient.Gender,
            PhoneNumber = patient.PhoneNumber,
            Address = patient.Address,
            City = patient.City,
            BloodType = patient.BloodType,
            Allergies = patient.Allergies,
            ChronicDiseases = patient.ChronicDiseases,
            Sector = patient.Sector,
            IsFromChurch = patient.IsFromChurch,
            ChurchSector = patient.ChurchSector,
            CreatedAt = patient.CreatedAt,
            IsActive = patient.IsActive
        };
    }

    public async Task<PatientDto?> GetByIdAsync(Guid id)
    {
        var patient = await _patientRepository.GetByIdAsync(id);

        if (patient == null)
            throw new NotFoundException("Patient introuvable");

        return new PatientDto
        {
            Id = patient.Id,
            PatientNumber = patient.PatientNumber,
            FirstName = patient.FirstName,
            LastName = patient.LastName,
            DateOfBirth = patient.DateOfBirth,
            Age = patient.Age,
            Gender = patient.Gender,
            PhoneNumber = patient.PhoneNumber,
            Address = patient.Address,
            City = patient.City,
            BloodType = patient.BloodType,
            Allergies = patient.Allergies,
            ChronicDiseases = patient.ChronicDiseases,
            Sector = patient.Sector,
            IsFromChurch = patient.IsFromChurch,
            ChurchSector = patient.ChurchSector,
            CreatedAt = patient.CreatedAt,
            IsActive = patient.IsActive
        };
    }

    public async Task<PatientDto?> GetByPatientNumberAsync(string patientNumber)
    {
        var patient = await _patientRepository.GetByPatientNumberAsync(patientNumber);

        if (patient == null)
            return null;

        return new PatientDto
        {
            Id = patient.Id,
            PatientNumber = patient.PatientNumber,
            FirstName = patient.FirstName,
            LastName = patient.LastName,
            DateOfBirth = patient.DateOfBirth,
            Age = patient.Age,
            Gender = patient.Gender,
            PhoneNumber = patient.PhoneNumber,
            Address = patient.Address,
            City = patient.City,
            BloodType = patient.BloodType,
            Allergies = patient.Allergies,
            ChronicDiseases = patient.ChronicDiseases,
            Sector = patient.Sector,
            IsFromChurch = patient.IsFromChurch,
            ChurchSector = patient.ChurchSector,
            CreatedAt = patient.CreatedAt,
            IsActive = patient.IsActive
        };
    }

    public async Task<(List<PatientDto> Items, int TotalCount)> SearchPatientsAsync(string? searchTerm, int page, int pageSize)
    {
        var patients = await _patientRepository.SearchAsync(searchTerm, page, pageSize);
        var totalCount = await _patientRepository.CountAsync();

        var items = patients.Select(p => new PatientDto
        {
            Id = p.Id,
            PatientNumber = p.PatientNumber,
            FirstName = p.FirstName,
            LastName = p.LastName,
            DateOfBirth = p.DateOfBirth,
            Age = p.Age,
            Gender = p.Gender,
            PhoneNumber = p.PhoneNumber,
            Address = p.Address,
            City = p.City,
            BloodType = p.BloodType,
            Allergies = p.Allergies,
            ChronicDiseases = p.ChronicDiseases,
            Sector = p.Sector,
            IsFromChurch = p.IsFromChurch,
            ChurchSector = p.ChurchSector,
            CreatedAt = p.CreatedAt,
            IsActive = p.IsActive
        }).ToList();

        return (items, totalCount);
    }
}
