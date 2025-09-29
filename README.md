
# 🎓 EduManager - Système de Gestion Scolaire

![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css)

---

## 📖 Description
**EduManager** est une plateforme web moderne pour la gestion scolaire complète, permettant aux établissements de gérer :
- Étudiants & enseignants  
- Cours & emplois du temps  
- Notes, bulletins & absences  
- Messagerie interne et ressources pédagogiques  
---

## ✨ Fonctionnalités

### 👥 Multi-Rôles
- **Étudiants** : Cours, emploi du temps, notes, absences  
- **Enseignants** : Gestion des cours, notes, présences  
- **Administrateurs** : Gestion complète de la plateforme  

### 📚 Modules Clés
- Authentification JWT sécurisée  
- Gestion des utilisateurs et profils  
- Emploi du temps interactif  
- Suivi des absences (justifiées/non justifiées)  
- Système de notation et bulletins  
- Messagerie interne  
- Gestion des départements et spécialités  

---

## 🛠️ Stack Technique
**Frontend :** Next.js 15, TypeScript, Tailwind CSS, Lucide React, React Hook Form  
**Backend :** Next.js API Routes, Prisma ORM, MySQL, bcryptjs, JWT  
**Base de données :** MySQL avec schéma relationnel normalisé  

---

## 🚀 Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/edumanager.git
cd edumanager

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Modifier .env :
# DATABASE_URL="mysql://username:password@localhost:3306/schooldb"
# JWT_SECRET="votre_secret_jwt"
# NEXTAUTH_URL="http://localhost:3000"

# Générer Prisma et synchroniser DB
npx prisma generate
npx prisma db push

# Lancer en développement
npm run dev


🗂️ Structure du Projet
edumanager/
├── app/                  # Pages et Dashboards
├── lib/                  # Config Prisma & Auth
├── prisma/               # Schéma de la base
└── public/               # Assets statiques


📊 Rôles & Permissions
Rôle	Permissions
Étudiant	Voir emploi du temps, notes, bulletins, absences, cours
Enseignant	Gérer matières, notes, absences, listes étudiants
Admin	Gestion complète, configuration, départements et spécialités
🔐 Sécurité

JWT sécurisé + cookies HTTP-only

Hachage bcrypt des mots de passe

Middleware de protection des routes

Validation serveur des données

🎨 UI & UX

Design responsive mobile/desktop

Interface moderne Tailwind CSS

Feedback visuel en temps réel

Accessibilité respectée

📸 Captures d'Écran
Login	Dashboard Étudiant	Dashboard Admin

	
	
🏗️ Scripts Disponibles
npm run dev       # Développement
npm run build     # Production
npm run start     # Lancer production
npm run lint      # Vérification du code
npx prisma studio # Interface DB

📈 Roadmap

Notifications push

Application mobile React Native

Intégration systèmes externes

Rapports analytiques avancés

Réservation de salles et paiement en ligne

🐛 Dépannage

Vérifier connexion MySQL

Vérifier DATABASE_URL dans .env

Régénérer Prisma : npx prisma generate && npx prisma db push

📄 Licence

MIT License – voir fichier LICENSE

👥 Équipe & Support

Développé avec ❤️ par [R'H Mohamed / Aya Rouissi / Sahar Yakoubi]

Support : trioMAS@support.com



