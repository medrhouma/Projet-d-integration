/**
 * Script pour tester la détection de conflits
 */

async function testConflict() {
  try {
    // D'abord, récupérer une séance existante
    const existingRes = await fetch('http://localhost:3000/api/emploi-temps/public', {
      headers: {
        'Cookie': 'token=your-token-here'
      }
    });
    const existing = await existingRes.json();
    console.log('📋 Séances existantes:', existing.length);
    
    if (existing.length === 0) {
      console.log('❌ Aucune séance existante pour tester les conflits');
      return;
    }

    const premiere = existing[0];
    console.log('\n✅ Séance de référence:');
    console.log(`   Date: ${new Date(premiere.date).toLocaleDateString()}`);
    console.log(`   Heure: ${new Date(premiere.heure_debut).toLocaleTimeString()} - ${new Date(premiere.heure_fin).toLocaleTimeString()}`);
    console.log(`   Salle: ${premiere.salle.code}`);
    console.log(`   Enseignant: ${premiere.enseignant.utilisateur.nom}`);
    console.log(`   Groupe: ${premiere.groupe.nom}`);

    // TEST 1: Conflit de salle
    console.log('\n🧪 TEST 1: Tentative d\'ajout avec conflit de SALLE...');
    const conflitSalle = {
      date: premiere.date,
      heure_debut: premiere.heure_debut,
      heure_fin: premiere.heure_fin,
      id_matiere: premiere.id_matiere,
      id_salle: premiere.id_salle, // MÊME SALLE
      id_groupe: 2, // Autre groupe
      id_enseignant: 3 // Autre enseignant
    };

    const res1 = await fetch('http://localhost:3000/api/emploi-temps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'token=your-token-here'
      },
      body: JSON.stringify(conflitSalle)
    });

    if (res1.status === 409) {
      const data = await res1.json();
      console.log('✅ Conflit de salle détecté correctement!');
      console.log('   Message:', data.conflits[0].message);
    } else {
      console.log('❌ Le conflit de salle n\'a PAS été détecté!');
    }

    // TEST 2: Conflit d'enseignant
    console.log('\n🧪 TEST 2: Tentative d\'ajout avec conflit d\'ENSEIGNANT...');
    const conflitProf = {
      date: premiere.date,
      heure_debut: premiere.heure_debut,
      heure_fin: premiere.heure_fin,
      id_matiere: premiere.id_matiere,
      id_salle: 2, // Autre salle
      id_groupe: 2, // Autre groupe
      id_enseignant: premiere.id_enseignant // MÊME ENSEIGNANT
    };

    const res2 = await fetch('http://localhost:3000/api/emploi-temps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'token=your-token-here'
      },
      body: JSON.stringify(conflitProf)
    });

    if (res2.status === 409) {
      const data = await res2.json();
      console.log('✅ Conflit d\'enseignant détecté correctement!');
      console.log('   Message:', data.conflits[0].message);
    } else {
      console.log('❌ Le conflit d\'enseignant n\'a PAS été détecté!');
    }

    // TEST 3: Conflit de groupe
    console.log('\n🧪 TEST 3: Tentative d\'ajout avec conflit de GROUPE...');
    const conflitGroupe = {
      date: premiere.date,
      heure_debut: premiere.heure_debut,
      heure_fin: premiere.heure_fin,
      id_matiere: premiere.id_matiere,
      id_salle: 2, // Autre salle
      id_groupe: premiere.id_groupe, // MÊME GROUPE
      id_enseignant: 3 // Autre enseignant
    };

    const res3 = await fetch('http://localhost:3000/api/emploi-temps', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'token=your-token-here'
      },
      body: JSON.stringify(conflitGroupe)
    });

    if (res3.status === 409) {
      const data = await res3.json();
      console.log('✅ Conflit de groupe détecté correctement!');
      console.log('   Message:', data.conflits[0].message);
    } else {
      console.log('❌ Le conflit de groupe n\'a PAS été détecté!');
    }

    console.log('\n✨ Tests terminés!');

  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testConflict();
