import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withChefDepartement, AuthUser, canAccessDepartement } from '@/middleware/auth';

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
      const dateObj = date ? new Date(date) : undefined;
      const heureDebutObj = heure_debut ? new Date(heure_debut) : undefined;
      const heureFinObj = heure_fin ? new Date(heure_fin) : undefined;

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
