// Test de l'API emploi-temps/public pour le groupe DSI21 (id_groupe = 1)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testAPI() {
  try {
    console.log('🧪 Test de la requête Prisma pour le groupe DSI21 (id=1)\n');
    
    const emplois = await prisma.emploiTemps.findMany({
      where: {
        id_groupe: 1, // DSI21
      },
      include: {
        matiere: {
          include: {
            niveau: {
              include: {
                specialite: {
                  include: {
                    departement: true
                  }
                }
              }
            }
          }
        },
        salle: true,
        groupe: {
          include: {
            niveau: true
          }
        },
        enseignant: {
          include: {
            utilisateur: true,
            departement: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { heure_debut: 'asc' }
      ]
    });
    
    console.log(`✅ Nombre de séances trouvées: ${emplois.length}\n`);
    
    if (emplois.length > 0) {
      console.log('📅 Première séance:');
      const e = emplois[0];
      console.log(`   Matière: ${e.matiere?.nom || 'N/A'}`);
      console.log(`   Groupe: ${e.groupe?.nom || 'N/A'}`);
      console.log(`   Date: ${e.date}`);
      console.log(`   Heure: ${e.heure_debut} - ${e.heure_fin}`);
      console.log(`   Enseignant: ${e.enseignant?.utilisateur?.nom || 'N/A'} ${e.enseignant?.utilisateur?.prenom || ''}`);
      console.log(`   Salle: ${e.salle?.code || 'N/A'}`);
    } else {
      console.log('⚠️ Aucune séance trouvée pour le groupe DSI21');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPI();
