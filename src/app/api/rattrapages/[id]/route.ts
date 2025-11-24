import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/errorHandler';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const r = await prisma.rattrapage.findUnique({
      where: { id_rattrapage: id },
      include: { groupes: { include: { groupe: true } }, matiere: true, enseignant: true, salle: true },
    });
    if (!r) return NextResponse.json({ error: 'Rattrapage introuvable' }, { status: 404 });
    return NextResponse.json(r);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const upd = await prisma.rattrapage.update({
      where: { id_rattrapage: id },
      data: body,
    });
    return NextResponse.json(upd);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    await prisma.rattrapage.delete({ where: { id_rattrapage: id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
