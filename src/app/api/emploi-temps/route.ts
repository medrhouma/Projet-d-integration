import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { withChefDepartement, AuthUser, canAccessDepartement } from '@/middleware/auth';

// Fonction pour détecter les conflits d'emploi du temps
async function detecterConflits(data: {
  date: Date;
  heure_debut: Date;
  heure_fin: Date;
  id_salle?: number;
  id_enseignant?: number;
  id_groupe?: number;
  excludeId?: number;
}) {
  const conflits = [];

  // 1. Conflit de salle (même salle au même moment)
  if (data.id_salle) {
    const conflitSalle = await prisma.emploiTemps.findFirst({
      where: {
        id_salle: data.id_salle,
        date: data.date,
        id_emploi: data.excludeId ? { not: data.excludeId } : undefined,
        OR: [
          {
            AND: [
              { heure_debut: { lte: data.heure_debut } },
              { heure_fin: { gt: data.heure_debut } }
            ]
          },
          {
            AND: [
              { heure_debut: { lt: data.heure_fin } },
              { heure_fin: { gte: data.heure_fin } }
            ]
          },
          {
            AND: [
              { heure_debut: { gte: data.heure_debut } },
              { heure_fin: { lte: data.heure_fin } }
            ]
          }
        ]
      },
      include: {
        salle: true,
        matiere: true
      }
    });

    if (conflitSalle) {
      conflits.push({
        type: 'salle',
        message: `La salle ${conflitSalle.salle.code} est déjà occupée pour ${conflitSalle.matiere.nom}`,
        details: conflitSalle
      });
    }
  }

  // 2. Conflit d'enseignant (même enseignant au même moment)
  if (data.id_enseignant) {
    const conflitEnseignant = await prisma.emploiTemps.findFirst({
      where: {
        id_enseignant: data.id_enseignant,
        date: data.date,
        id_emploi: data.excludeId ? { not: data.excludeId } : undefined,
        OR: [
          {
            AND: [
              { heure_debut: { lte: data.heure_debut } },
              { heure_fin: { gt: data.heure_debut } }
            ]
          },
          {
            AND: [
              { heure_debut: { lt: data.heure_fin } },
              { heure_fin: { gte: data.heure_fin } }
            ]
          },
          {
            AND: [
              { heure_debut: { gte: data.heure_debut } },
              { heure_fin: { lte: data.heure_fin } }
            ]
          }
        ]
      },
      include: {
        enseignant: {
          include: {
            utilisateur: true
          }
        },
        matiere: true
      }
    });

    if (conflitEnseignant) {
      conflits.push({
        type: 'enseignant',
        message: `L'enseignant ${conflitEnseignant.enseignant.utilisateur.nom} ${conflitEnseignant.enseignant.utilisateur.prenom} a déjà cours (${conflitEnseignant.matiere.nom})`,
        details: conflitEnseignant
      });
    }
  }

  // 3. Conflit de groupe (même groupe au même moment)
  if (data.id_groupe) {
    const conflitGroupe = await prisma.emploiTemps.findFirst({
      where: {
        id_groupe: data.id_groupe,
        date: data.date,
        id_emploi: data.excludeId ? { not: data.excludeId } : undefined,
        OR: [
          {
            AND: [
              { heure_debut: { lte: data.heure_debut } },
              { heure_fin: { gt: data.heure_debut } }
            ]
          },
          {
            AND: [
              { heure_debut: { lt: data.heure_fin } },
              { heure_fin: { gte: data.heure_fin } }
            ]
          },
          {
            AND: [
              { heure_debut: { gte: data.heure_debut } },
              { heure_fin: { lte: data.heure_fin } }
            ]
          }
        ]
      },
      include: {
        groupe: true,
        matiere: true
      }
    });

    if (conflitGroupe) {
      conflits.push({
        type: 'groupe',
        message: `Le groupe ${conflitGroupe.groupe.nom} a déjà cours (${conflitGroupe.matiere.nom})`,
        details: conflitGroupe
      });
    }
  }

  return conflits;
}

// GET - Récupérer les emplois du temps (avec filtres)
export const GET = withChefDepartement(async (request: NextRequest, user: AuthUser) => {
  try {
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

    // Filtre par département du chef
    if (departementId) {
      const deptId = parseInt(departementId);
      if (!canAccessDepartement(user, deptId)) {
        return NextResponse.json(
          { error: 'Accès non autorisé à ce département' },
          { status: 403 }
        );
      }

      // Filtrer par groupe du département
      const groupes = await prisma.groupe.findMany({
        where: {
          niveau: {
            specialite: {
              id_departement: deptId
            }
          }
        }
      });

      if (groupes.length > 0) {
        where.id_groupe = {
          in: groupes.map(g => g.id_groupe)
        };
      }
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
        groupe: true,
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
    console.error('❌ Erreur GET /api/emploi-temps:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des emplois du temps' },
      { status: 500 }
    );
  }
});

// POST - Créer un nouvel emploi du temps
export const POST = withChefDepartement(async (request: NextRequest, user: AuthUser) => {
  try {
    const body = await request.json();
    const {
      date,
      heure_debut,
      heure_fin,
      id_matiere,
      id_salle,
      id_groupe,
      id_enseignant
    } = body;

    // Validation des champs requis
    if (!date || !heure_debut || !heure_fin || !id_matiere || !id_groupe) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Vérifier que le chef a accès à ce département
    const matiere = await prisma.matiere.findUnique({
      where: { id_matiere },
      include: {
        niveau: {
          include: {
            specialite: true
          }
        }
      }
    });

    if (!matiere) {
      return NextResponse.json(
        { error: 'Matière non trouvée' },
        { status: 404 }
      );
    }

    const departementId = matiere.niveau.specialite.id_departement;
    if (!canAccessDepartement(user, departementId)) {
      return NextResponse.json(
        { error: 'Accès non autorisé à ce département' },
        { status: 403 }
      );
    }

    // Convertir les dates
    const dateObj = new Date(date);
    const heureDebutObj = new Date(heure_debut);
    const heureFinObj = new Date(heure_fin);

    // Détecter les conflits
    const conflits = await detecterConflits({
      date: dateObj,
      heure_debut: heureDebutObj,
      heure_fin: heureFinObj,
      id_salle,
      id_enseignant,
      id_groupe
    });

    if (conflits.length > 0) {
      return NextResponse.json(
        { 
          error: 'Conflits détectés',
          conflits
        },
        { status: 409 }
      );
    }

    // Créer l'emploi du temps
    const emploi = await prisma.emploiTemps.create({
      data: {
        date: dateObj,
        heure_debut: heureDebutObj,
        heure_fin: heureFinObj,
        id_matiere,
        id_salle,
        id_groupe,
        id_enseignant
      },
      include: {
        matiere: true,
        salle: true,
        groupe: true,
        enseignant: {
          include: {
            utilisateur: true
          }
        }
      }
    });

    return NextResponse.json(emploi, { status: 201 });
  } catch (error: any) {
    console.error('❌ Erreur POST /api/emploi-temps:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de l\'emploi du temps' },
      { status: 500 }
    );
  }
});
