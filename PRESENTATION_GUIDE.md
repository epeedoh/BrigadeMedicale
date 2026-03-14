# 🎬 Guide de Présentation - Brigade Médicale

## 📋 Avant de commencer

### Préparation
- [ ] Navigateur ouvert sur http://app.local:8081
- [ ] Onglet Swagger ouvert: http://api.local:8080/swagger
- [ ] Credentials admin: `admin` / `admin123`
- [ ] Écran clair et visible (zoom à 100%)
- [ ] Pas de notifications système gênantes

### Durée estimée
- Présentation courte: 10-15 min
- Présentation complète: 20-30 min

---

## 🎯 PART 1: Introduction (2 min)

### Contexte
```
"Brigade Médicale est un système de gestion médical intégré
permettant aux médecins et infirmiers de gérer les patients,
triages, consultations et prescriptions de manière centralisée."
```

### Acteurs système
1. **ADMIN** - Gestion du système
2. **MEDECIN** - Consultations et diagnostics
3. **INFIRMIER** - Triage et vitals

### Architecture
```
Frontend Angular (SPA)
        ↓
.NET Core API (REST)
        ↓
SQL Database
```

---

## 🎬 PART 2: Tour d'application (5 min)

### Étape 1: Page de login

**Actions:**
1. Afficher la page de login
2. Montrer les éléments visuels:
   - Logo Brigade Médicale
   - Design professionnel (couleurs teal/bleu)
   - Responsive (fonctionne sur mobile)

**Points clés à mentionner:**
- ✅ Authentification sécurisée (JWT)
- ✅ Interface utilisateur intuitive
- ✅ Design moderne et professionnel

---

### Étape 2: Login et Dashboard

**Actions:**
```
Username: admin
Password: admin123
Click: SE CONNECTER
```

**Attendre le chargement et montrer:**
1. Menu latéral (Sidebar)
2. Éléments du menu:
   - Dashboard
   - Patients
   - Consultations
   - Triage Patient (pour INFIRMIER)
   - Prescriptions
   - Paramètres

**Points clés:**
- ✅ Navigation intuitive
- ✅ Menu contextualisé par rôle
- ✅ Responsive design

---

### Étape 3: Gestion des Patients

**Navigation:** Menu > Patients

**Actions:**
1. Afficher la liste des patients
2. Montrer les colonnes:
   - Numéro du patient
   - Nom complet
   - Date de naissance
   - Groupe sanguin
   - Allergies
   - Secteur/Zone

**Fonctionnalités à démontrer:**
- [ ] **Recherche:** Filtrer par nom/numéro
- [ ] **Ajouter patient:** Remplir le formulaire
  - Informations personnelles
  - Antécédents médicaux
  - Informations d'urgence
- [ ] **Éditer patient:** Cliquer sur un patient
- [ ] **Voir détails:** Afficher le profil complet

**Points clés:**
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Validation des données
- ✅ Gestion des allergies et antécédents
- ✅ Interface claire et organisée

---

### Étape 4: Triage Patient (INFIRMIER)

**Navigation:** Menu > Triage Patient

**Contexte:**
"L'infirmier effectue un triage pour enregistrer les constantes vitales du patient"

**Actions:**
1. Cliquer sur "Nouveau Triage"
2. **Sélectionner un patient:**
   - Cliquer sur dropdown "Sélectionner un patient"
   - Montrer la liste des patients
   - **Point de sécurité:** Affiche SEULEMENT nom + numéro (pas les détails médicaux)
   - Sélectionner un patient
3. **Carte de confirmation:**
   - Affiche: Nom, Numéro, Âge, Sexe, Téléphone
   - Bouton "Changer" pour modifier la sélection

**Saisie des données:**
```
Constantes vitales à remplir:
- Fréquence cardiaque (FC): 72 bpm
- Tension artérielle: 120/80 mmHg
- Température: 37.5°C
- Fréquence respiratoire: 16
- Poids: 70 kg
- Taille: 1.75 m (→ calcule BMI automatiquement)
- Niveau d'urgence: Verde/Giallo/Rosso
```

**Points clés:**
- ✅ Interface simple et rapide (pour urgence)
- ✅ Calcul automatique du BMI
- ✅ Privacy by design (ne montre pas les détails médicaux)
- ✅ Validation des données
- ✅ Offline capable (queue locale)

4. **Soumettre et afficher:**
   - Cliquer "Enregistrer"
   - Montrer le message de succès
   - Afficher dans la liste des triages du jour

---

### Étape 5: Consultations (MEDECIN)

**Navigation:** Menu > Consultations

**Contexte:**
"Le médecin examine les patients et crée des consultations basées sur les triages"

**Actions:**
1. Afficher la liste des consultations
2. **Créer nouvelle consultation:**
   - Cliquer "Nouvelle consultation"
   - Sélectionner le patient (même interface que triage)
   - Le triage récent est chargé automatiquement
   - Afficher les constantes du triage en **lecture seule**

3. **Saisie des données médicales:**
```
Motif: Malaise général
Diagnostic: Fatigue passagère
Traitement recommandé: Repos 48h
Notes: À ré-évaluer si persistance
Statut: En cours / Complétée
```

4. **Lier une prescription:**
   - Afficher la section "Prescriptions"
   - Cliquer "Ajouter prescription"

**Points clés:**
- ✅ Données du triage pré-remplies
- ✅ Historique complet du patient
- ✅ Traçabilité médicale
- ✅ Integration avec prescriptions

---

### Étape 6: Prescriptions

**Actions:**
1. Depuis la consultation, ajouter prescription:
```
Médicament: Paracétamol
Dosage: 500mg
Fréquence: 3x par jour
Durée: 7 jours
Notes: Après les repas
```

2. Afficher la liste des prescriptions
3. Montrer les détails (patient, dates, statut)

**Points clés:**
- ✅ Traçabilité complète
- ✅ Respect des protocoles
- ✅ Intégration avec consultations

---

## 📊 PART 3: Démo API (3 min)

**Ouvrir:** http://api.local:8080/swagger

### Endpoints importants

#### 1. Patients
```
GET /api/patients - Lister tous les patients
POST /api/patients - Créer un patient
GET /api/patients/{id} - Détails patient
PUT /api/patients/{id} - Mettre à jour
```

#### 2. Triage
```
GET /api/triage/today - Triages du jour
POST /api/triage - Créer triage
GET /api/triage/{id} - Détails triage
```

#### 3. Consultations
```
GET /api/consultations - Lister
POST /api/consultations - Créer
```

### Tester un endpoint
1. Cliquer sur `GET /api/patients`
2. Cliquer "Try it out"
3. Cliquer "Execute"
4. Montrer la réponse JSON

**Points clés:**
- ✅ API RESTful standard
- ✅ Documentation Swagger automatique
- ✅ Facile à intégrer avec d'autres systèmes
- ✅ Erreurs claires et utiles

---

## 🔑 PART 4: Architecture & Points clés (3 min)

### Stack technologique
```
Frontend:
- Angular 17 (Standalone components)
- TypeScript
- RxJS (Reactive programming)
- Material Design
- PWA (Progressive Web App)

Backend:
- .NET 8
- Entity Framework Core
- JWT Authentication
- Migrations automatiques

Database:
- SQLite (dev)
- SQL Server (Azure)
- Migrations EF Core
```

### Points architecturaux importants

#### 1. Séparation des rôles
- ADMIN: Accès complet
- MEDECIN: Consultations + Prescriptions
- INFIRMIER: Triage + Constantes vitales
- **→ Sécurité par rôle implémentée**

#### 2. Privacy by Design
- Infirmier ne voit que nom + numéro du patient
- Pas d'accès aux détails médicaux
- **→ Conformité RGPD**

#### 3. Offline capable
- Triage peut être saisi offline
- Queue locale de synchronisation
- Auto-sync au reconnection
- **→ Résilience en cas de perte connexion**

#### 4. Scalabilité
- Déployable sur IIS local
- Prêt pour Azure (SQL Server, App Service)
- Code générique (peu dépendances spécifiques)
- **→ Croissance future facile**

---

## 💡 PART 5: Points de vente clés (2 min)

### Pourquoi Brigade Médicale?

1. **Intégration complète**
   - Un seul système pour tous
   - Pas de silos d'information
   - Traçabilité totale

2. **Sécurité**
   - Authentification JWT
   - Rôles et permissions
   - RGPD compliant
   - Données chiffrées

3. **Efficacité**
   - Workflow optimisé
   - Offline capable
   - Mobile friendly
   - Interface intuitive

4. **Scalabilité**
   - Architecture moderne
   - Prêt pour le cloud
   - Performances optimales
   - Migrations DB automatiques

5. **Support**
   - Code open source
   - Documentation complète
   - API RESTful standard
   - Facile à maintenir/évoluer

---

## 🎞️ Scénarios de démo bonus

### Scénario 1: Flux complet patient (5 min)

```
1. Créer un nouveau patient
   - Saisir infos personnelles
   - Ajouter antécédents
   - Ajouter allergies

2. Infirmier effectue triage
   - Saisir constantes vitales
   - Calculer BMI
   - Évaluer urgence

3. Médecin effectue consultation
   - Voir triage du patient
   - Diagnostiquer
   - Prescrire traitement

4. Historique complet visible
   - Timeline des actions
   - Traçabilité complète
```

### Scénario 2: Recherche et filtres (2 min)

```
1. Chercher patient par nom
   - Montrer recherche rapide
   - Filtres avancés disponibles

2. Lister triages du jour
   - Filtrer par urgence
   - Filtrer par statut

3. Historique patient
   - Consultations précédentes
   - Triages antérieurs
   - Prescriptions
```

### Scénario 3: Gestion d'erreur (1 min)

```
1. Tenter login avec mauvais password
   - Montrer message d'erreur clair

2. Créer patient sans données requises
   - Validation côté client
   - Message d'aide

3. Tenter accès sans permissions
   - Message "Accès refusé"
   - Redirection vers page autorisée
```

---

## 📱 Points visuels à souligner

- [ ] **Design:** Interface moderne, teal et bleu
- [ ] **Responsive:** Fonctionne sur desktop et mobile
- [ ] **Accessibilité:** Contraste bon, texte lisible
- [ ] **Performance:** Chargement rapide
- [ ] **UX:** Workflow logique et intuitif
- [ ] **Données:** Complètes et well-organized

---

## 🎥 Tips pour vidéo tutoriel

### Format recommandé
- Durée: 15-30 min
- Résolution: 1080p minimum
- Vitesse: Vitesse normale, puis accéléré pour sections longues
- Audio: Clair, pas de bruits de fond
- Sous-titres: Recommandé

### Sections vidéo
1. **Intro** (30 sec)
   - Titre
   - Qu'est-ce que Brigade Médicale?

2. **Installation & Setup** (2 min)
   - Prévia des prérequis
   - Lancement IIS
   - URLs des apps

3. **User tour** (10 min)
   - Login
   - Dashboard
   - Chaque module principal

4. **Cas d'usage** (5 min)
   - Flux patient complet
   - Points clés

5. **API** (2 min)
   - Swagger overview
   - Quelques appels d'exemple

6. **Conclusion** (1 min)
   - Points clés
   - Prochaines étapes
   - CTA (Call to action)

### Outils recommandés
- OBS Studio (gratuit, puissant)
- Camtasia (professionnel, payant)
- ScreenFlow (Mac, payant)
- Zoom (simple, enregistrement local)

---

## 🎬 Script d'ouverture suggéré

```
"Bienvenue à la présentation de Brigade Médicale,
un système complet de gestion médicale conçu pour
améliorer la collaboration entre infirmiers et médecins.

Aujourd'hui, je vais vous montrer:
1. Comment l'application fonctionne
2. Les workflows principaux
3. La technologie derrière
4. Comment cela améliore l'efficacité

Commençons!"
```

---

## 📋 Checklist de fin de présentation

- [ ] Tous les points clés ont été couverts
- [ ] Des questions de l'audience ont été répondues
- [ ] Les démos fonctionnaient correctement
- [ ] Le timing était approprié
- [ ] Feedback collecté (si applicable)

---

**Bonne présentation! 🎉**
