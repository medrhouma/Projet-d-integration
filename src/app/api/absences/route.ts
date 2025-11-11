import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST - Créer une absence
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id_etudiant, id_emploi, statut, motif } = body;

    if (!id_etudiant || !id_emploi) {
      return NextResponse.json(
        { error: 'id_etudiant et id_emploi sont requis' },
        { status: 400 }
      );
    }

    // Vérifier si une absence existe déjà pour cet étudiant et cet emploi
    const existingAbsence = await prisma.absence.findFirst({
      where: {
        id_etudiant: parseInt(id_etudiant),
        id_emploi: parseInt(id_emploi)
      }
    });

    if (existingAbsence) {
      return NextResponse.json(
        { error: 'Une absence existe déjà pour cet étudiant et cette séance' },
        { status: 400 }
      );
    }

    // Créer l'absence
    const absence = await prisma.absence.create({
      data: {
        id_etudiant: parseInt(id_etudiant),
        id_emploi: parseInt(id_emploi),
        statut: statut || 'NonJustifiee',
        motif: motif || null
      },
      include: {
        etudiant: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        emploi_temps: {
          include: {
            matiere: true,
            salle: true,
            groupe: true
          }
        }
      }
    });

    return NextResponse.json(absence, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de l\'absence:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET - Récupérer les absences avec filtres optionnels
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id_etudiant = searchParams.get('id_etudiant');
    const id_emploi = searchParams.get('id_emploi');

    const where: any = {};
    
    if (id_etudiant) {
      where.id_etudiant = parseInt(id_etudiant);
    }
    
    if (id_emploi) {
      where.id_emploi = parseInt(id_emploi);
    }

    const absences = await prisma.absence.findMany({
      where,
      include: {
        etudiant: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true
              }
            }
          }
        },
        emploi_temps: {
          include: {
            matiere: true,
            salle: true,
            groupe: true
          }
        }
      },
      orderBy: {
        id_absence: 'desc'
      }
    });

    return NextResponse.json(absences);
  } catch (error) {
    console.error('Erreur lors de la récupération des absences:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
