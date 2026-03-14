namespace BrigadeMedicale.Domain.Enums;

/// <summary>
/// Training audience types - determines which training modules are assigned to a role
/// </summary>
public enum TrainingAudience
{
    StaffAdmin = 0,          // ADMIN role
    StaffAccueil = 1,        // ACCUEIL role
    StaffMedecin = 2,        // MEDECIN role
    StaffLaborantin = 3,     // LABORANTIN role
    StaffPharmacien = 4,     // PHARMACIEN role
    StaffSuperviseur = 5,    // SUPERVISEUR role
    Patient = 6              // PATIENT role
}
