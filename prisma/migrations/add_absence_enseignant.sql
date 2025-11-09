-- Migration pour ajouter la table absence_enseignant

CREATE TABLE IF NOT EXISTS absence_enseignant (
  id_absence INT AUTO_INCREMENT PRIMARY KEY,
  id_enseignant INT NOT NULL,
  id_emploi INT NOT NULL,
  motif VARCHAR(255),
  statut ENUM('Justifiée', 'Non justifiée') NOT NULL DEFAULT 'Non justifiée',
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (id_enseignant) REFERENCES enseignant(id_enseignant) ON DELETE CASCADE,
  FOREIGN KEY (id_emploi) REFERENCES emploi_temps(id_emploi) ON DELETE CASCADE,
  
  INDEX idx_enseignant (id_enseignant),
  INDEX idx_emploi (id_emploi)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
