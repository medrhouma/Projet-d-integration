import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      jour, // 0-5 pour Lundi-Samedi
      heure_debut, 
      heure_fin, 
      id_salle, 
      id_enseignant, 
      id_groupe,
      id_emploi // Pour exclure la séance actuelle lors de la modification
    } = body;

    if (jour === undefined || !heure_debut || !heure_fin) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const conflits: any[] = [];

    // Fonction pour comparer les horaires (format "HH:MM")
    const hasTimeOverlap = (start1: string, end1: string, start2: string, end2: string) => {
      const [h1Start, m1Start] = start1.split(':').map(Number);
      const [h1End, m1End] = end1.split(':').map(Number);
      const [h2Start, m2Start] = start2.split(':').map(Number);
      const [h2End, m2End] = end2.split(':').map(Number);

      const time1Start = h1Start * 60 + m1Start;
      const time1End = h1End * 60 + m1End;
      const time2Start = h2Start * 60 + m2Start;
      const time2End = h2End * 60 + m2End;

      return time1Start < time2End && time2Start < time1End;
    };

    // Récupérer toutes les séances du département
    // On filtre ensuite côté application car Prisma ne peut pas filtrer par jour de la semaine facilement
    const allEmplois = await prisma.emploiTemps.findMany({
      where: id_emploi ? { NOT: { id_emploi: parseInt(id_emploi) } } : {},
      include: {
        salle: true,
        enseignant: {
          include: {
            utilisateur: true,
          },
        },
        groupe: true,
        matiere: true,
      },
    });

    // Filtrer pour le même jour de la semaine
    const emploisDuJour = allEmplois.filter(emploi => {
      const emploiDate = new Date(emploi.date);
      const emploiJour = emploiDate.getDay(); // 0 = Dimanche, 1 = Lundi, ...
      // Convertir notre index (0 = Lundi) au format de getDay (1 = Lundi)
      const targetDay = jour === 6 ? 0 : jour + 1; // Samedi = 0 (Dimanche dans getDay)
      return emploiJour === targetDay;
    });

    // Vérifier les conflits
    for (const emploi of emploisDuJour) {
      // Convertir les DateTime en string HH:MM en UTC pour éviter les décalages de fuseau horaire
      const debutDate = new Date(emploi.heure_debut);
      const finDate = new Date(emploi.heure_fin);
      const emploiHeureDebut = `${String(debutDate.getUTCHours()).padStart(2, '0')}:${String(debutDate.getUTCMinutes()).padStart(2, '0')}`;
      const emploiHeureFin = `${String(finDate.getUTCHours()).padStart(2, '0')}:${String(finDate.getUTCMinutes()).padStart(2, '0')}`;

      // Vérifier si les horaires se chevauchent
      if (hasTimeOverlap(heure_debut, heure_fin, emploiHeureDebut, emploiHeureFin)) {
        // Conflit de salle
        if (id_salle && emploi.id_salle === parseInt(id_salle)) {
          conflits.push({
            type: 'salle',
            message: `La salle ${emploi.salle?.code} est déjà occupée de ${emploiHeureDebut} à ${emploiHeureFin} par ${emploi.groupe.nom} (${emploi.matiere.nom})`,
          });
        }

        // Conflit d'enseignant
        if (id_enseignant && emploi.id_enseignant === parseInt(id_enseignant)) {
          conflits.push({
            type: 'enseignant',
            message: `${emploi.enseignant?.utilisateur?.nom} ${emploi.enseignant?.utilisateur?.prenom} a déjà un cours de ${emploiHeureDebut} à ${emploiHeureFin} avec ${emploi.groupe.nom}`,
          });
        }

        // Conflit de groupe
        if (id_groupe && emploi.id_groupe === parseInt(id_groupe)) {
          conflits.push({
            type: 'groupe',
            message: `Le groupe ${emploi.groupe.nom} a déjà un cours de ${emploiHeureDebut} à ${emploiHeureFin} (${emploi.matiere.nom})`,
          });
        }
      }
    }

    return NextResponse.json({ conflits });
  } catch (error) {
    console.error('❌ Erreur check-conflicts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des conflits' },
      { status: 500 }
    );
  }
}
