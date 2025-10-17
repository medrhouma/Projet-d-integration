import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';
import { withRoles } from '@/middleware/auth';

/**
 * GET /api/chefs-departement
 * Récupérer tous les chefs de département
 * Accessible par: Admin uniquement
 */
export const GET = withRoles(['Admin'], async (request: NextRequest) => {
  try {
    const chefsDepartement = await prisma.enseignant.findMany({
      where: {
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
        departement: true,
        matieres: {
          include: {
            niveau: {
              include: {
                specialite: true
              }
            }
          }
        }
      },
      orderBy: {
        utilisateur: {
          nom: 'asc'
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: chefsDepartement,
      count: chefsDepartement.length
    }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
});

/**
 * POST /api/chefs-departement/assign
 * Assigner un enseignant comme chef de département
 * Accessible par: Admin uniquement
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_enseignant, id_departement } = body;

    if (!id_enseignant || !id_departement) {
      return NextResponse.json(
        { 
          success: false,
          error: 'L\'ID de l\'enseignant et l\'ID du département sont requis' 
        },
        { status: 400 }
      );
    }

    // Vérifier si l'enseignant existe
    const enseignant = await prisma.enseignant.findUnique({
      where: { id_enseignant: parseInt(id_enseignant) },
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

    // Vérifier si le département existe
    const departement = await prisma.departement.findUnique({
      where: { id_departement: parseInt(id_departement) }
    });

    if (!departement) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Département non trouvé' 
        },
        { status: 404 }
      );
    }

    // Vérifier s'il y a déjà un chef pour ce département
    const chefExistant = await prisma.enseignant.findFirst({
      where: {
        id_departement: parseInt(id_departement),
        est_chef_departement: true,
        id_enseignant: { not: parseInt(id_enseignant) }
      },
      include: {
        utilisateur: true
      }
    });

    if (chefExistant) {
      return NextResponse.json(
        { 
          success: false,
          error: `Le département ${departement.nom} a déjà un chef: ${chefExistant.utilisateur.prenom} ${chefExistant.utilisateur.nom}`,
          existingChef: {
            id: chefExistant.id_enseignant,
            nom: chefExistant.utilisateur.nom,
            prenom: chefExistant.utilisateur.prenom
          }
        },
        { status: 409 }
      );
    }

    // Mettre à jour l'enseignant dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour l'enseignant
      const updatedEnseignant = await tx.enseignant.update({
        where: { id_enseignant: parseInt(id_enseignant) },
        data: {
          est_chef_departement: true,
          id_departement: parseInt(id_departement),
          departement_nom: departement.nom
        }
      });

      // Mettre à jour le rôle de l'utilisateur
      await tx.utilisateur.update({
        where: { id_utilisateur: parseInt(id_enseignant) },
        data: {
          role: 'ChefDepartement'
        }
      });

      return updatedEnseignant;
    });

    return NextResponse.json({
      success: true,
      message: `${enseignant.utilisateur.prenom} ${enseignant.utilisateur.nom} a été nommé chef du département ${departement.nom}`,
      data: result
    }, { status: 200 });

  } catch (error) {
    return handleApiError(error);
  }
}
