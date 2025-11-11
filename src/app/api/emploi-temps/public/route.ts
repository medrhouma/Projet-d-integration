import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt_tres_securise';

// GET - Récupérer les emplois du temps (accessible par tous les utilisateurs authentifiés)
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const cookieStore = await cookies();
    const token = cookieStore.get('token'); // Utiliser 'token' au lieu de 'auth_token'

    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier le token
    let user: any;
    try {
      user = jwt.verify(token.value, JWT_SECRET) as any;
    } catch (error) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    
    // Récupération des filtres
    const departementId = searchParams.get('departementId');
    const groupeId = searchParams.get('groupeId');
    const enseignantId = searchParams.get('enseignantId');
    const salleId = searchParams.get('salleId');
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');

    // Construction de la requête
    const where: any = {};

    if (departementId) {
      // Filtrer par département via la relation groupe -> niveau -> specialite -> departement
      where.groupe = {
        niveau: {
          specialite: {
            id_departement: parseInt(departementId)
          }
        }
      };
    }

    if (groupeId) {
      where.id_groupe = parseInt(groupeId);
    }

    if (enseignantId) {
      where.id_enseignant = parseInt(enseignantId);
    }

    if (salleId) {
      where.id_salle = parseInt(salleId);
    }

    if (dateDebut || dateFin) {
      where.date = {};
      if (dateDebut) where.date.gte = new Date(dateDebut);
      if (dateFin) where.date.lte = new Date(dateFin);
    }

    const emplois = await prisma.emploiTemps.findMany({
      where,
      include: {
        matiere: {
          include: {
            niveau: {
              include: {
                specialite: {
                  include: {
                    departement: true
                  }
                }
              }
            }
          }
        },
        salle: true,
        groupe: {
          include: {
            niveau: true
          }
        },
        enseignant: {
          include: {
            utilisateur: true,
            departement: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { heure_debut: 'asc' }
      ]
    });

    return NextResponse.json(emplois);
  } catch (error: any) {
    console.error('❌ Erreur GET /api/emploi-temps/public:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des emplois du temps' },
      { status: 500 }
    );
  }
}
