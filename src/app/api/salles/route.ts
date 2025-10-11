import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// GET - Récupérer toutes les salles
export async function GET(request: NextRequest) {
  try {
    const salles = await prisma.salle.findMany({
      orderBy: {
        code: 'asc'
      }
    });

    return NextResponse.json(salles, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Créer une nouvelle salle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, type, capacite } = body;

    if (!code || !type || !capacite) {
      return NextResponse.json(
        { error: 'Le code, le type et la capacité sont requis' },
        { status: 400 }
      );
    }

    const salle = await prisma.salle.create({
      data: {
        code,
        type,
        capacite: parseInt(capacite)
      }
    });

    return NextResponse.json(salle, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
