using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace BrigadeMedicale.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SeedTrainingModules : Migration
    {
        private static readonly Dictionary<string, Guid> TrainingIdToGuidMap = new()
        {
            // Admin modules
            ["admin-001-management"] = new Guid("11111111-1111-1111-1111-111111111101"),
            ["admin-002-policies"] = new Guid("11111111-1111-1111-1111-111111111102"),
            ["admin-003-crisis"] = new Guid("11111111-1111-1111-1111-111111111103"),

            // Accueil modules
            ["accueil-001-welcome"] = new Guid("11111111-1111-1111-1111-111111111201"),
            ["accueil-002-registration"] = new Guid("11111111-1111-1111-1111-111111111202"),
            ["accueil-003-communication"] = new Guid("11111111-1111-1111-1111-111111111203"),

            // Medecin modules
            ["medecin-001-protocols"] = new Guid("11111111-1111-1111-1111-111111111301"),
            ["medecin-002-documentation"] = new Guid("11111111-1111-1111-1111-111111111302"),
            ["medecin-003-emergency"] = new Guid("11111111-1111-1111-1111-111111111303"),

            // Laborantin modules
            ["laborantin-001-sampling"] = new Guid("11111111-1111-1111-1111-111111111401"),
            ["laborantin-002-analysis"] = new Guid("11111111-1111-1111-1111-111111111402"),
            ["laborantin-003-safety"] = new Guid("11111111-1111-1111-1111-111111111403"),

            // Pharmacien modules
            ["pharmacien-001-management"] = new Guid("11111111-1111-1111-1111-111111111501"),
            ["pharmacien-002-interactions"] = new Guid("11111111-1111-1111-1111-111111111502"),
            ["pharmacien-003-customer"] = new Guid("11111111-1111-1111-1111-111111111503"),

            // Superviseur modules
            ["superviseur-001-leadership"] = new Guid("11111111-1111-1111-1111-111111111601"),
            ["superviseur-002-quality"] = new Guid("11111111-1111-1111-1111-111111111602"),
            ["superviseur-003-conflict"] = new Guid("11111111-1111-1111-1111-111111111603"),

            // Patient modules
            ["patient-001-onboarding"] = new Guid("11111111-1111-1111-1111-111111111701"),
            ["patient-002-qrcode"] = new Guid("11111111-1111-1111-1111-111111111702"),
            ["patient-003-consultation"] = new Guid("11111111-1111-1111-1111-111111111703"),
        };

        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            var now = DateTime.UtcNow;

            // ADMIN Training Modules
            SeedAdminTrainingModules(migrationBuilder, now);

            // ACCUEIL Training Modules
            SeedAccueilTrainingModules(migrationBuilder, now);

            // MEDECIN Training Modules
            SeedMedecinTrainingModules(migrationBuilder, now);

            // LABORANTIN Training Modules
            SeedLaborantinTrainingModules(migrationBuilder, now);

            // PHARMACIEN Training Modules
            SeedPharmacienTrainingModules(migrationBuilder, now);

            // SUPERVISEUR Training Modules
            SeedSuperviseurTrainingModules(migrationBuilder, now);

            // PATIENT Training Modules
            SeedPatientTrainingModules(migrationBuilder, now);
        }

        private void SeedAdminTrainingModules(MigrationBuilder migrationBuilder, DateTime now)
        {
            var moduleId = GetModuleGuid("admin-001-management");
            var order = 1;

            // Module: Gestion Administrative du Centre
            migrationBuilder.InsertData(
                table: "TrainingModules",
                columns: new[] { "Id", "TrainingId", "Title", "Description", "ShortDescription", "DurationMinutes", "Level", "Tags", "ImageUrl", "Audience", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { moduleId, "admin-001-management", "Gestion Administrative du Centre", "Apprenez les principes fondamentaux de la gestion administrative pour optimiser les opérations du centre médical.", "Gestion administrative et opérationnelle", 45, "Intermédiaire", "gestion,administration,processus", null, 0, order++, now, now });

            // Steps
            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "admin-001-step-1", moduleId, "Vue d'ensemble des responsabilités administratives", "La gestion administrative d'un centre médical comprend plusieurs domaines clés:\n\n1. Gestion des ressources humaines\n2. Planification budgétaire\n3. Gestion des fournitures\n4. Coordination des services\n5. Rapports et conformité\n\nChaque domaine contribue au fonctionnement fluide du centre.", 1, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "admin-001-step-2", moduleId, "Gestion des horaires et du personnel", "Les administrateurs doivent:\n\n- Créer des horaires efficaces\n- Assurer une couverture suffisante du personnel\n- Gérer les congés et les demandes spéciales\n- Maintenir l'équilibre travail-vie personnelle du personnel\n- Résoudre les conflits d'horaires\n\nUn bon planning est essentiel pour la satisfaction du personnel et la qualité des services.", 2, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "admin-001-step-3", moduleId, "Suivi budgétaire et dépenses", "Responsabilités budgétaires:\n\n- Analyser les dépenses mensuelles\n- Faire des prévisions de budget\n- Identifier les économies possibles\n- Justifier les dépenses importantes\n- Maintenir les registres financiers\n\nLe suivi régulier du budget garantit la viabilité financière du centre.", 3, "[]", now, now });

            // Module: Politiques et Procédures
            moduleId = GetModuleGuid("admin-002-policies");
            migrationBuilder.InsertData(
                table: "TrainingModules",
                columns: new[] { "Id", "TrainingId", "Title", "Description", "ShortDescription", "DurationMinutes", "Level", "Tags", "ImageUrl", "Audience", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { moduleId, "admin-002-policies", "Politiques et Procédures du Centre", "Comprendre et appliquer les politiques de la Brigade Médicale pour maintenir la conformité et la qualité des services.", "Politiques, procédures et conformité", 30, "Débutant", "politiques,conformité,procédures", null, 0, order++, now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "admin-002-step-1", moduleId, "Les politiques fondamentales", "Les politiques clés de la Brigade Médicale:\n\n1. Code de conduite des employés\n2. Politique de confidentialité des patients\n3. Protocoles de sécurité\n4. Gestion des plaintes\n5. Politique d'égalité et de diversité\n\nChaque employé doit connaître ces politiques.", 1, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "admin-002-step-2", moduleId, "Application et suivi de conformité", "Pour assurer la conformité:\n\n- Organisez des séances de formation régulières\n- Vérifiez que les politiques sont suivies\n- Documentez les cas de non-conformité\n- Effectuez des audits internes\n- Mettez à jour les politiques selon les besoins\n\nLa conformité protège le centre et ses patients.", 2, "[]", now, now });

            // Module: Gestion de Crise
            moduleId = GetModuleGuid("admin-003-crisis");
            migrationBuilder.InsertData(
                table: "TrainingModules",
                columns: new[] { "Id", "TrainingId", "Title", "Description", "ShortDescription", "DurationMinutes", "Level", "Tags", "ImageUrl", "Audience", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { moduleId, "admin-003-crisis", "Gestion de Crise et Situations d'Urgence", "Préparation et réponse aux situations de crise pour assurer la continuité des services.", "Gestion des crises et urgences", 40, "Avancé", "crise,urgence,planification", null, 0, order++, now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "admin-003-step-1", moduleId, "Types de crises possibles", "Les crises que le centre peut rencontrer:\n\n1. Défaillance des systèmes informatiques\n2. Manque de personnel crucial\n3. Coupure d'électricité ou d'eau\n4. Afflux soudain de patients\n5. Incidents de sécurité\n6. Crises sanitaires\n\nChaque type nécessite une approche différente.", 1, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "admin-003-step-2", moduleId, "Plans de continuité", "Éléments d'un bon plan de continuité:\n\n- Identification des services critiques\n- Processus d'escalade des alertes\n- Protocoles d'activation\n- Communication avec les parties prenantes\n- Responsabilités claires\n- Tests réguliers du plan\n\nUn plan bien préparé minimise les perturbations.", 2, "[]", now, now });
        }

        private void SeedAccueilTrainingModules(MigrationBuilder migrationBuilder, DateTime now)
        {
            var moduleId = GetModuleGuid("accueil-001-welcome");
            var order = 1;

            // Module: Accueil Professionnel
            migrationBuilder.InsertData(
                table: "TrainingModules",
                columns: new[] { "Id", "TrainingId", "Title", "Description", "ShortDescription", "DurationMinutes", "Level", "Tags", "ImageUrl", "Audience", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { moduleId, "accueil-001-welcome", "Accueil Professionnel des Patients", "Maîtrisez l'art de l'accueil pour faire bonne impression et créer un environnement accueillant.", "Premiers contacts et relations client", 40, "Débutant", "accueil,communication,service", null, 1, order++, now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "accueil-001-step-1", moduleId, "L'importance du premier contact", "Le premier contact définit l'expérience du patient:\n\n1. Sourire authentique et chaleureux\n2. Regard attentif et positif\n3. Ton de voix professionnel et bienveillant\n4. Langage corporel ouvert\n5. Respect de l'espace personnel\n\nCe moment crée la confiance.", 1, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "accueil-001-step-2", moduleId, "Gestion des patients difficiles", "Approche pour les patients frustrés ou énervés:\n\n- Écoutez sans interrompre\n- Validez leurs sentiments\n- Restez calme et professionnel\n- Proposez des solutions\n- Impliquez un superviseur si nécessaire\n\nLa patience et l'empathie sont clés.", 2, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "accueil-001-step-3", moduleId, "Gestion des files d'attente", "Maintenir l'ordre et l'efficacité:\n\n- Accueillez chaque patient individuellement\n- Donnez des estimations de temps réalistes\n- Maintenez informés les patients sur les délais\n- Offrez du confort pendant l'attente\n- Reconnaissez le travail d'attente du patient\n\nUne attente bien gérée satisfait les patients.", 3, "[]", now, now });
        }

        private void SeedMedecinTrainingModules(MigrationBuilder migrationBuilder, DateTime now)
        {
            var moduleId = GetModuleGuid("medecin-001-protocols");
            var order = 1;

            // Module: Protocoles Cliniques
            migrationBuilder.InsertData(
                table: "TrainingModules",
                columns: new[] { "Id", "TrainingId", "Title", "Description", "ShortDescription", "DurationMinutes", "Level", "Tags", "ImageUrl", "Audience", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { moduleId, "medecin-001-protocols", "Protocoles Cliniques Essentiels", "Maîtrisez les protocoles cliniques standards pour les consultations et le traitement des patients.", "Protocoles et directives cliniques", 50, "Intermédiaire", "protocoles,clinique,traitement", null, 2, order++, now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "medecin-001-step-1", moduleId, "Structure de la consultation", "Étapes d'une consultation efficace:\n\n1. Anamnèse complète\n2. Examen physique systématique\n3. Diagnostic différentiel\n4. Plan de traitement\n5. Documentation complète\n\nSuivez toujours cette structure pour ne rien oublier.", 1, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "medecin-001-step-2", moduleId, "Diagnostic et investigation", "Processus diagnostique:\n\n- Écouter attentivement le patient\n- Poser les bonnes questions\n- Effectuer un examen physique complet\n- Ordonner les investigations appropriées\n- Interpréter les résultats correctement\n- Envisager les diagnostics alternatifs\n\nLe diagnostic est la fondation du traitement efficace.", 2, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "medecin-001-step-3", moduleId, "Prescriptions et suivi", "Bonnes pratiques de prescription:\n\n- Prescrire le médicament approprié\n- Dosage correct et voie d'administration\n- Contre-indications vérifiées\n- Interactions médicamenteuses considérées\n- Instructions claires au patient\n- Suivi approprié planifié\n\nUne bonne prescription est sûre et efficace.", 3, "[]", now, now });

            // Module: Documentation Médicale
            moduleId = GetModuleGuid("medecin-002-documentation");
            migrationBuilder.InsertData(
                table: "TrainingModules",
                columns: new[] { "Id", "TrainingId", "Title", "Description", "ShortDescription", "DurationMinutes", "Level", "Tags", "ImageUrl", "Audience", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { moduleId, "medecin-002-documentation", "Documentation Médicale Complète", "Apprenez à documenter correctement les consultations et les traitements des patients.", "Documentation médicale et dossiers", 35, "Débutant", "documentation,dossier,notes", null, 2, order++, now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "medecin-002-step-1", moduleId, "Éléments essentiels du dossier médical", "Contenus obligatoires d'un dossier médical:\n\n1. Antécédents du patient\n2. Motif de consultation\n3. Résultats de l'examen\n4. Diagnostic\n5. Plan de traitement\n6. Prescriptions\n7. Suivi prévu\n\nUn dossier complet protège le patient et le médecin.", 1, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "medecin-002-step-2", moduleId, "Notation et objectivité", "Principes de bonne documentation:\n\n- Être précis et objectif\n- Utiliser la terminologie médicale appropriée\n- Noter les faits, pas les opinions\n- Documenter immédiatement après\n- Corriger les erreurs proprement\n- Signer et dater les notes\n\nLa documentation est un enregistrement légal du soin.", 2, "[]", now, now });

            // Module: Gestion des Urgences
            moduleId = GetModuleGuid("medecin-003-emergency");
            migrationBuilder.InsertData(
                table: "TrainingModules",
                columns: new[] { "Id", "TrainingId", "Title", "Description", "ShortDescription", "DurationMinutes", "Level", "Tags", "ImageUrl", "Audience", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { moduleId, "medecin-003-emergency", "Gestion des Cas d'Urgence", "Réponse appropriée aux situations d'urgence et stabilisation du patient.", "Médecine d'urgence et premiers soins", 45, "Avancé", "urgence,emergency,stabilisation", null, 2, order++, now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "medecin-003-step-1", moduleId, "Triage et classification", "Classification des urgences:\n\n1. Urgence immédiate (life-threatening)\n2. Urgence (sérieux, attendre < 1h)\n3. Semi-urgent (peut attendre 1-2h)\n4. Non-urgent (peut attendre > 2h)\n\nLe triage correct assure les ressources pour les cas graves.", 1, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "medecin-003-step-2", moduleId, "ABCDE - Approche systématique", "Approche ABCDE pour les urgences:\n\nA - Airway (voies aériennes)\nB - Breathing (respiration)\nC - Circulation (circulation)\nD - Disability (déficit neurologique)\nE - Exposure (exposition/hypothermie)\n\nSuivez cet ordre pour ne rien oublier.", 2, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "medecin-003-step-3", moduleId, "Transfert et escalade", "Quand et comment transférer:\n\n- Reconnaître les limitations du centre\n- Décider rapidement du transfert\n- Stabiliser avant le transfert\n- Communiquer avec l'établissement récepteur\n- Accompagnement approprié\n- Documentation complète\n\nUn transfert en temps opportun peut sauver des vies.", 3, "[]", now, now });
        }

        private void SeedLaborantinTrainingModules(MigrationBuilder migrationBuilder, DateTime now)
        {
            var moduleId = GetModuleGuid("laborantin-001-sampling");
            var order = 1;

            // Module: Prélèvements et Bioéchantillons
            migrationBuilder.InsertData(
                table: "TrainingModules",
                columns: new[] { "Id", "TrainingId", "Title", "Description", "ShortDescription", "DurationMinutes", "Level", "Tags", "ImageUrl", "Audience", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { moduleId, "laborantin-001-sampling", "Prélèvements et Bioéchantillons", "Maîtrisez les techniques de prélèvement pour assurer la qualité des échantillons biologiques.", "Techniques de prélèvement", 50, "Intermédiaire", "prélèvement,biologie,technique", null, 3, order++, now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "laborantin-001-step-1", moduleId, "Types de prélèvements", "Prélèvements courants:\n\n1. Prélèvement sanguin (veineux, capillaire)\n2. Prélèvement urinaire\n3. Prélèvement de gorge/nasopharyngé\n4. Prélèvement fécal\n5. Autres prélèvements (salive, sueur)\n\nChaque type a ses protocoles spécifiques.", 1, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "laborantin-001-step-2", moduleId, "Préparation et sécurité", "Protocoles de sécurité essentiels:\n\n- Équipement de protection personnelle (EPI)\n- Hygiène des mains\n- Désinfection des sites\n- Élimination des déchets biologiques\n- Gestion des accidents d'exposition\n- Documentation appropriée\n\nLa sécurité protège patient et personnel.", 2, "[]", now, now });
        }

        private void SeedPharmacienTrainingModules(MigrationBuilder migrationBuilder, DateTime now)
        {
            var moduleId = GetModuleGuid("pharmacien-001-management");
            var order = 1;

            // Module: Gestion des Médicaments
            migrationBuilder.InsertData(
                table: "TrainingModules",
                columns: new[] { "Id", "TrainingId", "Title", "Description", "ShortDescription", "DurationMinutes", "Level", "Tags", "ImageUrl", "Audience", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { moduleId, "pharmacien-001-management", "Gestion des Médicaments", "Apprenez à gérer efficacement l'inventaire des médicaments et maintenir la conformité.", "Gestion d'inventaire et conformité", 45, "Intermédiaire", "médicaments,inventaire,gestion", null, 4, order++, now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "pharmacien-001-step-1", moduleId, "Stockage et conditions de conservation", "Bonnes pratiques de stockage:\n\n1. Température contrôlée\n2. Lumière appropriée (protection UV)\n3. Humidité régulée\n4. Organisation logique\n5. Inspection régulière\n6. Rotation FIFO (First In First Out)\n\nUn bon stockage maintient l'efficacité des médicaments.", 1, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "pharmacien-001-step-2", moduleId, "Suivi d'inventaire et expiration", "Gestion de l'inventaire:\n\n- Enregistrement des entrées/sorties\n- Suivi des dates d'expiration\n- Élimination appropriée des médicaments périmés\n- Audit régulier des stocks\n- Prévention du vol\n- Documentation complète\n\nUn suivi rigoureux prévient le gaspillage.", 2, "[]", now, now });
        }

        private void SeedSuperviseurTrainingModules(MigrationBuilder migrationBuilder, DateTime now)
        {
            var moduleId = GetModuleGuid("superviseur-001-leadership");
            var order = 1;

            // Module: Leadership et Supervision
            migrationBuilder.InsertData(
                table: "TrainingModules",
                columns: new[] { "Id", "TrainingId", "Title", "Description", "ShortDescription", "DurationMinutes", "Level", "Tags", "ImageUrl", "Audience", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { moduleId, "superviseur-001-leadership", "Leadership et Supervision", "Développez vos compétences en leadership pour superviser efficacement une équipe.", "Gestion d'équipe et leadership", 50, "Intermédiaire", "leadership,supervision,équipe", null, 5, order++, now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "superviseur-001-step-1", moduleId, "Styles de leadership", "Styles de leadership efficaces:\n\n1. Autoritaire - Pour les situations d'urgence\n2. Participatif - Pour les décisions importantes\n3. Délégatif - Pour les équipes expérimentées\n4. Supportif - Pour les nouveaux employés\n5. Transformationnel - Pour le changement\n\nAdaptez votre style à la situation.", 1, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "superviseur-001-step-2", moduleId, "Motivation et performance", "Motiver votre équipe:\n\n- Fixer des objectifs clairs\n- Reconnaître les accomplissements\n- Fournir du feedback régulier\n- Offrir des opportunités de croissance\n- Créer un environnement de confiance\n- Gérer le stress de l'équipe\n\nUne équipe motivée produit des meilleurs résultats.", 2, "[]", now, now });
        }

        private void SeedPatientTrainingModules(MigrationBuilder migrationBuilder, DateTime now)
        {
            var moduleId = GetModuleGuid("patient-001-onboarding");
            var order = 1;

            // Module: Créer mon dossier
            migrationBuilder.InsertData(
                table: "TrainingModules",
                columns: new[] { "Id", "TrainingId", "Title", "Description", "ShortDescription", "DurationMinutes", "Level", "Tags", "ImageUrl", "Audience", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { moduleId, "patient-001-onboarding", "Créer mon dossier avant ma première visite", "Apprenez comment bien préparer votre dossier médical et les informations importantes à avoir lors de votre visite à la Brigade Médicale.", "Préparez vos informations et documents", 8, "Débutant", "onboarding,dossier,préparation", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop", 6, order++, now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "patient-001-step-1", moduleId, "Pourquoi préparer votre dossier?", "Un dossier médical bien préparé permet :\n• Une consultation plus rapide\n• Une prise en charge optimale\n• Un suivi médical cohérent\n• Une meilleure qualité de service\n\nCela montre aussi que vous êtes impliqué dans votre santé!", 1, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "patient-001-step-2", moduleId, "Informations personnelles à préparer", "Avant votre visite, rassemblez :\n\n1. Identité complète (nom, prénom, date de naissance)\n2. Numéro de téléphone et adresse\n3. Numéro de secteur (si vous êtes enregistré)\n4. Informations d'urgence (contact personne d'urgence)\n5. Informations sur votre assurance/mutuelle si applicable\n\nAyez ces informations à portée de main.", 2, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "patient-001-step-3", moduleId, "Documents et antécédents médicaux", "Si possible, apportez :\n\n• Carnet de vaccination (si vous en avez un)\n• Ordonnances précédentes\n• Résultats d'analyses médicales récentes\n• Courriers d'autres médecins\n• Traitement actuel (liste des médicaments que vous prenez)\n\nCes informations aident le médecin à mieux vous soigner.", 3, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "patient-001-step-4", moduleId, "Antécédents familiaux et allergies", "Notez les informations importantes :\n\n• Allergies (médicaments, aliments...)\n• Maladies chroniques (diabète, hypertension...)\n• Allergies familiales (parents, frères/sœurs)\n• Opérations chirurgicales antérieures\n\nCette information est CONFIDENTIELLE et très utile pour votre traitement.", 4, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "patient-001-step-5", moduleId, "Votre secteur et secteur d'église", "Lors de l'inscription, vous avez peut-être indiqué :\n\n• Votre secteur géographique de vie\n• Votre secteur d'église (si applicable)\n\nAyez ces informations en tête, elles permettent un meilleur suivi communautaire.", 5, "[]", now, now });

            migrationBuilder.InsertData(
                table: "TrainingSteps",
                columns: new[] { "Id", "StepId", "TrainingModuleId", "Title", "Content", "Order", "Media", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "patient-001-step-6", moduleId, "Vous êtes prêt(e)!", "Vous avez maintenant tout ce qu'il faut pour :\n\n✓ Venir à votre consultation\n✓ Avoir un suivi de qualité\n✓ Accélérer le processus d'enregistrement\n✓ Faciliter le travail de l'équipe médicale\n\nMerci de votre implication pour votre santé!\n\nProchain module: Présenter mon QR Code à l'accueil", 6, "[]", now, now });

            // Add quiz for patient module
            migrationBuilder.InsertData(
                table: "TrainingQuizzes",
                columns: new[] { "Id", "QuizId", "TrainingModuleId", "Question", "Options", "AnswerIndex", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "q1-1", moduleId, "Quels sont les 3 bénéfices principaux d'un dossier bien préparé?", JsonSerializer.Serialize(new[] { "Consultation plus rapide, prise en charge optimale, suivi cohérent", "Gratuit, facile, et pas besoin de documents", "Vous pouvez diagnostiquer vous-même", "C'est obligatoire par la loi" }), 0, 1, now, now });

            migrationBuilder.InsertData(
                table: "TrainingQuizzes",
                columns: new[] { "Id", "QuizId", "TrainingModuleId", "Question", "Options", "AnswerIndex", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "q1-2", moduleId, "Que devriez-vous apporter si possible à votre visite?", JsonSerializer.Serialize(new[] { "Uniquement de l'argent", "Carnet de vaccination, ordonnances, résultats d'analyses", "Rien, le médecin a accès à tout", "Juste votre carte d'identité" }), 1, 2, now, now });

            migrationBuilder.InsertData(
                table: "TrainingQuizzes",
                columns: new[] { "Id", "QuizId", "TrainingModuleId", "Question", "Options", "AnswerIndex", "Order", "CreatedAt", "UpdatedAt" },
                values: new object[] { Guid.NewGuid(), "q1-3", moduleId, "Pourquoi noter les allergies est-il important?", JsonSerializer.Serialize(new[] { "C'est juste administratif", "Cela permet au médecin de vous traiter en toute sécurité", "Ce n'est pas nécessaire", "Cela n'affecte pas le traitement" }), 1, 3, now, now });
        }

        private Guid GetModuleGuid(string trainingId)
        {
            return TrainingIdToGuidMap.TryGetValue(trainingId, out var guid)
                ? guid
                : Guid.NewGuid();
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Delete in reverse order to handle foreign key constraints
            migrationBuilder.Sql("DELETE FROM TrainingQuizzes WHERE QuizId IN ('q1-1', 'q1-2', 'q1-3')");
            migrationBuilder.Sql("DELETE FROM TrainingSteps");
            migrationBuilder.Sql("DELETE FROM TrainingModules");
        }
    }
}
