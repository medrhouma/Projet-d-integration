// Script de test pour vérifier le login d'un chef de département

async function testChefLogin() {
  console.log('🧪 Test de connexion Chef de Département\n');
  
  // Test 1: Créer un chef de département
  console.log('1️⃣ Création d\'un chef de département...');
  
  const createResponse = await fetch('http://localhost:3000/api/enseignants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nom: "Chef",
      prenom: "Test",
      email: "chef.test@ecole.tn",
      identifiant: "chef_test",
      mot_de_passe: "test1234",
      matricule: "CHEF001",
      id_departement: 1,
      est_chef_departement: true
    })
  });
  
  const createData = await createResponse.json();
  
  if (createResponse.ok) {
    console.log('✅ Chef créé avec succès!');
    console.log('   ID:', createData.id_enseignant);
    console.log('   Nom:', createData.utilisateur.prenom, createData.utilisateur.nom);
    console.log('   Rôle:', createData.utilisateur.role);
  } else {
    console.log('⚠️ Création échouée (peut-être déjà existant):', createData.error);
  }
  
  console.log('\n2️⃣ Test de connexion...');
  
  // Test 2: Se connecter
  const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      login: "chef_test",
      password: "test1234",
      role: "ChefDepartement"
    })
  });
  
  const loginData = await loginResponse.json();
  
  if (loginResponse.ok && loginData.success) {
    console.log('✅ Connexion réussie!');
    console.log('   Token:', loginData.token ? 'Généré ✓' : 'Non généré ✗');
    console.log('   Utilisateur:', loginData.user.prenom, loginData.user.nom);
    console.log('   Rôle:', loginData.user.role);
    console.log('   Est chef?:', loginData.user.est_chef_departement ? 'Oui ✓' : 'Non ✗');
    console.log('   Département:', loginData.user.departement_nom || 'N/A');
    console.log('   ID Département:', loginData.user.id_departement || 'N/A');
    
    // Test 3: Vérifier /api/auth/me
    console.log('\n3️⃣ Test de récupération du profil...');
    
    const meResponse = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Cookie': `token=${loginData.token}`
      }
    });
    
    const meData = await meResponse.json();
    
    if (meResponse.ok && meData.success) {
      console.log('✅ Profil récupéré!');
      console.log('   Rôle:', meData.user.role);
      console.log('   Est chef?:', meData.user.est_chef_departement ? 'Oui ✓' : 'Non ✗');
    } else {
      console.log('❌ Échec récupération profil:', meData.message);
    }
    
    // Test 4: Accéder aux statistiques
    console.log('\n4️⃣ Test d\'accès aux statistiques...');
    
    const statsResponse = await fetch(`http://localhost:3000/api/chefs-departement/statistiques?departementId=${loginData.user.id_departement}`, {
      method: 'GET',
      headers: {
        'Cookie': `token=${loginData.token}`
      }
    });
    
    const statsData = await statsResponse.json();
    
    if (statsResponse.ok && statsData.success) {
      console.log('✅ Statistiques récupérées!');
      console.log('   Département:', statsData.data.departement.nom);
      console.log('   Enseignants:', statsData.data.nombre_enseignants);
      console.log('   Étudiants:', statsData.data.nombre_etudiants);
      console.log('   Matières:', statsData.data.nombre_matieres);
    } else {
      console.log('❌ Échec statistiques:', statsData.error);
    }
    
  } else {
    console.log('❌ Connexion échouée!');
    console.log('   Message:', loginData.message);
    console.log('   Données complètes:', JSON.stringify(loginData, null, 2));
  }
  
  console.log('\n✨ Tests terminés!\n');
}

// Exécuter les tests
testChefLogin().catch(console.error);
