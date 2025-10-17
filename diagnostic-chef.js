/**
 * Script de diagnostic pour le login Chef de Département
 * Utilisation: node diagnostic-chef.js
 */

const PORT = process.env.PORT || 3001; // Adapter selon le port affiché
const BASE_URL = `http://localhost:${PORT}`;

async function diagnostic() {
  console.log('\n🔍 === DIAGNOSTIC CHEF DE DÉPARTEMENT ===\n');
  console.log(`URL de base: ${BASE_URL}\n`);

  try {
    // Étape 1: Vérifier que le serveur répond
    console.log('1️⃣  Vérification du serveur...');
    try {
      const healthCheck = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'OPTIONS'
      });
      console.log('   ✅ Serveur accessible\n');
    } catch (e) {
      console.log(`   ❌ Serveur non accessible sur le port ${PORT}`);
      console.log(`   💡 Vérifiez que 'npm run dev' est lancé\n`);
      return;
    }

    // Étape 2: Lister les départements
    console.log('2️⃣  Récupération des départements...');
    const deptResp = await fetch(`${BASE_URL}/api/departements`);
    const depts = await deptResp.json();
    
    if (depts && depts.length > 0) {
      console.log(`   ✅ ${depts.length} département(s) trouvé(s)`);
      console.log(`   📋 Premier département: ${depts[0].nom} (ID: ${depts[0].id_departement})\n`);
    } else {
      console.log('   ⚠️  Aucun département trouvé\n');
    }

    // Étape 3: Tenter de créer un chef de test
    console.log('3️⃣  Création d\'un chef de département de test...');
    
    const newChef = {
      nom: "TestChef",
      prenom: "Admin",
      email: "chef.diagnostic@test.tn",
      identifiant: "diag_chef",
      mot_de_passe: "test123456",
      matricule: "DIAG001",
      id_departement: depts && depts[0] ? depts[0].id_departement : 1,
      est_chef_departement: true
    };

    const createResp = await fetch(`${BASE_URL}/api/enseignants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChef)
    });

    const createResult = await createResp.json();

    if (createResp.ok) {
      console.log('   ✅ Chef créé avec succès!');
      console.log(`   👤 ${createResult.utilisateur.prenom} ${createResult.utilisateur.nom}`);
      console.log(`   🎭 Rôle: ${createResult.utilisateur.role}`);
      console.log(`   🏢 Département ID: ${createResult.id_departement || 'N/A'}`);
      console.log(`   👔 Est chef?: ${createResult.est_chef_departement}\n`);
    } else {
      console.log('   ⚠️  Chef non créé (peut-être existe déjà)');
      console.log(`   📝 Message: ${createResult.error}\n`);
      
      // On continue quand même pour tester le login
      console.log('   ℹ️  On va tester le login avec les credentials existants\n');
    }

    // Étape 4: Tester le login
    console.log('4️⃣  Test de connexion...');
    
    const loginResp = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        login: "diag_chef",
        password: "test123456",
        role: "ChefDepartement"
      })
    });

    const loginResult = await loginResp.json();

    if (loginResp.ok && loginResult.success) {
      console.log('   ✅ CONNEXION RÉUSSIE!');
      console.log(`   👤 Utilisateur: ${loginResult.user.prenom} ${loginResult.user.nom}`);
      console.log(`   🎭 Rôle retourné: ${loginResult.user.role}`);
      console.log(`   👔 Est chef?: ${loginResult.user.est_chef_departement}`);
      console.log(`   🏢 Département: ${loginResult.user.departement_nom || 'N/A'} (ID: ${loginResult.user.id_departement || 'N/A'})`);
      console.log(`   🎫 Token généré?: ${loginResult.token ? 'OUI ✓' : 'NON ✗'}`);
      
      // Étape 5: Vérifier le token
      if (loginResult.token) {
        console.log('\n5️⃣  Vérification du token...');
        
        const meResp = await fetch(`${BASE_URL}/api/auth/me`, {
          headers: {
            'Cookie': `token=${loginResult.token}`
          }
        });

        const meResult = await meResp.json();

        if (meResp.ok && meResult.success) {
          console.log('   ✅ Token valide!');
          console.log(`   🎭 Rôle confirmé: ${meResult.user.role}`);
          
          // Étape 6: Tester l'accès aux statistiques
          console.log('\n6️⃣  Test d\'accès aux statistiques...');
          
          const statsResp = await fetch(`${BASE_URL}/api/chefs-departement/statistiques?departementId=${loginResult.user.id_departement}`, {
            headers: {
              'Cookie': `token=${loginResult.token}`
            }
          });

          const statsResult = await statsResp.json();

          if (statsResp.ok && statsResult.success) {
            console.log('   ✅ Statistiques accessibles!');
            console.log(`   🏢 Département: ${statsResult.data.departement.nom}`);
            console.log(`   👥 Enseignants: ${statsResult.data.nombre_enseignants}`);
            console.log(`   🎓 Étudiants: ${statsResult.data.nombre_etudiants}`);
            console.log(`   📚 Matières: ${statsResult.data.nombre_matieres}`);
          } else {
            console.log('   ❌ Échec accès statistiques');
            console.log(`   📝 Erreur: ${statsResult.error}`);
          }
        } else {
          console.log('   ❌ Token invalide');
          console.log(`   📝 Message: ${meResult.message}`);
        }
      }

      console.log('\n✅ === DIAGNOSTIC COMPLET : SUCCÈS ===');
      console.log('\n💡 Vous pouvez maintenant vous connecter avec:');
      console.log('   📧 Identifiant: diag_chef');
      console.log('   🔑 Mot de passe: test123456');
      console.log(`   🌐 URL: http://localhost:${PORT}/login`);
      console.log('   🎭 Rôle: Chef de Département\n');
      
    } else {
      console.log('   ❌ ÉCHEC DE CONNEXION');
      console.log(`   📝 Message: ${loginResult.message || 'Erreur inconnue'}`);
      console.log('\n🔍 Détails de la réponse:');
      console.log(JSON.stringify(loginResult, null, 2));
      
      console.log('\n💡 Suggestions:');
      console.log('   1. Vérifiez que le chef existe dans la base de données');
      console.log('   2. Vérifiez le mot de passe');
      console.log('   3. Vérifiez que est_chef_departement = true');
      console.log('   4. Vérifiez que le rôle est "ChefDepartement"');
    }

  } catch (error) {
    console.log('\n❌ === ERREUR CRITIQUE ===');
    console.error(error);
  }

  console.log('\n');
}

// Exécution
diagnostic();
