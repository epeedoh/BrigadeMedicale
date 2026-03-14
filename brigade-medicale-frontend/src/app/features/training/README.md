# Formation (E-Learning) Feature - Brigade Médicale Patient Portal

## Overview

The **Formation** feature is an e-learning module system integrated into the Brigade Médicale patient portal. It allows patients to access educational modules on various health-related topics, track their progress, and complete quizzes to reinforce learning.

### MVP1 Scope

- **Role**: Patient only (`PATIENT`)
- **Features**:
  - Catalogue of training modules with search/filter
  - Module detail view with expandable steps
  - Interactive quizzes (5 questions per module)
  - Progress tracking with offline support
  - Responsive design (360px - 1366px with zero horizontal scroll)
  - Fallback to JSON assets if API is unavailable

---

## Architecture

### Feature-First Structure

```
src/app/features/training/
├── core/
│   ├── models/
│   │   └── training.models.ts          # TypeScript interfaces & types
│   └── services/
│       ├── training.service.ts         # API with fallback strategy
│       └── training-storage.service.ts # LocalStorage management
├── pages/
│   ├── training-catalog/
│   │   └── training-catalog.component.ts         # Module catalogue
│   ├── training-module-detail/
│   │   └── training-module-detail.component.ts   # Module with steps
│   └── training-quiz/
│       └── training-quiz.component.ts            # Quiz component
├── training.routes.ts                  # Feature routes
└── README.md                           # Documentation
```

### API & Fallback Strategy

The `TrainingService` attempts to fetch modules from the backend API. If the API is unavailable (offline or server down), it automatically falls back to JSON asset files:

**API Endpoint:**
```
GET /api/training/modules?role=PATIENT
GET /api/training/modules/:id?role=PATIENT
```

**Fallback Asset Path:**
```
assets/training/patient.modules.json
```

The service detects offline mode and provides an `isOffline()` getter to notify the UI.

---

## Standalone Components

All components are **Angular standalone** (no NgModule required):

### 1. TrainingCatalogComponent
**Route:** `/patient/dashboard/training`

**Features:**
- List all available modules for the PATIENT role
- Search and filter by title, description, and tags
- Display module metadata: duration, level, step count, quiz questions
- Show progress status (Not Started, In Progress, Completed)
- Responsive grid: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop)
- Offline mode indicator badge
- CTA buttons: "Commencer" / "Continuer" / "Revoir" based on status

**Data:**
- Uses async pipe with module$ Observable
- Auto-marks module as "started" when clicked
- Fetches progress from TrainingStorageService

### 2. TrainingModuleDetailComponent
**Route:** `/patient/dashboard/training/:id`

**Features:**
- Display single module with accordion-style expandable steps
- Header: back button, title, description, info bar (duration, steps, quiz count, level)
- Steps: numbered circles, one expanded at a time
- Step navigation: Previous/Next buttons
- Media support: images with captions, external links
- Quiz CTA button on last step
- Responsive typography: text-sm (mobile) → text-base (desktop)
- No horizontal overflow at any breakpoint

**Data:**
- Fetches module by ID from API/assets
- Tracks expanded steps in Set<string>
- Displays step content with whitespace preservation

### 3. TrainingQuizComponent
**Route:** `/patient/dashboard/training/:id/quiz`

**Features:**
- Display 5-question quiz one at a time
- Question navigation: Previous/Next buttons, Submit on last question
- Progress bar showing current position (X of Y)
- Radio button options for answers
- Results screen showing:
  - Score percentage in large circle
  - Correct/total answer count
  - Pass/fail badge (≥60% = pass)
  - Contextual message based on score
- "Redo Quiz" or "Back to Module" buttons
- Saves result to localStorage via TrainingStorageService

**Score Ranges:**
- 90-100%: "Excellent !"
- 75-89%: "Très bien !"
- 60-74%: "Bien !"
- <60%: "À réessayer"

**Data:**
- Loads quiz from module's quiz array
- Tracks selected answers in array indexed by question
- Calculates score: (correct answers / total) * 100
- Marks module as COMPLETED with QuizResult in storage

---

## Data Models

### TrainingModule
```typescript
interface TrainingModule {
  id: string;
  role: TrainingRole;        // 'PATIENT' | 'ACCUEIL' | 'MEDECIN' | ...
  title: string;
  shortDescription?: string;
  description: string;
  durationMinutes: number;
  level: TrainingLevel;       // 'Débutant' | 'Intermédiaire' | 'Avancé'
  tags: string[];
  imageUrl?: string;
  steps: TrainingStep[];
  quiz?: TrainingQuizQuestion[];
  createdAt: string;
  updatedAt: string;
}
```

### TrainingStep
```typescript
interface TrainingStep {
  id: string;
  title: string;
  content: string;
  order: number;
  media?: TrainingMedia[];
}

interface TrainingMedia {
  type: 'image' | 'link';
  url: string;
  caption?: string;
}
```

### TrainingQuizQuestion
```typescript
interface TrainingQuizQuestion {
  id: string;
  question: string;
  options: string[];
  answerIndex: number;      // 0-3
  order: number;
}
```

### TrainingProgress
```typescript
interface TrainingProgress {
  moduleId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  startedAt?: string;
  completedAt?: string;
  lastAccessedAt?: string;
  quizResult?: QuizResult;
}

interface QuizResult {
  moduleId: string;
  score: number;            // 0-100
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  answers: number[];        // Array of selected option indices
}
```

---

## Services

### TrainingService
**Purpose:** Fetch training modules from API or fallback to JSON assets

**Methods:**
```typescript
// Get all modules for a specific role
getModulesByRole(role: TrainingRole): Observable<TrainingModule[]>

// Get single module by ID and role
getModuleById(id: string, role: TrainingRole): Observable<TrainingModule>

// Save progress to backend (optional in MVP1)
saveProgress(moduleId: string, score: number): Observable<any>

// Get user's stats
getStats(): Observable<any>

// Check if offline
isOffline(): boolean
```

**Fallback Logic:**
1. Try API endpoint: `GET /api/training/modules?role=PATIENT`
2. If error → fallback to: `GET /assets/training/patient.modules.json`
3. Emit isOffline flag for UI notification

### TrainingStorageService
**Purpose:** Manage localStorage for offline progress tracking

**LocalStorage Key Pattern:** `training_` prefix
- `training_progress_modules` - Map of all module progress
- `training_completed_modules` - Array of completed module IDs
- `training_last_sync` - Last API sync timestamp

**Methods:**
```typescript
// Get progress for single module
getProgress(moduleId: string): TrainingProgress | null

// Get all progress records
getAllProgress(): Map<string, TrainingProgress>

// Mark module as started
markStarted(moduleId: string): void

// Update progress for a module
setProgress(moduleId: string, progress: TrainingProgress): void

// Mark as completed with quiz result
markCompleted(moduleId: string, quizResult: QuizResult): void

// Get status of a module
getStatus(moduleId: string): ProgressStatus

// Get stats: completed count, in-progress count, total count
getStats(): { completed: number; inProgress: number; notStarted: number }

// Clear all progress (for testing)
clearAll(): void
```

---

## Offline Support

### How It Works

1. **Local Progress Tracking**: All progress is saved to browser localStorage with `training_` prefix
2. **API Fallback**: If API is unreachable, JSON assets are used
3. **Seamless Offline Mode**: Quiz results and progress are stored locally, synced to backend when online

### Storage Keys

```javascript
localStorage.getItem('training_progress_modules')      // All progress
localStorage.getItem('training_completed_modules')     // Completed IDs
localStorage.getItem('training_last_sync')             // Last sync timestamp
```

### Testing Offline Mode

1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Navigate to Formation feature
4. Complete a quiz
5. Results are saved to localStorage
6. Go back online to sync (future implementation)

---

## Content Structure

### JSON Asset File: `assets/training/patient.modules.json`

Structure:
```json
{
  "modules": [
    {
      "id": "module-001",
      "role": "PATIENT",
      "title": "Créer mon dossier avant ma première visite",
      "shortDescription": "Préparez-vous à votre première visite",
      "description": "Apprenez comment créer votre dossier patient...",
      "durationMinutes": 6,
      "level": "Débutant",
      "tags": ["onboarding", "premier-rdv"],
      "imageUrl": "https://images.unsplash.com/...",
      "steps": [
        {
          "id": "step-001-001",
          "title": "Qu'est-ce que mon dossier patient ?",
          "content": "Votre dossier patient...",
          "order": 1,
          "media": [
            {
              "type": "image",
              "url": "https://images.unsplash.com/...",
              "caption": "Exemple de dossier patient"
            }
          ]
        }
      ],
      "quiz": [
        {
          "id": "quiz-001-001",
          "question": "Que contient un dossier patient ?",
          "options": [
            "Antécédents médicaux",
            "Allergies",
            "Prescriptions",
            "Tous les éléments ci-dessus"
          ],
          "answerIndex": 3,
          "order": 1
        }
      ]
    }
  ]
}
```

### Current Content (MVP1)

5 complete modules in French for PATIENT role:

1. **Module 1**: "Créer mon dossier avant ma première visite"
   - Duration: 6 minutes | Level: Débutant | 6 steps + 5-question quiz

2. **Module 2**: "Présenter mon QR Code à l'accueil"
   - Duration: 8 minutes | Level: Débutant | 6 steps + 5-question quiz

3. **Module 3**: "Consulter mon carnet de santé"
   - Duration: 7 minutes | Level: Intermédiaire | 6 steps + 5-question quiz

4. **Module 4**: "Comprendre mon ordonnance et mes médicaments"
   - Duration: 10 minutes | Level: Intermédiaire | 6 steps + 5-question quiz

5. **Module 5**: "Rester informé: Messages et annonces"
   - Duration: 9 minutes | Level: Débutant | 6 steps + 5-question quiz

---

## Routing Integration

### Routes

**Feature Routes** (`training.routes.ts`):
```typescript
{
  path: '',                              // → /patient/dashboard/training
  component: TrainingCatalogComponent
},
{
  path: ':id',                           // → /patient/dashboard/training/:id
  component: TrainingModuleDetailComponent
},
{
  path: ':id/quiz',                      // → /patient/dashboard/training/:id/quiz
  component: TrainingQuizComponent
}
```

**App Routes Integration** (`app.routes.ts`):
```typescript
{
  path: 'training',
  loadChildren: () => import('./features/training/training.routes')
    .then(m => m.TRAINING_ROUTES)
}
```

### Navigation Flow

```
MainPage
  └─ /patient/dashboard
      ├─ overview
      ├─ profile
      ├─ training ← NEW
      │   ├─ (catalog)
      │   ├─ :id (detail)
      │   └─ :id/quiz (quiz)
      └─ ... other features
```

---

## Patient Shell Integration

### Menu Item

Added to `patient-shell.component.ts`:

```typescript
{
  label: 'Formation',
  route: '/patient/dashboard/training',
  icon: '<svg>...</svg>'  // Book icon
}
```

### Mobile Navigation

Formation is included in the mobile bottom navigation bar (6 items):
1. Accueil
2. Formation ← NEW
3. Analyses
4. Pharmacie
5. Profil

---

## Responsive Design

### Breakpoints (Tailwind CSS)

- **Base (0-640px)**: Mobile layout
  - `text-sm` for smaller screens
  - `p-4` padding
  - Single-column grid
  - Bottom navigation bar

- **sm (640-768px)**: Tablet portrait
  - `sm:text-base` readable text
  - `sm:p-6` better spacing
  - Grid cols adjustment

- **md (768-1024px)**: Tablet landscape
  - Sidebar navigation visible
  - `md:ml-64` for sidebar offset
  - 2-column grid

- **lg (1024px+)**: Desktop
  - `lg:ml-72` wider sidebar
  - 3-column grid for module cards
  - Full desktop experience

### Zero Horizontal Overflow

- All components use `w-full` or `max-w-4xl` with `mx-auto`
- Text truncation with `truncate` or `line-clamp-X`
- Responsive padding: `p-4 sm:p-6`
- Image responsive with `max-w-full h-auto`
- No fixed-width elements that exceed viewport

---

## Testing Checklist

### Functional Testing

- [ ] **Catalogue Page**
  - [ ] Load all modules from API/assets
  - [ ] Search filters by title, description, tags
  - [ ] Click module → navigate to detail page
  - [ ] Progress status displays correctly (Not Started/In Progress/Completed)
  - [ ] Offline mode badge shows when API unavailable

- [ ] **Module Detail Page**
  - [ ] Load module by URL parameter ID
  - [ ] First step auto-expands
  - [ ] Click step header → expand/collapse accordion
  - [ ] Previous/Next buttons navigate correctly
  - [ ] Quiz button on last step → navigate to quiz
  - [ ] Media (images, links) display properly
  - [ ] Back button → return to catalogue

- [ ] **Quiz Page**
  - [ ] Load quiz for module
  - [ ] Progress bar updates as questions change
  - [ ] Radio buttons work correctly
  - [ ] Previous/Next buttons enabled when answered
  - [ ] Submit button disabled until last question answered
  - [ ] Submit → calculate score and show results
  - [ ] Score ≥60% shows "Module réussi" (green)
  - [ ] Score <60% shows "À réessayer" (orange)
  - [ ] Redo quiz → reset and start over
  - [ ] Back to module → navigate to detail

### Responsive Testing

Test at viewport widths: **360px, 480px, 640px, 768px, 1024px, 1366px**

- [ ] No horizontal scroll at 360px (minimum supported width)
- [ ] Text is readable at all sizes
- [ ] Buttons are touch-friendly (min 44px height on mobile)
- [ ] Images scale properly
- [ ] Navigation transitions smoothly between breakpoints

### Offline Testing

- [ ] DevTools → Network → Offline
- [ ] Navigate to Formation
- [ ] Modules load from JSON assets
- [ ] "Offline Mode" badge visible
- [ ] Complete quiz
- [ ] Results saved to localStorage
- [ ] Go back online
- [ ] Data persists (future: sync to API)

### Accessibility

- [ ] Keyboard navigation: Tab through all controls
- [ ] Radio buttons: Space to select
- [ ] Links: Enter to navigate
- [ ] Buttons: Enter/Space to activate
- [ ] Labels associated with form inputs
- [ ] Color contrast ratios meet WCAG AA
- [ ] Focus states visible

---

## API Endpoints (Phase 2)

**Future implementation:** Backend API endpoints for syncing progress

```
POST /api/training/progress/:moduleId
  Body: { score, completedAt, answers[] }
  Response: { success, data: { id, synced_at } }

GET /api/training/stats
  Response: { success, data: { completed, in_progress, total } }

GET /api/training/modules/:id/results
  Response: { success, data: { quizResult } }
```

---

## Performance Considerations

### Lazy Loading

- Training feature routes are lazy-loaded via `loadChildren`
- Components load only when user navigates to `/patient/dashboard/training`

### Change Detection

- All components use **OnPush change detection** (via async pipe)
- No manual subscriptions → no memory leaks
- Uses `takeUntilDestroyed` for RxJS cleanup

### Bundle Size

- Standalone components reduce bundle overhead
- Shared utilities in `core/` avoid duplication
- No external UI library dependencies (pure Tailwind CSS)

---

## Future Enhancements (Phase 2+)

1. **Multi-Role Support**: Add modules for ACCUEIL, MEDECIN, PHARMACIE roles
2. **Progress Sync**: Backend API integration to sync offline progress
3. **Certificates**: PDF certificates for completed modules
4. **Analytics**: Track time spent, completion rates, performance trends
5. **Video Content**: Support for video steps (media type: 'video')
6. **Discussions**: Comments/questions on modules
7. **Adaptive Learning**: Personalized content based on user performance
8. **Mobile App**: Include Formation in MAUI patient mobile app

---

## Troubleshooting

### Modules not loading?

1. Check browser DevTools → Network tab
2. Verify API endpoint: `GET /api/training/modules?role=PATIENT`
3. If API fails, confirm `assets/training/patient.modules.json` exists
4. Check browser console for errors

### Progress not saving?

1. Check localStorage in DevTools → Application → LocalStorage
2. Verify key `training_progress_modules` exists
3. Clear localStorage and try again
4. Check if browser has localStorage enabled

### Quiz not submitting?

1. Ensure all questions are answered
2. Submit button should be enabled on last question
3. Check browser console for JavaScript errors
4. Verify TrainingStorageService is properly injected

### Styling issues?

1. Confirm Tailwind CSS is properly configured
2. Check for CSS conflicts with other features
3. Verify responsive classes (sm:, md:, lg:) are applied
4. Test in different browsers

---

## Files Reference

| File | Purpose |
|------|---------|
| `training.models.ts` | TypeScript interfaces and enums |
| `training.service.ts` | API client with fallback logic |
| `training-storage.service.ts` | LocalStorage progress management |
| `training-catalog.component.ts` | Module listing and filtering |
| `training-module-detail.component.ts` | Module content with steps |
| `training-quiz.component.ts` | Interactive quiz with scoring |
| `training.routes.ts` | Feature route definitions |
| `assets/training/patient.modules.json` | Fallback content for PATIENT role |
| `README.md` | This documentation |

---

## Support

For issues, questions, or feature requests:
1. Check this README for troubleshooting
2. Review browser console for error messages
3. Check localStorage for progress data
4. Report issues with API endpoint or JSON asset format

---

**Last Updated:** February 2025
**MVP1 Status:** Complete ✓
