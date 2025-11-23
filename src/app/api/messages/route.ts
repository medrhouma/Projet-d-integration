import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-key';

// GET - Récupérer les conversations de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };

    // Récupérer toutes les conversations (messages uniques avec chaque utilisateur)
    const conversations = await prisma.$queryRaw<any[]>`
      SELECT DISTINCT
        CASE 
          WHEN m.id_expediteur = ${decoded.userId} THEN m.id_destinataire
          ELSE m.id_expediteur
        END as user_id,
        u.nom,
        u.prénom as prenom,
        u.rôle as role,
        (SELECT contenu FROM message m2 
         WHERE (m2.id_expediteur = user_id AND m2.id_destinataire = ${decoded.userId})
            OR (m2.id_destinataire = user_id AND m2.id_expediteur = ${decoded.userId})
         ORDER BY m2.date DESC LIMIT 1) as dernier_message,
        (SELECT date FROM message m2 
         WHERE (m2.id_expediteur = user_id AND m2.id_destinataire = ${decoded.userId})
            OR (m2.id_destinataire = user_id AND m2.id_expediteur = ${decoded.userId})
         ORDER BY m2.date DESC LIMIT 1) as derniere_date,
        (SELECT COUNT(*) FROM message m3 
         WHERE m3.id_expediteur = user_id 
           AND m3.id_destinataire = ${decoded.userId} 
           AND m3.lu = false) as messages_non_lus
      FROM message m
      JOIN utilisateur u ON u.id_utilisateur = CASE 
        WHEN m.id_expediteur = ${decoded.userId} THEN m.id_destinataire
        ELSE m.id_expediteur
      END
      WHERE m.id_expediteur = ${decoded.userId} OR m.id_destinataire = ${decoded.userId}
      ORDER BY derniere_date DESC
    `;

    // Convertir les BigInt en nombres
    const conversationsFormatted = conversations.map(conv => ({
      ...conv,
      user_id: Number(conv.user_id),
      messages_non_lus: Number(conv.messages_non_lus),
    }));

    return NextResponse.json(conversationsFormatted);
  } catch (error: any) {
    console.error('Erreur lors de la récupération des conversations:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message 
    }, { status: 500 });
  }
}

// POST - Envoyer un nouveau message
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    const body = await request.json();
    console.log('POST /api/messages - Body:', body);
    console.log('POST /api/messages - User ID:', decoded.userId);
    
    const { id_destinataire, contenu } = body;

    if (!id_destinataire || !contenu) {
      console.error('Validation error - Missing fields:', { id_destinataire, contenu });
      return NextResponse.json(
        { error: 'Destinataire et contenu requis' },
        { status: 400 }
      );
    }

    const destinataireId = parseInt(id_destinataire);
    if (isNaN(destinataireId)) {
      console.error('Validation error - Invalid ID:', id_destinataire);
      return NextResponse.json(
        { error: 'ID destinataire invalide' },
        { status: 400 }
      );
    }

    console.log('Creating message:', { id_expediteur: decoded.userId, id_destinataire: destinataireId, contenu });

    const message = await prisma.message.create({
      data: {
        id_expediteur: decoded.userId,
        id_destinataire: destinataireId,
        contenu,
      },
      include: {
        expediteur: {
          select: {
            nom: true,
            prenom: true,
            role: true,
          },
        },
        destinataire: {
          select: {
            nom: true,
            prenom: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi du message:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      meta: error.meta,
    });
    return NextResponse.json(
      { 
        error: 'Erreur serveur', 
        details: error.message,
        code: error.code 
      }, 
      { status: 500 }
    );
  }
}
