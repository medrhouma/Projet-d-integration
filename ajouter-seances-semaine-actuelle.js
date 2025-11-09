const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function ajouterSeancesSemaineActuelle() {
  try {
    console.log('🔧 Ajout de séances pour novembre 2025...\n');
    
    // SEMAINE DU 10 NOVEMBRE 2025
    console.log('📅 Semaine du 10 novembre 2025:\n');
    
    // Lundi 10 novembre - DSI21
    const s1 = await prisma.emploiTemps.create({
      data: {
        date: new Date('2025-11-10T00:00:00Z'),
        heure_debut: new Date('2025-11-10T08:30:00Z'),
        heure_fin: new Date('2025-11-10T10:00:00Z'),
        id_matiere: 1, // Programmation Orientée Objet
        id_groupe: 1, // DSI21
        id_enseignant: 6, // Hamdi Youssef
        id_salle: 9,
      }
    });
    console.log('✅ Lundi 10/11 - 08:30-10:00 - POO - DSI21');
    
    const s2 = await prisma.emploiTemps.create({
      data: {
        date: new Date('2025-11-10T00:00:00Z'),
        heure_debut: new Date('2025-11-10T10:00:00Z'),
        heure_fin: new Date('2025-11-10T11:30:00Z'),
        id_matiere: 2, // Base de Données Avancées
        id_groupe: 1, // DSI21
        id_enseignant: 3, // Fatma Trabelsi
        id_salle: 9,
      }
    });
    console.log('✅ Lundi 10/11 - 10:00-11:30 - Base de Données - DSI21');
    
    // Mardi 11 novembre - DSI21
    const s3 = await prisma.emploiTemps.create({
      data: {
        date: new Date('2025-11-11T00:00:00Z'),
        heure_debut: new Date('2025-11-11T08:30:00Z'),
        heure_fin: new Date('2025-11-11T10:00:00Z'),
        id_matiere: 4, // Développement Web Avancé
        id_groupe: 1, // DSI21
        id_enseignant: 2, // Ben Ali Mohamed
        id_salle: 8,
      }
    });
    console.log('✅ Mardi 11/11 - 08:30-10:00 - Développement Web - DSI21');
    
    const s4 = await prisma.emploiTemps.create({
      data: {
        date: new Date('2025-11-11T00:00:00Z'),
        heure_debut: new Date('2025-11-11T14:00:00Z'),
        heure_fin: new Date('2025-11-11T15:30:00Z'),
        id_matiere: 3, // Réseaux Informatiques
        id_groupe: 1, // DSI21
        id_enseignant: 6, // Hamdi Youssef
        id_salle: 7,
      }
    });
    console.log('✅ Mardi 11/11 - 14:00-15:30 - Réseaux Informatiques - DSI21');
    
    // Mercredi 12 novembre - DSI21
    const s5 = await prisma.emploiTemps.create({
      data: {
        date: new Date('2025-11-12T00:00:00Z'),
        heure_debut: new Date('2025-11-12T10:00:00Z'),
        heure_fin: new Date('2025-11-12T11:30:00Z'),
        id_matiere: 1, // POO
        id_groupe: 1, // DSI21
        id_enseignant: 6, // Hamdi Youssef
        id_salle: 9,
      }
    });
    console.log('✅ Mercredi 12/11 - 10:00-11:30 - POO - DSI21');
    
    // Jeudi 13 novembre - DSI21
    const s6 = await prisma.emploiTemps.create({
      data: {
        date: new Date('2025-11-13T00:00:00Z'),
        heure_debut: new Date('2025-11-13T08:30:00Z'),
        heure_fin: new Date('2025-11-13T10:00:00Z'),
        id_matiere: 2, // Base de Données Avancées
        id_groupe: 1, // DSI21
        id_enseignant: 3, // Fatma Trabelsi
        id_salle: 6,
      }
    });
    console.log('✅ Jeudi 13/11 - 08:30-10:00 - Base de Données - DSI21');
    
    const s7 = await prisma.emploiTemps.create({
      data: {
        date: new Date('2025-11-13T00:00:00Z'),
        heure_debut: new Date('2025-11-13T11:30:00Z'),
        heure_fin: new Date('2025-11-13T13:00:00Z'),
        id_matiere: 4, // Développement Web
        id_groupe: 1, // DSI21
        id_enseignant: 2, // Ben Ali Mohamed
        id_salle: 8,
      }
    });
    console.log('✅ Jeudi 13/11 - 11:30-13:00 - Développement Web - DSI21');
    
    // Vendredi 14 novembre - DSI21
    const s8 = await prisma.emploiTemps.create({
      data: {
        date: new Date('2025-11-14T00:00:00Z'),
        heure_debut: new Date('2025-11-14T08:30:00Z'),
        heure_fin: new Date('2025-11-14T10:00:00Z'),
        id_matiere: 3, // Réseaux Informatiques
        id_groupe: 1, // DSI21
        id_enseignant: 6, // Hamdi Youssef
        id_salle: 7,
      }
    });
    console.log('✅ Vendredi 14/11 - 08:30-10:00 - Réseaux Informatiques - DSI21');
    
    console.log('\n✅ 8 séances ajoutées avec succès pour la semaine du 10 novembre !');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ajouterSeancesSemaineActuelle();
