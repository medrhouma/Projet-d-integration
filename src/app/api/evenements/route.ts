import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/errorHandler';

// GET - récupérer événements à venir (date_fin >= now())
export async function GET(request: NextRequest) {
  try {
    const now = new Date();
    const events = await prisma.evenementInstitutionnel.findMany({
      where: {
        date_fin: {
          gte: now,
        },
      },
      include: {
        organisateur: {
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            email: true,
          },
        },
      },
      orderBy: {
        date_debut: 'asc',
      },
    });

    return NextResponse.json(events, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - créer un événement (administratif)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      titre,
      description,
      date_debut,
      date_fin,
      type,
      id_organisateur,
      concerne_tous,
      concerne_departements,
    } = body;

    if (!titre || !date_debut || !date_fin || !type || !id_organisateur) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const evenement = await prisma.evenementInstitutionnel.create({
      data: {
        titre,
        description: description || null,
        date_debut: new Date(date_debut),
        date_fin: new Date(date_fin),
        type,
        id_organisateur,
        concerne_tous: Boolean(concerne_tous),
        concerne_departements: concerne_departements ? JSON.stringify(concerne_departements) : null,
      },
    });

    return NextResponse.json(evenement, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
