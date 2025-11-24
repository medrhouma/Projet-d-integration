import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/errorHandler';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    await prisma.evenementInstitutionnel.delete({
      where: { id_evenement: id },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (Number.isNaN(id)) {
      return NextResponse.json({ error: 'ID invalide' }, { status: 400 });
    }

    const body = await request.json();
    const { titre, description, date_debut, date_fin, type, concerne_tous, concerne_departements } = body;

    const updated = await prisma.evenementInstitutionnel.update({
      where: { id_evenement: id },
      data: {
        titre: titre ?? undefined,
        description: description ?? undefined,
        date_debut: date_debut ? new Date(date_debut) : undefined,
        date_fin: date_fin ? new Date(date_fin) : undefined,
        type: type ?? undefined,
        concerne_tous: concerne_tous === undefined ? undefined : Boolean(concerne_tous),
        concerne_departements: concerne_departements ? JSON.stringify(concerne_departements) : undefined,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}