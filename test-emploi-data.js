const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testEmploiTemps() {
  try {
    console.log('🔍 Vérification des données emploi du temps...\n');

    // Compter le total
    const total = await prisma.emploiTemps.count();
    console.log(`📊 Total de séances dans la base: ${total}\n`);

    if (total === 0) {
      console.log('⚠️ Aucune séance trouvée dans la base de données!');
      console.log('💡 Ajoutez des séances via la page admin: /dashboard-admin/emplois-du-temps\n');
    } else {
      // Récupérer quelques exemples
      const exemples = await prisma.emploiTemps.findMany({
        take: 5,
        include: {
          matiere: {
            include: {
              niveau: true
            }
          },
          salle: true,
          groupe: true,
          enseignant: {
            include: {
              utilisateur: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      });

      console.log('📅 Exemples de séances (les 5 plus récentes):\n');
      exemples.forEach((emploi, index) => {
        console.log(`${index + 1}. ${emploi.matiere.nom}`);
        console.log(`   Date: ${new Date(emploi.date).toLocaleDateString('fr-FR')}`);
        console.log(`   Heure: ${new Date(emploi.heure_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(emploi.heure_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`);
        console.log(`   Groupe: ${emploi.groupe.nom}`);
        console.log(`   Salle: ${emploi.salle.code}`);
        if (emploi.enseignant) {
          console.log(`   Enseignant: ${emploi.enseignant.utilisateur.nom} ${emploi.enseignant.utilisateur.prenom}`);
        }
        console.log('');
      });

      // Statistiques par groupe
      const groupes = await prisma.emploiTemps.groupBy({
        by: ['id_groupe'],
        _count: true
      });

      console.log(`📊 Répartition par groupe (${groupes.length} groupes):`);
      for (const g of groupes) {
        const groupe = await prisma.groupe.findUnique({
          where: { id_groupe: g.id_groupe }
        });
        console.log(`   - Groupe ${groupe?.nom}: ${g._count} séances`);
      }
      console.log('');

      // Statistiques par enseignant
      const enseignants = await prisma.emploiTemps.groupBy({
        by: ['id_enseignant'],
        _count: true
      });

      console.log(`📊 Répartition par enseignant (${enseignants.length} enseignants):`);
      for (const e of enseignants) {
        const enseignant = await prisma.enseignant.findUnique({
          where: { id_enseignant: e.id_enseignant },
          include: { utilisateur: true }
        });
        console.log(`   - ${enseignant?.utilisateur.nom} ${enseignant?.utilisateur.prenom}: ${e._count} séances`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testEmploiTemps();
