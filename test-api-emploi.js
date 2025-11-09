// Test direct de l'API emploi-temps/public
// Ce script simule un appel à l'API avec l'ID du groupe DSI21 (id_groupe = 1)

const testAPI = async () => {
  try {
    console.log('🧪 Test de l\'API /api/emploi-temps/public\n');
    
    const groupeId = 1; // DSI21
    const url = `http://localhost:3000/api/emploi-temps/public?groupeId=${groupeId}`;
    
    console.log(`📡 Requête: ${url}\n`);
    
    const response = await fetch(url, {
      headers: {
        'Cookie': 'auth_token=votre_token_ici' // Vous devez mettre un vrai token
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}\n`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Données reçues: ${data.length} séances\n`);
      
      if (data.length > 0) {
        console.log('📅 Première séance:');
        const seance = data[0];
        console.log(`   Matière: ${seance.matiere?.nom}`);
        console.log(`   Groupe: ${seance.groupe?.nom}`);
        console.log(`   Date: ${seance.date}`);
        console.log(`   Heure début: ${seance.heure_debut}`);
        console.log(`   Heure fin: ${seance.heure_fin}`);
        
        // Test conversion
        const heureDebut = new Date(seance.heure_debut);
        const heureDebutUTC = heureDebut.getUTCHours() + heureDebut.getUTCMinutes() / 60;
        console.log(`\n   🕐 Conversion UTC: ${heureDebutUTC}`);
        console.log(`   Créneau attendu: 8.5 (08:30-10:00)`);
        console.log(`   Match? ${heureDebutUTC >= 8.5 && heureDebutUTC < 10}`);
      } else {
        console.log('⚠️ Aucune séance retournée par l\'API');
      }
    } else {
      const errorText = await response.text();
      console.log(`❌ Erreur: ${errorText}`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
};

testAPI();
