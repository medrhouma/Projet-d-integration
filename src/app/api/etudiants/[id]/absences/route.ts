import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/etudiants/[id]/absences - Récupérer les absences d'un étudiant
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params;
    const id_etudiant = parseInt(idParam);

    if (isNaN(id_etudiant)) {
      return NextResponse.json(
        { error: 'ID étudiant invalide' },
        { status: 400 }
      );
    }

    // Vérifier si l'étudiant existe
    const etudiant = await prisma.etudiant.findUnique({
      where: { id_etudiant }
    });

    if (!etudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Récupérer toutes les absences de l'étudiant
    const absences = await prisma.absence.findMany({
      where: { id_etudiant },
      include: {
        emploi_temps: {
          include: {
            matiere: {
              select: {
                nom: true
              }
            },
            salle: {
              select: {
                code: true,
                type: true
              }
            },
            groupe: {
              select: {
                nom: true
              }
            },
            enseignant: {
              select: {
                matricule: true,
                utilisateur: {
                  select: {
                    nom: true,
                    prenom: true
                  }
                }
              }
            }
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
