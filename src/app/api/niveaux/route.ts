import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// GET - Récupérer tous les niveaux
export async function GET(request: NextRequest) {
  try {
    const niveaux = await prisma.niveau.findMany({
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
      },
      orderBy: {
        nom: 'asc'
      }
    });

    return NextResponse.json(niveaux, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Créer un nouveau niveau
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, id_specialite } = body;

    if (!nom || !id_specialite) {
      return NextResponse.json(
        { error: 'Le nom et la spécialité sont requis' },
        { status: 400 }
      );
    }

    const niveau = await prisma.niveau.create({
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

    return NextResponse.json(niveau, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
