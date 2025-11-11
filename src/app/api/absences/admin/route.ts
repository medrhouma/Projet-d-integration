import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

// GET - Récupérer toutes les absences (Admin uniquement)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    if (decoded.role !== 'Admin') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const absences = await prisma.absence.findMany({
      include: {
        etudiant: {
          include: {
            utilisateur: true,
            groupe: {
              include: {
                niveau: true
              }
            }
          }
        },
        emploi_temps: {
          include: {
            matiere: true,
            salle: true,
            enseignant: {
              include: {
                utilisateur: true
              }
            }
          }
        }
      },
      orderBy: [
        { emploi_temps: { date: 'desc' } },
        { emploi_temps: { heure_debut: 'desc' } }
      ]
    });

    return NextResponse.json(absences);

  } catch (error: any) {
    console.error('❌ Erreur GET /api/absences/admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des absences' },
      { status: 500 }
    );
  }
}

// PUT - Modifier le statut d'une absence (Admin uniquement)
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    if (decoded.role !== 'Admin') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const body = await request.json();
    const { id_absence, statut, motif } = body;

    if (!id_absence) {
      return NextResponse.json({ error: 'id_absence requis' }, { status: 400 });
    }

    const absence = await prisma.absence.update({
      where: { id_absence: parseInt(id_absence) },
      data: {
        statut: statut || undefined,
        motif: motif !== undefined ? motif : undefined
      },
      include: {
        etudiant: {
          include: {
            utilisateur: true
          }
        },
        emploi_temps: {
          include: {
            matiere: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, absence });

  } catch (error: any) {
    console.error('❌ Erreur PUT /api/absences/admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la modification de l\'absence' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une absence (Admin uniquement)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    if (decoded.role !== 'Admin') {
      return NextResponse.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id_absence = searchParams.get('id_absence');

    if (!id_absence) {
      return NextResponse.json({ error: 'id_absence requis' }, { status: 400 });
    }

    await prisma.absence.delete({
      where: { id_absence: parseInt(id_absence) }
    });

    return NextResponse.json({ success: true, message: 'Absence supprimée' });

  } catch (error: any) {
    console.error('❌ Erreur DELETE /api/absences/admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'absence' },
      { status: 500 }
    );
  }
}
