using BrigadeMedicale.Application.DTOs.Prescription;
using BrigadeMedicale.Application.DTOs.Medication;
using BrigadeMedicale.Application.DTOs.StockMovement;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Application.Interfaces.Repositories;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;
using BrigadeMedicale.Domain.Exceptions;

namespace BrigadeMedicale.Application.Services;

public class PharmacyService : IPharmacyService
{
    private readonly IPrescriptionRepository _prescriptionRepository;
    private readonly IMedicationRepository _medicationRepository;
    private readonly IStockMovementRepository _stockMovementRepository;

    public PharmacyService(
        IPrescriptionRepository prescriptionRepository,
        IMedicationRepository medicationRepository,
        IStockMovementRepository stockMovementRepository)
    {
        _prescriptionRepository = prescriptionRepository;
        _medicationRepository = medicationRepository;
        _stockMovementRepository = stockMovementRepository;
    }

    public async Task<PrescriptionDto> CreatePrescriptionAsync(CreatePrescriptionDto dto)
    {
        var medication = await _medicationRepository.GetByIdAsync(dto.MedicationId);
        if (medication == null || !medication.IsActive)
        {
            throw new NotFoundException("Médicament introuvable");
        }

        var prescription = new Prescription
        {
            Id = Guid.NewGuid(),
            ConsultationId = dto.ConsultationId,
            MedicationId = dto.MedicationId,
            QuantityPrescribed = dto.QuantityPrescribed,
            QuantityDispensed = 0,
            Dosage = dto.Dosage,
            Instructions = dto.Instructions,
            Status = PrescriptionStatus.Pending
        };

        await _prescriptionRepository.AddAsync(prescription);
        await _prescriptionRepository.SaveChangesAsync();

        return new PrescriptionDto
        {
            Id = prescription.Id,
            ConsultationId = prescription.ConsultationId,
            MedicationId = prescription.MedicationId,
            MedicationName = medication.Name,
            QuantityPrescribed = prescription.QuantityPrescribed,
            QuantityDispensed = prescription.QuantityDispensed,
            Dosage = prescription.Dosage,
            Instructions = prescription.Instructions,
            Status = prescription.Status,
            CreatedAt = prescription.CreatedAt
        };
    }

    public async Task<PrescriptionDto> DispensePrescriptionAsync(Guid prescriptionId, int quantity, Guid pharmacistId)
    {
        var prescription = await _prescriptionRepository.GetByIdWithDetailsAsync(prescriptionId);
        if (prescription == null)
        {
            throw new NotFoundException("Prescription introuvable");
        }

        if (prescription.Status == PrescriptionStatus.Dispensed)
        {
            throw new BusinessException("Cette prescription a déjà été entièrement dispensée");
        }

        var newTotal = prescription.QuantityDispensed + quantity;
        if (newTotal > prescription.QuantityPrescribed)
        {
            throw new BusinessException($"Quantité trop élevée. Restant à dispenser: {prescription.QuantityPrescribed - prescription.QuantityDispensed}");
        }

        // Vérifier le stock disponible
        var currentStock = await _medicationRepository.CalculateCurrentStockAsync(prescription.MedicationId);
        if (currentStock < quantity)
        {
            throw new BusinessException($"Stock insuffisant. Stock actuel: {currentStock}");
        }

        // Mettre à jour la prescription
        prescription.QuantityDispensed = newTotal;
        prescription.DispensedBy = pharmacistId;
        prescription.DispensedAt = DateTime.UtcNow;

        if (newTotal == prescription.QuantityPrescribed)
        {
            prescription.Status = PrescriptionStatus.Dispensed;
        }
        else
        {
            prescription.Status = PrescriptionStatus.PartiallyDispensed;
        }

        _prescriptionRepository.Update(prescription);

        // Créer un mouvement de stock (sortie)
        var stockMovement = new StockMovement
        {
            Id = Guid.NewGuid(),
            MedicationId = prescription.MedicationId,
            MovementType = MovementType.Exit,
            Quantity = quantity,
            Reason = $"Prescription {prescription.Id}",
            UserId = pharmacistId,
            PrescriptionId = prescriptionId
        };

        await _stockMovementRepository.AddAsync(stockMovement);
        await _stockMovementRepository.SaveChangesAsync();
        await _prescriptionRepository.SaveChangesAsync();

        return new PrescriptionDto
        {
            Id = prescription.Id,
            ConsultationId = prescription.ConsultationId,
            MedicationId = prescription.MedicationId,
            MedicationName = prescription.Medication.Name,
            QuantityPrescribed = prescription.QuantityPrescribed,
            QuantityDispensed = prescription.QuantityDispensed,
            Dosage = prescription.Dosage,
            Instructions = prescription.Instructions,
            Status = prescription.Status,
            DispensedAt = prescription.DispensedAt,
            DispensedBy = prescription.DispensedBy,
            CreatedAt = prescription.CreatedAt
        };
    }

    public async Task<(List<PrescriptionDto> Items, int TotalCount)> GetPendingPrescriptionsAsync(int page, int pageSize)
    {
        var prescriptions = await _prescriptionRepository.GetByStatusAsync(PrescriptionStatus.Pending, page, pageSize);
        var totalCount = await _prescriptionRepository.CountByStatusAsync(PrescriptionStatus.Pending);

        var items = prescriptions.Select(p => new PrescriptionDto
        {
            Id = p.Id,
            ConsultationId = p.ConsultationId,
            MedicationId = p.MedicationId,
            MedicationName = p.Medication.Name,
            QuantityPrescribed = p.QuantityPrescribed,
            QuantityDispensed = p.QuantityDispensed,
            Dosage = p.Dosage,
            Status = p.Status,
            CreatedAt = p.CreatedAt
        }).ToList();

        return (items, totalCount);
    }

    public async Task<MedicationDto> CreateMedicationAsync(CreateMedicationDto dto)
    {
        // Vérifier doublon
        var existing = await _medicationRepository.GetByNameAsync(dto.Name);
        if (existing != null)
        {
            throw new DuplicateException("Un médicament avec ce nom existe déjà", new { existing.Name });
        }

        var medication = new Medication
        {
            Id = Guid.NewGuid(),
            Name = dto.Name,
            GenericName = dto.GenericName,
            Form = dto.Form,
            Strength = dto.Strength,
            Unit = dto.Unit,
            IsActive = true
        };

        await _medicationRepository.AddAsync(medication);
        await _medicationRepository.SaveChangesAsync();

        return new MedicationDto
        {
            Id = medication.Id,
            Name = medication.Name,
            GenericName = medication.GenericName,
            Form = medication.Form,
            Strength = medication.Strength,
            Unit = medication.Unit,
            CurrentStock = 0,
            IsActive = medication.IsActive,
            CreatedAt = medication.CreatedAt
        };
    }

    public async Task<MedicationDto> GetMedicationByIdAsync(Guid id)
    {
        var medication = await _medicationRepository.GetByIdAsync(id);
        if (medication == null)
        {
            throw new NotFoundException("Médicament introuvable");
        }

        var currentStock = await _medicationRepository.CalculateCurrentStockAsync(id);

        return new MedicationDto
        {
            Id = medication.Id,
            Name = medication.Name,
            GenericName = medication.GenericName,
            Form = medication.Form,
            Strength = medication.Strength,
            Unit = medication.Unit,
            CurrentStock = currentStock,
            IsActive = medication.IsActive,
            CreatedAt = medication.CreatedAt
        };
    }

    public async Task<(List<MedicationDto> Items, int TotalCount)> SearchMedicationsAsync(string? searchTerm, int page, int pageSize)
    {
        var medications = await _medicationRepository.SearchAsync(searchTerm, page, pageSize);
        var totalCount = await _medicationRepository.CountAsync();

        var items = new List<MedicationDto>();
        foreach (var medication in medications)
        {
            var currentStock = await _medicationRepository.CalculateCurrentStockAsync(medication.Id);
            items.Add(new MedicationDto
            {
                Id = medication.Id,
                Name = medication.Name,
                GenericName = medication.GenericName,
                Form = medication.Form,
                Strength = medication.Strength,
                Unit = medication.Unit,
                CurrentStock = currentStock,
                IsActive = medication.IsActive,
                CreatedAt = medication.CreatedAt
            });
        }

        return (items, totalCount);
    }

    public async Task AddStockMovementAsync(CreateStockMovementDto dto, Guid userId)
    {
        var medication = await _medicationRepository.GetByIdAsync(dto.MedicationId);
        if (medication == null || !medication.IsActive)
        {
            throw new NotFoundException("Médicament introuvable");
        }

        var movement = new StockMovement
        {
            Id = Guid.NewGuid(),
            MedicationId = dto.MedicationId,
            MovementType = dto.MovementType,
            Quantity = dto.Quantity,
            LotNumber = dto.LotNumber,
            ExpiryDate = dto.ExpiryDate,
            Reason = dto.Reason,
            UserId = userId
        };

        await _stockMovementRepository.AddAsync(movement);
        await _stockMovementRepository.SaveChangesAsync();
    }

    public async Task<int> GetCurrentStockAsync(Guid medicationId)
    {
        return await _medicationRepository.CalculateCurrentStockAsync(medicationId);
    }
}
