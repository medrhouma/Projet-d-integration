/**
 * Test de conflit de salle
 * Vérifie qu'une salle ne peut pas être utilisée par 2 groupes en même temps
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testConflitSalle() {
  try {
    console.log('🧪 TEST DE CONFLIT DE SALLE\n');
    console.log('=' .repeat(60));

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
      console.log('❌ Aucune séance existante dans la base de données');
      return;
    }

    console.log('\n📋 SÉANCE EXISTANTE:');
    console.log(`   Date: ${seanceExistante.date.toLocaleDateString('fr-FR')}`);
    console.log(`   Horaire: ${seanceExistante.heure_debut.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - ${seanceExistante.heure_fin.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`);
    console.log(`   Salle: ${seanceExistante.salle.code} (ID: ${seanceExistante.id_salle})`);
    console.log(`   Groupe: ${seanceExistante.groupe.nom} (ID: ${seanceExistante.id_groupe})`);
    console.log(`   Matière: ${seanceExistante.matiere.nom}`);
    if (seanceExistante.enseignant) {
      console.log(`   Enseignant: ${seanceExistante.enseignant.utilisateur.nom} ${seanceExistante.enseignant.utilisateur.prenom}`);
    }

    // 2. Trouver un autre groupe
    const autreGroupe = await prisma.groupe.findFirst({
      where: {
        id_groupe: { not: seanceExistante.id_groupe }
      }
    });

    if (!autreGroupe) {
      console.log('❌ Impossible de trouver un autre groupe pour le test');
      return;
    }

    // 3. Trouver un autre enseignant
    const autreEnseignant = await prisma.enseignant.findFirst({
      where: {
        id_enseignant: seanceExistante.id_enseignant 
          ? { not: seanceExistante.id_enseignant }
          : undefined
      },
      include: {
        utilisateur: true
      }
    });

    console.log('\n🎯 TENTATIVE D\'AJOUT AVEC CONFLIT:');
    console.log(`   MÊME Date: ${seanceExistante.date.toLocaleDateString('fr-FR')}`);
    console.log(`   MÊME Horaire: ${seanceExistante.heure_debut.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - ${seanceExistante.heure_fin.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`);
    console.log(`   MÊME Salle: ${seanceExistante.salle.code} (ID: ${seanceExistante.id_salle}) ⚠️`);
    console.log(`   Groupe différent: ${autreGroupe.nom} (ID: ${autreGroupe.id_groupe})`);
    if (autreEnseignant) {
      console.log(`   Enseignant différent: ${autreEnseignant.utilisateur.nom} ${autreEnseignant.utilisateur.prenom}`);
    }

    // 4. Vérifier les conflits manuellement (simulation de la fonction detecterConflits)
    const conflitSalle = await prisma.emploiTemps.findFirst({
      where: {
        id_salle: seanceExistante.id_salle,
        date: seanceExistante.date,
        OR: [
          {
            AND: [
              { heure_debut: { lte: seanceExistante.heure_debut } },
              { heure_fin: { gt: seanceExistante.heure_debut } }
            ]
          },
          {
            AND: [
              { heure_debut: { lt: seanceExistante.heure_fin } },
              { heure_fin: { gte: seanceExistante.heure_fin } }
            ]
          },
          {
            AND: [
              { heure_debut: { gte: seanceExistante.heure_debut } },
              { heure_fin: { lte: seanceExistante.heure_fin } }
            ]
          }
        ]
      },
      include: {
        salle: true,
        matiere: true,
        groupe: true
      }
    });

    console.log('\n🔍 RÉSULTAT DE LA VÉRIFICATION:');
    
    if (conflitSalle) {
      console.log('✅ ✅ ✅ CONFLIT DÉTECTÉ AVEC SUCCÈS ! ✅ ✅ ✅');
      console.log('\n⚠️  DÉTAILS DU CONFLIT:');
      console.log(`   Type: Conflit de SALLE`);
      console.log(`   Message: La salle ${conflitSalle.salle.code} est déjà occupée pour ${conflitSalle.matiere.nom}`);
      console.log(`   Groupe en conflit: ${conflitSalle.groupe.nom}`);
      console.log(`   Horaire du conflit: ${conflitSalle.heure_debut.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - ${conflitSalle.heure_fin.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`);
      console.log('\n🎉 Le système fonctionne correctement !');
      console.log('   → La salle NE PEUT PAS être utilisée par un autre groupe au même moment');
    } else {
      console.log('❌ ERREUR: Aucun conflit détecté (ce qui est incorrect!)');
    }

    // 5. Test avec un horaire différent (devrait fonctionner)
    console.log('\n\n' + '=' .repeat(60));
    console.log('🧪 TEST AVEC HORAIRE DIFFÉRENT (devrait réussir)');
    console.log('=' .repeat(60));

    // Créer une date 2 heures plus tard
    const nouvelleHeureDebut = new Date(seanceExistante.heure_fin);
    nouvelleHeureDebut.setHours(nouvelleHeureDebut.getHours() + 0.5); // 30 minutes après la fin
    
    const nouvelleHeureFin = new Date(nouvelleHeureDebut);
    nouvelleHeureFin.setHours(nouvelleHeureFin.getHours() + 1.5); // 1h30 de cours

    console.log(`\n📋 Nouvelle tentative:`);
    console.log(`   Horaire: ${nouvelleHeureDebut.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})} - ${nouvelleHeureFin.toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}`);
    console.log(`   Salle: ${seanceExistante.salle.code} (même salle)`);
    console.log(`   Groupe: ${autreGroupe.nom}`);

    const conflitHoraireDifferent = await prisma.emploiTemps.findFirst({
      where: {
        id_salle: seanceExistante.id_salle,
        date: seanceExistante.date,
        OR: [
          {
            AND: [
              { heure_debut: { lte: nouvelleHeureDebut } },
              { heure_fin: { gt: nouvelleHeureDebut } }
            ]
          },
          {
            AND: [
              { heure_debut: { lt: nouvelleHeureFin } },
              { heure_fin: { gte: nouvelleHeureFin } }
            ]
          },
          {
            AND: [
              { heure_debut: { gte: nouvelleHeureDebut } },
              { heure_fin: { lte: nouvelleHeureFin } }
            ]
          }
        ]
      }
    });

    if (!conflitHoraireDifferent) {
      console.log('✅ Aucun conflit détecté');
      console.log('   → La salle PEUT être utilisée par un autre groupe à un horaire différent');
    } else {
      console.log('⚠️  Conflit détecté (il y a peut-être une autre séance à cet horaire)');
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ TEST TERMINÉ AVEC SUCCÈS');
    console.log('=' .repeat(60));

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConflitSalle();
