import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-key';

// GET - récupérer tous les messages entre l'utilisateur authentifié et :id
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const otherIdRaw = params?.id;
    if (!otherIdRaw) return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 });
    const otherUserId = parseInt(otherIdRaw, 10);
    if (isNaN(otherUserId)) return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 400 });

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { id_expediteur: userId, id_destinataire: otherUserId },
          { id_expediteur: otherUserId, id_destinataire: userId },
        ],
      },
      include: {
        expediteur: { select: { id_utilisateur: true, nom: true, prenom: true, role: true } },
        destinataire: { select: { id_utilisateur: true, nom: true, prenom: true, role: true } },
      },
      orderBy: { date: 'asc' },
    });

    // Mark received messages as read
    await prisma.message.updateMany({
      where: { id_expediteur: otherUserId, id_destinataire: userId, lu: false },
      data: { lu: true },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Erreur GET /api/messages/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - envoyer un message à :id
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    const otherIdRaw = params?.id;
    if (!otherIdRaw) return NextResponse.json({ error: 'ID utilisateur manquant' }, { status: 400 });
    const otherUserId = parseInt(otherIdRaw, 10);
    if (isNaN(otherUserId)) return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 400 });

    const body = await request.json();
    const contenu = body?.contenu;
    if (!contenu || String(contenu).trim() === '') return NextResponse.json({ error: 'Contenu vide' }, { status: 400 });

    const message = await prisma.message.create({
      data: { id_expediteur: userId, id_destinataire: otherUserId, contenu },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Erreur POST /api/messages/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
