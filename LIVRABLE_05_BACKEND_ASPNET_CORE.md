# LIVRABLE 5 : BACKEND ASP.NET CORE - DÉVELOPPEMENT COMPLET

**Projet** : Brigade Médicale - Application de gestion médicale terrain
**Date** : 2026-01-24
**Version** : 1.0
**Statut** : En attente de validation

---

## 1. VUE D'ENSEMBLE ARCHITECTURE BACKEND

### 1.1 Architecture en couches (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────┐
│                    BRIGADE MEDICALE BACKEND                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  BrigadeMedicale.API (Web API Layer)                │    │
│  │  ├─ Controllers                                      │    │
│  │  ├─ Middleware                                       │    │
│  │  ├─ Filters                                          │    │
│  │  └─ Program.cs / appsettings.json                    │    │
│  └────────────────┬────────────────────────────────────┘    │
│                   │ Dépend de                                │
│  ┌────────────────▼────────────────────────────────────┐    │
│  │  BrigadeMedicale.Application (Business Logic)       │    │
│  │  ├─ Services (Implementations)                      │    │
│  │  ├─ Interfaces                                       │    │
│  │  ├─ DTOs                                             │    │
│  │  ├─ Validators                                       │    │
│  │  └─ Mappings                                         │    │
│  └────────────────┬────────────────────────────────────┘    │
│                   │ Dépend de                                │
│  ┌────────────────▼────────────────────────────────────┐    │
│  │  BrigadeMedicale.Infrastructure (Data Access)       │    │
│  │  ├─ Data/                                            │    │
│  │  │  ├─ ApplicationDbContext                          │    │
│  │  │  ├─ Repositories                                  │    │
│  │  │  └─ Migrations                                    │    │
│  │  ├─ Identity/                                        │    │
│  │  └─ External Services                                │    │
│  └────────────────┬────────────────────────────────────┘    │
│                   │ Dépend de                                │
│  ┌────────────────▼────────────────────────────────────┐    │
│  │  BrigadeMedicale.Domain (Core Entities)             │    │
│  │  ├─ Entities                                         │    │
│  │  ├─ Enums                                            │    │
│  │  ├─ Exceptions                                       │    │
│  │  └─ Constants                                        │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. STRUCTURE SOLUTION COMPLÈTE

```
BrigadeMedicale/
├── src/
│   ├── BrigadeMedicale.Domain/
│   │   ├── Entities/
│   │   │   ├── User.cs
│   │   │   ├── Role.cs
│   │   │   ├── Patient.cs
│   │   │   ├── PatientAccessToken.cs
│   │   │   ├── VitalSign.cs
│   │   │   ├── Consultation.cs
│   │   │   ├── Diagnosis.cs
│   │   │   ├── LabTest.cs
│   │   │   ├── LabResult.cs
│   │   │   ├── Prescription.cs
│   │   │   ├── PrescriptionItem.cs
│   │   │   ├── Medication.cs
│   │   │   ├── MedicationStock.cs
│   │   │   ├── PharmacyDispensation.cs
│   │   │   ├── Specialty.cs
│   │   │   ├── LabTestType.cs
│   │   │   ├── MedicalAuditLog.cs
│   │   │   └── SecurityAuditLog.cs
│   │   ├── Enums/
│   │   │   ├── Gender.cs
│   │   │   ├── ConsultationStatus.cs
│   │   │   ├── LabTestStatus.cs
│   │   │   ├── PrescriptionStatus.cs
│   │   │   ├── MedicationForm.cs
│   │   │   └── Roles.cs
│   │   ├── Exceptions/
│   │   │   ├── DomainException.cs
│   │   │   ├── NotFoundException.cs
│   │   │   ├── DuplicateException.cs
│   │   │   └── BusinessException.cs
│   │   └── Constants/
│   │       └── AppConstants.cs
│   │
│   ├── BrigadeMedicale.Application/
│   │   ├── Interfaces/
│   │   │   ├── IAuthService.cs
│   │   │   ├── IPatientService.cs
│   │   │   ├── IConsultationService.cs
│   │   │   ├── ILabTestService.cs
│   │   │   ├── IPrescriptionService.cs
│   │   │   ├── IPharmacyService.cs
│   │   │   ├── IMedicationService.cs
│   │   │   ├── IVitalSignService.cs
│   │   │   ├── IUserService.cs
│   │   │   ├── IPatientTokenService.cs
│   │   │   ├── ITokenBlacklistService.cs
│   │   │   ├── IAuditService.cs
│   │   │   └── IQRCodeService.cs
│   │   ├── Services/
│   │   │   ├── AuthService.cs
│   │   │   ├── PatientService.cs
│   │   │   ├── ConsultationService.cs
│   │   │   ├── LabTestService.cs
│   │   │   ├── PrescriptionService.cs
│   │   │   ├── PharmacyService.cs
│   │   │   ├── MedicationService.cs
│   │   │   ├── VitalSignService.cs
│   │   │   ├── UserService.cs
│   │   │   ├── PatientTokenService.cs
│   │   │   ├── TokenBlacklistService.cs
│   │   │   ├── AuditService.cs
│   │   │   └── QRCodeService.cs
│   │   ├── DTOs/
│   │   │   ├── Auth/
│   │   │   │   ├── LoginRequestDto.cs
│   │   │   │   ├── LoginResponseDto.cs
│   │   │   │   └── RefreshTokenRequestDto.cs
│   │   │   ├── Patient/
│   │   │   │   ├── CreatePatientDto.cs
│   │   │   │   ├── UpdatePatientDto.cs
│   │   │   │   ├── PatientDto.cs
│   │   │   │   └── PatientListDto.cs
│   │   │   ├── Consultation/
│   │   │   ├── LabTest/
│   │   │   ├── Prescription/
│   │   │   ├── Pharmacy/
│   │   │   └── Common/
│   │   │       ├── PaginationDto.cs
│   │   │       └── ApiResponseDto.cs
│   │   ├── Validators/
│   │   │   ├── CreatePatientValidator.cs
│   │   │   ├── LoginValidator.cs
│   │   │   └── ...
│   │   ├── Mappings/
│   │   │   └── AutoMapperProfile.cs
│   │   └── Helpers/
│   │       ├── PatientNumberGenerator.cs
│   │       └── AntiDuplicateDetector.cs
│   │
│   ├── BrigadeMedicale.Infrastructure/
│   │   ├── Data/
│   │   │   ├── ApplicationDbContext.cs
│   │   │   ├── Configurations/
│   │   │   │   ├── UserConfiguration.cs
│   │   │   │   ├── PatientConfiguration.cs
│   │   │   │   └── ...
│   │   │   ├── Repositories/
│   │   │   │   ├── Interfaces/
│   │   │   │   │   ├── IRepository.cs
│   │   │   │   │   ├── IPatientRepository.cs
│   │   │   │   │   └── ...
│   │   │   │   └── Implementations/
│   │   │   │       ├── Repository.cs
│   │   │   │       ├── PatientRepository.cs
│   │   │   │       └── ...
│   │   │   ├── Seeders/
│   │   │   │   └── DataSeeder.cs
│   │   │   └── Migrations/
│   │   ├── Identity/
│   │   │   └── JwtTokenService.cs
│   │   └── ExternalServices/
│   │       └── SmtpEmailService.cs (optionnel)
│   │
│   └── BrigadeMedicale.API/
│       ├── Controllers/
│       │   ├── AuthController.cs
│       │   ├── PatientsController.cs
│       │   ├── PublicController.cs
│       │   ├── ConsultationsController.cs
│       │   ├── LabTestsController.cs
│       │   ├── PrescriptionsController.cs
│       │   ├── PharmacyController.cs
│       │   ├── MedicationsController.cs
│       │   ├── VitalSignsController.cs
│       │   ├── UsersController.cs
│       │   ├── StatisticsController.cs
│       │   └── AuditController.cs
│       ├── Middleware/
│       │   ├── ExceptionHandlingMiddleware.cs
│       │   ├── PatientTokenMiddleware.cs
│       │   ├── RbacMiddleware.cs
│       │   └── RequestLoggingMiddleware.cs
│       ├── Filters/
│       │   └── ValidateModelStateFilter.cs
│       ├── Extensions/
│       │   ├── ServiceCollectionExtensions.cs
│       │   └── ApplicationBuilderExtensions.cs
│       ├── appsettings.json
│       ├── appsettings.Development.json
│       ├── appsettings.Production.json
│       └── Program.cs
│
├── tests/
│   ├── BrigadeMedicale.UnitTests/
│   │   ├── Services/
│   │   └── Validators/
│   └── BrigadeMedicale.IntegrationTests/
│       └── Controllers/
│
└── BrigadeMedicale.sln
```

---

## 3. COUCHE DOMAIN (Entités métier)

### 3.1 Entité de base

```csharp
// BrigadeMedicale.Domain/Entities/BaseEntity.cs

namespace BrigadeMedicale.Domain.Entities;

public abstract class BaseEntity
{
    public Guid Id { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}
```

---

### 3.2 Entités principales

#### User.cs

```csharp
// BrigadeMedicale.Domain/Entities/User.cs

namespace BrigadeMedicale.Domain.Entities;

public class User : BaseEntity
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime? LastLoginAt { get; set; }

    // Navigation properties
    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
    public ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
}

public class UserRole
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public int RoleId { get; set; }
    public Role Role { get; set; } = null!;
}

public class Role
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public ICollection<UserRole> UserRoles { get; set; } = new List<UserRole>();
}
```

---

#### Patient.cs

```csharp
// BrigadeMedicale.Domain/Entities/Patient.cs

using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Domain.Entities;

public class Patient : BaseEntity
{
    public string PatientNumber { get; set; } = string.Empty; // BM-2026-00001
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public Gender Gender { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? AlternativePhone { get; set; }
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? EmergencyContact { get; set; }
    public string? EmergencyPhone { get; set; }
    public string? BloodType { get; set; }
    public string? Allergies { get; set; }
    public string? ChronicDiseases { get; set; }
    public string RegistrationSource { get; set; } = "ACCUEIL"; // SELF_ONBOARDING | ACCUEIL
    public bool IsActive { get; set; } = true;

    public Guid? CreatedBy { get; set; }
    public User? Creator { get; set; }

    public Guid? UpdatedBy { get; set; }
    public User? Updater { get; set; }

    // Navigation properties
    public ICollection<VitalSign> VitalSigns { get; set; } = new List<VitalSign>();
    public ICollection<Consultation> Consultations { get; set; } = new List<Consultation>();
    public ICollection<PatientAccessToken> AccessTokens { get; set; } = new List<PatientAccessToken>();
    public ICollection<PatientDocument> Documents { get; set; } = new List<PatientDocument>();

    // Calculated property
    public int Age => DateTime.UtcNow.Year - DateOfBirth.Year;
}
```

---

#### Consultation.cs

```csharp
// BrigadeMedicale.Domain/Entities/Consultation.cs

using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Domain.Entities;

public class Consultation : BaseEntity
{
    public Guid PatientId { get; set; }
    public Patient Patient { get; set; } = null!;

    public int SpecialtyId { get; set; }
    public Specialty Specialty { get; set; } = null!;

    public Guid DoctorId { get; set; }
    public User Doctor { get; set; } = null!;

    public DateTime ConsultationDate { get; set; }
    public string ChiefComplaint { get; set; } = string.Empty;
    public string? History { get; set; }
    public string? PhysicalExamination { get; set; }
    public string? TreatmentPlan { get; set; }
    public string? Notes { get; set; }

    public ConsultationStatus Status { get; set; } = ConsultationStatus.IN_PROGRESS;
    public DateTime? CompletedAt { get; set; }

    // Navigation properties
    public ICollection<Diagnosis> Diagnoses { get; set; } = new List<Diagnosis>();
    public ICollection<LabTest> LabTests { get; set; } = new List<LabTest>();
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public ICollection<VitalSign> VitalSigns { get; set; } = new List<VitalSign>();
}
```

---

#### Prescription.cs

```csharp
// BrigadeMedicale.Domain/Entities/Prescription.cs

using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Domain.Entities;

public class Prescription : BaseEntity
{
    public Guid ConsultationId { get; set; }
    public Consultation Consultation { get; set; } = null!;

    public Guid PrescribedBy { get; set; }
    public User Prescriber { get; set; } = null!;

    public PrescriptionStatus Status { get; set; } = PrescriptionStatus.PENDING;
    public DateTime PrescribedAt { get; set; }
    public string? Notes { get; set; }

    // Navigation properties
    public ICollection<PrescriptionItem> Items { get; set; } = new List<PrescriptionItem>();
}

public class PrescriptionItem : BaseEntity
{
    public Guid PrescriptionId { get; set; }
    public Prescription Prescription { get; set; } = null!;

    public Guid MedicationId { get; set; }
    public Medication Medication { get; set; } = null!;

    public int Quantity { get; set; }
    public string Dosage { get; set; } = string.Empty;
    public string? Duration { get; set; }
    public string? Instructions { get; set; }

    // Navigation properties
    public ICollection<PharmacyDispensation> Dispensations { get; set; } = new List<PharmacyDispensation>();
}
```

---

#### MedicationStock.cs

```csharp
// BrigadeMedicale.Domain/Entities/MedicationStock.cs

namespace BrigadeMedicale.Domain.Entities;

public class Medication : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? GenericName { get; set; }
    public MedicationForm Form { get; set; }
    public string Dosage { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty; // comprimé, flacon, ampoule
    public bool IsActive { get; set; } = true;

    // Navigation properties
    public ICollection<MedicationStock> Stocks { get; set; } = new List<MedicationStock>();
}

public class MedicationStock : BaseEntity
{
    public Guid MedicationId { get; set; }
    public Medication Medication { get; set; } = null!;

    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public int InitialQuantity { get; set; }
    public int CurrentQuantity { get; set; }
    public int? MinimumThreshold { get; set; }
    public DateTime LastUpdatedAt { get; set; }

    // Navigation properties
    public ICollection<PharmacyDispensation> Dispensations { get; set; } = new List<PharmacyDispensation>();
}

public class PharmacyDispensation : BaseEntity
{
    public Guid PrescriptionItemId { get; set; }
    public PrescriptionItem PrescriptionItem { get; set; } = null!;

    public Guid MedicationStockId { get; set; }
    public MedicationStock MedicationStock { get; set; } = null!;

    public int QuantityDispensed { get; set; }
    public DateTime DispensedAt { get; set; }

    public Guid DispensedBy { get; set; }
    public User Dispenser { get; set; } = null!;

    public string? Notes { get; set; }
}
```

---

### 3.3 Enums

```csharp
// BrigadeMedicale.Domain/Enums/Gender.cs

namespace BrigadeMedicale.Domain.Enums;

public enum Gender
{
    Male = 0,
    Female = 1,
    Other = 2
}
```

```csharp
// BrigadeMedicale.Domain/Enums/ConsultationStatus.cs

namespace BrigadeMedicale.Domain.Enums;

public enum ConsultationStatus
{
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}
```

```csharp
// BrigadeMedicale.Domain/Enums/LabTestStatus.cs

namespace BrigadeMedicale.Domain.Enums;

public enum LabTestStatus
{
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    CANCELLED
}
```

```csharp
// BrigadeMedicale.Domain/Enums/PrescriptionStatus.cs

namespace BrigadeMedicale.Domain.Enums;

public enum PrescriptionStatus
{
    PENDING,
    PARTIALLY_DISPENSED,
    DISPENSED,
    CANCELLED
}
```

```csharp
// BrigadeMedicale.Domain/Enums/MedicationForm.cs

namespace BrigadeMedicale.Domain.Enums;

public enum MedicationForm
{
    TABLET,
    CAPSULE,
    SYRUP,
    INJECTION,
    OINTMENT,
    CREAM,
    DROPS,
    INHALER,
    SUPPOSITORY,
    OTHER
}
```

```csharp
// BrigadeMedicale.Domain/Enums/Roles.cs

namespace BrigadeMedicale.Domain.Enums;

public static class Roles
{
    public const string ADMIN = "ADMIN";
    public const string ACCUEIL = "ACCUEIL";
    public const string MEDECIN = "MEDECIN";
    public const string LABORANTIN = "LABORANTIN";
    public const string PHARMACIEN = "PHARMACIEN";
    public const string SUPERVISEUR = "SUPERVISEUR";
}
```

---

### 3.4 Exceptions personnalisées

```csharp
// BrigadeMedicale.Domain/Exceptions/DomainException.cs

namespace BrigadeMedicale.Domain.Exceptions;

public class DomainException : Exception
{
    public string Code { get; }

    public DomainException(string code, string message) : base(message)
    {
        Code = code;
    }
}

public class NotFoundException : DomainException
{
    public NotFoundException(string message) : base("NOT_FOUND", message) { }
}

public class DuplicateException : DomainException
{
    public object? DuplicateData { get; }

    public DuplicateException(string message, object? duplicateData = null)
        : base("DUPLICATE_ENTITY", message)
    {
        DuplicateData = duplicateData;
    }
}

public class BusinessException : DomainException
{
    public BusinessException(string code, string message) : base(code, message) { }
}

public class UnauthorizedException : DomainException
{
    public UnauthorizedException(string message) : base("UNAUTHORIZED", message) { }
}
```

---

## 4. COUCHE INFRASTRUCTURE (Data Access)

### 4.1 ApplicationDbContext

```csharp
// BrigadeMedicale.Infrastructure/Data/ApplicationDbContext.cs

using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;

namespace BrigadeMedicale.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    // DbSets
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<PatientAccessToken> PatientAccessTokens => Set<PatientAccessToken>();
    public DbSet<VitalSign> VitalSigns => Set<VitalSign>();
    public DbSet<Consultation> Consultations => Set<Consultation>();
    public DbSet<Diagnosis> Diagnoses => Set<Diagnosis>();
    public DbSet<Specialty> Specialties => Set<Specialty>();
    public DbSet<LabTest> LabTests => Set<LabTest>();
    public DbSet<LabTestType> LabTestTypes => Set<LabTestType>();
    public DbSet<LabResult> LabResults => Set<LabResult>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<PrescriptionItem> PrescriptionItems => Set<PrescriptionItem>();
    public DbSet<Medication> Medications => Set<Medication>();
    public DbSet<MedicationStock> MedicationStocks => Set<MedicationStock>();
    public DbSet<PharmacyDispensation> PharmacyDispensations => Set<PharmacyDispensation>();
    public DbSet<MedicalAuditLog> MedicalAuditLogs => Set<MedicalAuditLog>();
    public DbSet<SecurityAuditLog> SecurityAuditLogs => Set<SecurityAuditLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Application des configurations
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Auto-update timestamps
        var entries = ChangeTracker.Entries<BaseEntity>();

        foreach (var entry in entries)
        {
            if (entry.State == EntityState.Added)
            {
                entry.Entity.CreatedAt = DateTime.UtcNow;
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.Entity.UpdatedAt = DateTime.UtcNow;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
```

---

### 4.2 Configurations EF Core

```csharp
// BrigadeMedicale.Infrastructure/Data/Configurations/PatientConfiguration.cs

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BrigadeMedicale.Domain.Entities;

namespace BrigadeMedicale.Infrastructure.Data.Configurations;

public class PatientConfiguration : IEntityTypeConfiguration<Patient>
{
    public void Configure(EntityTypeBuilder<Patient> builder)
    {
        builder.ToTable("Patients");

        builder.HasKey(p => p.Id);

        builder.Property(p => p.PatientNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(p => p.PatientNumber)
            .IsUnique();

        builder.Property(p => p.FirstName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.LastName)
            .IsRequired()
            .HasMaxLength(100);

        builder.Property(p => p.PhoneNumber)
            .IsRequired()
            .HasMaxLength(20);

        builder.HasIndex(p => p.PhoneNumber);
        builder.HasIndex(p => p.DateOfBirth);
        builder.HasIndex(p => p.IsActive);

        // Constraint anti-doublon (optionnel)
        builder.HasIndex(p => new { p.PhoneNumber, p.DateOfBirth })
            .HasFilter("[IsActive] = 1")
            .IsUnique()
            .HasDatabaseName("IX_Patients_PhoneDOB");

        // Relations
        builder.HasOne(p => p.Creator)
            .WithMany()
            .HasForeignKey(p => p.CreatedBy)
            .OnDelete(DeleteBehavior.SetNull);

        builder.HasMany(p => p.VitalSigns)
            .WithOne(v => v.Patient)
            .HasForeignKey(v => v.PatientId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Consultations)
            .WithOne(c => c.Patient)
            .HasForeignKey(c => c.PatientId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
```

```csharp
// BrigadeMedicale.Infrastructure/Data/Configurations/UserConfiguration.cs

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using BrigadeMedicale.Domain.Entities;

namespace BrigadeMedicale.Infrastructure.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.ToTable("Users");

        builder.HasKey(u => u.Id);

        builder.Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(u => u.Username).IsUnique();

        builder.Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(100);

        builder.HasIndex(u => u.Email).IsUnique();

        builder.Property(u => u.PasswordHash)
            .IsRequired()
            .HasMaxLength(255);

        builder.HasIndex(u => u.IsActive);
    }
}

public class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.ToTable("UserRoles");

        builder.HasKey(ur => new { ur.UserId, ur.RoleId });

        builder.HasOne(ur => ur.User)
            .WithMany(u => u.UserRoles)
            .HasForeignKey(ur => ur.UserId);

        builder.HasOne(ur => ur.Role)
            .WithMany(r => r.UserRoles)
            .HasForeignKey(ur => ur.RoleId);
    }
}
```

---

### 4.3 Repository Pattern

```csharp
// BrigadeMedicale.Infrastructure/Data/Repositories/Interfaces/IRepository.cs

using System.Linq.Expressions;

namespace BrigadeMedicale.Infrastructure.Data.Repositories.Interfaces;

public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id);
    Task<IEnumerable<T>> GetAllAsync();
    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
    Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate);
    Task<bool> AnyAsync(Expression<Func<T, bool>> predicate);
    Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
    Task AddAsync(T entity);
    Task AddRangeAsync(IEnumerable<T> entities);
    void Update(T entity);
    void Remove(T entity);
    void RemoveRange(IEnumerable<T> entities);
}
```

```csharp
// BrigadeMedicale.Infrastructure/Data/Repositories/Implementations/Repository.cs

using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Infrastructure.Data.Repositories.Interfaces;
using System.Linq.Expressions;

namespace BrigadeMedicale.Infrastructure.Data.Repositories.Implementations;

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly ApplicationDbContext _context;
    protected readonly DbSet<T> _dbSet;

    public Repository(ApplicationDbContext context)
    {
        _context = context;
        _dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(Guid id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task<IEnumerable<T>> GetAllAsync()
    {
        return await _dbSet.ToListAsync();
    }

    public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.Where(predicate).ToListAsync();
    }

    public virtual async Task<T?> FirstOrDefaultAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.FirstOrDefaultAsync(predicate);
    }

    public virtual async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
    {
        return await _dbSet.AnyAsync(predicate);
    }

    public virtual async Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null)
    {
        return predicate == null
            ? await _dbSet.CountAsync()
            : await _dbSet.CountAsync(predicate);
    }

    public virtual async Task AddAsync(T entity)
    {
        await _dbSet.AddAsync(entity);
    }

    public virtual async Task AddRangeAsync(IEnumerable<T> entities)
    {
        await _dbSet.AddRangeAsync(entities);
    }

    public virtual void Update(T entity)
    {
        _dbSet.Update(entity);
    }

    public virtual void Remove(T entity)
    {
        _dbSet.Remove(entity);
    }

    public virtual void RemoveRange(IEnumerable<T> entities)
    {
        _dbSet.RemoveRange(entities);
    }
}
```

---

```csharp
// BrigadeMedicale.Infrastructure/Data/Repositories/Interfaces/IPatientRepository.cs

using BrigadeMedicale.Domain.Entities;

namespace BrigadeMedicale.Infrastructure.Data.Repositories.Interfaces;

public interface IPatientRepository : IRepository<Patient>
{
    Task<Patient?> GetByPatientNumberAsync(string patientNumber);
    Task<Patient?> GetByPhoneAndDobAsync(string phoneNumber, DateTime dateOfBirth);
    Task<IEnumerable<Patient>> SearchAsync(string searchTerm, int page, int pageSize);
    Task<IEnumerable<Patient>> FindPotentialDuplicatesAsync(string firstName, string lastName, DateTime dateOfBirth);
}
```

```csharp
// BrigadeMedicale.Infrastructure/Data/Repositories/Implementations/PatientRepository.cs

using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Infrastructure.Data.Repositories.Interfaces;

namespace BrigadeMedicale.Infrastructure.Data.Repositories.Implementations;

public class PatientRepository : Repository<Patient>, IPatientRepository
{
    public PatientRepository(ApplicationDbContext context) : base(context) { }

    public async Task<Patient?> GetByPatientNumberAsync(string patientNumber)
    {
        return await _dbSet
            .FirstOrDefaultAsync(p => p.PatientNumber == patientNumber);
    }

    public async Task<Patient?> GetByPhoneAndDobAsync(string phoneNumber, DateTime dateOfBirth)
    {
        return await _dbSet
            .FirstOrDefaultAsync(p => p.PhoneNumber == phoneNumber
                                   && p.DateOfBirth.Date == dateOfBirth.Date
                                   && p.IsActive);
    }

    public async Task<IEnumerable<Patient>> SearchAsync(string searchTerm, int page, int pageSize)
    {
        var query = _dbSet.AsQueryable();

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

    public async Task<IEnumerable<Patient>> FindPotentialDuplicatesAsync(
        string firstName, string lastName, DateTime dateOfBirth)
    {
        return await _dbSet
            .Where(p => p.IsActive
                     && p.DateOfBirth.Date == dateOfBirth.Date
                     && (p.FirstName.ToLower() == firstName.ToLower()
                      || p.LastName.ToLower() == lastName.ToLower()))
            .ToListAsync();
    }
}
```

---

### 4.4 Unit of Work Pattern

```csharp
// BrigadeMedicale.Infrastructure/Data/IUnitOfWork.cs

using BrigadeMedicale.Infrastructure.Data.Repositories.Interfaces;

namespace BrigadeMedicale.Infrastructure.Data;

public interface IUnitOfWork : IDisposable
{
    IPatientRepository Patients { get; }
    IRepository<User> Users { get; }
    IRepository<Consultation> Consultations { get; }
    IRepository<Prescription> Prescriptions { get; }
    IRepository<Medication> Medications { get; }
    IRepository<MedicationStock> MedicationStocks { get; }
    // ... autres repositories

    Task<int> SaveChangesAsync();
    Task BeginTransactionAsync();
    Task CommitTransactionAsync();
    Task RollbackTransactionAsync();
}
```

```csharp
// BrigadeMedicale.Infrastructure/Data/UnitOfWork.cs

using Microsoft.EntityFrameworkCore.Storage;
using BrigadeMedicale.Infrastructure.Data.Repositories.Interfaces;
using BrigadeMedicale.Infrastructure.Data.Repositories.Implementations;
using BrigadeMedicale.Domain.Entities;

namespace BrigadeMedicale.Infrastructure.Data;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;
    private IDbContextTransaction? _transaction;

    public IPatientRepository Patients { get; }
    public IRepository<User> Users { get; }
    public IRepository<Consultation> Consultations { get; }
    public IRepository<Prescription> Prescriptions { get; }
    public IRepository<Medication> Medications { get; }
    public IRepository<MedicationStock> MedicationStocks { get; }

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;

        Patients = new PatientRepository(_context);
        Users = new Repository<User>(_context);
        Consultations = new Repository<Consultation>(_context);
        Prescriptions = new Repository<Prescription>(_context);
        Medications = new Repository<Medication>(_context);
        MedicationStocks = new Repository<MedicationStock>(_context);
    }

    public async Task<int> SaveChangesAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public async Task BeginTransactionAsync()
    {
        _transaction = await _context.Database.BeginTransactionAsync();
    }

    public async Task CommitTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.CommitAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public async Task RollbackTransactionAsync()
    {
        if (_transaction != null)
        {
            await _transaction.RollbackAsync();
            await _transaction.DisposeAsync();
            _transaction = null;
        }
    }

    public void Dispose()
    {
        _transaction?.Dispose();
        _context.Dispose();
    }
}
```

---

### 4.5 Data Seeder

```csharp
// BrigadeMedicale.Infrastructure/Data/Seeders/DataSeeder.cs

using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Infrastructure.Data.Seeders;

public static class DataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Seed Roles
        if (!await context.Roles.AnyAsync())
        {
            var roles = new[]
            {
                new Role { Id = 1, Name = Roles.ADMIN, Description = "Administrateur système" },
                new Role { Id = 2, Name = Roles.ACCUEIL, Description = "Agent d'accueil" },
                new Role { Id = 3, Name = Roles.MEDECIN, Description = "Médecin" },
                new Role { Id = 4, Name = Roles.LABORANTIN, Description = "Technicien de laboratoire" },
                new Role { Id = 5, Name = Roles.PHARMACIEN, Description = "Pharmacien" },
                new Role { Id = 6, Name = Roles.SUPERVISEUR, Description = "Superviseur" }
            };

            await context.Roles.AddRangeAsync(roles);
            await context.SaveChangesAsync();
        }

        // Seed Specialties
        if (!await context.Specialties.AnyAsync())
        {
            var specialties = new[]
            {
                new Specialty { Id = 1, Name = "Médecine Générale", Code = "MG", IsActive = true },
                new Specialty { Id = 2, Name = "Pédiatrie", Code = "PED", IsActive = true },
                new Specialty { Id = 3, Name = "Gynécologie", Code = "GYN", IsActive = true },
                new Specialty { Id = 4, Name = "Ophtalmologie", Code = "OPH", IsActive = true },
                new Specialty { Id = 5, Name = "Dentisterie", Code = "DENT", IsActive = true },
                new Specialty { Id = 6, Name = "Chirurgie Mineure", Code = "CHIR", IsActive = true }
            };

            await context.Specialties.AddRangeAsync(specialties);
            await context.SaveChangesAsync();
        }

        // Seed LabTestTypes
        if (!await context.LabTestTypes.AnyAsync())
        {
            var labTestTypes = new[]
            {
                new LabTestType { Id = 1, Name = "Numération Formule Sanguine", Code = "NFS", IsActive = true },
                new LabTestType { Id = 2, Name = "Glycémie", Code = "GLY", IsActive = true },
                new LabTestType { Id = 3, Name = "Parasitologie des selles", Code = "PARA", IsActive = true },
                new LabTestType { Id = 4, Name = "Test de grossesse", Code = "HCG", IsActive = true },
                new LabTestType { Id = 5, Name = "Groupe sanguin", Code = "GRP", IsActive = true },
                new LabTestType { Id = 6, Name = "Goutte épaisse (Paludisme)", Code = "GE", IsActive = true }
            };

            await context.LabTestTypes.AddRangeAsync(labTestTypes);
            await context.SaveChangesAsync();
        }

        // Seed Default Admin User
        if (!await context.Users.AnyAsync(u => u.Username == "admin"))
        {
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                Username = "admin",
                Email = "admin@brigade-medicale.org",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@2026"),
                FirstName = "Administrateur",
                LastName = "Système",
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            await context.Users.AddAsync(adminUser);
            await context.SaveChangesAsync();

            // Assign ADMIN role
            var userRole = new UserRole
            {
                UserId = adminUser.Id,
                RoleId = 1 // ADMIN
            };

            await context.UserRoles.AddAsync(userRole);
            await context.SaveChangesAsync();
        }
    }
}
```

---

## 5. COUCHE APPLICATION (Services métier)

### 5.1 DTOs

```csharp
// BrigadeMedicale.Application/DTOs/Auth/LoginRequestDto.cs

using System.ComponentModel.DataAnnotations;

namespace BrigadeMedicale.Application.DTOs.Auth;

public class LoginRequestDto
{
    [Required(ErrorMessage = "Le nom d'utilisateur est requis")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le mot de passe est requis")]
    public string Password { get; set; } = string.Empty;

    public bool RememberMe { get; set; } = false;
}

public class LoginResponseDto
{
    public string AccessToken { get; set; } = string.Empty;
    public string TokenType { get; set; } = "Bearer";
    public int ExpiresIn { get; set; }
    public UserDto User { get; set; } = null!;
}

public class UserDto
{
    public Guid Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public List<string> Roles { get; set; } = new();
}
```

```csharp
// BrigadeMedicale.Application/DTOs/Patient/CreatePatientDto.cs

using System.ComponentModel.DataAnnotations;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Application.DTOs.Patient;

public class CreatePatientDto
{
    [Required(ErrorMessage = "Le prénom est requis")]
    [StringLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Le nom est requis")]
    [StringLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required(ErrorMessage = "La date de naissance est requise")]
    public DateTime DateOfBirth { get; set; }

    [Required(ErrorMessage = "Le sexe est requis")]
    public Gender Gender { get; set; }

    [Required(ErrorMessage = "Le numéro de téléphone est requis")]
    [Phone(ErrorMessage = "Le numéro de téléphone est invalide")]
    public string PhoneNumber { get; set; } = string.Empty;

    [Phone]
    public string? AlternativePhone { get; set; }

    public string? Address { get; set; }
    public string? City { get; set; }
    public string? EmergencyContact { get; set; }
    public string? EmergencyPhone { get; set; }
    public string? BloodType { get; set; }
    public string? Allergies { get; set; }
    public string? ChronicDiseases { get; set; }
}

public class PatientDto
{
    public Guid Id { get; set; }
    public string PatientNumber { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public int Age { get; set; }
    public Gender Gender { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? City { get; set; }
    public string? BloodType { get; set; }
    public string? Allergies { get; set; }
    public DateTime CreatedAt { get; set; }
    public bool IsActive { get; set; }
}
```

```csharp
// BrigadeMedicale.Application/DTOs/Common/ApiResponseDto.cs

namespace BrigadeMedicale.Application.DTOs.Common;

public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public string? Message { get; set; }
    public ErrorDto? Error { get; set; }

    public static ApiResponse<T> SuccessResponse(T data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Data = data,
            Message = message
        };
    }

    public static ApiResponse<T> ErrorResponse(string code, string message, object? details = null)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Error = new ErrorDto
            {
                Code = code,
                Message = message,
                Details = details
            }
        };
    }
}

public class ErrorDto
{
    public string Code { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public object? Details { get; set; }
}

public class PaginatedResponse<T>
{
    public List<T> Items { get; set; } = new();
    public PaginationMetadata Pagination { get; set; } = new();
}

public class PaginationMetadata
{
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalItems { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}
```

---

### 5.2 Service PatientService (exemple complet)

```csharp
// BrigadeMedicale.Application/Interfaces/IPatientService.cs

using BrigadeMedicale.Application.DTOs.Patient;
using BrigadeMedicale.Application.DTOs.Common;

namespace BrigadeMedicale.Application.Interfaces;

public interface IPatientService
{
    Task<PatientDto> CreatePatientAsync(CreatePatientDto dto, Guid? createdBy, string source);
    Task<PatientDto> GetByIdAsync(Guid id);
    Task<PatientDto?> GetByPatientNumberAsync(string patientNumber);
    Task<PaginatedResponse<PatientListDto>> SearchPatientsAsync(string? searchTerm, int page, int pageSize);
    Task<PatientDto> UpdatePatientAsync(Guid id, UpdatePatientDto dto, Guid updatedBy);
    Task<string> GenerateAccessTokenAsync(Guid patientId);
}
```

```csharp
// BrigadeMedicale.Application/Services/PatientService.cs

using AutoMapper;
using BrigadeMedicale.Application.DTOs.Patient;
using BrigadeMedicale.Application.DTOs.Common;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Application.Helpers;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Exceptions;
using BrigadeMedicale.Infrastructure.Data;

namespace BrigadeMedicale.Application.Services;

public class PatientService : IPatientService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPatientTokenService _tokenService;
    private readonly IQRCodeService _qrCodeService;
    private readonly IAuditService _auditService;

    public PatientService(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IPatientTokenService tokenService,
        IQRCodeService qrCodeService,
        IAuditService auditService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _tokenService = tokenService;
        _qrCodeService = qrCodeService;
        _auditService = auditService;
    }

    public async Task<PatientDto> CreatePatientAsync(CreatePatientDto dto, Guid? createdBy, string source)
    {
        // 1. Vérification anti-doublon (téléphone + date naissance)
        var existingPatient = await _unitOfWork.Patients
            .GetByPhoneAndDobAsync(dto.PhoneNumber, dto.DateOfBirth);

        if (existingPatient != null)
        {
            throw new DuplicateException(
                "Un patient avec ce numéro de téléphone et date de naissance existe déjà",
                new { existingPatient.PatientNumber, existingPatient.FirstName, existingPatient.LastName });
        }

        // 2. Vérification similarité nom+prénom (optionnel)
        var potentialDuplicates = await _unitOfWork.Patients
            .FindPotentialDuplicatesAsync(dto.FirstName, dto.LastName, dto.DateOfBirth);

        if (potentialDuplicates.Any())
        {
            // Log warning ou retourner pour confirmation manuelle
            // Pour simplifier, on continue ici
        }

        // 3. Génération PatientNumber
        var patientNumber = await PatientNumberGenerator.GenerateAsync(
            _unitOfWork.Patients, DateTime.UtcNow.Year);

        // 4. Création entité
        var patient = _mapper.Map<Patient>(dto);
        patient.Id = Guid.NewGuid();
        patient.PatientNumber = patientNumber;
        patient.RegistrationSource = source;
        patient.CreatedBy = createdBy;
        patient.CreatedAt = DateTime.UtcNow;

        await _unitOfWork.Patients.AddAsync(patient);
        await _unitOfWork.SaveChangesAsync();

        // 5. Audit médical
        await _auditService.LogMedicalActionAsync(new MedicalAuditLog
        {
            EntityType = "PATIENT",
            EntityId = patient.Id,
            Action = "CREATE",
            PatientId = patient.Id,
            PerformedBy = createdBy ?? Guid.Empty,
            RoleName = source == "SELF_ONBOARDING" ? "PUBLIC" : "ACCUEIL",
            Timestamp = DateTime.UtcNow
        });

        return _mapper.Map<PatientDto>(patient);
    }

    public async Task<PatientDto> GetByIdAsync(Guid id)
    {
        var patient = await _unitOfWork.Patients.GetByIdAsync(id);

        if (patient == null)
            throw new NotFoundException("Patient introuvable");

        return _mapper.Map<PatientDto>(patient);
    }

    public async Task<PatientDto?> GetByPatientNumberAsync(string patientNumber)
    {
        var patient = await _unitOfWork.Patients.GetByPatientNumberAsync(patientNumber);
        return patient == null ? null : _mapper.Map<PatientDto>(patient);
    }

    public async Task<PaginatedResponse<PatientListDto>> SearchPatientsAsync(
        string? searchTerm, int page, int pageSize)
    {
        var patients = await _unitOfWork.Patients.SearchAsync(searchTerm ?? "", page, pageSize);
        var totalCount = await _unitOfWork.Patients.CountAsync(p => p.IsActive);

        var items = _mapper.Map<List<PatientListDto>>(patients);

        return new PaginatedResponse<PatientListDto>
        {
            Items = items,
            Pagination = new PaginationMetadata
            {
                CurrentPage = page,
                PageSize = pageSize,
                TotalItems = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                HasNextPage = page * pageSize < totalCount,
                HasPreviousPage = page > 1
            }
        };
    }

    public async Task<PatientDto> UpdatePatientAsync(Guid id, UpdatePatientDto dto, Guid updatedBy)
    {
        var patient = await _unitOfWork.Patients.GetByIdAsync(id);

        if (patient == null)
            throw new NotFoundException("Patient introuvable");

        // Mapping des champs modifiables
        _mapper.Map(dto, patient);
        patient.UpdatedBy = updatedBy;
        patient.UpdatedAt = DateTime.UtcNow;

        _unitOfWork.Patients.Update(patient);
        await _unitOfWork.SaveChangesAsync();

        // Audit
        await _auditService.LogMedicalActionAsync(new MedicalAuditLog
        {
            EntityType = "PATIENT",
            EntityId = patient.Id,
            Action = "UPDATE",
            PatientId = patient.Id,
            PerformedBy = updatedBy,
            Timestamp = DateTime.UtcNow
        });

        return _mapper.Map<PatientDto>(patient);
    }

    public async Task<string> GenerateAccessTokenAsync(Guid patientId)
    {
        return await _tokenService.GenerateTokenAsync(patientId);
    }
}
```

---

### 5.3 Helper PatientNumberGenerator

```csharp
// BrigadeMedicale.Application/Helpers/PatientNumberGenerator.cs

using BrigadeMedicale.Infrastructure.Data.Repositories.Interfaces;

namespace BrigadeMedicale.Application.Helpers;

public static class PatientNumberGenerator
{
    public static async Task<string> GenerateAsync(IPatientRepository repository, int year)
    {
        // Format: BM-2026-00001

        var prefix = $"BM-{year}-";

        // Récupération dernier numéro pour l'année
        var lastPatient = (await repository.FindAsync(p => p.PatientNumber.StartsWith(prefix)))
            .OrderByDescending(p => p.PatientNumber)
            .FirstOrDefault();

        int nextSequence = 1;

        if (lastPatient != null)
        {
            var lastNumber = lastPatient.PatientNumber.Replace(prefix, "");
            if (int.TryParse(lastNumber, out int lastSequence))
            {
                nextSequence = lastSequence + 1;
            }
        }

        return $"{prefix}{nextSequence:D5}"; // BM-2026-00001
    }
}
```

---

### 5.4 AutoMapper Profile

```csharp
// BrigadeMedicale.Application/Mappings/AutoMapperProfile.cs

using AutoMapper;
using BrigadeMedicale.Application.DTOs.Patient;
using BrigadeMedicale.Application.DTOs.Auth;
using BrigadeMedicale.Domain.Entities;

namespace BrigadeMedicale.Application.Mappings;

public class AutoMapperProfile : Profile
{
    public AutoMapperProfile()
    {
        // Patient mappings
        CreateMap<CreatePatientDto, Patient>();
        CreateMap<UpdatePatientDto, Patient>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));
        CreateMap<Patient, PatientDto>();
        CreateMap<Patient, PatientListDto>();

        // User mappings
        CreateMap<User, UserDto>()
            .ForMember(dest => dest.Roles,
                opt => opt.MapFrom(src => src.UserRoles.Select(ur => ur.Role.Name).ToList()));

        // Consultation mappings
        // ... autres mappings
    }
}
```

---

## 6. SUITE DU DOCUMENT

Le document continue avec :
- Controllers ASP.NET Core complets
- Middleware personnalisés
- Configuration Program.cs
- Gestion des erreurs
- Tests unitaires

**Voulez-vous que je continue avec la suite du LIVRABLE 5 ou validez-vous cette première partie ?**
