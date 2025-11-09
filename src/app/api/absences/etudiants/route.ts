import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

// GET - Récupérer les absences pour une séance (enseignant)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;
    
    const { searchParams } = new URL(request.url);
    const id_emploi = searchParams.get('id_emploi');
    const id_etudiant = searchParams.get('id_etudiant');

    // Si c'est un étudiant, récupérer SES absences
    if (decoded.role === 'Etudiant') {
      const absences = await prisma.absence.findMany({
        where: {
          id_etudiant: decoded.etudiant?.id_etudiant || parseInt(id_etudiant || '0')
        },
        include: {
          emploi_temps: {
            include: {
              matiere: true,
              salle: true,
              enseignant: {
                include: {
                  utilisateur: true
                }
              }
            }
          }
        },
        orderBy: {
          id_absence: 'desc'
        }
      });

      return NextResponse.json({ success: true, absences });
    }

    // Si c'est un enseignant, récupérer les absences d'une séance spécifique
    if (decoded.role === 'Enseignant' && id_emploi) {
      const emploi = await prisma.emploiTemps.findUnique({
        where: { id_emploi: parseInt(id_emploi) },
        include: {
          groupe: {
            include: {
              etudiants: {
                include: {
                  utilisateur: true
                }
              }
            }
          }
        }
      });

      if (!emploi) {
        return NextResponse.json({ error: 'Séance non trouvée' }, { status: 404 });
      }

      // Vérifier que c'est bien sa séance
      if (emploi.id_enseignant !== decoded.enseignant?.id_enseignant) {
        return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
      }

      // Récupérer les absences déjà enregistrées
      const absences = await prisma.absence.findMany({
        where: { id_emploi: parseInt(id_emploi) },
        include: {
          etudiant: {
            include: {
              utilisateur: true
            }
          }
        }
      });

      // Préparer la liste des étudiants avec leur statut d'absence
      const etudiants = emploi.groupe.etudiants.map(etudiant => {
        const absence = absences.find(a => a.id_etudiant === etudiant.id_etudiant);
        return {
          id_etudiant: etudiant.id_etudiant,
          nom: etudiant.utilisateur.nom,
          prenom: etudiant.utilisateur.prenom,
          numero_inscription: etudiant.numero_inscription,
          absent: !!absence,
          absence: absence ? {
            id_absence: absence.id_absence,
            statut: absence.statut,
            motif: absence.motif
          } : null
        };
      });

      return NextResponse.json({
        success: true,
        emploi: {
          id_emploi: emploi.id_emploi,
          date: emploi.date,
          heure_debut: emploi.heure_debut,
          heure_fin: emploi.heure_fin
        },
        etudiants
      });
    }

    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });

  } catch (error: any) {
    console.error('❌ Erreur GET /api/absences/etudiants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des absences' },
      { status: 500 }
    );
  }
}

// POST - Marquer un étudiant absent (enseignant uniquement)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    if (decoded.role !== 'Enseignant') {
      return NextResponse.json({ error: 'Accès réservé aux enseignants' }, { status: 403 });
    }

    const body = await request.json();
    const { id_emploi, id_etudiant, motif, statut } = body;

    if (!id_emploi || !id_etudiant) {
      return NextResponse.json(
        { error: 'id_emploi et id_etudiant requis' },
        { status: 400 }
      );
    }

    // Vérifier que la séance appartient à cet enseignant
    const emploi = await prisma.emploiTemps.findUnique({
      where: { id_emploi: parseInt(id_emploi) }
    });

    if (!emploi) {
      return NextResponse.json({ error: 'Séance non trouvée' }, { status: 404 });
    }

    if (emploi.id_enseignant !== decoded.enseignant?.id_enseignant) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Vérifier si une absence existe déjà
    const absenceExistante = await prisma.absence.findFirst({
      where: {
        id_emploi: parseInt(id_emploi),
        id_etudiant: parseInt(id_etudiant)
      }
    });

    if (absenceExistante) {
      return NextResponse.json(
        { error: 'Absence déjà enregistrée' },
        { status: 409 }
      );
    }

    // Créer l'absence
    const absence = await prisma.absence.create({
      data: {
        id_emploi: parseInt(id_emploi),
        id_etudiant: parseInt(id_etudiant),
        motif: motif || null,
        statut: statut || 'NonJustifiee'
      },
      include: {
        etudiant: {
          include: {
            utilisateur: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, absence }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Erreur POST /api/absences/etudiants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de l\'absence' },
      { status: 500 }
    );
  }
}

// DELETE - Annuler une absence (enseignant uniquement)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    if (decoded.role !== 'Enseignant') {
      return NextResponse.json({ error: 'Accès réservé aux enseignants' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id_absence = searchParams.get('id_absence');

    if (!id_absence) {
      return NextResponse.json({ error: 'id_absence requis' }, { status: 400 });
    }

    // Récupérer l'absence avec la séance
    const absence = await prisma.absence.findUnique({
      where: { id_absence: parseInt(id_absence) },
      include: {
        emploi_temps: true
      }
    });

    if (!absence) {
      return NextResponse.json({ error: 'Absence non trouvée' }, { status: 404 });
    }

    // Vérifier que la séance appartient à cet enseignant
    if (absence.emploi_temps.id_enseignant !== decoded.enseignant?.id_enseignant) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Supprimer l'absence
    await prisma.absence.delete({
      where: { id_absence: parseInt(id_absence) }
    });

    return NextResponse.json({ success: true, message: 'Absence annulée' });

  } catch (error: any) {
    console.error('❌ Erreur DELETE /api/absences/etudiants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'absence' },
      { status: 500 }
    );
  }
}
