import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-key';

// GET - Récupérer le nombre de messages non lus
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };

    const count = await prisma.message.count({
      where: {
        id_destinataire: decoded.userId,
        lu: false,
      },
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Erreur lors du comptage des messages non lus:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
