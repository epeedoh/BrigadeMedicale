using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BrigadeMedicale.Application.DTOs;
using BrigadeMedicale.Application.Interfaces;
using BrigadeMedicale.Domain.Enums;
using BrigadeMedicale.API.Helpers;

namespace BrigadeMedicale.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TrainingController : ControllerBase
{
    private readonly ITrainingService _trainingService;
    private readonly ILogger<TrainingController> _logger;

    public TrainingController(ITrainingService trainingService, ILogger<TrainingController> logger)
    {
        _trainingService = trainingService;
        _logger = logger;
    }

    /// <summary>
    /// Get all training modules for a specific audience or role
    /// GET /api/training/modules?audience=staff-admin
    /// GET /api/training/modules?role=ADMIN
    /// </summary>
    [HttpGet("modules")]
    [AllowAnonymous]
    public async Task<IActionResult> GetModulesByAudience([FromQuery] string? audience, [FromQuery] string? role)
    {
        try
        {
            List<TrainingModuleDto> modules;

            if (!string.IsNullOrEmpty(audience))
            {
                if (Enum.TryParse<TrainingAudience>(
                    audience.Replace("-", ""),
                    ignoreCase: true,
                    out var parsedAudience))
                {
                    modules = await _trainingService.GetModulesByAudienceAsync(parsedAudience);
                }
                else
                {
                    return BadRequest(new { success = false, message = $"Invalid audience: {audience}" });
                }
            }
            else if (!string.IsNullOrEmpty(role))
            {
                var trainingAudience = _trainingService.RoleToAudience(role);
                modules = await _trainingService.GetModulesByAudienceAsync(trainingAudience);
            }
            else
            {
                modules = await _trainingService.GetAllModulesAsync();
            }

            return Ok(new { success = true, data = modules });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving training modules");
            return StatusCode(500, new { success = false, message = "Error retrieving training modules", error = ex.Message });
        }
    }

    /// <summary>
    /// Get a specific training module by TrainingId (the string GUID returned in API)
    /// GET /api/training/modules/{trainingId}
    /// </summary>
    [HttpGet("modules/{trainingId}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetModuleById(string trainingId)
    {
        try
        {
            // The API returns TrainingId (string GUID), not Id (database GUID)
            // Use the service method that looks up by TrainingId
            var module = await _trainingService.GetModuleByTrainingIdAsync(trainingId);

            if (module == null)
            {
                return NotFound(new { success = false, message = $"Training module {trainingId} not found" });
            }

            return Ok(new { success = true, data = module });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving training module {trainingId}", trainingId);
            return StatusCode(500, new { success = false, message = "Error retrieving training module", error = ex.Message });
        }
    }

    /// <summary>
    /// Create a new training module (Admin only)
    /// POST /api/training/modules
    /// </summary>
    [HttpPost("modules")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> CreateModule([FromBody] CreateTrainingModuleDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(new { success = false, message = "Invalid module data", errors });
            }

            var module = await _trainingService.CreateModuleAsync(dto);
            return CreatedAtAction(nameof(GetModuleById), new { id = module.Id }, new { success = true, data = module });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating training module");
            return StatusCode(500, new { success = false, message = "Error creating training module", error = ex.Message });
        }
    }

    /// <summary>
    /// Update a training module (Admin only)
    /// PUT /api/training/modules/{id}
    /// </summary>
    [HttpPut("modules/{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> UpdateModule(Guid id, [FromBody] CreateTrainingModuleDto dto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage).ToList();
                return BadRequest(new { success = false, message = "Invalid module data", errors });
            }

            await _trainingService.UpdateModuleAsync(id, dto);
            var updated = await _trainingService.GetModuleByIdAsync(id);

            return Ok(new { success = true, data = updated });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating training module {id}", id);
            return StatusCode(500, new { success = false, message = "Error updating training module", error = ex.Message });
        }
    }

    /// <summary>
    /// Delete a training module (Admin only)
    /// DELETE /api/training/modules/{id}
    /// </summary>
    [HttpDelete("modules/{id}")]
    [Authorize(Roles = "ADMIN")]
    public async Task<IActionResult> DeleteModule(Guid id)
    {
        try
        {
            await _trainingService.DeleteModuleAsync(id);
            return Ok(new { success = true, message = "Training module deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting training module {id}", id);
            return StatusCode(500, new { success = false, message = "Error deleting training module", error = ex.Message });
        }
    }

    /// <summary>
    /// Get user's progress for a specific module
    /// GET /api/training/progress/{moduleId}
    /// </summary>
    [HttpGet("progress/{moduleId}")]
    public async Task<IActionResult> GetProgress(Guid moduleId)
    {
        try
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            var progress = await _trainingService.GetUserProgressAsync(userId.Value, moduleId);

            if (progress == null)
            {
                progress = new TrainingProgressDto
                {
                    ModuleId = moduleId.ToString(),
                    Status = "NOT_STARTED",
                    CompletedSteps = [],
                    CurrentStepIndex = 0
                };
            }

            return Ok(new { success = true, data = progress });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user progress");
            return StatusCode(500, new { success = false, message = "Error retrieving user progress", error = ex.Message });
        }
    }

    /// <summary>
    /// Save user's progress for a module
    /// POST /api/training/progress/{moduleId}
    /// </summary>
    [HttpPost("progress/{moduleId}")]
    public async Task<IActionResult> SaveProgress(Guid moduleId, [FromBody] TrainingProgressDto progressDto)
    {
        try
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            await _trainingService.SaveProgressAsync(userId.Value, moduleId, progressDto);
            return Ok(new { success = true, message = "User progress saved successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving user progress");
            return StatusCode(500, new { success = false, message = "Error saving user progress", error = ex.Message });
        }
    }

    /// <summary>
    /// Get user's stats across all modules
    /// GET /api/training/stats
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            var userId = GetUserIdFromToken();
            if (userId == null)
            {
                return Unauthorized(new { success = false, message = "User not authenticated" });
            }

            var (completed, inProgress, notStarted) = await _trainingService.GetUserStatsAsync(userId.Value);

            var stats = new
            {
                Completed = completed,
                InProgress = inProgress,
                NotStarted = notStarted
            };

            return Ok(new { success = true, data = stats });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user training stats");
            return StatusCode(500, new { success = false, message = "Error retrieving user training stats", error = ex.Message });
        }
    }

    /// <summary>
    /// Seed demo training data
    /// POST /api/training/seed-demo-data
    /// </summary>
    [HttpPost("seed-demo-data")]
    [AllowAnonymous]
    public async Task<IActionResult> SeedDemoData()
    {
        try
        {
            // Create all training modules with their steps and quizzes
            var modules = new List<CreateTrainingModuleDto>
            {
                // ADMIN MODULES
                CreateModule("Gestion Administrative", "StaffAdmin", "Gestion des dossiers administratifs", 45),
                CreateModule("Politique et Conformité", "StaffAdmin", "Respecter les politiques", 50),
                CreateModule("Gestion de Crise", "StaffAdmin", "Procédures d'urgence", 60),

                // ACCUEIL MODULES
                CreateModule("Bienvenue et Accueil", "StaffAccueil", "Accueillir les patients", 40),
                CreateModule("Enregistrement Patient", "StaffAccueil", "Système d'enregistrement", 50),
                CreateModule("Communication Efficace", "StaffAccueil", "Communication patient", 45),

                // MEDECIN MODULES
                CreateModule("Protocoles Médicaux", "StaffMedecin", "Protocoles de traitement", 90),
                CreateModule("Documentation Médicale", "StaffMedecin", "Documentation des cas", 60),
                CreateModule("Gestion d'Urgence", "StaffMedecin", "Cas d'urgence", 75),

                // LABORANTIN MODULES
                CreateModule("Prélèvement d'Échantillons", "StaffLaborantin", "Techniques de prélèvement", 50),
                CreateModule("Analyse de Laboratoire", "StaffLaborantin", "Tests et analyses", 80),
                CreateModule("Sécurité Biologique", "StaffLaborantin", "Protocoles de sécurité", 60),

                // PHARMACIEN MODULES
                CreateModule("Gestion Pharmacie", "StaffPharmacien", "Gestion des stocks", 55),
                CreateModule("Interactions Médicamenteuses", "StaffPharmacien", "Interactions entre médicaments", 70),
                CreateModule("Service Client Pharmacie", "StaffPharmacien", "Service au patient", 45),

                // SUPERVISEUR MODULES
                CreateModule("Leadership et Supervision", "StaffSuperviseur", "Gestion d'équipe", 50),
                CreateModule("Assurance Qualité", "StaffSuperviseur", "Contrôle qualité", 65),
                CreateModule("Gestion de Conflits", "StaffSuperviseur", "Résolution de conflits", 55),

                // PATIENT MODULES
                CreateModule("Créer mon Dossier", "Patient", "Préparer dossier médical", 8),
                CreateModule("Mon Code QR", "Patient", "Utiliser le QR Code", 5),
                CreateModule("Ma Consultation", "Patient", "Pendant la consultation", 10)
            };

            int createdCount = 0;
            foreach (var moduleDto in modules)
            {
                try
                {
                    await _trainingService.CreateModuleAsync(moduleDto);
                    createdCount++;
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to create module: {moduleDto.Title}");
                }
            }

            return Ok(new
            {
                success = true,
                message = $"Successfully seeded {createdCount} out of {modules.Count} training modules",
                createdCount = createdCount,
                totalCount = modules.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding training data");
            return StatusCode(500, new { success = false, message = "Error seeding training data", error = ex.Message });
        }
    }

    /// <summary>
    /// Seed comprehensive professional training data for all user roles
    /// POST /api/training/seed-comprehensive-data
    /// </summary>
    [HttpPost("seed-comprehensive-data")]
    [AllowAnonymous]
    public async Task<IActionResult> SeedComprehensiveData()
    {
        try
        {
            // Get all comprehensive training modules for all roles
            var modules = ComprehensiveTrainingData.GetAllComprehensiveModules();

            int createdCount = 0;
            var createdModules = new List<string>();

            foreach (var moduleDto in modules)
            {
                try
                {
                    await _trainingService.CreateModuleAsync(moduleDto);
                    createdCount++;
                    createdModules.Add($"{moduleDto.Title} ({moduleDto.Audience})");
                    _logger.LogInformation($"Successfully created training module: {moduleDto.Title}");
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Failed to create comprehensive module: {moduleDto.Title}");
                }
            }

            return Ok(new
            {
                success = true,
                message = $"Successfully seeded {createdCount} out of {modules.Count} comprehensive training modules",
                createdCount = createdCount,
                totalCount = modules.Count,
                createdModules = createdModules,
                details = new
                {
                    staffAdminModules = createdModules.Count(m => m.Contains("StaffAdmin")),
                    staffAccueilModules = createdModules.Count(m => m.Contains("StaffAccueil")),
                    staffMedecinModules = createdModules.Count(m => m.Contains("StaffMedecin")),
                    staffLaborantinModules = createdModules.Count(m => m.Contains("StaffLaborantin")),
                    staffPharmacienModules = createdModules.Count(m => m.Contains("StaffPharmacien")),
                    staffSuperviseurModules = createdModules.Count(m => m.Contains("StaffSuperviseur")),
                    patientModules = createdModules.Count(m => m.Contains("Patient"))
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding comprehensive training data");
            return StatusCode(500, new { success = false, message = "Error seeding comprehensive training data", error = ex.Message });
        }
    }

    /// <summary>
    /// Delete old demo training modules (keep only comprehensive ones)
    /// DELETE /api/training/cleanup-demo-modules
    /// </summary>
    [HttpDelete("cleanup-demo-modules")]
    [AllowAnonymous]
    public async Task<IActionResult> CleanupDemoModules()
    {
        try
        {
            // List of old demo module titles to delete
            var demoModuleTitles = new List<string>
            {
                "Gestion Administrative",
                "Politique et Conformité",
                "Gestion de Crise",
                "Bienvenue et Accueil",
                "Enregistrement Patient",
                "Communication Efficace",
                "Protocoles Médicaux",
                "Documentation Médicale",
                "Gestion d'Urgence",
                "Prélèvement d'Échantillons",
                "Analyse de Laboratoire",
                "Sécurité Biologique",
                "Gestion Pharmacie",
                "Interactions Médicamenteuses",
                "Service Client Pharmacie",
                "Leadership et Supervision",
                "Assurance Qualité",
                "Gestion de Conflits",
                "Créer mon Dossier",
                "Mon Code QR",
                "Ma Consultation"
            };

            int deletedCount = 0;

            foreach (var title in demoModuleTitles)
            {
                try
                {
                    // Get all modules with this title
                    var modules = await _trainingService.GetAllModulesAsync();
                    var toDelete = modules.Where(m => m.Title == title).ToList();

                    foreach (var module in toDelete)
                    {
                        // Convert string ID to Guid
                        if (Guid.TryParse(module.Id, out var moduleId))
                        {
                            await _trainingService.DeleteModuleAsync(moduleId);
                            deletedCount++;
                            _logger.LogInformation($"Deleted old demo module: {title}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Could not delete module: {title}");
                }
            }

            return Ok(new
            {
                success = true,
                message = $"Successfully cleaned up {deletedCount} old demo training modules",
                deletedCount = deletedCount,
                details = "Old demo modules removed. Only comprehensive training modules remain."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning up demo modules");
            return StatusCode(500, new { success = false, message = "Error cleaning up demo modules", error = ex.Message });
        }
    }

    /// <summary>
    /// DELETE ALL training modules (nuclear cleanup)
    /// DELETE /api/training/delete-all
    /// </summary>
    [HttpDelete("delete-all")]
    [AllowAnonymous]
    public async Task<IActionResult> DeleteAllModules()
    {
        try
        {
            var allModules = await _trainingService.GetAllModulesAsync();
            int deletedCount = 0;

            foreach (var module in allModules)
            {
                try
                {
                    if (Guid.TryParse(module.Id, out var moduleId))
                    {
                        await _trainingService.DeleteModuleAsync(moduleId);
                        deletedCount++;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, $"Could not delete module: {module.Title}");
                }
            }

            return Ok(new
            {
                success = true,
                message = $"Successfully deleted ALL {deletedCount} training modules",
                deletedCount = deletedCount,
                details = "All modules removed. Database is now clean."
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting all modules");
            return StatusCode(500, new { success = false, message = "Error deleting all modules", error = ex.Message });
        }
    }

    /// <summary>
    /// Helper to create training module DTO
    /// </summary>
    private CreateTrainingModuleDto CreateModule(string title, string audience, string description, int duration)
    {
        return new CreateTrainingModuleDto
        {
            Title = title,
            Audience = audience,
            ShortDescription = description,
            Description = $"Module formation: {description}",
            Level = "Intermédiaire",
            DurationMinutes = duration,
            Tags = new List<string> { audience.ToLower(), "formation" },
            Steps = new List<TrainingStepDto>
            {
                new() { Title = "Étape 1", Content = "Contenu de la première étape", Media = new List<string>(), Order = 1 }
            },
            Quiz = new List<TrainingQuizDto>
            {
                new() { Question = "Avez-vous compris?", Options = new List<string> { "Oui", "Non" }, AnswerIndex = 0, Order = 1 }
            }
        };
    }

    /// <summary>
    /// Helper method to extract user ID from JWT token claims
    /// </summary>
    private Guid? GetUserIdFromToken()
    {
        var userIdClaim = User.Claims.FirstOrDefault(c => c.Type == "sub")?.Value;
        if (userIdClaim != null && Guid.TryParse(userIdClaim, out var userId))
        {
            return userId;
        }
        return null;
    }
}
