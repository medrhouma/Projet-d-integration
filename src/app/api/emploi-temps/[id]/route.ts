import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withChefDepartement, AuthUser, canAccessDepartement } from '@/middleware/auth';

// Fonction pour détecter les conflits d'emploi du temps
async function detecterConflits(data: {
  date: Date;
  heure_debut: Date;
  heure_fin: Date;
  id_salle?: number;
  id_enseignant?: number;
  id_groupe?: number;
  excludeId?: number;
}) {
  const conflits = [];

  // Convertir les heures en décimal pour la comparaison (ex: 8.5 = 8h30)
  const heureDebutDecimal = data.heure_debut.getUTCHours() + data.heure_debut.getUTCMinutes() / 60;
  const heureFinDecimal = data.heure_fin.getUTCHours() + data.heure_fin.getUTCMinutes() / 60;

  // Récupérer toutes les séances de la même date
  const seancesDuJour = await prisma.emploiTemps.findMany({
    where: {
      date: data.date,
      id_emploi: data.excludeId ? { not: data.excludeId } : undefined,
      OR: [
        { id_salle: data.id_salle },
        { id_enseignant: data.id_enseignant },
        { id_groupe: data.id_groupe }
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

  // Vérifier les conflits manuellement
  for (const seance of seancesDuJour) {
    const seanceDebutDecimal = seance.heure_debut.getUTCHours() + seance.heure_debut.getUTCMinutes() / 60;
    const seanceFinDecimal = seance.heure_fin.getUTCHours() + seance.heure_fin.getUTCMinutes() / 60;

    // Vérifier si les horaires se chevauchent
    const chevauche = (
      (heureDebutDecimal >= seanceDebutDecimal && heureDebutDecimal < seanceFinDecimal) || // Début dans la séance
      (heureFinDecimal > seanceDebutDecimal && heureFinDecimal <= seanceFinDecimal) ||     // Fin dans la séance
      (heureDebutDecimal <= seanceDebutDecimal && heureFinDecimal >= seanceFinDecimal)     // Englobe la séance
    );

    if (!chevauche) continue;

    // Conflit de salle
    if (data.id_salle && seance.id_salle === data.id_salle) {
      conflits.push({
        type: 'salle',
        message: `La salle ${seance.salle.code} est déjà occupée pour ${seance.matiere.nom} (${seance.groupe.nom})`,
        details: seance
      });
    }

    // Conflit d'enseignant
    if (data.id_enseignant && seance.id_enseignant === data.id_enseignant && seance.enseignant) {
      conflits.push({
        type: 'enseignant',
        message: `L'enseignant ${seance.enseignant.utilisateur.nom} ${seance.enseignant.utilisateur.prenom} a déjà cours (${seance.matiere.nom} avec ${seance.groupe.nom})`,
        details: seance
      });
    }

    // Conflit de groupe
    if (data.id_groupe && seance.id_groupe === data.id_groupe) {
      conflits.push({
        type: 'groupe',
        message: `Le groupe ${seance.groupe.nom} a déjà cours (${seance.matiere.nom})`,
        details: seance
      });
    }
  }

  // Retirer les doublons (si une séance cause plusieurs types de conflits)
  const conflitsUniques = conflits.filter((conflit, index, self) =>
    index === self.findIndex((c) => c.details.id_emploi === conflit.details.id_emploi && c.type === conflit.type)
  );

  return conflitsUniques;
}

// DELETE - Supprimer un emploi du temps
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withChefDepartement(async (req: NextRequest, user: AuthUser) => {
    try {
      const id = parseInt(params.id);

      // Récupérer l'emploi pour vérifier les permissions
      const emploi = await prisma.emploiTemps.findUnique({
        where: { id_emploi: id },
        include: {
          matiere: {
            include: {
              niveau: {
                include: {
                  specialite: true
                }
              }
            }
          }
        }
      });

      if (!emploi) {
        return NextResponse.json(
          { error: 'Emploi du temps non trouvé' },
          { status: 404 }
        );
      }

      const departementId = emploi.matiere.niveau.specialite.id_departement;
      if (!canAccessDepartement(user, departementId)) {
        return NextResponse.json(
          { error: 'Accès non autorisé à ce département' },
          { status: 403 }
        );
      }

      // Supprimer l'emploi
      await prisma.emploiTemps.delete({
        where: { id_emploi: id }
      });

      return NextResponse.json({ message: 'Emploi du temps supprimé avec succès' });
    } catch (error: any) {
      console.error('❌ Erreur DELETE /api/emploi-temps/[id]:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'emploi du temps' },
        { status: 500 }
      );
    }
  })(request);
}

// PUT - Modifier un emploi du temps
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withChefDepartement(async (req: NextRequest, user: AuthUser) => {
    try {
      const id = parseInt(params.id);
      const body = await req.json();
      const {
        date,
        heure_debut,
        heure_fin,
        id_matiere,
        id_salle,
        id_groupe,
        id_enseignant
      } = body;

      // Récupérer l'emploi existant
      const emploiExistant = await prisma.emploiTemps.findUnique({
        where: { id_emploi: id },
        include: {
          matiere: {
            include: {
              niveau: {
                include: {
                  specialite: true
                }
              }
            }
          }
        }
      });

      if (!emploiExistant) {
        return NextResponse.json(
          { error: 'Emploi du temps non trouvé' },
          { status: 404 }
        );
      }

      const departementId = emploiExistant.matiere.niveau.specialite.id_departement;
      if (!canAccessDepartement(user, departementId)) {
        return NextResponse.json(
          { error: 'Accès non autorisé à ce département' },
          { status: 403 }
        );
      }

      // Convertir les dates
      const dateObj = date ? new Date(date) : emploiExistant.date;
      const heureDebutObj = heure_debut ? new Date(heure_debut) : emploiExistant.heure_debut;
      const heureFinObj = heure_fin ? new Date(heure_fin) : emploiExistant.heure_fin;

      // Détecter les conflits (en excluant l'emploi actuel)
      const conflits = await detecterConflits({
        date: dateObj,
        heure_debut: heureDebutObj,
        heure_fin: heureFinObj,
        id_salle: id_salle || emploiExistant.id_salle || undefined,
        id_enseignant: id_enseignant || emploiExistant.id_enseignant || undefined,
        id_groupe: id_groupe || emploiExistant.id_groupe,
        excludeId: id
      });

      if (conflits.length > 0) {
        return NextResponse.json(
          { 
            error: 'Conflits détectés',
            conflits
          },
          { status: 409 }
        );
      }

      // Mettre à jour l'emploi
      const emploiMaj = await prisma.emploiTemps.update({
        where: { id_emploi: id },
        data: {
          ...(dateObj && { date: dateObj }),
          ...(heureDebutObj && { heure_debut: heureDebutObj }),
          ...(heureFinObj && { heure_fin: heureFinObj }),
          ...(id_matiere && { id_matiere: parseInt(id_matiere) }),
          ...(id_salle && { id_salle: parseInt(id_salle) }),
          ...(id_groupe && { id_groupe: parseInt(id_groupe) }),
          ...(id_enseignant && { id_enseignant: parseInt(id_enseignant) }),
        },
        include: {
          matiere: true,
          salle: true,
          groupe: true,
          enseignant: {
            include: {
              utilisateur: true
            }
          }
        }
      });

      return NextResponse.json(emploiMaj);
    } catch (error: any) {
      console.error('❌ Erreur PUT /api/emploi-temps/[id]:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la modification de l\'emploi du temps' },
        { status: 500 }
      );
    }
  })(request);
}
