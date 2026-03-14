# Brigade Médicale Frontend - Fonctionnalités

## 🏥 Portail Patient

**Routes**:
- `/patient/onboarding` - Inscription 2 étapes (guest guard)
- `/patient/login` - Connexion patient (guest guard)
- `/patient/success` - Confirmation + QR code
- `/patient/dashboard/*` - Carnet santé complet (patient guard)
  - `/overview` - Vue d'ensemble
  - `/profile` - Infos personnelles
  - `/visits` - Historique visites
  - `/consultations` - Consultations médecin
  - `/analyses` - Tests laboratoire
  - `/pharmacie` - Ordonnances/médicaments
  - `/infos` - Annonces santé
  - `/training` - Formation patient (avec quiz)

**Sécurité**:
- Token patient: `localStorage.patientToken`
- Header auto: `X-Patient-Token: <token>`
- Guards : redirection auto vers login

---

## 📚 Formation (Patient + Staff)

### Patient
**Route**: `/patient/dashboard/training`
- Catalogue modules (patient-only)
- Quiz interactif par module
- Progress localStorage (`training_patient_*`)
- JSON assets: `assets/training/patient-modules.json`

### Staff (6 profils)
**Route**: `/dashboard/training`
- Catalogue par rôle (ADMIN/ACCUEIL/MEDECIN/LABORANTIN/PHARMACIEN/SUPERVISEUR)
- **PAS de quiz** pour staff
- Progress localStorage (`training_staff-{role}_*`)
- JSON assets: `assets/training/staff-{role}.modules.json`

**Audience-aware**:
```typescript
Role → Audience mapping:
- ADMIN → staff-admin
- ACCUEIL → staff-accueil
- MEDECIN → staff-medecin
- LABORANTIN → staff-laborantin
- PHARMACIEN → staff-pharmacien
- SUPERVISEUR → staff-superviseur
```

**Offline**: Fallback JSON assets si API 404

---

## 🩺 Triage (Prise de Constantes)

**Route**: `/dashboard/triage`
**Rôles**: ADMIN, ACCUEIL, SUPERVISEUR

**Formulaire**:
- Température (°C)
- Pouls (bpm)
- Tension artérielle (systolique/diastolique)
- Poids (kg) + Taille (cm) → **IMC auto-calculé**
- SpO2 (%) - optionnel
- Motif consultation
- Urgence (Vert/Jaune/Rouge)
- Notes supplémentaires

**Offline**:
- Détection `navigator.onLine`
- Sauvegarde brouillon: localStorage
- Bouton "Enregistrer brouillon"

**API**:
- `POST /api/triage` - Créer (avec fallback 404 → localStorage)
- `GET /api/triage/latest?patientId=X` - Récent
- `GET /api/triage/by-visit/{id}` - Par visite

**Widget** (`triage-summary-widget`):
- Affichage résumé pour consultations médecin
- Constantes + urgence + motif
- À ajouter dans `consultation-detail.component.ts`:
  ```html
  <app-triage-summary-widget [patientId]="..." [visitId]="...">
  </app-triage-summary-widget>
  ```

---

## 🔑 Auth & Guards

### Patient Auth
```typescript
// Store & retrieve
patientTokenService.setPatientData(token, patientNumber, qrCode)
patientTokenService.getToken()
patientTokenService.getPatientNumber()
patientTokenService.getQrCode()
patientTokenService.clearPatientData()

// Guards
patientGuard : sans token → /patient/login
patientGuestGuard : avec token → /patient/dashboard
```

### Staff Auth (existant)
```typescript
// JWT
authService.login(username, password)
authService.logout()
authService.getCurrentUser()

// Guards
authGuard : sans JWT → /login
roleGuard : rôle non autorisé → /unauthorized
```

---

## 📱 Responsive Design

**Breakpoints**:
- Mobile: 360px
- Tablet: 768px
- Desktop: 1024px
- Laptop: 1366px+

**Pattern**:
- `sm:` tailwind prefix pour tablet+
- `md:` pour desktop+
- Sidebar desktop fixe (64/72 width units)
- Bottom nav mobile pour patient
- Dropdown menu mobile pour staff

**Zéro scroll horizontal** ✅

---

## 🔌 Environment

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5238/api', // ASP.NET backend
  tokenKey: 'brigade_access_token',
  refreshTokenKey: 'brigade_refresh_token'
};
```

---

## 📦 Dépendances clés

- Angular 20 (standalone)
- RxJS (observable services)
- Tailwind CSS (styling)
- Reactive Forms (validation)
- Router guards (auth)

---

## 🚀 Démarrage

```bash
npm install
ng serve
# http://localhost:4200/
```

---

## 📚 Voir aussi

- [IMPLEMENTATION_SUMMARY.md](../IMPLEMENTATION_SUMMARY.md) - Détails implémentation
- Code inline: JSDoc détaillé dans services et composants
