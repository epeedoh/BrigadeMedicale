using BrigadeMedicale.Application.DTOs.Prescription;
using BrigadeMedicale.Application.DTOs.Medication;
using BrigadeMedicale.Application.DTOs.StockMovement;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.Interfaces;

public interface IPharmacyService
{
    // Prescriptions
    Task<PrescriptionDto> CreatePrescriptionAsync(CreatePrescriptionDto dto);
    Task<PrescriptionDto> DispensePrescriptionAsync(Guid prescriptionId, int quantity, Guid pharmacistId);
    Task<(List<PrescriptionDto> Items, int TotalCount)> GetPendingPrescriptionsAsync(int page, int pageSize);

    // Medications
    Task<MedicationDto> CreateMedicationAsync(CreateMedicationDto dto);
    Task<MedicationDto> GetMedicationByIdAsync(Guid id);
    Task<(List<MedicationDto> Items, int TotalCount)> SearchMedicationsAsync(string? searchTerm, int page, int pageSize);

    // Stock
    Task AddStockMovementAsync(CreateStockMovementDto dto, Guid userId);
    Task<int> GetCurrentStockAsync(Guid medicationId);
}
