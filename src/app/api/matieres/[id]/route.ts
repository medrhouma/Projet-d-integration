import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// GET - Récupérer une matière par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const matiere = await prisma.matiere.findUnique({
      where: { id_matiere: id },
      include: {
        niveau: {
          include: {
            specialite: {
              include: {
                departement: true
              }
            }
          }
        },
        enseignant: {
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
    });

    if (!matiere) {
      return NextResponse.json(
        { error: 'Matière non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(matiere, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Mettre à jour une matière
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nom, id_niveau, id_enseignant } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    if (!nom || !id_niveau || !id_enseignant) {
      return NextResponse.json(
        { error: 'Le nom, le niveau et l\'enseignant sont requis' },
        { status: 400 }
      );
    }

    const matiere = await prisma.matiere.update({
      where: { id_matiere: id },
      data: {
        nom,
        id_niveau: parseInt(id_niveau),
        id_enseignant: parseInt(id_enseignant)
      },
      include: {
        niveau: {
          include: {
            specialite: {
              include: {
                departement: true
              }
            }
          }
        },
        enseignant: {
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
    });

    return NextResponse.json(matiere, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Supprimer une matière
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    await prisma.matiere.delete({
      where: { id_matiere: id }
    });

    return NextResponse.json(
      { message: 'Matière supprimée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
