import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/errorHandler';

export async function GET() {
  try {
    const list = await prisma.ajustementEmploiTemps.findMany({
      include: { auteur: { select: { id_utilisateur: true, nom: true, prenom: true } }, rattrapage: true, emploi_origine: true },
      orderBy: { date_creation: 'desc' },
    });
    return NextResponse.json(list);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_emploi_origine, id_rattrapage, type_ajustement, anciennes_valeurs, nouvelles_valeurs, motif, id_auteur } = body;

    if (!id_emploi_origine || !type_ajustement || !motif || !id_auteur) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const created = await prisma.ajustementEmploiTemps.create({
      data: {
        id_emploi_origine,
        id_rattrapage: id_rattrapage || null,
        type_ajustement,
        anciennes_valeurs: anciennes_valeurs ? JSON.stringify(anciennes_valeurs) : null,
        nouvelles_valeurs: nouvelles_valeurs ? JSON.stringify(nouvelles_valeurs) : null,
        motif,
        id_auteur,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
