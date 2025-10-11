import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// GET - Récupérer tous les départements
export async function GET(request: NextRequest) {
  try {
    const departements = await prisma.departement.findMany({
      include: {
        specialites: true,
        enseignants: {
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

    return NextResponse.json(departements, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Créer un nouveau département
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom } = body;

    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom du département est requis' },
        { status: 400 }
      );
    }

    const departement = await prisma.departement.create({
      data: {
        nom
      },
      include: {
        specialites: true,
        enseignants: {
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

    return NextResponse.json(departement, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
