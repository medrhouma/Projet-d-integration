import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// GET - Récupérer une salle par ID
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

    const salle = await prisma.salle.findUnique({
      where: { id_salle: id }
    });

    if (!salle) {
      return NextResponse.json(
        { error: 'Salle non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(salle, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Mettre à jour une salle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { code, type, capacite } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    if (!code || !type || !capacite) {
      return NextResponse.json(
        { error: 'Le code, le type et la capacité sont requis' },
        { status: 400 }
      );
    }

    const salle = await prisma.salle.update({
      where: { id_salle: id },
      data: {
        code,
        type,
        capacite: parseInt(capacite)
      }
    });

    return NextResponse.json(salle, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Supprimer une salle
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

    await prisma.salle.delete({
      where: { id_salle: id }
    });

    return NextResponse.json(
      { message: 'Salle supprimée avec succès' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
