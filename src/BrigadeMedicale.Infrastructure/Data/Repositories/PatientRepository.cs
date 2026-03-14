using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Application.Interfaces.Repositories;

namespace BrigadeMedicale.Infrastructure.Data.Repositories;

public class PatientRepository : IPatientRepository
{
    private readonly ApplicationDbContext _context;

    public PatientRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Patient?> GetByIdAsync(Guid id)
    {
        return await _context.Patients.FindAsync(id);
    }

    public async Task<Patient?> GetByPatientNumberAsync(string patientNumber)
    {
        return await _context.Patients
            .FirstOrDefaultAsync(p => p.PatientNumber == patientNumber);
    }

    public async Task<Patient?> GetByPhoneAndDobAsync(string phoneNumber, DateTime dateOfBirth)
    {
        return await _context.Patients
            .FirstOrDefaultAsync(p => p.PhoneNumber == phoneNumber
                                   && p.DateOfBirth.Date == dateOfBirth.Date
                                   && p.IsActive);
    }

    public async Task<bool> ExistsByPhoneAsync(string phoneNumber)
    {
        return await _context.Patients
            .AnyAsync(p => p.PhoneNumber == phoneNumber && p.IsActive);
    }

    public async Task<IEnumerable<Patient>> SearchAsync(string? searchTerm, int page, int pageSize)
    {
        var query = _context.Patients.AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm))
        {
            query = query.Where(p =>
                p.FirstName.Contains(searchTerm) ||
                p.LastName.Contains(searchTerm) ||
                p.PatientNumber.Contains(searchTerm) ||
                p.PhoneNumber.Contains(searchTerm));
        }

        return await query
            .Where(p => p.IsActive)
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> CountAsync()
    {
        return await _context.Patients.CountAsync(p => p.IsActive);
    }

    public async Task AddAsync(Patient patient)
    {
        await _context.Patients.AddAsync(patient);
    }

    public void Update(Patient patient)
    {
        _context.Patients.Update(patient);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}
