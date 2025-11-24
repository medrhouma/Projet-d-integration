-- Drop Foreign Key
ALTER TABLE `enseignant` DROP FOREIGN KEY `enseignant_id_departement_fkey`;

-- AlterTable enseignant
ALTER TABLE `enseignant`
    ADD COLUMN `departement_nom` VARCHAR(100) NULL,
    MODIFY `id_departement` INTEGER NULL;

-- AlterTable etudiant
ALTER TABLE `etudiant`
    ADD COLUMN `departement` VARCHAR(100) NULL,
    ADD COLUMN `groupe_nom` VARCHAR(50) NULL,
    ADD COLUMN `id_niveau` INTEGER NULL,
    ADD COLUMN `niveau_nom` VARCHAR(50) NULL,
    ADD COLUMN `specialite_nom` VARCHAR(100) NULL;

-- CreateIndex
CREATE INDEX `etudiant_id_niveau_idx` ON `etudiant`(`id_niveau`);

-- AddForeignKey etudiant -> niveau
ALTER TABLE `etudiant`
    ADD CONSTRAINT `etudiant_id_niveau_fkey`
    FOREIGN KEY (`id_niveau`) REFERENCES `niveau`(`id_niveau`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;


-- Fix index enseignant
ALTER TABLE `enseignant`
    DROP INDEX `enseignant_id_departement_fkey`;

ALTER TABLE `enseignant`
    ADD INDEX `enseignant_id_departement_idx`(`id_departement`);

-- Re-create foreign key for enseignant -> departement after fixing index
ALTER TABLE `enseignant`
    ADD CONSTRAINT `enseignant_id_departement_fkey`
    FOREIGN KEY (`id_departement`) REFERENCES `departement`(`id_departement`)
    ON DELETE SET NULL
    ON UPDATE CASCADE;

-- Fix index etudiant groupe
ALTER TABLE `etudiant`
    ADD INDEX `etudiant_id_groupe_idx`(`id_groupe`);

-- Fix index etudiant specialite
ALTER TABLE `etudiant`
    ADD INDEX `etudiant_id_specialite_idx`(`id_specialite`);
