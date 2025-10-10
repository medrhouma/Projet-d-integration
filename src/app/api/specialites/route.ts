import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// GET - Récupérer toutes les spécialités
export async function GET(request: NextRequest) {
  try {
    const specialites = await prisma.specialite.findMany({
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
      },
      orderBy: {
        nom: 'asc'
      }
    });

    return NextResponse.json(specialites, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Créer une nouvelle spécialité
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, id_departement } = body;

    if (!nom || !id_departement) {
      return NextResponse.json(
        { error: 'Le nom et le département sont requis' },
        { status: 400 }
      );
    }

    const specialite = await prisma.specialite.create({
      data: {
        nom,
        id_departement: parseInt(id_departement)
      },
      include: {
        departement: true,
        niveaux: true
      }
    });

    return NextResponse.json(specialite, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
