import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// GET - Récupérer tous les groupes
export async function GET(request: NextRequest) {
  try {
    const groupes = await prisma.groupe.findMany({
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
      },
      orderBy: {
        nom: 'asc'
      }
    });

    return NextResponse.json(groupes, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Créer un nouveau groupe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, id_niveau } = body;

    if (!nom || !id_niveau) {
      return NextResponse.json(
        { error: 'Le nom et le niveau sont requis' },
        { status: 400 }
      );
    }

    const groupe = await prisma.groupe.create({
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

    return NextResponse.json(groupe, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
