using Microsoft.EntityFrameworkCore;
using BrigadeMedicale.Domain.Entities;

namespace BrigadeMedicale.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
        // Suppress pending model changes warning (seeding changes don't require migrations)
        optionsBuilder.ConfigureWarnings(w =>
            w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<PatientToken> PatientTokens => Set<PatientToken>();
    public DbSet<TriageRecord> TriageRecords => Set<TriageRecord>();
    public DbSet<Consultation> Consultations => Set<Consultation>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<Medication> Medications => Set<Medication>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();
    public DbSet<LabTestRequest> LabTestRequests => Set<LabTestRequest>();
    public DbSet<TrainingModule> TrainingModules => Set<TrainingModule>();
    public DbSet<TrainingStep> TrainingSteps => Set<TrainingStep>();
    public DbSet<TrainingQuiz> TrainingQuizzes => Set<TrainingQuiz>();
    public DbSet<TrainingProgress> TrainingProgress => Set<TrainingProgress>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // User configuration
        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();

            // Seed test user: admin / admin123
            // Password hash generated with BCrypt for "admin123"
            var adminUserId = new Guid("00000000-0000-0000-0000-000000000001");
            entity.HasData(
                new User
                {
                    Id = adminUserId,
                    Username = "admin",
                    Email = "admin@brigade.com",
                    PasswordHash = "$2a$11$fXEIORWwGNdft//xGOI4melViISH3./sbEi2I5fVD/LX0HtBdtq8C", // admin123
                    FirstName = "Admin",
                    LastName = "Système",
                    IsActive = true,
                    CreatedAt = new DateTime(2025, 1, 1, 0, 0, 0, DateTimeKind.Utc)
                }
            );
        });

        // Role configuration
        modelBuilder.Entity<Role>(entity =>
        {
            entity.ToTable("Roles");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Name).IsUnique();

            // Seed roles
            entity.HasData(
                new Role { Id = 1, Name = "ADMIN", Description = "Administrateur système" },
                new Role { Id = 2, Name = "ACCUEIL", Description = "Agent d'accueil" },
                new Role { Id = 3, Name = "INFIRMIER", Description = "Infirmier" },
                new Role { Id = 4, Name = "MEDECIN", Description = "Médecin" },
                new Role { Id = 5, Name = "LABORANTIN", Description = "Technicien de laboratoire" },
                new Role { Id = 6, Name = "PHARMACIEN", Description = "Pharmacien" },
                new Role { Id = 7, Name = "SUPERVISEUR", Description = "Superviseur" }
            );
        });

        // UserRole configuration
        modelBuilder.Entity<UserRole>(entity =>
        {
            entity.ToTable("UserRoles");
            entity.HasKey(e => new { e.UserId, e.RoleId });

            entity.HasOne(e => e.User)
                .WithMany(u => u.UserRoles)
                .HasForeignKey(e => e.UserId);

            entity.HasOne(e => e.Role)
                .WithMany(r => r.UserRoles)
                .HasForeignKey(e => e.RoleId);

            // Seed UserRole: admin user has ADMIN and INFIRMIER roles
            entity.HasData(
                new UserRole
                {
                    UserId = new Guid("00000000-0000-0000-0000-000000000001"),
                    RoleId = 1  // ADMIN role
                },
                new UserRole
                {
                    UserId = new Guid("00000000-0000-0000-0000-000000000001"),
                    RoleId = 3  // INFIRMIER role
                }
            );
        });

        // Patient configuration
        modelBuilder.Entity<Patient>(entity =>
        {
            entity.ToTable("Patients");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.PatientNumber).IsRequired().HasMaxLength(20);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PhoneNumber).IsRequired().HasMaxLength(20);

            entity.HasIndex(e => e.PatientNumber).IsUnique();
            entity.HasIndex(e => e.PhoneNumber);
            entity.HasIndex(e => new { e.PhoneNumber, e.DateOfBirth })
                .HasFilter("[IsActive] = 1")
                .IsUnique();
        });

        // RefreshToken configuration
        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.ToTable("RefreshTokens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.HasIndex(e => e.Token).IsUnique();

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // PatientToken configuration
        modelBuilder.Entity<PatientToken>(entity =>
        {
            entity.ToTable("PatientTokens");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Token).IsRequired().HasMaxLength(500);
            entity.HasIndex(e => e.Token).IsUnique();

            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // TriageRecord configuration
        modelBuilder.Entity<TriageRecord>(entity =>
        {
            entity.ToTable("TriageRecords");
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Infirmier)
                .WithMany()
                .HasForeignKey(e => e.InfirmierId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Consultation)
                .WithOne(c => c.TriageRecord)
                .HasForeignKey<Consultation>(c => c.TriageRecordId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.PatientId);
            entity.HasIndex(e => e.RecordedAt);
            entity.HasIndex(e => e.Status);
        });

        // Consultation configuration
        modelBuilder.Entity<Consultation>(entity =>
        {
            entity.ToTable("Consultations");
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Patient)
                .WithMany()
                .HasForeignKey(e => e.PatientId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Doctor)
                .WithMany()
                .HasForeignKey(e => e.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => e.PatientId);
            entity.HasIndex(e => e.ConsultationDate);
        });

        // Prescription configuration
        modelBuilder.Entity<Prescription>(entity =>
        {
            entity.ToTable("Prescriptions");
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Consultation)
                .WithMany(c => c.Prescriptions)
                .HasForeignKey(e => e.ConsultationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Medication)
                .WithMany()
                .HasForeignKey(e => e.MedicationId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        // Medication configuration
        modelBuilder.Entity<Medication>(entity =>
        {
            entity.ToTable("Medications");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(200);
            entity.HasIndex(e => e.Name);
        });

        // StockMovement configuration
        modelBuilder.Entity<StockMovement>(entity =>
        {
            entity.ToTable("StockMovements");
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Medication)
                .WithMany(m => m.StockMovements)
                .HasForeignKey(e => e.MedicationId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => e.MedicationId);
            entity.HasIndex(e => e.CreatedAt);
        });

        // LabTestRequest configuration
        modelBuilder.Entity<LabTestRequest>(entity =>
        {
            entity.ToTable("LabTestRequests");
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Consultation)
                .WithMany(c => c.LabTestRequests)
                .HasForeignKey(e => e.ConsultationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.ConsultationId);
            entity.HasIndex(e => e.Status);
        });

        // TrainingModule configuration
        modelBuilder.Entity<TrainingModule>(entity =>
        {
            entity.ToTable("TrainingModules");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TrainingId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Description).IsRequired();
            entity.Property(e => e.ShortDescription).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Level).HasMaxLength(50);
            entity.Property(e => e.Tags).HasMaxLength(500);

            entity.HasIndex(e => e.TrainingId).IsUnique();
            entity.HasIndex(e => e.Audience);
        });

        // TrainingStep configuration
        modelBuilder.Entity<TrainingStep>(entity =>
        {
            entity.ToTable("TrainingSteps");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.StepId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Content).IsRequired();

            entity.HasOne(e => e.TrainingModule)
                .WithMany(m => m.Steps)
                .HasForeignKey(e => e.TrainingModuleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.TrainingModuleId);
            entity.HasIndex(e => e.Order);
        });

        // TrainingQuiz configuration
        modelBuilder.Entity<TrainingQuiz>(entity =>
        {
            entity.ToTable("TrainingQuizzes");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.QuizId).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Question).IsRequired();
            entity.Property(e => e.Options).IsRequired();

            entity.HasOne(e => e.TrainingModule)
                .WithMany(m => m.Quiz)
                .HasForeignKey(e => e.TrainingModuleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.TrainingModuleId);
            entity.HasIndex(e => e.Order);
        });

        // TrainingProgress configuration
        modelBuilder.Entity<TrainingProgress>(entity =>
        {
            entity.ToTable("TrainingProgress");
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CompletedSteps).HasDefaultValue("[]");

            entity.HasOne(e => e.User)
                .WithMany()
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.TrainingModule)
                .WithMany(m => m.UserProgress)
                .HasForeignKey(e => e.TrainingModuleId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.UserId, e.TrainingModuleId }).IsUnique();
            entity.HasIndex(e => e.Status);
        });
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
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
