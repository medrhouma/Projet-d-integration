/**
 * Test rapide de la connexion chef de département
 * Usage: node test-login-chef.js
 */

const PORT = 3000; // Changez en 3001 si nécessaire

async function testLogin() {
  console.log('\n🧪 TEST DE CONNEXION CHEF DE DÉPARTEMENT\n');
  console.log('═'.repeat(50));

  try {
    const url = `http://localhost:${PORT}/api/auth/login`;
    console.log(`\n📡 Tentative de connexion sur: ${url}\n`);

    const response = await fetch(url, {
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

    console.log(`📊 Status HTTP: ${response.status} ${response.statusText}\n`);

    const data = await response.json();

    if (response.ok && data.success) {
      console.log('✅ CONNEXION RÉUSSIE!\n');
      console.log('👤 Utilisateur:');
      console.log(`   • Nom: ${data.user.prenom} ${data.user.nom}`);
      console.log(`   • Email: ${data.user.email}`);
      console.log(`   • Identifiant: ${data.user.identifiant}`);
      console.log(`   • Rôle: ${data.user.role} ${data.user.role === 'ChefDepartement' ? '✓' : '✗'}`);
      console.log(`   • Chef?: ${data.user.est_chef_departement ? 'OUI ✓' : 'NON ✗'}`);
      console.log(`   • Département: ${data.user.departement_nom || 'N/A'} (ID: ${data.user.id_departement || 'N/A'})`);
      console.log(`   • Token: ${data.token ? 'Présent ✓' : 'Absent ✗'}`);
      
      console.log('\n🎯 Dashboard attendu: /dashboard-chef-departement');
      
      if (data.user.role !== 'ChefDepartement') {
        console.log('\n⚠️  ATTENTION: Le rôle devrait être "ChefDepartement" mais c\'est "' + data.user.role + '"');
      }
      
      if (!data.user.est_chef_departement) {
        console.log('\n⚠️  ATTENTION: est_chef_departement devrait être true');
      }
      
      console.log('\n═'.repeat(50));
      console.log('✅ Le login fonctionne correctement!');
      console.log('🌐 Vous pouvez maintenant tester dans le navigateur:');
      console.log(`   http://localhost:${PORT}/login`);
      console.log('═'.repeat(50));
      
    } else {
      console.log('❌ ÉCHEC DE CONNEXION\n');
      console.log('Message:', data.message || 'Erreur inconnue');
      console.log('\nDétails de la réponse:');
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.log('\n❌ ERREUR DE CONNEXION AU SERVEUR\n');
    console.error(error.message);
    console.log('\n💡 Vérifiez que le serveur Next.js est lancé:');
    console.log('   npm run dev');
    console.log(`\n   et accessible sur http://localhost:${PORT}`);
  }

  console.log('\n');
}

testLogin();
