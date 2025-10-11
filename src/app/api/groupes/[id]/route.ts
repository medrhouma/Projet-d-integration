import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// GET - Récupérer un groupe par ID
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

    const groupe = await prisma.groupe.findUnique({
      where: { id_groupe: id },
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
        etudiants: {
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

    if (!groupe) {
      return NextResponse.json(
        { error: 'Groupe non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(groupe, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Mettre à jour un groupe
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nom, id_niveau } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    if (!nom || !id_niveau) {
      return NextResponse.json(
        { error: 'Le nom et le niveau sont requis' },
        { status: 400 }
      );
    }

    const groupe = await prisma.groupe.update({
      where: { id_groupe: id },
      data: {
        nom,
        id_niveau: parseInt(id_niveau)
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
        }
      }
    });

    return NextResponse.json(groupe, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Supprimer un groupe
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

    await prisma.groupe.delete({
      where: { id_groupe: id }
    });

    return NextResponse.json(
      { message: 'Groupe supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
