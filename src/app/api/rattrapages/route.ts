import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/errorHandler';

// GET - liste simple de rattrapages
export async function GET() {
  try {
    const rattrapages = await prisma.rattrapage.findMany({
      include: {
        matiere: true,
        enseignant: true,
        salle: true,
        planificateur: {
          select: { id_utilisateur: true, nom: true, prenom: true },
        },
        groupes: {
          include: { groupe: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(rattrapages);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - créer un rattrapage
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id_matiere,
      id_enseignant,
      id_salle,
      date,
      heure_debut,
      heure_fin,
      motif,
      id_planificateur,
      groupes,
      id_emploi_annule,
      id_evenement,
    } = body;

    if (!id_matiere || !id_enseignant || !id_salle || !date || !heure_debut || !heure_fin || !motif || !id_planificateur) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const created = await prisma.rattrapage.create({
      data: {
        id_matiere,
        id_enseignant,
        id_salle,
        date: new Date(date),
        heure_debut: new Date(heure_debut),
        heure_fin: new Date(heure_fin),
        motif,
        id_planificateur,
        id_emploi_annule: id_emploi_annule || null,
        id_evenement: id_evenement || null,
      },
    });

    // lier les groupes si fournis
    if (Array.isArray(groupes) && groupes.length > 0) {
      const data = groupes.map((gId: number) => ({ id_rattrapage: created.id_rattrapage, id_groupe: gId }));
      await prisma.rattrapageGroupe.createMany({ data, skipDuplicates: true });
    }

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
