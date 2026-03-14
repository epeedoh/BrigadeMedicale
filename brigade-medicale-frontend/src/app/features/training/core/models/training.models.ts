/**
 * Training/Formation Feature Models
 * Supports multiple roles: PATIENT, ACCUEIL, MEDECIN, PHARMACIE, ADMIN
 */

export type TrainingRole = 'PATIENT' | 'ACCUEIL' | 'MEDECIN' | 'PHARMACIE' | 'ADMIN' | 'LABORANTIN' | 'PHARMACIEN' | 'SUPERVISEUR';
export type TrainingAudience = 'Patient' | 'StaffAdmin' | 'StaffAccueil' | 'StaffMedecin' | 'StaffLaborantin' | 'StaffPharmacien' | 'StaffSuperviseur';
export type TrainingLevel = 'Débutant' | 'Intermédiaire' | 'Avancé';
export type ProgressStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
export type MediaType = 'image' | 'video' | 'link';

/**
 * Une étape du module de formation
 */
export interface TrainingStep {
  id: string;
  title: string;
  content: string;
  order: number;
  media?: TrainingMedia[];
}

/**
 * Média (image, vidéo, lien)
 */
export interface TrainingMedia {
  type: MediaType;
  url: string;
  caption?: string;
}

/**
 * Question de quiz
 */
export interface TrainingQuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number; // Index correct dans les options (0-3)
  order: number;
}

/**
 * Module de formation (module unique)
 */
export interface TrainingModule {
  id: string;
  role: TrainingRole;
  title: string;
  description: string;
  shortDescription?: string;
  durationMinutes: number;
  level: TrainingLevel;
  tags: string[];
  imageUrl?: string;
  steps: TrainingStep[];
  quiz?: TrainingQuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Progression utilisateur sur un module
 */
export interface TrainingProgress {
  moduleId: string;
  status: ProgressStatus;
  startedAt?: string;
  completedAt?: string;
  score?: number; // Score quiz en %
  currentStepIndex?: number;
  completedSteps?: string[]; // Array of completed step IDs
}

/**
 * Réponse à une question du quiz
 */
export interface QuizAnswer {
  questionId: string;
  selectedIndex: number;
}

/**
 * Résultat du quiz
 */
export interface QuizResult {
  moduleId: string;
  score: number; // Pourcentage
  correctAnswers: number;
  totalQuestions: number;
  answers: QuizAnswer[];
  completedAt: string;
}
