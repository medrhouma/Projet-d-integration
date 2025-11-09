/**
 * Déboguer les dates et heures pour comprendre le problème
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugDates() {
  try {
    const seance = await prisma.emploiTemps.findFirst({
      include: {
        salle: true,
        groupe: true,
        matiere: true
      }
    });

    if (!seance) {
      console.log('Aucune séance');
      return;
    }

    console.log('📅 ANALYSE DES DATES:\n');
    console.log('Date complète:', seance.date);
    console.log('Date ISO:', seance.date.toISOString());
    console.log('Date locale:', seance.date.toLocaleString('fr-FR'));
    
    console.log('\n⏰ HEURE DÉBUT:');
    console.log('Complète:', seance.heure_debut);
    console.log('ISO:', seance.heure_debut.toISOString());
    console.log('Locale:', seance.heure_debut.toLocaleString('fr-FR'));
    
    console.log('\n⏰ HEURE FIN:');
    console.log('Complète:', seance.heure_fin);
    console.log('ISO:', seance.heure_fin.toISOString());
    console.log('Locale:', seance.heure_fin.toLocaleString('fr-FR'));

    // Tester la requête de conflit exacte
    console.log('\n\n🔍 TEST DE REQUÊTE DE CONFLIT:');
    console.log('Cherche conflit avec:');
    console.log('  id_salle:', seance.id_salle);
    console.log('  date:', seance.date);
    console.log('  heure_debut:', seance.heure_debut);
    console.log('  heure_fin:', seance.heure_fin);

    const conflit = await prisma.emploiTemps.findFirst({
      where: {
        id_salle: seance.id_salle,
        date: seance.date,
        OR: [
          {
            AND: [
              { heure_debut: { lte: seance.heure_debut } },
              { heure_fin: { gt: seance.heure_debut } }
            ]
          },
          {
            AND: [
              { heure_debut: { lt: seance.heure_fin } },
              { heure_fin: { gte: seance.heure_fin } }
            ]
          },
          {
            AND: [
              { heure_debut: { gte: seance.heure_debut } },
              { heure_fin: { lte: seance.heure_fin } }
            ]
          }
        ]
      },
      include: {
        salle: true,
        groupe: true
      }
    });

    if (conflit) {
      console.log('\n✅ CONFLIT TROUVÉ!');
      console.log('Salle:', conflit.salle.code);
      console.log('Groupe:', conflit.groupe.nom);
      console.log('ID séance:', conflit.id_emploi);
    } else {
      console.log('\n❌ Aucun conflit trouvé');
    }

    // Chercher toutes les séances dans cette salle
    console.log('\n\n📋 TOUTES LES SÉANCES DANS LA SALLE', seance.salle.code + ':');
    const toutesSeances = await prisma.emploiTemps.findMany({
      where: {
        id_salle: seance.id_salle
      },
      include: {
        groupe: true,
        matiere: true
      },
      orderBy: {
        date: 'asc'
      }
    });

    toutesSeances.forEach((s, i) => {
      console.log(`\n${i + 1}. ID: ${s.id_emploi}`);
      console.log(`   Date: ${s.date.toLocaleDateString('fr-FR')}`);
      console.log(`   Horaire: ${s.heure_debut.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - ${s.heure_fin.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`);
      console.log(`   Groupe: ${s.groupe.nom}`);
      console.log(`   Matière: ${s.matiere.nom}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugDates();
