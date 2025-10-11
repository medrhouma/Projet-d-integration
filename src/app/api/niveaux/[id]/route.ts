import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// GET - Récupérer un niveau par ID
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

    const niveau = await prisma.niveau.findUnique({
      where: { id_niveau: id },
      include: {
        specialite: {
          include: {
            departement: true
          }
        },
        groupes: true,
        matieres: {
          include: {
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
        }
      }
    });

    if (!niveau) {
      return NextResponse.json(
        { error: 'Niveau non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(niveau, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Mettre à jour un niveau
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nom, id_specialite } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    if (!nom || !id_specialite) {
      return NextResponse.json(
        { error: 'Le nom et la spécialité sont requis' },
        { status: 400 }
      );
    }

    const niveau = await prisma.niveau.update({
      where: { id_niveau: id },
      data: {
        nom,
        id_specialite: parseInt(id_specialite)
      },
      include: {
        specialite: {
          include: {
            departement: true
          }
        },
        groupes: true
      }
    });

    return NextResponse.json(niveau, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Supprimer un niveau
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

    await prisma.niveau.delete({
      where: { id_niveau: id }
    });

    return NextResponse.json(
      { message: 'Niveau supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
