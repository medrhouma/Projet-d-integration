import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

// POST - Ajouter manuellement une absence d'enseignant (chef de département)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    if (decoded.role !== 'ChefDepartement') {
      return NextResponse.json({ error: 'Accès réservé aux chefs de département' }, { status: 403 });
    }

    const body = await request.json();
    const { id_enseignant, date, heure_debut, heure_fin, motif, statut } = body;

    if (!id_enseignant || !date || !heure_debut || !heure_fin) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Récupérer le département du chef
    const chef = await prisma.enseignant.findFirst({
      where: {
        utilisateur: {
          id_utilisateur: decoded.userId
        },
        est_chef_departement: true
      }
    });

    if (!chef || !chef.id_departement) {
      return NextResponse.json({ error: 'Chef de département non trouvé' }, { status: 404 });
    }

    // Vérifier que l'enseignant est dans le même département
    const enseignant = await prisma.enseignant.findUnique({
      where: { id_enseignant: parseInt(id_enseignant) }
    });

    if (!enseignant || enseignant.id_departement !== chef.id_departement) {
      return NextResponse.json({ 
        error: 'Enseignant non trouvé ou pas dans votre département' 
      }, { status: 403 });
    }

    // Créer une séance temporaire pour l'absence (ou trouver une existante)
    // Pour simplifier, on cherche d'abord une séance correspondante dans l'emploi du temps
    const dateObj = new Date(date);
    const emploiExistant = await prisma.emploiTemps.findFirst({
      where: {
        id_enseignant: parseInt(id_enseignant),
        date: dateObj,
        heure_debut: heure_debut + ':00',
        heure_fin: heure_fin + ':00'
      }
    });

    let id_emploi: number;

    if (emploiExistant) {
      id_emploi = emploiExistant.id_emploi;
    } else {
      // Créer une séance temporaire (marqueur d'absence sans cours réel)
      // Il faut une matière, une salle et un groupe par défaut
      const matiereDefaut = await prisma.matiere.findFirst({
        where: {
          niveau: {
            specialite: {
              id_departement: chef.id_departement
            }
          }
        }
      });

      const groupeDefaut = await prisma.groupe.findFirst({
        where: {
          niveau: {
            specialite: {
              id_departement: chef.id_departement
            }
          }
        }
      });

      const salleDefaut = await prisma.salle.findFirst();

      if (!matiereDefaut || !salleDefaut || !groupeDefaut) {
        return NextResponse.json({ 
          error: 'Configuration incomplète: matière, salle ou groupe manquant' 
        }, { status: 500 });
      }

      const nouvelEmploi = await prisma.emploiTemps.create({
        data: {
          date: dateObj,
          heure_debut: heure_debut + ':00',
          heure_fin: heure_fin + ':00',
          id_enseignant: parseInt(id_enseignant),
          id_matiere: matiereDefaut.id_matiere,
          id_salle: salleDefaut.id_salle,
          id_groupe: groupeDefaut.id_groupe,
        }
      });

      id_emploi = nouvelEmploi.id_emploi;
    }

    // Vérifier si une absence existe déjà
    const absenceExistante = await prisma.absenceEnseignant.findFirst({
      where: {
        id_emploi: id_emploi,
        id_enseignant: parseInt(id_enseignant)
      }
    });

    if (absenceExistante) {
      return NextResponse.json(
        { error: 'Une absence existe déjà pour cette séance' },
        { status: 409 }
      );
    }

    // Créer l'absence
    const absence = await prisma.absenceEnseignant.create({
      data: {
        id_emploi: id_emploi,
        id_enseignant: parseInt(id_enseignant),
        motif: motif || null,
        statut: statut || 'NonJustifiee'
      },
      include: {
        enseignant: {
          include: {
            utilisateur: true
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      absence,
      message: 'Absence enregistrée avec succès'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Erreur POST /api/absences/enseignants/manuel:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de l\'absence' },
      { status: 500 }
    );
  }
}
