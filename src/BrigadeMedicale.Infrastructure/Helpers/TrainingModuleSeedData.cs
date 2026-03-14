using System.Text.Json;
using BrigadeMedicale.Domain.Entities;
using BrigadeMedicale.Domain.Enums;

namespace BrigadeMedicale.Infrastructure.Helpers;

/// <summary>
/// Helper class to generate training module seed data
/// </summary>
public static class TrainingModuleSeedData
{
    // Deterministic mapping of training IDs to GUIDs for consistent seeding
    private static readonly Dictionary<string, Guid> TrainingIdToGuidMap = new();

    static TrainingModuleSeedData()
    {
        // Initialize mapping - in production, these would be loaded from config or generated consistently
        InitializeGuidMapping();
    }

    private static void InitializeGuidMapping()
    {
        // Admin modules
        TrainingIdToGuidMap["admin-001-management"] = new Guid("11111111-1111-1111-1111-111111111101");
        TrainingIdToGuidMap["admin-002-policies"] = new Guid("11111111-1111-1111-1111-111111111102");
        TrainingIdToGuidMap["admin-003-crisis"] = new Guid("11111111-1111-1111-1111-111111111103");

        // Accueil modules
        TrainingIdToGuidMap["accueil-001-welcome"] = new Guid("11111111-1111-1111-1111-111111111201");
        TrainingIdToGuidMap["accueil-002-registration"] = new Guid("11111111-1111-1111-1111-111111111202");
        TrainingIdToGuidMap["accueil-003-communication"] = new Guid("11111111-1111-1111-1111-111111111203");

        // Medecin modules
        TrainingIdToGuidMap["medecin-001-protocols"] = new Guid("11111111-1111-1111-1111-111111111301");
        TrainingIdToGuidMap["medecin-002-documentation"] = new Guid("11111111-1111-1111-1111-111111111302");
        TrainingIdToGuidMap["medecin-003-emergency"] = new Guid("11111111-1111-1111-1111-111111111303");

        // Laborantin modules
        TrainingIdToGuidMap["laborantin-001-sampling"] = new Guid("11111111-1111-1111-1111-111111111401");
        TrainingIdToGuidMap["laborantin-002-analysis"] = new Guid("11111111-1111-1111-1111-111111111402");
        TrainingIdToGuidMap["laborantin-003-safety"] = new Guid("11111111-1111-1111-1111-111111111403");

        // Pharmacien modules
        TrainingIdToGuidMap["pharmacien-001-management"] = new Guid("11111111-1111-1111-1111-111111111501");
        TrainingIdToGuidMap["pharmacien-002-interactions"] = new Guid("11111111-1111-1111-1111-111111111502");
        TrainingIdToGuidMap["pharmacien-003-customer"] = new Guid("11111111-1111-1111-1111-111111111503");

        // Superviseur modules
        TrainingIdToGuidMap["superviseur-001-leadership"] = new Guid("11111111-1111-1111-1111-111111111601");
        TrainingIdToGuidMap["superviseur-002-quality"] = new Guid("11111111-1111-1111-1111-111111111602");
        TrainingIdToGuidMap["superviseur-003-conflict"] = new Guid("11111111-1111-1111-1111-111111111603");

        // Patient modules
        TrainingIdToGuidMap["patient-001-onboarding"] = new Guid("11111111-1111-1111-1111-111111111701");
        TrainingIdToGuidMap["patient-002-qrcode"] = new Guid("11111111-1111-1111-1111-111111111702");
        TrainingIdToGuidMap["patient-003-consultation"] = new Guid("11111111-1111-1111-1111-111111111703");
    }

    public static Guid GetGuidForTrainingId(string trainingId)
    {
        if (!TrainingIdToGuidMap.TryGetValue(trainingId, out var guid))
        {
            // Fallback: generate from hash for unknown IDs
            guid = GenerateDeterministicGuid(trainingId);
            TrainingIdToGuidMap[trainingId] = guid;
        }
        return guid;
    }

    private static Guid GenerateDeterministicGuid(string input)
    {
        // Create a deterministic GUID from a string
        var hash = System.Security.Cryptography.SHA256.HashData(System.Text.Encoding.UTF8.GetBytes(input));
        var guid = new Guid(hash.Take(16).ToArray());
        return guid;
    }

    /// <summary>
    /// Get all training modules grouped by audience from JSON files
    /// </summary>
    public static async Task<Dictionary<TrainingAudience, List<TrainingModuleDto>>> GetAllTrainingModulesAsync(string basePath)
    {
        var modulesbyAudience = new Dictionary<TrainingAudience, List<TrainingModuleDto>>();

        var files = new[]
        {
            ("staff-admin.modules.json", TrainingAudience.StaffAdmin),
            ("staff-accueil.modules.json", TrainingAudience.StaffAccueil),
            ("staff-medecin.modules.json", TrainingAudience.StaffMedecin),
            ("staff-laborantin.modules.json", TrainingAudience.StaffLaborantin),
            ("staff-pharmacien.modules.json", TrainingAudience.StaffPharmacien),
            ("staff-superviseur.modules.json", TrainingAudience.StaffSuperviseur),
            ("patient.modules.json", TrainingAudience.Patient),
        };

        foreach (var (filename, audience) in files)
        {
            var filepath = Path.Combine(basePath, filename);
            if (File.Exists(filepath))
            {
                var json = await File.ReadAllTextAsync(filepath);
                var modules = JsonSerializer.Deserialize<List<TrainingModuleDto>>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (modules != null)
                {
                    modulesbyAudience[audience] = modules;
                }
            }
        }

        return modulesbyAudience;
    }

    // DTO for deserializing JSON
    public class TrainingModuleDto
    {
        public string Id { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string ShortDescription { get; set; } = string.Empty;
        public int DurationMinutes { get; set; }
        public string Level { get; set; } = string.Empty;
        public List<string> Tags { get; set; } = new();
        public string? ImageUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public List<StepDto> Steps { get; set; } = new();
        public List<QuizDto> Quiz { get; set; } = new();
    }

    public class StepDto
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int Order { get; set; }
        public List<object> Media { get; set; } = new();
    }

    public class QuizDto
    {
        public string Id { get; set; } = string.Empty;
        public string Question { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new();
        public int AnswerIndex { get; set; }
        public int Order { get; set; }
    }
}
