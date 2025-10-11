import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// GET - Récupérer une spécialité par ID
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

    const specialite = await prisma.specialite.findUnique({
      where: { id_specialite: id },
      include: {
        departement: true,
        niveaux: true,
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

    if (!specialite) {
      return NextResponse.json(
        { error: 'Spécialité non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(specialite, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Mettre à jour une spécialité
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nom, id_departement } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    if (!nom || !id_departement) {
      return NextResponse.json(
        { error: 'Le nom et le département sont requis' },
        { status: 400 }
      );
    }

    const specialite = await prisma.specialite.update({
      where: { id_specialite: id },
      data: {
        nom,
        id_departement: parseInt(id_departement)
      },
      include: {
        departement: true,
        niveaux: true
      }
    });

    return NextResponse.json(specialite, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Supprimer une spécialité
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

    await prisma.specialite.delete({
      where: { id_specialite: id }
    });

    return NextResponse.json(
      { message: 'Spécialité supprimée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
