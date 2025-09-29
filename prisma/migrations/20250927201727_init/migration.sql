-- CreateTable
CREATE TABLE `utilisateur` (
    `id_utilisateur` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `prénom` VARCHAR(100) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `identifiant` VARCHAR(50) NOT NULL,
    `mot_de_passe_hash` VARCHAR(255) NOT NULL,
    `rôle` ENUM('Etudiant', 'Enseignant', 'Admin') NOT NULL,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_modification` DATETIME(3) NOT NULL,

    UNIQUE INDEX `utilisateur_email_key`(`email`),
    UNIQUE INDEX `utilisateur_identifiant_key`(`identifiant`),
    PRIMARY KEY (`id_utilisateur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `departement` (
    `id_departement` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `departement_nom_key`(`nom`),
    PRIMARY KEY (`id_departement`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `specialite` (
    `id_specialite` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `id_departement` INTEGER NOT NULL,

    UNIQUE INDEX `specialite_nom_key`(`nom`),
    PRIMARY KEY (`id_specialite`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `niveau` (
    `id_niveau` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(50) NOT NULL,
    `id_specialite` INTEGER NOT NULL,

    PRIMARY KEY (`id_niveau`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `groupe` (
    `id_groupe` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(50) NOT NULL,
    `id_niveau` INTEGER NOT NULL,

    PRIMARY KEY (`id_groupe`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etudiant` (
    `id_etudiant` INTEGER NOT NULL,
    `numero_inscription` CHAR(6) NOT NULL,
    `id_specialite` INTEGER NULL,
    `id_groupe` INTEGER NULL,

    UNIQUE INDEX `etudiant_numero_inscription_key`(`numero_inscription`),
    PRIMARY KEY (`id_etudiant`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enseignant` (
    `id_enseignant` INTEGER NOT NULL,
    `matricule` VARCHAR(50) NOT NULL,
    `id_departement` INTEGER NOT NULL,

    UNIQUE INDEX `enseignant_matricule_key`(`matricule`),
    PRIMARY KEY (`id_enseignant`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `matiere` (
    `id_matiere` INTEGER NOT NULL AUTO_INCREMENT,
    `nom` VARCHAR(100) NOT NULL,
    `id_niveau` INTEGER NOT NULL,
    `id_enseignant` INTEGER NOT NULL,

    PRIMARY KEY (`id_matiere`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `salle` (
    `id_salle` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(20) NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `capacité` INTEGER NOT NULL,

    UNIQUE INDEX `salle_code_key`(`code`),
    PRIMARY KEY (`id_salle`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `emploi_temps` (
    `id_emploi` INTEGER NOT NULL AUTO_INCREMENT,
    `date` DATE NOT NULL,
    `heure_debut` TIME NOT NULL,
    `heure_fin` TIME NOT NULL,
    `id_salle` INTEGER NOT NULL,
    `id_matiere` INTEGER NOT NULL,
    `id_groupe` INTEGER NOT NULL,
    `id_enseignant` INTEGER NOT NULL,

    INDEX `emploi_temps_date_idx`(`date`),
    INDEX `emploi_temps_id_groupe_date_idx`(`id_groupe`, `date`),
    PRIMARY KEY (`id_emploi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `absence` (
    `id_absence` INTEGER NOT NULL AUTO_INCREMENT,
    `id_etudiant` INTEGER NOT NULL,
    `id_emploi` INTEGER NOT NULL,
    `motif` VARCHAR(255) NULL,
    `statut` ENUM('Justifiée', 'Non justifiée') NOT NULL,

    INDEX `absence_id_etudiant_idx`(`id_etudiant`),
    INDEX `absence_id_emploi_idx`(`id_emploi`),
    PRIMARY KEY (`id_absence`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `message` (
    `id_message` INTEGER NOT NULL AUTO_INCREMENT,
    `id_expediteur` INTEGER NOT NULL,
    `id_destinataire` INTEGER NOT NULL,
    `contenu` TEXT NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lu` BOOLEAN NOT NULL DEFAULT false,

    INDEX `message_id_destinataire_idx`(`id_destinataire`),
    INDEX `message_date_idx`(`date`),
    PRIMARY KEY (`id_message`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `specialite` ADD CONSTRAINT `specialite_id_departement_fkey` FOREIGN KEY (`id_departement`) REFERENCES `departement`(`id_departement`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `niveau` ADD CONSTRAINT `niveau_id_specialite_fkey` FOREIGN KEY (`id_specialite`) REFERENCES `specialite`(`id_specialite`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `groupe` ADD CONSTRAINT `groupe_id_niveau_fkey` FOREIGN KEY (`id_niveau`) REFERENCES `niveau`(`id_niveau`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `etudiant` ADD CONSTRAINT `etudiant_id_etudiant_fkey` FOREIGN KEY (`id_etudiant`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `etudiant` ADD CONSTRAINT `etudiant_id_specialite_fkey` FOREIGN KEY (`id_specialite`) REFERENCES `specialite`(`id_specialite`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `etudiant` ADD CONSTRAINT `etudiant_id_groupe_fkey` FOREIGN KEY (`id_groupe`) REFERENCES `groupe`(`id_groupe`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enseignant` ADD CONSTRAINT `enseignant_id_enseignant_fkey` FOREIGN KEY (`id_enseignant`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enseignant` ADD CONSTRAINT `enseignant_id_departement_fkey` FOREIGN KEY (`id_departement`) REFERENCES `departement`(`id_departement`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matiere` ADD CONSTRAINT `matiere_id_niveau_fkey` FOREIGN KEY (`id_niveau`) REFERENCES `niveau`(`id_niveau`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `matiere` ADD CONSTRAINT `matiere_id_enseignant_fkey` FOREIGN KEY (`id_enseignant`) REFERENCES `enseignant`(`id_enseignant`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emploi_temps` ADD CONSTRAINT `emploi_temps_id_salle_fkey` FOREIGN KEY (`id_salle`) REFERENCES `salle`(`id_salle`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emploi_temps` ADD CONSTRAINT `emploi_temps_id_matiere_fkey` FOREIGN KEY (`id_matiere`) REFERENCES `matiere`(`id_matiere`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emploi_temps` ADD CONSTRAINT `emploi_temps_id_groupe_fkey` FOREIGN KEY (`id_groupe`) REFERENCES `groupe`(`id_groupe`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `emploi_temps` ADD CONSTRAINT `emploi_temps_id_enseignant_fkey` FOREIGN KEY (`id_enseignant`) REFERENCES `enseignant`(`id_enseignant`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absence` ADD CONSTRAINT `absence_id_etudiant_fkey` FOREIGN KEY (`id_etudiant`) REFERENCES `etudiant`(`id_etudiant`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `absence` ADD CONSTRAINT `absence_id_emploi_fkey` FOREIGN KEY (`id_emploi`) REFERENCES `emploi_temps`(`id_emploi`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_id_expediteur_fkey` FOREIGN KEY (`id_expediteur`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `message` ADD CONSTRAINT `message_id_destinataire_fkey` FOREIGN KEY (`id_destinataire`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;
