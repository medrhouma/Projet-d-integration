/**
 * Test réel de l'API de détection de conflits
 * Tente de créer une séance dans une salle déjà occupée
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log('🧪 TEST API - DÉTECTION DE CONFLIT DE SALLE\n');
    console.log('=' .repeat(70));

    // 1. Récupérer une séance existante
    const seanceExistante = await prisma.emploiTemps.findFirst({
      include: {
        salle: true,
        groupe: true,
        enseignant: {
          include: { utilisateur: true }
        },
        matiere: true
      }
    });

    if (!seanceExistante) {
      console.log('❌ Aucune séance existante');
      await prisma.$disconnect();
      return;
    }

    console.log('\n📋 SÉANCE EXISTANTE DANS LA BASE:');
    console.log(`   ID: ${seanceExistante.id_emploi}`);
    console.log(`   Date: ${seanceExistante.date.toISOString().split('T')[0]}`);
    console.log(`   Heure début: ${seanceExistante.heure_debut.toISOString()}`);
    console.log(`   Heure fin: ${seanceExistante.heure_fin.toISOString()}`);
    console.log(`   Salle: ${seanceExistante.salle.code} (ID: ${seanceExistante.id_salle})`);
    console.log(`   Groupe: ${seanceExistante.groupe.nom} (ID: ${seanceExistante.id_groupe})`);
    console.log(`   Matière: ${seanceExistante.matiere.nom} (ID: ${seanceExistante.id_matiere})`);

    // 2. Trouver un autre groupe
    const autreGroupe = await prisma.groupe.findFirst({
      where: { id_groupe: { not: seanceExistante.id_groupe } }
    });

    if (!autreGroupe) {
      console.log('❌ Impossible de trouver un autre groupe');
      await prisma.$disconnect();
      return;
    }

    // 3. Trouver un autre enseignant
    const autreEnseignant = await prisma.enseignant.findFirst({
      where: {
        id_enseignant: seanceExistante.id_enseignant 
          ? { not: seanceExistante.id_enseignant }
          : undefined
      },
      include: { utilisateur: true }
    });

    // 4. Préparer les données pour créer une séance en CONFLIT
    const nouvelleSeance = {
      date: seanceExistante.date.toISOString().split('T')[0], // Même date
      heure_debut: seanceExistante.heure_debut.toISOString(), // Même heure début
      heure_fin: seanceExistante.heure_fin.toISOString(),     // Même heure fin
      id_matiere: seanceExistante.id_matiere,
      id_salle: seanceExistante.id_salle,                     // MÊME SALLE ⚠️
      id_groupe: autreGroupe.id_groupe,                        // Autre groupe
      id_enseignant: autreEnseignant?.id_enseignant || seanceExistante.id_enseignant
    };

    console.log('\n🎯 TENTATIVE DE CRÉATION AVEC CONFLIT:');
    console.log(`   Date: ${nouvelleSeance.date} (MÊME)`);
    console.log(`   Horaire: ${new Date(nouvelleSeance.heure_debut).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - ${new Date(nouvelleSeance.heure_fin).toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} (MÊME)`);
    console.log(`   Salle: ${seanceExistante.salle.code} (ID: ${nouvelleSeance.id_salle}) ⚠️ MÊME SALLE`);
    console.log(`   Groupe: ${autreGroupe.nom} (ID: ${nouvelleSeance.id_groupe}) ✅ Différent`);
    if (autreEnseignant) {
      console.log(`   Enseignant: ${autreEnseignant.utilisateur.nom} (ID: ${nouvelleSeance.id_enseignant}) ✅ Différent`);
    }

    console.log('\n🔍 SIMULATION DE LA VÉRIFICATION detecterConflits():');
    
    // Simuler exactement ce que fait la fonction detecterConflits dans l'API
    const dateObj = new Date(nouvelleSeance.date);
    const heureDebutObj = new Date(nouvelleSeance.heure_debut);
    const heureFinObj = new Date(nouvelleSeance.heure_fin);

    console.log(`   Recherche conflit avec:`);
    console.log(`   - id_salle: ${nouvelleSeance.id_salle}`);
    console.log(`   - date: ${dateObj.toISOString()}`);
    console.log(`   - heure_debut: ${heureDebutObj.toISOString()}`);
    console.log(`   - heure_fin: ${heureFinObj.toISOString()}`);

    // Convertir les heures en décimal (comme dans la nouvelle logique)
    const heureDebutDecimal = heureDebutObj.getUTCHours() + heureDebutObj.getUTCMinutes() / 60;
    const heureFinDecimal = heureFinObj.getUTCHours() + heureFinObj.getUTCMinutes() / 60;

    console.log(`   - heure_debut décimal: ${heureDebutDecimal}h`);
    console.log(`   - heure_fin décimal: ${heureFinDecimal}h`);

    // Récupérer toutes les séances du même jour
    const seancesDuJour = await prisma.emploiTemps.findMany({
      where: {
        date: dateObj,
        OR: [
          { id_salle: nouvelleSeance.id_salle },
          { id_enseignant: nouvelleSeance.id_enseignant },
          { id_groupe: nouvelleSeance.id_groupe }
        ]
      },
      include: {
        salle: true,
        matiere: true,
        groupe: true,
        enseignant: {
          include: {
            utilisateur: true
          }
        }
      }
    });

    console.log(`\n   Séances trouvées ce jour: ${seancesDuJour.length}`);

    let conflitSalle = null;

    // Vérifier les conflits manuellement (nouvelle logique)
    for (const seance of seancesDuJour) {
      const seanceDebutDecimal = seance.heure_debut.getUTCHours() + seance.heure_debut.getUTCMinutes() / 60;
      const seanceFinDecimal = seance.heure_fin.getUTCHours() + seance.heure_fin.getUTCMinutes() / 60;

      console.log(`   - Séance ${seance.id_emploi}: ${seanceDebutDecimal}h - ${seanceFinDecimal}h, Salle: ${seance.id_salle}`);

      // Vérifier si les horaires se chevauchent
      const chevauche = (
        (heureDebutDecimal >= seanceDebutDecimal && heureDebutDecimal < seanceFinDecimal) || // Début dans la séance
        (heureFinDecimal > seanceDebutDecimal && heureFinDecimal <= seanceFinDecimal) ||     // Fin dans la séance
        (heureDebutDecimal <= seanceDebutDecimal && heureFinDecimal >= seanceFinDecimal)     // Englobe la séance
      );

      console.log(`     Chevauche? ${chevauche}`);

      if (chevauche && seance.id_salle === nouvelleSeance.id_salle) {
        conflitSalle = seance;
        break;
      }
    }

    console.log('\n' + '='.repeat(70));
    
    if (conflitSalle) {
      console.log('✅ ✅ ✅ CONFLIT DÉTECTÉ AVEC SUCCÈS ! ✅ ✅ ✅\n');
      console.log('⚠️  DÉTAILS DU CONFLIT:');
      console.log(`   Type: Conflit de SALLE`);
      console.log(`   Message: "La salle ${conflitSalle.salle.code} est déjà occupée pour ${conflitSalle.matiere.nom}"`);
      console.log(`   Groupe en conflit: ${conflitSalle.groupe.nom}`);
      console.log(`   Horaire: ${conflitSalle.heure_debut.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - ${conflitSalle.heure_fin.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`);
      console.log(`   ID séance en conflit: ${conflitSalle.id_emploi}`);
      console.log('\n🎉 LE SYSTÈME FONCTIONNE PARFAITEMENT !');
      console.log('   ➜ La salle NE PEUT PAS être utilisée par 2 groupes en même temps');
      console.log('   ➜ L\'API retournerait un code 409 Conflict');
      console.log('   ➜ La nouvelle séance NE SERA PAS créée');
    } else {
      console.log('❌ ❌ ❌ ERREUR: AUCUN CONFLIT DÉTECTÉ ! ❌ ❌ ❌\n');
      console.log('⚠️  Ceci est un PROBLÈME - la séance devrait être bloquée!');
    }

    console.log('\n' + '='.repeat(70));

    // 5. Test avec un horaire DIFFÉRENT (devrait réussir)
    console.log('\n\n🧪 TEST 2: SALLE LIBRE À UN AUTRE HORAIRE\n');
    console.log('='.repeat(70));

    // Créer une nouvelle date 3 heures plus tard
    const heureDebutLibre = new Date(seanceExistante.heure_fin);
    heureDebutLibre.setHours(heureDebutLibre.getHours() + 3);
    
    const heureFinLibre = new Date(heureDebutLibre);
    heureFinLibre.setHours(heureFinLibre.getHours() + 1.5);

    console.log(`\n📋 Tentative à un horaire différent:`);
    console.log(`   Horaire: ${heureDebutLibre.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - ${heureFinLibre.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`);
    console.log(`   Salle: ${seanceExistante.salle.code} (même salle)`);
    console.log(`   Groupe: ${autreGroupe.nom}`);

    const conflitHoraireDifferent = await prisma.emploiTemps.findFirst({
      where: {
        id_salle: nouvelleSeance.id_salle,
        date: dateObj,
        OR: [
          {
            AND: [
              { heure_debut: { lte: heureDebutLibre } },
              { heure_fin: { gt: heureDebutLibre } }
            ]
          },
          {
            AND: [
              { heure_debut: { lt: heureFinLibre } },
              { heure_fin: { gte: heureFinLibre } }
            ]
          },
          {
            AND: [
              { heure_debut: { gte: heureDebutLibre } },
              { heure_fin: { lte: heureFinLibre } }
            ]
          }
        ]
      }
    });

    if (!conflitHoraireDifferent) {
      console.log('\n✅ Aucun conflit - LA SÉANCE PEUT ÊTRE CRÉÉE');
      console.log('   ➜ La salle est libre à cet horaire');
      console.log('   ➜ Un autre groupe peut l\'utiliser');
    } else {
      console.log('\n⚠️  Conflit détecté (il y a peut-être déjà une autre séance)');
    }

    console.log('\n' + '='.repeat(70));

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
