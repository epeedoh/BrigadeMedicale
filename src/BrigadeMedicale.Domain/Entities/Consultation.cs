using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Domain.Entities;

public class Consultation : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public Guid DoctorId { get; set; }
    public User Doctor { get; set; } = null!;

    public string ChiefComplaint { get; set; } = string.Empty;
    public string? History { get; set; }
    public string? PhysicalExam { get; set; }
    public string? VitalSigns { get; set; }
    public string? Diagnosis { get; set; }
    public string? Treatment { get; set; }
    public string? Notes { get; set; }

    public ConsultationStatus Status { get; set; }
    public DateTime ConsultationDate { get; set; }
    public DateTime? ClosedAt { get; set; }

    // Navigation properties
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public ICollection<LabTestRequest> LabTestRequests { get; set; } = new List<LabTestRequest>();
}
