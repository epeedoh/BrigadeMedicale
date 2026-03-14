import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { ConfigService } from '../../../../core/services/config.service';
import { TrainingModule, TrainingRole, TrainingAudience } from '../models/training.models';
import { ApiResponse } from '../../../../core/models/api-response.model';

/**
 * Service pour récupérer les modules de formation
 * - Essaye l'API en priorité
 * - Fallback sur les assets JSON si API indisponible
 * - Supporte plusieurs audiences: patient, staff-admin, staff-accueil, staff-medecin, staff-laborantin, staff-pharmacien, staff-superviseur
 */
@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  private readonly ASSETS_PATH = 'assets/training';
  private isOfflineMode = false;

  constructor(private http: HttpClient, private configService: ConfigService) {}

  private getApiUrl(): string {
    return `${this.configService.getApiUrl()}/training`;
  }

  /**
   * Mapping rôles staff → audiences (must match API enum values)
   */
  private readonly roleToAudienceMap: Record<string, TrainingAudience> = {
    'ADMIN': 'StaffAdmin',
    'ACCUEIL': 'StaffAccueil',
    'MEDECIN': 'StaffMedecin',
    'LABORANTIN': 'StaffLaborantin',
    'PHARMACIEN': 'StaffPharmacien',
    'SUPERVISEUR': 'StaffSuperviseur'
  };

  /**
   * Convertit un rôle staff en audience
   */
  getRoleToAudience(role: string): TrainingAudience {
    return this.roleToAudienceMap[role] || 'StaffAdmin';
  }

  /**
   * Convertit une audience en rôle
   */
  private getAudienceRole(audience: TrainingAudience): TrainingRole {
    if (audience === 'Patient') return 'PATIENT';
    // Map StaffAdmin → ADMIN, StaffAccueil → ACCUEIL, etc.
    const roleMap: Record<string, TrainingRole> = {
      'StaffAdmin': 'ADMIN',
      'StaffAccueil': 'ACCUEIL',
      'StaffMedecin': 'MEDECIN',
      'StaffLaborantin': 'LABORANTIN',
      'StaffPharmacien': 'PHARMACIEN',
      'StaffSuperviseur': 'SUPERVISEUR'
    };
    return roleMap[audience] as TrainingRole || 'ADMIN';
  }

  /**
   * Récupère la liste des modules pour un rôle donné
   * GET /api/training/modules?role=PATIENT
   * Fallback: assets/training/patient.modules.json
   */
  getModulesByRole(role: TrainingRole): Observable<TrainingModule[]> {
    return this.http.get<ApiResponse<TrainingModule[]>>(
      `${this.getApiUrl()}/modules?role=${role}`
    ).pipe(
      // Extract data from ApiResponse
      tap(response => {
        if (response?.success) {
          this.isOfflineMode = false;
        }
      }),
      // Map ApiResponse to TrainingModule[]
      map(response => response.data || []),
      catchError(error => {
        console.warn(`Training API unavailable for role ${role}, using fallback assets`, error);
        this.isOfflineMode = true;
        return this.loadModulesFromAssets(role);
      })
    );
  }

  /**
   * Récupère les modules pour une audience (staff ou patient)
   * Pour staff : audience = staff-admin, staff-accueil, etc.
   * Pour patient : audience = patient
   */
  getModulesByAudience(audience: TrainingAudience): Observable<TrainingModule[]> {
    return this.http.get<ApiResponse<TrainingModule[]>>(
      `${this.getApiUrl()}/modules?audience=${audience}`
    ).pipe(
      tap(response => {
        if (response?.success) {
          this.isOfflineMode = false;
        }
      }),
      map(response => response.data || []),
      catchError(error => {
        console.warn(`Training API unavailable for audience ${audience}, using fallback assets`, error);
        this.isOfflineMode = true;
        return this.loadModulesFromAssetsByAudience(audience);
      })
    );
  }

  /**
   * Récupère le détail d'un module
   * GET /api/training/modules/{id}
   * Fallback: charge depuis assets et filtre
   */
  getModuleById(id: string, role: TrainingRole): Observable<TrainingModule> {
    return this.http.get<ApiResponse<TrainingModule>>(
      `${this.getApiUrl()}/modules/${id}`
    ).pipe(
      tap(response => {
        if (response?.success) {
          this.isOfflineMode = false;
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.warn(`Failed to fetch module ${id}, using fallback`, error);
        this.isOfflineMode = true;
        return this.loadModulesFromAssets(role).pipe(
          map(modules => {
            const found = modules.find(m => m.id === id);
            if (!found) {
              throw new Error(`Module ${id} not found`);
            }
            return found;
          }),
          catchError(() => {
            return throwError(() => new Error(`Module ${id} not found`));
          })
        );
      })
    );
  }

  /**
   * Récupère le détail d'un module par audience
   */
  getModuleByIdAndAudience(id: string, audience: TrainingAudience): Observable<TrainingModule> {
    return this.http.get<ApiResponse<TrainingModule>>(
      `${this.getApiUrl()}/modules/${id}?audience=${audience}`
    ).pipe(
      tap(response => {
        if (response?.success) {
          this.isOfflineMode = false;
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.warn(`Failed to fetch module ${id} for audience ${audience}, using fallback`, error);
        this.isOfflineMode = true;
        return this.loadModulesFromAssetsByAudience(audience).pipe(
          map(modules => {
            const found = modules.find(m => m.id === id);
            if (!found) {
              throw new Error(`Module ${id} not found in audience ${audience}`);
            }
            return found;
          }),
          catchError(() => {
            return throwError(() => new Error(`Module ${id} not found in audience ${audience}`));
          })
        );
      })
    );
  }

  /**
   * Sauvegarde la progression utilisateur (optionnel, peut échouer si API offline)
   * POST /api/training/progress
   */
  saveProgress(moduleId: string, score?: number): Observable<any> {
    return this.http.post(`${this.getApiUrl()}/progress`, {
      moduleId,
      score,
      completedAt: new Date().toISOString()
    }).pipe(
      catchError(error => {
        // Don't fail if progress save fails - it's stored locally
        console.warn('Failed to sync progress to backend', error);
        return of(null);
      })
    );
  }

  /**
   * Récupère les stats de progression pour le dashboard
   * GET /api/training/stats
   */
  getStats(): Observable<any> {
    return this.http.get(`${this.getApiUrl()}/stats`).pipe(
      catchError(() => {
        // Return empty stats if unavailable
        return of({ completed: 0, inProgress: 0, notStarted: 0 });
      })
    );
  }

  /**
   * Vérifie si on est en mode offline
   */
  isOffline(): boolean {
    return this.isOfflineMode;
  }

  /**
   * Charge les modules depuis les assets JSON locaux ou données embarquées
   * Paths: assets/training/{role.toLowerCase()}.modules.json
   */
  private loadModulesFromAssets(role: TrainingRole): Observable<TrainingModule[]> {
    const filePath = `${this.ASSETS_PATH}/${role.toLowerCase()}.modules.json`;
    return this.http.get<TrainingModule[]>(filePath).pipe(
      catchError(error => {
        console.error(`Failed to load modules from ${filePath}, using embedded fallback`, error);
        // Fallback to embedded data if asset file not available
        if (role === 'PATIENT') {
          return of(this.getEmbeddedPatientModules());
        }
        return throwError(() => new Error(`Cannot load training modules for role ${role}`));
      })
    );
  }

  /**
   * Charge les modules depuis les assets JSON pour une audience donnée
   * Convertit PascalCase (StaffAdmin) → kebab-case (staff-admin) pour le nom du fichier
   */
  private loadModulesFromAssetsByAudience(audience: TrainingAudience): Observable<TrainingModule[]> {
    // Convert PascalCase to kebab-case: StaffAdmin → staff-admin, StaffAccueil → staff-accueil
    const fileName = audience === 'Patient'
      ? 'patient'
      : audience.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');

    const filePath = `${this.ASSETS_PATH}/${fileName}.modules.json`;
    console.log(`Loading modules from: ${filePath}`);

    return this.http.get<TrainingModule[]>(filePath).pipe(
      tap(() => console.log(`Successfully loaded modules from ${filePath}`)),
      catchError(error => {
        console.error(`Failed to load modules from ${filePath}`, error);
        // Fallback to embedded data based on audience
        if (audience === 'Patient') {
          console.warn('Using embedded patient modules as fallback');
          return of(this.getEmbeddedPatientModules());
        } else if (audience.startsWith('Staff')) {
          console.warn(`Using embedded staff modules as fallback for audience: ${audience}`);
          return of(this.getEmbeddedStaffModules(audience));
        }
        return throwError(() => new Error(`Cannot load training modules for audience ${audience}`));
      })
    );
  }

  /**
   * Données embarquées des modules de formation pour STAFF
   * Utilisées comme fallback si le fichier assets n'est pas disponible
   * Retourne un module de démarrage pour chaque audience staff
   */
  private getEmbeddedStaffModules(audience: TrainingAudience): TrainingModule[] {
    const titles: Record<TrainingAudience, string> = {
      'StaffAdmin': 'Gestion Administrative du Centre',
      'StaffAccueil': 'Communication Efficace avec les Patients',
      'StaffMedecin': 'Protocoles Cliniques Essentiels',
      'StaffLaborantin': 'Procédures de Prélèvement d\'Échantillons',
      'StaffPharmacien': 'Gestion des Médicaments et Inventaire',
      'StaffSuperviseur': 'Leadership et Gestion d\'Équipe',
      'Patient': 'Formation Patient'
    };

    const descriptions: Record<TrainingAudience, string> = {
      'StaffAdmin': 'Module de démarrage pour les administrateurs - Gestion des ressources et des processus.',
      'StaffAccueil': 'Module de démarrage pour l\'accueil - Techniques de communication efficace.',
      'StaffMedecin': 'Module de démarrage pour les médecins - Protocoles et standards cliniques.',
      'StaffLaborantin': 'Module de démarrage pour le laboratoire - Procédures de prélèvement.',
      'StaffPharmacien': 'Module de démarrage pour la pharmacie - Gestion du stock.',
      'StaffSuperviseur': 'Module de démarrage pour les superviseurs - Leadership et qualité.',
      'Patient': 'Formation Patient'
    };

    const title = titles[audience] || 'Module de Formation';
    const description = descriptions[audience] || 'Module de formation disponible';

    return [
      {
        id: `${audience}-intro`,
        role: this.getAudienceRole(audience),
        title: title,
        shortDescription: 'Module d\'introduction',
        description: description,
        durationMinutes: 15,
        level: 'Débutant',
        tags: ['introduction', 'démarrage'],
        imageUrl: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        steps: [
          {
            id: `${audience}-intro-step-1`,
            title: 'Bienvenue',
            content: `Bienvenue dans le module de formation pour ${title.toLowerCase()}.\n\nCe module d'introduction vous fournit les informations de base nécessaires pour bien comprendre votre rôle et vos responsabilités.\n\nLes modules complets seront disponibles dès que le système se synchronise avec les données de formation.`,
            order: 1,
            media: []
          },
          {
            id: `${audience}-intro-step-2`,
            title: 'À propos de ce module',
            content: `Les modules de formation sont conçus pour vous aider à:\n\n• Comprendre les processus clés\n• Développer vos compétences\n• Respecter les standards de qualité\n• Collaborer efficacement avec l'équipe\n\nPour accéder aux modules complets avec tous les contenus, veuillez redémarrer l'application ou attendre la synchronisation.`,
            order: 2,
            media: []
          }
        ]
      }
    ];
  }

  /**
   * Données embarquées des modules de formation pour PATIENT
   * Utilisées comme fallback si le fichier assets n'est pas disponible
   */
  private getEmbeddedPatientModules(): TrainingModule[] {
    return [
      {
        id: 'module-1-onboarding',
        role: 'PATIENT',
        title: 'Créer mon dossier avant ma première visite',
        shortDescription: 'Préparez vos informations et documents',
        description: 'Apprenez comment bien préparer votre dossier médical et les informations importantes à avoir lors de votre visite à la Brigade Médicale.',
        durationMinutes: 8,
        level: 'Débutant',
        tags: ['onboarding', 'dossier', 'préparation'],
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=400&h=300&fit=crop',
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        steps: [
          {id: 'step-1-1', title: 'Pourquoi préparer votre dossier?', content: 'Un dossier médical bien préparé permet :\n• Une consultation plus rapide\n• Une prise en charge optimale\n• Un suivi médical cohérent\n• Une meilleure qualité de service\n\nCela montre aussi que vous êtes impliqué dans votre santé!', order: 1, media: []},
          {id: 'step-1-2', title: 'Informations personnelles à préparer', content: 'Avant votre visite, rassemblez :\n\n1. Identité complète (nom, prénom, date de naissance)\n2. Numéro de téléphone et adresse\n3. Numéro de secteur (si vous êtes enregistré)\n4. Informations d\'urgence (contact personne d\'urgence)\n5. Informations sur votre assurance/mutuelle si applicable\n\nAyez ces informations à portée de main.', order: 2, media: []},
          {id: 'step-1-3', title: 'Documents et antécédents médicaux', content: 'Si possible, apportez :\n\n• Carnet de vaccination (si vous en avez un)\n• Ordonnances précédentes\n• Résultats d\'analyses médicales récentes\n• Courriers d\'autres médecins\n• Traitement actuel (liste des médicaments que vous prenez)\n\nCes informations aident le médecin à mieux vous soigner.', order: 3, media: []},
          {id: 'step-1-4', title: 'Antécédents familiaux et allergies', content: 'Notez les informations importantes :\n\n• Allergies (médicaments, aliments...)\n• Maladies chroniques (diabète, hypertension...)\n• Allergies familiales (parents, frères/sœurs)\n• Opérations chirurgicales antérieures\n\nCette information est CONFIDENTIELLE et très utile pour votre traitement.', order: 4, media: []},
          {id: 'step-1-5', title: 'Votre secteur et secteur d\'église', content: 'Lors de l\'inscription, vous avez peut-être indiqué :\n\n• Votre secteur géographique de vie\n• Votre secteur d\'église (si applicable)\n\nAyez ces informations en tête, elles permettent un meilleur suivi communautaire.', order: 5, media: []},
          {id: 'step-1-6', title: 'Prêt à visiter la Brigade Médicale?', content: 'Vous avez maintenant tout ce qu\'il faut :\n✓ Vos informations personnelles\n✓ Vos documents médicaux\n✓ Vos antécédents\n✓ Votre motivation!\n\nVous pouvez maintenant vous présenter à la Brigade Médicale pour votre première visite. L\'équipe est là pour vous accueillir et vous aider!', order: 6, media: []}
        ],
        quiz: [
          {id: 'q1-1', question: 'Quel est le premier document important à préparer?', options: ['Votre passeport', 'Votre identité complète', 'Votre permis de conduire', 'Votre carte bancaire'], answerIndex: 1, order: 1},
          {id: 'q1-2', question: 'Pourquoi est-il important de noter vos allergies?', options: ['Pour garder un dossier', 'Pour la sécurité de votre traitement', 'Pour montrer au médecin', 'Ce n\'est pas important'], answerIndex: 1, order: 2},
          {id: 'q1-3', question: 'Qu\'est-ce qu\'un carnet de vaccination?', options: ['Un document personnel de suivi vaccinal', 'Une carte de crédit', 'Un formulaire d\'inscription', 'Une facture'], answerIndex: 0, order: 3},
          {id: 'q1-4', question: 'Qui devrait vous accompagner à votre première visite?', options: ['Obligatoire quelqu\'un', 'Personne d\'urgence si possible', 'N\'importe qui', 'Personne de votre secteur'], answerIndex: 1, order: 4},
          {id: 'q1-5', question: 'Combien de temps devrait prendre votre préparation?', options: ['Plus de 2 heures', '30 minutes à 1 heure', 'Moins de 15 minutes', 'Toute une journée'], answerIndex: 1, order: 5}
        ]
      },
      {
        id: 'module-2-qr-code',
        role: 'PATIENT',
        title: 'Présenter mon QR Code à l\'accueil',
        shortDescription: 'Utilisez votre QR Code pour accélérer votre accueil',
        description: 'Découvrez comment utiliser votre code QR Brigade Médicale pour faciliter votre accès et votre enregistrement à l\'accueil.',
        durationMinutes: 7,
        level: 'Débutant',
        tags: ['QR code', 'accueil', 'vérification'],
        imageUrl: 'https://images.unsplash.com/photo-1611532736e291cf87c5fe11a3e1e3bc0c5d7a7b?w=400&h=300&fit=crop',
        createdAt: '2024-01-15T11:00:00Z',
        updatedAt: '2024-01-15T11:00:00Z',
        steps: [
          {id: 'step-2-1', title: 'Qu\'est-ce qu\'un code QR?', content: 'Un code QR (Quick Response) est:\n• Un code à barres en 2 dimensions\n• Lisible par un smartphone ou une tablette\n• Contient vos informations de patient\n• Unique et sécurisé\n• Accélère votre enregistrement', order: 1, media: []},
          {id: 'step-2-2', title: 'Où trouver votre code QR?', content: 'Votre QR Code Brigade Médicale se trouve:\n• Dans votre dossier patient en ligne\n• Sur votre notification de création de compte\n• Sur votre carte patient (si imprimée)\n• Dans l\'application Brigade Médicale\n\nVous pouvez le télécharger ou l\'afficher sur votre téléphone.', order: 2, media: []},
          {id: 'step-2-3', title: 'Comment utiliser le code QR?', content: 'À votre arrivée à la Brigade Médicale:\n1. Présentez votre téléphone avec le QR Code visible à l\'accueil\n2. Le personnel scannera votre code\n3. Vos informations seront vérifiées automatiquement\n4. Vous serez enregistré plus rapidement', order: 3, media: []},
          {id: 'step-2-4', title: 'Si vous n\'avez pas de téléphone?', content: 'Pas de problème!\n• Vous pouvez imprimer votre QR Code\n• Vous pouvez demander un QR Code imprimé à l\'accueil\n• L\'enregistrement manuel est toujours possible\n• Le personnel vous aidera à vous identifier', order: 4, media: []},
          {id: 'step-2-5', title: 'Sécurité et confidentialité', content: 'Votre QR Code est sécurisé:\n• Chiffré et personnel\n• Uniquement lisible par Brigade Médicale\n• Vous pouvez le régénérer à tout moment\n• Vos données sont protégées', order: 5, media: []},
          {id: 'step-2-6', title: 'Prêt à scannez?', content: 'Vous savez maintenant:\n✓ Ce qu\'est un QR Code\n✓ Où trouver le vôtre\n✓ Comment l\'utiliser\n✓ Comment vous protéger\n\nÀ bientôt à la Brigade Médicale!', order: 6, media: []}
        ],
        quiz: [
          {id: 'q2-1', question: 'Que signifie QR?', options: ['Quite Right', 'Quick Response', 'Quality Record', 'Quantum Response'], answerIndex: 1, order: 1},
          {id: 'q2-2', question: 'Où pouvez-vous trouver votre QR Code?', options: ['À l\'accueil seulement', 'Dans votre dossier patient ou sur votre téléphone', 'Nulle part', 'Chez vous sur un papier'], answerIndex: 1, order: 2},
          {id: 'q2-3', question: 'Qu\'y a-t-il dans votre QR Code?', options: ['Juste un numéro', 'Vos informations de patient', 'Un site internet', 'Rien de spécial'], answerIndex: 1, order: 3},
          {id: 'q2-4', question: 'Que faire si vous n\'avez pas de téléphone?', options: ['Retourner chez vous', 'Vous pouvez imprimer votre QR Code', 'Vous ne pouvez pas accéder', 'C\'est obligatoire d\'avoir un téléphone'], answerIndex: 1, order: 4},
          {id: 'q2-5', question: 'Votre QR Code est-il sécurisé?', options: ['Non, n\'importe qui peut le scanner', 'Oui, il est chiffré et personnel', 'Partiellement sécurisé', 'On ne sait pas'], answerIndex: 1, order: 5}
        ]
      }
    ];
  }
}
