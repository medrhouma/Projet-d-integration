-- DropForeignKey
ALTER TABLE `enseignant` DROP FOREIGN KEY `enseignant_id_departement_fkey`;

-- AlterTable
ALTER TABLE `enseignant` ADD COLUMN `departement_nom` VARCHAR(100) NULL,
    MODIFY `id_departement` INTEGER NULL;

-- AlterTable
ALTER TABLE `etudiant` ADD COLUMN `departement` VARCHAR(100) NULL,
    ADD COLUMN `groupe_nom` VARCHAR(50) NULL,
    ADD COLUMN `id_niveau` INTEGER NULL,
    ADD COLUMN `niveau_nom` VARCHAR(50) NULL,
    ADD COLUMN `specialite_nom` VARCHAR(100) NULL;

-- CreateIndex
CREATE INDEX `etudiant_id_niveau_idx` ON `etudiant`(`id_niveau`);

-- AddForeignKey
ALTER TABLE `etudiant` ADD CONSTRAINT `etudiant_id_niveau_fkey` FOREIGN KEY (`id_niveau`) REFERENCES `niveau`(`id_niveau`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `enseignant` ADD CONSTRAINT `enseignant_id_departement_fkey` FOREIGN KEY (`id_departement`) REFERENCES `departement`(`id_departement`) ON DELETE SET NULL ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `enseignant` RENAME INDEX `enseignant_id_departement_fkey` TO `enseignant_id_departement_idx`;

-- RenameIndex
ALTER TABLE `etudiant` RENAME INDEX `etudiant_id_groupe_fkey` TO `etudiant_id_groupe_idx`;

-- RenameIndex
ALTER TABLE `etudiant` RENAME INDEX `etudiant_id_specialite_fkey` TO `etudiant_id_specialite_idx`;
