import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      date, 
      heure_debut, 
      heure_fin, 
      id_salle, 
      id_enseignant, 
      id_groupe,
      id_emploi // Pour exclure la séance actuelle lors de la modification
    } = body;

    if (!date || !heure_debut || !heure_fin) {
      return NextResponse.json(
        { error: 'Paramètres manquants' },
        { status: 400 }
      );
    }

    const conflicts: any = {
      hasConflict: false,
      salleConflict: null,
      enseignantConflict: null,
      groupeConflict: null,
    };

    // Convertir les dates
    const checkDate = new Date(date);
    const checkHeureDebut = new Date(heure_debut);
    const checkHeureFin = new Date(heure_fin);

    // Fonction pour vérifier si deux créneaux horaires se chevauchent
    const hasTimeOverlap = (start1: Date, end1: Date, start2: Date, end2: Date) => {
      return start1 < end2 && start2 < end1;
    };

    // Récupérer toutes les séances pour la même date
    const emploisDuJour = await prisma.emploiTemps.findMany({
      where: {
        date: checkDate,
        ...(id_emploi ? { NOT: { id_emploi: parseInt(id_emploi) } } : {}),
      },
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

    // Vérifier les conflits
    for (const emploi of emploisDuJour) {
      const emploiDebut = new Date(emploi.heure_debut);
      const emploiFin = new Date(emploi.heure_fin);

      // Vérifier si les horaires se chevauchent
      if (hasTimeOverlap(checkHeureDebut, checkHeureFin, emploiDebut, emploiFin)) {
        // Conflit de salle
        if (id_salle && emploi.id_salle === parseInt(id_salle)) {
          conflicts.hasConflict = true;
          conflicts.salleConflict = {
            salle: emploi.salle?.code || 'Inconnue',
            matiere: emploi.matiere.nom,
            groupe: emploi.groupe.nom,
            heure_debut: emploi.heure_debut,
            heure_fin: emploi.heure_fin,
          };
        }

        // Conflit d'enseignant
        if (id_enseignant && emploi.id_enseignant === parseInt(id_enseignant)) {
          conflicts.hasConflict = true;
          conflicts.enseignantConflict = {
            enseignant: `${emploi.enseignant?.utilisateur?.nom} ${emploi.enseignant?.utilisateur?.prenom}`,
            matiere: emploi.matiere.nom,
            groupe: emploi.groupe.nom,
            salle: emploi.salle?.code || 'Inconnue',
            heure_debut: emploi.heure_debut,
            heure_fin: emploi.heure_fin,
          };
        }

        // Conflit de groupe
        if (id_groupe && emploi.id_groupe === parseInt(id_groupe)) {
          conflicts.hasConflict = true;
          conflicts.groupeConflict = {
            groupe: emploi.groupe.nom,
            matiere: emploi.matiere.nom,
            enseignant: `${emploi.enseignant?.utilisateur?.nom} ${emploi.enseignant?.utilisateur?.prenom}`,
            salle: emploi.salle?.code || 'Inconnue',
            heure_debut: emploi.heure_debut,
            heure_fin: emploi.heure_fin,
          };
        }
      }
    }

    return NextResponse.json(conflicts);
  } catch (error) {
    console.error('❌ Erreur check-conflicts:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la vérification des conflits' },
      { status: 500 }
    );
  }
}
