# 📝 Système de Gestion des Absences - Documentation Complète

## ✅ Fonctionnalités Implémentées (MISES À JOUR)

**Dernière mise à jour : 9 novembre 2025**  
**Statut : ✅ Système 100% fonctionnel**

---

### 1. 👨‍🏫 Pour les Enseignants

#### Prendre les absences des étudiants
- **Page**: `/dashboard-enseignant/absences/prendre?id_emploi=X`
- **Fonctionnalités**:
  - Voir la liste complète des étudiants du groupe
  - Marquer un étudiant absent/présent en un clic
  - Voir le taux de présence en temps réel
  - Statistiques instantanées (présents, absents, taux)

#### API Utilisée
```typescript
// GET - Liste des étudiants avec statut d'absence
GET /api/absences/etudiants?id_emploi=123

// POST - Marquer un étudiant absent
POST /api/absences/etudiants
{
  "id_emploi": 123,
  "id_etudiant": 45,
  "statut": "NonJustifiee",
  "motif": "optionnel"
}

// DELETE - Annuler une absence
DELETE /api/absences/etudiants?id_absence=789
```

---

### 2. 👨‍🎓 Pour les Étudiants

#### Consulter ses absences
- **Page**: `/dashboard-etudiant/absences`
- **Fonctionnalités**:
  - Voir toutes ses absences
  - Détails: date, heure, matière, salle, enseignant
  - Statut: justifiée ou non justifiée
  - Statistiques: total, justifiées, non justifiées
  - Alerte si absences non justifiées

#### API Utilisée
```typescript
// GET - Mes absences
GET /api/absences/etudiants
```

---

### 3. 👔 Pour le Chef de Département

#### Gérer les absences des enseignants
- **API Créée**: `/api/absences/enseignants`
- **Fonctionnalités**:
  - Marquer un enseignant absent
  - Justifier une absence
  - Voir les statistiques par enseignant
  - Supprimer une absence erronée

#### API Utilisée
```typescript
// GET - Absences des enseignants du département
GET /api/absences/enseignants?id_enseignant=X

// POST - Marquer un enseignant absent
POST /api/absences/enseignants
{
  "id_enseignant": 12,
  "id_emploi": 456,
  "statut": "NonJustifiee",
  "motif": "optionnel"
}

// PUT - Justifier une absence
PUT /api/absences/enseignants
{
  "id_absence": 789,
  "statut": "Justifiee",
  "motif": "Raison médicale"
}

// DELETE - Supprimer une absence
DELETE /api/absences/enseignants?id_absence=789
```

---

## 📊 Structure de la Base de Données

### Table: `absence` (Absences Étudiants)
```sql
CREATE TABLE absence (
  id_absence INT AUTO_INCREMENT PRIMARY KEY,
  id_etudiant INT NOT NULL,
  id_emploi INT NOT NULL,
  motif VARCHAR(255),
  statut ENUM('Justifiée', 'Non justifiée') NOT NULL,
  
  FOREIGN KEY (id_etudiant) REFERENCES etudiant(id_etudiant) ON DELETE CASCADE,
  FOREIGN KEY (id_emploi) REFERENCES emploi_temps(id_emploi) ON DELETE CASCADE
);
```

### Table: `absence_enseignant` (Absences Enseignants)
```sql
CREATE TABLE absence_enseignant (
  id_absence INT AUTO_INCREMENT PRIMARY KEY,
  id_enseignant INT NOT NULL,
  id_emploi INT NOT NULL,
  motif VARCHAR(255),
  statut ENUM('Justifiée', 'Non justifiée') NOT NULL DEFAULT 'Non justifiée',
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_enseignant) REFERENCES enseignant(id_enseignant) ON DELETE CASCADE,
  FOREIGN KEY (id_emploi) REFERENCES emploi_temps(id_emploi) ON DELETE CASCADE
);
```

---

## 🎨 Interface Utilisateur

### Page Enseignant - Prendre les Absences

```
┌────────────────────────────────────────────────────────┐
│  👥 Feuille de Présence                                │
│  Enregistrement des absences                           │
├────────────────────────────────────────────────────────┤
│  📅 Lundi 10 novembre    ⏰ 08:30-10:00    ✅ 85%      │
├────────────────────────────────────────────────────────┤
│                                                         │
│  1.  Ahmed Ben Ali                  [✅ Présent] 28006 │
│      ➜ Marquer Absent                                  │
│                                                         │
│  2.  Fatma Trabelsi                [❌ Absent]  28007  │
│      ➜ Marquer Présent                                 │
│                                                         │
│  3.  Mohamed Karim                 [✅ Présent] 28008  │
│      ➜ Marquer Absent                                  │
│                                                         │
├────────────────────────────────────────────────────────┤
│  Présents: 18  |  Absents: 3  |  Taux: 85.7%          │
└────────────────────────────────────────────────────────┘
```

### Page Étudiant - Mes Absences

```
┌────────────────────────────────────────────────────────┐
│  ⚠️ Mes Absences                                        │
│  Historique complet de vos absences                    │
├────────────────────────────────────────────────────────┤
│  Total: 3  |  Justifiées: 1  |  Non Justifiées: 2     │
├────────────────────────────────────────────────────────┤
│                                                         │
│  📅 Lundi 10 novembre 2025  ⏰ 08:30-10:00            │
│  📚 Mathématiques  🏢 A101  👨‍🏫 Prof. Ben Ali          │
│  [❌ Non Justifiée]                                    │
│                                                         │
│  📅 Mercredi 12 novembre 2025  ⏰ 10:00-11:30         │
│  📚 Physique  🏢 B203  👨‍🏫 Prof. Trabelsi              │
│  [✅ Justifiée] Motif: Certificat médical              │
│                                                         │
├────────────────────────────────────────────────────────┤
│  ⚠️ Attention !                                         │
│  Vous avez 2 absences non justifiées.                  │
│  Veuillez fournir un justificatif à votre chef.       │
└────────────────────────────────────────────────────────┘
```

---

## 🔐 Sécurité

### Authentification
- Toutes les routes requièrent un token JWT
- Vérification du rôle de l'utilisateur
- Les enseignants peuvent seulement marquer les absences de LEURS séances
- Les chefs ne voient que les enseignants de LEUR département

### Validation
- Vérification que la séance appartient à l'enseignant
- Vérification que l'étudiant est dans le groupe
- Empêche les doublons d'absences
- Vérification des permissions pour chaque action

---

## 📝 Exemples d'Utilisation

### 1. Enseignant marque une absence

```typescript
// Dans l'emploi du temps de l'enseignant
<button onClick={() => {
  window.location.href = `/dashboard-enseignant/absences/prendre?id_emploi=${seance.id_emploi}`;
}}>
  📝 Prendre les absences
</button>
```

### 2. Étudiant consulte ses absences

```typescript
// Dans le dashboard étudiant
<Link href="/dashboard-etudiant/absences">
  ⚠️ Mes Absences ({nbAbsences})
</Link>
```

### 3. Chef marque un enseignant absent

```typescript
// API Call
await fetch('/api/absences/enseignants', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id_enseignant: 12,
    id_emploi: 456,
    statut: 'NonJustifiee'
  })
});
```

---

## 🚀 Prochaines Étapes (Optionnel)

1. **Notifications**
   - Email automatique aux étudiants absents
   - Alerte aux parents si trop d'absences
   - Notification au chef si enseignant absent

2. **Rapports**
   - Export PDF des absences
   - Statistiques mensuelles
   - Graphiques de présence

3. **Justificatifs**
   - Upload de documents
   - Validation par le chef
   - Archivage

4. **Seuils d'alerte**
   - Alerte si > 3 absences non justifiées
   - Blocage des examens si trop d'absences
   - Convocation automatique

---

## ✅ Résumé

**✅ Système Complet et Fonctionnel !**

- Enseignants peuvent prendre les absences facilement
- Étudiants voient leurs absences en temps réel
- Chefs peuvent gérer les absences des enseignants
- Interface moderne et intuitive
- Sécurité renforcée
- Statistiques en temps réel

**Le système est prêt à être utilisé !** 🎉
