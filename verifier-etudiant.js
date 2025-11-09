const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifierEtudiant() {
  try {
    console.log('🔍 Vérification de l\'étudiant ETU002...\n');
    
    // Trouver l'utilisateur
    const user = await prisma.utilisateur.findFirst({
      where: {
        identifiant: 'ETU002'
      }
    });
    
    if (!user) {
      console.log('❌ Utilisateur ETU002 non trouvé');
      return;
    }
    
    console.log(`✅ Utilisateur trouvé: ${user.nom} ${user.prenom}`);
    console.log(`   ID: ${user.id_utilisateur}`);
    
    // Trouver l'étudiant
    const etudiant = await prisma.etudiant.findUnique({
      where: {
        id_etudiant: user.id_utilisateur
      },
      include: {
        groupe: true,
        niveau: true,
        specialite: true
      }
    });
    
    if (!etudiant) {
      console.log('❌ Données étudiant non trouvées');
      return;
    }
    
    console.log('\n📚 Données étudiant:');
    console.log(`   ID Groupe: ${etudiant.id_groupe}`);
    console.log(`   Groupe: ${etudiant.groupe?.nom || 'NON ASSIGNÉ'}`);
    console.log(`   Niveau: ${etudiant.niveau?.nom || 'N/A'}`);
    console.log(`   Spécialité: ${etudiant.specialite?.nom || 'N/A'}`);
    
    // Si pas de groupe, on l'assigne au groupe DSI21
    if (!etudiant.id_groupe) {
      console.log('\n⚠️ L\'étudiant n\'a pas de groupe assigné !');
      console.log('🔧 Assignation au groupe DSI21 (id=1)...');
      
      await prisma.etudiant.update({
        where: {
          id_etudiant: user.id_utilisateur
        },
        data: {
          id_groupe: 1, // DSI21
          groupe_nom: 'DSI21'
        }
      });
      
      console.log('✅ Groupe assigné avec succès !');
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifierEtudiant();
