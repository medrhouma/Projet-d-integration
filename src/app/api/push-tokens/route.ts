import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notificationService';

export async function POST(request: NextRequest) {
  try {
    const { id_etudiant, token, device_type } = await request.json();

    if (!id_etudiant || !token) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      );
    }

    const result = await NotificationService.enregistrerPushToken(
      id_etudiant,
      token,
      device_type || 'web'
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}