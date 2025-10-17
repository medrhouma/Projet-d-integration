// Script pour créer un chef de département de test
// Exécutez: node create-chef-test.js

const bcrypt = require('bcryptjs');

async function createTestChef() {
  // Connexion à MySQL
  const mysql = require('mysql2/promise');
  
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'hama',
    database: 'schooldb'
  });

  try {
    console.log('✅ Connecté à MySQL\n');

    // 1. Vérifier si un département existe
    const [depts] = await connection.execute('SELECT * FROM departement LIMIT 1');
    
    if (depts.length === 0) {
      console.log('❌ Aucun département trouvé. Créez-en un d\'abord!');
      process.exit(1);
    }

    const dept = depts[0];
    console.log(`📋 Département trouvé: ${dept.nom} (ID: ${dept.id_departement})\n`);

    // 2. Hash du mot de passe
    const password = 'chef123456';
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('🔒 Mot de passe hashé\n');

    // 3. Vérifier si l'utilisateur existe déjà
    const [existingUsers] = await connection.execute(
      'SELECT * FROM utilisateur WHERE identifiant = ?',
      ['chef_test']
    );

    let userId;

    if (existingUsers.length > 0) {
      console.log('⚠️  Utilisateur chef_test existe déjà\n');
      userId = existingUsers[0].id_utilisateur;
      
      // Mettre à jour le rôle
      await connection.execute(
        'UPDATE utilisateur SET `rôle` = ? WHERE id_utilisateur = ?',
        ['Enseignant', userId]
      );
      console.log('✅ Rôle mis à jour vers Enseignant\n');
    } else {
      // 4. Créer l'utilisateur
      const [userResult] = await connection.execute(`
        INSERT INTO utilisateur (nom, \`prénom\`, email, identifiant, mot_de_passe_hash, \`rôle\`, date_creation, date_modification)
        VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, ['TestChef', 'Mohamed', 'chef.test@enis.tn', 'chef_test', hashedPassword, 'Enseignant']);

      userId = userResult.insertId;
      console.log(`✅ Utilisateur créé (ID: ${userId})\n`);
    }

    // 5. Vérifier si l'enseignant existe
    const [existingEns] = await connection.execute(
      'SELECT * FROM enseignant WHERE id_enseignant = ?',
      [userId]
    );

    if (existingEns.length > 0) {
      console.log('⚠️  Enseignant existe déjà\n');
      
      // Mettre à jour pour être chef
      await connection.execute(`
        UPDATE enseignant 
        SET est_chef_departement = true,
            id_departement = ?,
            departement_nom = ?
        WHERE id_enseignant = ?
      `, [dept.id_departement, dept.nom, userId]);
      
      console.log('✅ Enseignant mis à jour comme chef de département\n');
    } else {
      // 6. Créer l'enseignant
      await connection.execute(`
        INSERT INTO enseignant (id_enseignant, matricule, id_departement, departement_nom, est_chef_departement)
        VALUES (?, ?, ?, ?, true)
      `, [userId, 'CHEF001', dept.id_departement, dept.nom]);

      console.log('✅ Enseignant créé comme chef de département\n');
    }

    // 7. Afficher les infos de connexion
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 CHEF DE DÉPARTEMENT CRÉÉ AVEC SUCCÈS!\n');
    console.log('📝 Informations de connexion:');
    console.log('   • Identifiant: chef_test');
    console.log('   • Mot de passe: chef123456');
    console.log('   • Rôle à sélectionner: Chef de Département');
    console.log(`   • Département: ${dept.nom}`);
    console.log('\n🌐 Connectez-vous sur: http://localhost:3001/login');
    console.log('═══════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await connection.end();
  }
}

createTestChef();
