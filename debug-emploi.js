const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function debugEmploi() {
  try {
    console.log('=== DEBUG EMPLOI DU TEMPS ===\n');
    
    // Récupérer toutes les séances
    const emplois = await prisma.emploi_temps.findMany({
      include: {
        matiere: true,
        groupe: true,
        enseignant: {
          include: {
            utilisateur: true
          }
        },
        salle: true
      }
    });

    console.log(`Total de séances: ${emplois.length}\n`);

    emplois.forEach((emploi, index) => {
      const date = new Date(emploi.date);
      const heureDebut = new Date(emploi.heure_debut);
      const heureFin = new Date(emploi.heure_fin);
      
      // Test avec heure locale
      const heureDebutLocale = heureDebut.getHours() + heureDebut.getMinutes() / 60;
      
      // Test avec UTC
      const heureDebutUTC = heureDebut.getUTCHours() + heureDebut.getUTCMinutes() / 60;
      
      console.log(`\n${index + 1}. ${emploi.matiere.nom}`);
      console.log(`   Groupe: ${emploi.groupe.nom}`);
      console.log(`   Date: ${date.toISOString().split('T')[0]}`);
      console.log(`   Jour de la semaine: ${date.toLocaleDateString('fr-FR', { weekday: 'long' })}`);
      console.log(`   Heure début brute: ${emploi.heure_debut}`);
      console.log(`   Heure début (Date object): ${heureDebut}`);
      console.log(`   Heure début locale: ${heureDebutLocale} (${heureDebut.toLocaleTimeString('fr-FR')})`);
      console.log(`   Heure début UTC: ${heureDebutUTC} (${heureDebut.getUTCHours()}:${heureDebut.getUTCMinutes().toString().padStart(2, '0')})`);
      console.log(`   Heure fin UTC: ${heureFin.getUTCHours()}:${heureFin.getUTCMinutes().toString().padStart(2, '0')}`);
      
      // Vérifier dans quel créneau ça tombe
      const creneaux = [
        { label: '08:30 - 10:00', start: 8.5, end: 10 },
        { label: '10:00 - 11:30', start: 10, end: 11.5 },
        { label: '11:30 - 13:00', start: 11.5, end: 13 },
        { label: '14:00 - 15:30', start: 14, end: 15.5 },
        { label: '15:30 - 17:00', start: 15.5, end: 17 },
      ];
      
      const creneauMatch = creneaux.find(c => heureDebutUTC >= c.start && heureDebutUTC < c.end);
      if (creneauMatch) {
        console.log(`   ✓ Correspond au créneau: ${creneauMatch.label}`);
      } else {
        console.log(`   ✗ Ne correspond à aucun créneau (heure UTC: ${heureDebutUTC})`);
      }
    });

    console.log('\n\n=== CRÉNEAUX HORAIRES ===');
    const creneaux = [
      { label: '08:30 - 10:00', start: 8.5, end: 10 },
      { label: '10:00 - 11:30', start: 10, end: 11.5 },
      { label: '11:30 - 13:00', start: 11.5, end: 13 },
      { label: 'PAUSE', start: 13, end: 14, isPause: true },
      { label: '14:00 - 15:30', start: 14, end: 15.5 },
      { label: '15:30 - 17:00', start: 15.5, end: 17 },
    ];
    
    creneaux.forEach(c => {
      console.log(`${c.label}: ${c.start} - ${c.end}${c.isPause ? ' (PAUSE)' : ''}`);
    });

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugEmploi();
