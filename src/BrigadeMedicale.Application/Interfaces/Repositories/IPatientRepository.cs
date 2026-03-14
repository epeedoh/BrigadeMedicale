using BrigadeMedicale.Domain.Entities;

namespace BrigadeMedicale.Application.Interfaces.Repositories;

public interface IPatientRepository
{
    Task<Patient?> GetByIdAsync(Guid id);
    Task<Patient?> GetByPatientNumberAsync(string patientNumber);
    Task<Patient?> GetByPhoneAndDobAsync(string phoneNumber, DateTime dateOfBirth);
    Task<bool> ExistsByPhoneAsync(string phoneNumber);
    Task<IEnumerable<Patient>> SearchAsync(string? searchTerm, int page, int pageSize);
    Task<int> CountAsync();
    Task AddAsync(Patient patient);
    void Update(Patient patient);
    Task<int> SaveChangesAsync();
}
