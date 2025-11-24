import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { handleApiError } from '@/lib/errorHandler';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const r = await prisma.ajustementEmploiTemps.findUnique({ where: { id_ajustement: id } });
    if (!r) return NextResponse.json({ error: 'Ajustement introuvable' }, { status: 404 });
    return NextResponse.json(r);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await request.json();
    const upd = await prisma.ajustementEmploiTemps.update({ where: { id_ajustement: id }, data: body });
    return NextResponse.json(upd);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    await prisma.ajustementEmploiTemps.delete({ where: { id_ajustement: id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
