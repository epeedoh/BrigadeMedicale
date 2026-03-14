using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;
using BrigadeMedicale.Application.Interfaces.Repositories;

namespace BrigadeMedicale.Infrastructure.Data.Repositories;

public class ConsultationRepository : IConsultationRepository
{
    private readonly ApplicationDbContext _context;

    public ConsultationRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Consultation?> GetByIdAsync(Guid id)
    {
        return await _context.Consultations.FindAsync(id);
    }

    public async Task<Consultation?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _context.Consultations
            .Include(c => c.Patient)
            .Include(c => c.Doctor)
            .Include(c => c.Prescriptions)
                .ThenInclude(p => p.Medication)
            .Include(c => c.LabTestRequests)
            .FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task<IEnumerable<Consultation>> GetByPatientIdAsync(Guid patientId)
    {
        return await _context.Consultations
            .Include(c => c.Doctor)
            .Where(c => c.PatientId == patientId)
            .OrderByDescending(c => c.ConsultationDate)
            .ToListAsync();
    }

    public async Task<IEnumerable<Consultation>> GetByDoctorIdAsync(Guid doctorId, int page, int pageSize)
    {
        return await _context.Consultations
            .Include(c => c.Patient)
            .Where(c => c.DoctorId == doctorId)
            .OrderByDescending(c => c.ConsultationDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<IEnumerable<Consultation>> GetByStatusAsync(ConsultationStatus status, int page, int pageSize)
    {
        return await _context.Consultations
            .Include(c => c.Patient)
            .Include(c => c.Doctor)
            .Where(c => c.Status == status)
            .OrderByDescending(c => c.ConsultationDate)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();
    }

    public async Task<int> CountByStatusAsync(ConsultationStatus status)
    {
        return await _context.Consultations.CountAsync(c => c.Status == status);
    }

    public async Task AddAsync(Consultation consultation)
    {
        await _context.Consultations.AddAsync(consultation);
    }

    public void Update(Consultation consultation)
    {
        _context.Consultations.Update(consultation);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }
}
