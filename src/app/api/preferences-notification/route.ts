import { NextRequest, NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/notificationService';

// GET - Récupérer les préférences
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

    const preferences = await NotificationService.obtenirPreferences(
      parseInt(id_etudiant)
    );

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les préférences
export async function PUT(request: NextRequest) {
  try {
    const { id_etudiant, ...donnees } = await request.json();

    if (!id_etudiant) {
      return NextResponse.json(
        { error: 'ID étudiant manquant' },
        { status: 400 }
      );
    }

    const preferences = await NotificationService.mettreAJourPreferences(
      id_etudiant,
      donnees
    );

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}