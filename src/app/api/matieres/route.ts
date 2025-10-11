import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// GET - Récupérer toutes les matières
export async function GET(request: NextRequest) {
  try {
    const matieres = await prisma.matiere.findMany({
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
            },
            departement: true
          }
        }
      },
      orderBy: {
        nom: 'asc'
      }
    });

    return NextResponse.json(matieres, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Créer une nouvelle matière
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, id_niveau, id_enseignant } = body;

    if (!nom || !id_niveau || !id_enseignant) {
      return NextResponse.json(
        { error: 'Le nom, le niveau et l\'enseignant sont requis' },
        { status: 400 }
      );
    }

    const matiere = await prisma.matiere.create({
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

    return NextResponse.json(matiere, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
