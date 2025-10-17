-- AlterTable
ALTER TABLE `enseignant` ADD COLUMN `est_chef_departement` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `utilisateur` MODIFY `rôle` ENUM('Etudiant', 'Enseignant', 'ChefDepartement', 'Admin') NOT NULL;
