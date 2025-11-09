const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function listerIDs() {
  const enseignants = await prisma.enseignant.findMany({
    include: { utilisateur: true }
  });
  
  const matieres = await prisma.matiere.findMany();
  const salles = await prisma.salle.findMany();
  const groupes = await prisma.groupe.findMany();
  
  console.log('📚 ENSEIGNANTS:');
  enseignants.forEach(e => console.log(`  ID: ${e.id_enseignant} - ${e.utilisateur.nom} ${e.utilisateur.prenom}`));
  
  console.log('\n📖 MATIÈRES (pour DSI21):');
  matieres.filter(m => m.id_niveau === 1).forEach(m => console.log(`  ID: ${m.id_matiere} - ${m.nom}`));
  
  console.log('\n🚪 SALLES:');
  salles.forEach(s => console.log(`  ID: ${s.id_salle} - ${s.nom}`));
  
  console.log('\n👥 GROUPES:');
  groupes.forEach(g => console.log(`  ID: ${g.id_groupe} - ${g.nom}`));
  
  await prisma.$disconnect();
}

listerIDs();
