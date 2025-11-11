import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// DELETE - Supprimer une absence
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id_absence = parseInt(idParam);

    if (isNaN(id_absence)) {
      return NextResponse.json(
        { error: 'ID absence invalide' },
        { status: 400 }
      );
    }

    // Vérifier si l'absence existe
    const absence = await prisma.absence.findUnique({
      where: { id_absence }
    });

    if (!absence) {
      return NextResponse.json(
        { error: 'Absence non trouvée' },
        { status: 404 }
      );
    }

    // Supprimer l'absence
    await prisma.absence.delete({
      where: { id_absence }
    });

    return NextResponse.json({ 
      message: 'Absence supprimée avec succès' 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'absence:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET - Récupérer une absence spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id_absence = parseInt(idParam);

    if (isNaN(id_absence)) {
      return NextResponse.json(
        { error: 'ID absence invalide' },
        { status: 400 }
      );
    }

    const absence = await prisma.absence.findUnique({
      where: { id_absence },
      include: {
        etudiant: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        emploi_temps: {
          include: {
            matiere: true,
            salle: true,
            groupe: true
          }
        }
      }
    });

    if (!absence) {
      return NextResponse.json(
        { error: 'Absence non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json(absence);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'absence:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
