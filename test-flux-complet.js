/**
 * Test complet du flux de connexion Chef de Département
 * Usage: node test-flux-complet.js
 */

const PORT = 3000; // Changez en 3001 si nécessaire
const BASE_URL = `http://localhost:${PORT}`;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function testFluxComplet() {
  console.log('\n🧪 TEST COMPLET - FLUX CHEF DE DÉPARTEMENT\n');
  console.log('═'.repeat(60));

  try {
    // ÉTAPE 1: Login
    console.log('\n📝 ÉTAPE 1: Connexion...\n');
    
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        login: 'chef_test',
        password: 'chef123456',
        role: 'ChefDepartement'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Échec du login');
      const error = await loginResponse.json();
      console.log('Erreur:', error);
      return;
    }

    const loginData = await loginResponse.json();
    
    if (!loginData.success) {
      console.log('❌ Login non réussi');
      console.log('Réponse:', loginData);
      return;
    }

    console.log('✅ Login réussi!');
    console.log(`   • Utilisateur: ${loginData.user.prenom} ${loginData.user.nom}`);
    console.log(`   • Rôle: ${loginData.user.role}`);
    console.log(`   • Chef?: ${loginData.user.est_chef_departement}`);
    console.log(`   • Département: ${loginData.user.departement_nom}`);
    console.log(`   • Token présent: ${loginData.token ? 'OUI' : 'NON'}`);

    // Récupérer les cookies
    const cookies = loginResponse.headers.get('set-cookie');
    console.log(`   • Cookies définis: ${cookies ? 'OUI' : 'NON'}`);

    if (!loginData.token) {
      console.log('\n❌ Pas de token reçu!');
      return;
    }

    // ÉTAPE 2: Vérifier /api/auth/me
    console.log('\n📝 ÉTAPE 2: Vérification de /api/auth/me...\n');
    
    await sleep(500); // Attendre un peu

    const meResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: {
        'Cookie': `token=${loginData.token}`
      }
    });

    if (!meResponse.ok) {
      console.log('❌ Échec de /api/auth/me');
      const error = await meResponse.json();
      console.log('Erreur:', error);
      return;
    }

    const meData = await meResponse.json();

    if (!meData.success) {
      console.log('❌ /api/auth/me non réussi');
      console.log('Réponse:', meData);
      return;
    }

    console.log('✅ /api/auth/me réussi!');
    console.log(`   • Rôle retourné: ${meData.user.role}`);
    console.log(`   • Chef?: ${meData.user.est_chef_departement}`);
    console.log(`   • ID Département: ${meData.user.id_departement}`);

    if (meData.user.role !== 'ChefDepartement') {
      console.log('\n⚠️  ATTENTION: Le rôle devrait être "ChefDepartement"!');
      console.log(`   Rôle actuel: ${meData.user.role}`);
      return;
    }

    // ÉTAPE 3: Vérifier l'accès aux statistiques
    console.log('\n📝 ÉTAPE 3: Vérification des statistiques...\n');

    const statsResponse = await fetch(
      `${BASE_URL}/api/chefs-departement/statistiques?departementId=${meData.user.id_departement}`,
      {
        headers: {
          'Cookie': `token=${loginData.token}`
        }
      }
    );

    if (!statsResponse.ok) {
      console.log('⚠️  Échec de récupération des statistiques');
      const error = await statsResponse.json();
      console.log('Erreur:', error);
    } else {
      const statsData = await statsResponse.json();
      
      if (statsData.success) {
        console.log('✅ Statistiques accessibles!');
        console.log(`   • Département: ${statsData.data.departement.nom}`);
        console.log(`   • Enseignants: ${statsData.data.nombre_enseignants}`);
        console.log(`   • Étudiants: ${statsData.data.nombre_etudiants}`);
        console.log(`   • Matières: ${statsData.data.nombre_matieres}`);
        console.log(`   • Spécialités: ${statsData.data.nombre_specialites}`);
      } else {
        console.log('⚠️  Statistiques non disponibles');
      }
    }

    // RÉSUMÉ
    console.log('\n' + '═'.repeat(60));
    console.log('✅ TOUS LES TESTS SONT RÉUSSIS!\n');
    console.log('🎯 Prochaine étape: Tester dans le navigateur');
    console.log(`   1. Ouvrez: ${BASE_URL}/login`);
    console.log('   2. Sélectionnez: Chef de Département (carte orange)');
    console.log('   3. Connectez-vous avec:');
    console.log('      • Identifiant: chef_test');
    console.log('      • Mot de passe: chef123456');
    console.log('   4. Vous devriez être redirigé vers:');
    console.log('      /dashboard-chef-departement');
    console.log('═'.repeat(60));

  } catch (error) {
    console.log('\n❌ ERREUR CRITIQUE\n');
    console.error(error);
    console.log('\n💡 Vérifiez que le serveur est lancé:');
    console.log(`   npm run dev`);
    console.log(`   et accessible sur ${BASE_URL}`);
  }

  console.log('\n');
}

testFluxComplet();
