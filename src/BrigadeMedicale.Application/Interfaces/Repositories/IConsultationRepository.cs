using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.Interfaces.Repositories;

public interface IConsultationRepository
{
    Task<Consultation?> GetByIdAsync(Guid id);
    Task<Consultation?> GetByIdWithDetailsAsync(Guid id);
    Task<IEnumerable<Consultation>> GetByPatientIdAsync(Guid patientId);
    Task<IEnumerable<Consultation>> GetByDoctorIdAsync(Guid doctorId, int page, int pageSize);
    Task<IEnumerable<Consultation>> GetByStatusAsync(ConsultationStatus status, int page, int pageSize);
    Task<int> CountByStatusAsync(ConsultationStatus status);
    Task AddAsync(Consultation consultation);
    void Update(Consultation consultation);
    Task<int> SaveChangesAsync();
}
