import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-key';

// GET - Récupérer tous les messages avec un utilisateur spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const { userId } = await params;
    
    // Validation du userId
    if (!userId || userId === 'undefined') {
      return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 400 });
    }
    
    const otherUserId = parseInt(userId);
    
    if (isNaN(otherUserId)) {
      return NextResponse.json({ error: 'ID utilisateur invalide' }, { status: 400 });
    }

    // Récupérer tous les messages entre les deux utilisateurs
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          {
            id_expediteur: decoded.userId,
            id_destinataire: otherUserId,
          },
          {
            id_expediteur: otherUserId,
            id_destinataire: decoded.userId,
          },
        ],
      },
      include: {
        expediteur: {
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            role: true,
          },
        },
        destinataire: {
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            role: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Marquer les messages reçus comme lus
    await prisma.message.updateMany({
      where: {
        id_expediteur: otherUserId,
        id_destinataire: decoded.userId,
        lu: false,
      },
      data: {
        lu: true,
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Erreur lors de la récupération des messages:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
