import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notificationService';

// GET - Récupérer les notifications
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id_etudiant = searchParams.get('id_etudiant');

    if (!id_etudiant) {
      return NextResponse.json(
        { error: 'ID étudiant manquant' },
        { status: 400 }
      );
    }

    const notifications =
      await NotificationService.obtenirNonLues(parseInt(id_etudiant));

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Envoyer une notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const notification = await NotificationService.envoyer(body);

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}