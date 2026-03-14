# 🎓 Self Onboarding Workflow - Brigade Médicale

**Durée estimée:** 30-45 minutes
**Niveau:** Débutant
**Objectif:** Maîtriser l'utilisation de Brigade Médicale

---

## 📋 Table des matières

1. [Préparation](#préparation)
2. [Module 1: Authentification](#module-1-authentification)
3. [Module 2: Navigation](#module-2-navigation)
4. [Module 3: Gestion Patients](#module-3-gestion-patients)
5. [Module 4: Triage (INFIRMIER)](#module-4-triage-infirmier)
6. [Module 5: Consultations (MEDECIN)](#module-5-consultations-medecin)
7. [Module 6: Prescriptions](#module-6-prescriptions)
8. [Module 7: Troubleshooting](#module-7-troubleshooting)
9. [Certification](#certification)

---

# ⏳ PRÉPARATION (2 min)

## Avant de commencer

### Checklist
- [ ] Vous avez une adresse email valide
- [ ] Vous connaissez votre identifiant (username)
- [ ] Vous avez reçu votre mot de passe temporaire
- [ ] Vous disposez de 30-45 minutes
- [ ] Vous êtes dans un environnement tranquille
- [ ] Votre navigateur est à jour (Chrome, Firefox, Safari, Edge)

### Accès à l'application

**URL:** `http://app.local:8081`

*Note: Pour la production, remplacez `app.local:8081` par votre domaine.*

### Contacts support
- **Email:** support@brigademed.local
- **Téléphone:** +33 1 XX XX XX XX
- **Chat:** Disponible dans l'app (coin inférieur droit)

---

# MODULE 1: AUTHENTIFICATION (3 min)

## Objectifs
- [ ] Comprendre le processus de login
- [ ] Se connecter avec succès
- [ ] Changer votre mot de passe temporaire

---

## Étape 1.1: Accéder à la page de login

1. Ouvrez votre navigateur
2. Allez à: `http://app.local:8081`
3. **Vous devez voir:**
   - Logo "Brigade Médicale"
   - Champ "IDENTIFIANT"
   - Champ "MOT DE PASSE"
   - Bouton "SE CONNECTER"

**✓ Checkpoint:** Vous voyez la page de login?

---

## Étape 1.2: Vous connecter

1. **Entrez votre identifiant:**
   - Exemple: `marie.dupont` (fourni par l'admin)

2. **Entrez votre mot de passe:**
   - Votre mot de passe temporaire

3. **Cliquez "SE CONNECTER"**

**Attendre 2-3 secondes...**

**✓ Checkpoint:** Vous êtes connecté? Vous voyez le Dashboard?

---

## Étape 1.3: Changer votre mot de passe (IMPORTANT)

1. **Cliquez sur votre profil** (coin supérieur droit)
   - Vous voyez votre nom/avatar

2. **Sélectionnez "Paramètres"**

3. **Allez à "Sécurité" → "Changer mot de passe"**

4. **Remplissez:**
   ```
   Mot de passe actuel: [votre mot passe temporaire]
   Nouveau mot de passe: [minimum 8 caractères]
   Confirmer mot de passe: [répétez]
   ```

5. **Cliquez "Enregistrer"**

**✓ Checkpoint:** Votre nouveau mot de passe est accepté?

---

## ⚠️ Règles de sécurité

- ✅ Minimum 8 caractères
- ✅ 1 majuscule (A-Z)
- ✅ 1 chiffre (0-9)
- ✅ 1 caractère spécial (!@#$%)
- ❌ Ne pas partager votre mot de passe
- ❌ Ne pas l'écrire sur un post-it
- ✅ Utilisez un gestionnaire de mots de passe

**Exemple bon:** `Brigade2024!Secure`
**Exemple mauvais:** `123456`

---

# MODULE 2: NAVIGATION (3 min)

## Objectifs
- [ ] Comprendre l'interface
- [ ] Naviguer entre les modules
- [ ] Utiliser le menu principal

---

## Étape 2.1: Explorer le Dashboard

Vous êtes maintenant sur le **Dashboard** principal.

### Elements visibles:

**À GAUCHE - Menu latéral (Sidebar):**
```
🏠 Dashboard
👥 Patients
📋 Consultations
🩺 Triage Patient (si INFIRMIER)
💊 Prescriptions
⚙️ Paramètres
🚪 Déconnexion
```

**EN HAUT - Barre de navigation:**
```
[Logo]  [Titre page]  [Notifications]  [Profil]
```

**CENTRE - Contenu principal:**
```
[Widgets et données selon votre rôle]
```

**✓ Checkpoint:** Pouvez-vous voir tous ces éléments?

---

## Étape 2.2: Comprendre votre rôle

Votre rôle détermine ce que vous pouvez voir/faire.

### Si vous êtes INFIRMIER:
- ✅ Voir patients
- ✅ Créer triages
- ✅ Saisir constantes vitales
- ❌ Accès limité aux détails médicaux (sécurité)

### Si vous êtes MEDECIN:
- ✅ Voir patients (détails complets)
- ✅ Créer consultations
- ✅ Voir triages du patient
- ✅ Prescrire traitements
- ✅ Analyser diagnostics

### Si vous êtes ADMIN:
- ✅ Accès à TOUT
- ✅ Gérer utilisateurs
- ✅ Configurer système
- ✅ Rapports et statistiques

**✓ Checkpoint:** Connaissez-vous votre rôle?

---

## Étape 2.3: Naviguer entre les pages

1. **Cliquez sur "Patients"** dans le menu
   - Vous devez voir la liste des patients

2. **Cliquez sur "Dashboard"** pour revenir
   - Vous êtes de retour

3. **Cliquez sur "Consultations"**
   - Vous voyez les consultations existantes

**✓ Checkpoint:** Vous pouvez naviguer librement?

---

# MODULE 3: GESTION PATIENTS (5 min)

## Objectifs
- [ ] Lister les patients
- [ ] Créer un nouveau patient
- [ ] Éditer un patient existant
- [ ] Voir le profil complet d'un patient

---

## Étape 3.1: Voir la liste des patients

1. **Allez à:** Menu → Patients

2. **Vous voyez une liste avec:**
   ```
   | N° Patient | Nom | Age | Sexe | Tél | Actions |
   ```

3. **Explorez les colonnes:**
   - Cliquez sur l'en-tête pour trier
   - Utilisez la barre de recherche pour filtrer

**✓ Checkpoint:** Vous avez trouvé au moins 3 patients?

---

## Étape 3.2: Voir le profil d'un patient

1. **Cliquez sur un patient** de la liste

2. **Vous voyez maintenant:**
   ```
   INFORMATIONS PERSONNELLES:
   - Nom complet
   - Date de naissance
   - Sexe
   - Contact (email, téléphone)

   INFORMATIONS MÉDICALES:
   - Groupe sanguin
   - Allergies
   - Maladies chroniques
   - Antécédents

   HISTORIQUE:
   - Triages précédents
   - Consultations
   - Prescriptions
   ```

3. **Notez les données importantes:**
   - Allergies (⚠️ IMPORTANT!)
   - Maladies chroniques
   - Contact d'urgence

**✓ Checkpoint:** Vous comprenez le profil patient?

---

## Étape 3.3: Créer un nouveau patient

1. **Allez à:** Menu → Patients

2. **Cliquez sur:** "Ajouter patient" ou "+" (coin supérieur droit)

3. **Remplissez les informations REQUISES:**
   ```
   Prénom: *
   Nom: *
   Date de naissance: *
   Sexe: *
   Email: *
   Téléphone: *
   Adresse: *
   ```

4. **Ajoutez les informations MÉDICALES:**
   ```
   Groupe sanguin:
   Allergies (séparées par virgule):
   Maladies chroniques:
   Antécédents:
   Médicaments actuels:
   ```

5. **Cliquez "Créer patient"**

**✓ Checkpoint:** Vous avez créé un patient avec succès?

---

## Étape 3.4: Éditer un patient

1. **Allez au profil du patient**

2. **Cliquez "Éditer"** (coin supérieur droit)

3. **Modifiez les champs:**
   - Exemple: Ajouter une allergie

4. **Cliquez "Enregistrer"**

**✓ Checkpoint:** Vos modifications sont sauvegardées?

---

# MODULE 4: TRIAGE (INFIRMIER) (8 min)

## Objectifs
- [ ] Comprendre ce qu'est un triage
- [ ] Créer un nouveau triage
- [ ] Saisir les constantes vitales
- [ ] Évaluer le niveau d'urgence

---

## Étape 4.1: Comprendre le triage

**Qu'est-ce qu'un triage?**

C'est l'enregistrement des constantes vitales d'un patient:
- Fréquence cardiaque (FC)
- Tension artérielle (TA)
- Température
- Fréquence respiratoire
- Poids et taille (→ BMI auto-calculé)

**Objectifs:**
- Évaluer l'état de santé initial
- Prioriser les patients par urgence
- Servir de base pour le médecin

**⏰ Timing:** Fait au début de chaque visite/consultation

---

## Étape 4.2: Créer un nouveau triage

1. **Allez à:** Menu → Triage Patient

2. **Cliquez "Nouveau Triage"** ou "+"

3. **Sélectionnez le patient:**
   - Cliquez sur le dropdown
   - Cherchez le patient par nom
   - Cliquez pour sélectionner

**⚠️ SÉCURITÉ:** Notez qu'il n'y a que le nom + numéro
*(Les détails médicaux ne sont pas affichés pour la confidentialité)*

**Carte de confirmation:**
```
Nom complet
Numéro patient
Âge
Sexe
Téléphone
[Bouton CHANGER]
```

**✓ Checkpoint:** Patient sélectionné et confirmé?

---

## Étape 4.3: Saisir les constantes vitales

**Champ 1: Fréquence Cardiaque (FC)**
```
Label: "FC (bpm)"
Plage normale: 60-100 bpm
Exemple: 72
Unité: bpm (battements par minute)
```

**Champ 2: Tension Artérielle (TA)**
```
Label: "Systolique / Diastolique"
Plage normale: 120/80 mmHg
Exemple: 120 / 80
Format: [Systolique] / [Diastolique]
```

**Champ 3: Température**
```
Label: "Température (°C)"
Plage normale: 36.5-37.5°C
Exemple: 37.2
Unité: °C
```

**Champ 4: Fréquence Respiratoire**
```
Label: "FR (respirations/min)"
Plage normale: 12-20 par minute
Exemple: 16
Unité: respirations/min
```

**Champ 5: Poids**
```
Label: "Poids (kg)"
Exemple: 70
Unité: kg
```

**Champ 6: Taille**
```
Label: "Taille (m)"
Exemple: 1.75
Unité: mètres
Note: BMI sera calculé automatiquement!
```

**Remplissez tous les champs avec des données de test:**

```
FC: 72 bpm
TA: 120/80 mmHg
Température: 37.2°C
FR: 16 respirations/min
Poids: 70 kg
Taille: 1.75 m
→ BMI auto-calculé: 22.9 (Normal!)
```

**✓ Checkpoint:** Tous les champs remplis?

---

## Étape 4.4: Évaluer le niveau d'urgence

**Champ: Niveau d'urgence**

Sélectionnez l'un des 3 niveaux:

### 🟢 VERDE (Vert - Urgent non)
- Pas de danger immédiat
- Patient stable
- Peut attendre

**Exemples:**
- Contrôle de routine
- Consultation générale
- Douleur mineure

### 🟡 GIALLO (Jaune - Urgent)
- Patient préoccupant
- Nécessite l'attention du médecin
- À voir rapidement

**Exemples:**
- Fièvre modérée (38-39°C)
- Douleur moyenne
- Tension élevée (>140/90)

### 🔴 ROSSO (Rouge - Urgent très)
- ⚠️ URGENCE MÉDICALE
- Danger immédiat
- Voir le médecin IMMÉDIATEMENT

**Exemples:**
- Température très élevée (>40°C)
- Douleur intense
- Tension critique
- Difficultés respiratoires

**Sélectionnez:** VERDE (pour votre test)

**✓ Checkpoint:** Urgence sélectionnée?

---

## Étape 4.5: Soumettre le triage

1. **Vérifiez les données:**
   - Patient correct ✓
   - Toutes les constantes remplies ✓
   - Urgence sélectionnée ✓

2. **Cliquez "Enregistrer triage"**

3. **Vous voyez un message de succès:**
   ```
   ✓ Triage enregistré avec succès!
   ```

4. **Vous êtes redirigé vers le triage enregistré**

**✓ Checkpoint:** Triage créé et visible dans la liste?

---

# MODULE 5: CONSULTATIONS (MEDECIN) (7 min)

## Objectifs
- [ ] Créer une consultation
- [ ] Voir les triages du patient
- [ ] Saisir le diagnostic
- [ ] Prescrire un traitement

---

## Étape 5.1: Créer une consultation

1. **Allez à:** Menu → Consultations

2. **Cliquez "Nouvelle consultation"**

3. **Sélectionnez le patient:**
   - Même interface que triage
   - Cherchez et sélectionnez le patient

---

## Étape 5.2: Voir les constantes du triage

**Une fois le patient sélectionné, vous voyez:**

```
TRIAGE RÉCENT (Lecture seule):
┌─────────────────────────────────┐
│ Constantes vitales du patient   │
│ FC: 72 bpm                      │
│ TA: 120/80 mmHg                 │
│ Température: 37.2°C             │
│ FR: 16 respirations/min         │
│ BMI: 22.9 (Normal)              │
│ Urgence: Verde                  │
│ Heure du triage: 14h30          │
└─────────────────────────────────┘
```

**⚠️ NOTE:** Ces données sont en **LECTURE SEULE** (vous ne pouvez pas les modifier)

**✓ Checkpoint:** Vous voyez les constantes du triage?

---

## Étape 5.3: Saisir le diagnostic

**Champ 1: Motif de consultation**
```
Label: "Motif"
Exemple: "Patient présente une fièvre depuis 2 jours"
```

**Champ 2: Diagnostic**
```
Label: "Diagnostic"
Exemple: "Rhume/Grippe saisonnière"
```

**Champ 3: Notes médicales**
```
Label: "Notes supplémentaires"
Exemple: "Repos recommandé. À réévaluer si persistance."
```

**Remplissez les champs:**

```
Motif: "Fièvre et malaise général"
Diagnostic: "Infection virale bénigne"
Notes: "Repos 48h. À revoir si aggravation.
        Boire beaucoup d'eau."
```

**✓ Checkpoint:** Diagnostic et notes remplis?

---

## Étape 5.4: Soumettre la consultation

1. **Cliquez "Enregistrer consultation"**

2. **Message de succès:**
   ```
   ✓ Consultation enregistrée
   ```

3. **Vous pouvez maintenant ajouter une prescription**

**✓ Checkpoint:** Consultation créée?

---

# MODULE 6: PRESCRIPTIONS (5 min)

## Objectifs
- [ ] Ajouter une prescription
- [ ] Saisir les détails du médicament
- [ ] Spécifier les instructions

---

## Étape 6.1: Ajouter une prescription

1. **Depuis la consultation créée**

2. **Cliquez "Ajouter prescription"**

3. **Remplissez les champs:**

```
Médicament: Paracétamol 500mg
Dosage: 500 mg
Fréquence: 3 fois par jour (matin/midi/soir)
Durée: 7 jours
Instructions: "Après les repas avec un verre d'eau"
Notes: "Peut être associé à d'autres traitements"
```

---

## Étape 6.2: Points importants

**Dosage:**
- Doit être spécifié en mg/ml/unités
- Respecter les contre-indications

**Fréquence:**
- "Une fois par jour"
- "Deux fois par jour"
- "Trois fois par jour"
- "Chaque 4 heures" (max 6 fois/jour)
- "Au besoin" (ne dépasser X fois/jour)

**Durée:**
- En jours (exemple: "7 jours")
- En semaines
- Continu (si chronique)

**Instructions:**
- "Avec un repas"
- "À jeun"
- "Avant le coucher"
- Important pour efficacité!

---

## Étape 6.3: Soumettre la prescription

1. **Vérifiez les données**

2. **Cliquez "Enregistrer prescription"**

3. **Message de confirmation:**
   ```
   ✓ Prescription ajoutée
   ```

**✓ Checkpoint:** Prescription visible dans la liste?

---

# MODULE 7: TROUBLESHOOTING (5 min)

## Problèmes courants et solutions

---

### ❌ "Login incorrect"

**Causes possibles:**
- [ ] Identifiant mal orthographié
- [ ] Maj/min mal placées
- [ ] Compte désactivé
- [ ] Internet déconnecté

**Solutions:**
1. Vérifiez votre email d'invitation
2. Respectez la casse (majuscules/minuscules)
3. Contactez l'admin si compte désactivé
4. Rechargez la page (F5)

---

### ❌ "Patient non trouvé"

**Causes possibles:**
- [ ] Mauvaise orthographe du nom
- [ ] Patient supprimé
- [ ] Délai de synchronisation

**Solutions:**
1. Essayez par numéro du patient
2. Vérifiez l'orthographe exacte
3. Recharger la page (F5)
4. Créer le patient s'il n'existe pas

---

### ❌ "Erreur lors de l'enregistrement"

**Causes possibles:**
- [ ] Connexion internet perdue
- [ ] Champs requis non remplis
- [ ] Données invalides

**Solutions:**
1. Vérifiez les champs avec * (requis)
2. Vérifiez votre connexion internet
3. Essayez à nouveau
4. Contactez le support si problème persiste

---

### ❌ "Page blanche / Application figée"

**Solutions:**
1. Attendez 10 secondes
2. Recharger la page: **Ctrl+R** (ou Cmd+R sur Mac)
3. Vider le cache: **Ctrl+Maj+Suppr**
4. Essayer un autre navigateur
5. Redémarrer votre ordinateur

---

### ❌ "Je n'ai pas accès à une fonction"

**Cause:** Permissions insuffisantes basées sur votre rôle

**Solutions:**
1. Vérifiez votre rôle (Profil → Mes informations)
2. Contactez l'admin pour les permissions
3. Attendez la synchronisation (peut prendre 5 min)

---

### ❌ "Données ne s'affichent pas"

**Causes possibles:**
- [ ] Cache navigateur
- [ ] Base de données en synchronisation
- [ ] Permissions de lecture

**Solutions:**
1. Vider le cache: **Ctrl+Maj+Suppr**
2. Recharger la page: **F5**
3. Attendre quelques secondes
4. Contactez le support

---

## 📞 Contacter le Support

**Avant de contacter, préparez:**
- [ ] Description du problème
- [ ] Capture d'écran (si possible)
- [ ] Votre navigateur/OS
- [ ] Numéro de patient (si applicable)
- [ ] Message d'erreur exact (copier-coller)

**Channels:**
- **Email:** support@brigademed.local
- **Chat:** Dans l'app (coin inférieur droit)
- **Téléphone:** +33 1 XX XX XX XX

---

# 🎯 CERTIFICATION (2 min)

## Vous avez terminé tous les modules!

### ✓ Checklist finale

Vérifiez que vous avez complété:

**Module 1 - Authentification:**
- [ ] Vous êtes connecté
- [ ] Vous avez changé votre mot de passe

**Module 2 - Navigation:**
- [ ] Vous connaissez votre rôle
- [ ] Vous savez naviguer entre pages

**Module 3 - Gestion Patients:**
- [ ] Vous avez vu une liste de patients
- [ ] Vous avez créé un nouveau patient
- [ ] Vous avez consulté un profil

**Module 4 - Triage:**
- [ ] Vous avez créé un triage
- [ ] Vous avez rempli les constantes vitales
- [ ] Vous avez évalué l'urgence

**Module 5 - Consultations:**
- [ ] Vous avez créé une consultation
- [ ] Vous avez saisi un diagnostic

**Module 6 - Prescriptions:**
- [ ] Vous avez ajouté une prescription
- [ ] Vous avez spécifié les instructions

**Module 7 - Troubleshooting:**
- [ ] Vous connaissez comment résoudre les problèmes
- [ ] Vous connaissez les contacts support

---

## 🎓 Certificat de Complétion

Félicitations! Vous avez complété le **Self Onboarding de Brigade Médicale**.

```
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║     CERTIFICAT D'ONBOARDING - BRIGADE MÉDICALE       ║
║                                                       ║
║  Nom: _________________________________             ║
║  Rôle: ________________________________              ║
║  Date: ________________________________              ║
║                                                       ║
║  ✓ Tous les modules complétés                        ║
║  ✓ Prêt à utiliser Brigade Médicale                 ║
║                                                       ║
║  Signature: _____________________________            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
```

**Vous pouvez maintenant:**
- ✅ Utiliser Brigade Médicale en autonomie
- ✅ Créer patients, triages, consultations
- ✅ Résoudre les problèmes courants
- ✅ Contacter le support si besoin

---

## 📚 Ressources supplémentaires

- **Présentation vidéo:** http://app.local:8081/video-tutorial
- **Documentation complète:** http://app.local:8081/docs
- **FAQ:** http://app.local:8081/faq
- **Glossaire médical:** http://app.local:8081/glossary
- **Shortcuts clavier:** Menu → Aide → Raccourcis

---

## 🎉 Bienvenue dans l'équipe Brigade Médicale!

Si vous avez des questions, n'hésitez pas à:
- Consulter ce guide
- Demander au mentor/formateur
- Contacter le support

**Bon travail! 💪**

---

**Dernière mise à jour:** 2026-03-05
**Version:** 1.0
**Questions?** support@brigademed.local
