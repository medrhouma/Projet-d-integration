import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';
import { withRoles } from '@/middleware/auth';

/**
 * GET /api/chefs-departement/:id
 * Récupérer les informations d'un chef de département
 * Accessible par: Admin, le chef lui-même
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID invalide' 
        },
        { status: 400 }
      );
    }

    const chefDepartement = await prisma.enseignant.findUnique({
      where: { 
        id_enseignant: id,
        est_chef_departement: true
      },
      include: {
        utilisateur: {
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            email: true,
            identifiant: true,
            role: true
          }
        },
        departement: {
          include: {
            specialites: {
              include: {
                niveaux: {
                  include: {
                    groupes: true,
                    matieres: true
                  }
                }
              }
            },
            enseignants: {
              include: {
                utilisateur: {
                  select: {
                    nom: true,
                    prenom: true,
                    email: true
                  }
                }
              }
            }
          }
        },
        matieres: {
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

    if (!chefDepartement) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Chef de département non trouvé' 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: chefDepartement
    }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/chefs-departement/:id
 * Retirer le statut de chef de département
 * Accessible par: Admin uniquement
 */
export const DELETE = withRoles(['Admin'], async (
  request: NextRequest,
  context: any
) => {
  try {
    const { params } = context;
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID invalide' 
        },
        { status: 400 }
      );
    }

    // Vérifier si l'enseignant existe et est chef
    const enseignant = await prisma.enseignant.findUnique({
      where: { id_enseignant: id },
      include: {
        utilisateur: true
      }
    });

    if (!enseignant) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Enseignant non trouvé' 
        },
        { status: 404 }
      );
    }

    if (!enseignant.est_chef_departement) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Cet enseignant n\'est pas chef de département' 
        },
        { status: 400 }
      );
    }

    // Retirer le statut de chef dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour l'enseignant
      const updatedEnseignant = await tx.enseignant.update({
        where: { id_enseignant: id },
        data: {
          est_chef_departement: false
        }
      });

      // Mettre à jour le rôle de l'utilisateur
      await tx.utilisateur.update({
        where: { id_utilisateur: id },
        data: {
          role: 'Enseignant'
        }
      });

      return updatedEnseignant;
    });

    return NextResponse.json({
      success: true,
      message: `${enseignant.utilisateur.prenom} ${enseignant.utilisateur.nom} n'est plus chef de département`,
      data: result
    }, { status: 200 });

  } catch (error) {
    return handleApiError(error);
  }
});
