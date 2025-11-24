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

  // Convertir les heures en décimal pour la comparaison (ex: 8.5 = 8h30)
  const heureDebutDecimal = data.heure_debut.getUTCHours() + data.heure_debut.getUTCMinutes() / 60;
  const heureFinDecimal = data.heure_fin.getUTCHours() + data.heure_fin.getUTCMinutes() / 60;

  // Récupérer toutes les séances de la même date
  const seancesDuJour = await prisma.emploiTemps.findMany({
    where: {
      date: data.date,
      id_emploi: data.excludeId ? { not: data.excludeId } : undefined,
      OR: [
        { id_salle: data.id_salle },
        { id_enseignant: data.id_enseignant },
        { id_groupe: data.id_groupe }
      ]
    },
    include: {
      salle: true,
      matiere: true,
      groupe: true,
      enseignant: {
        include: {
          utilisateur: true
        }
      }
    }
  });

  // Vérifier les conflits manuellement
  for (const seance of seancesDuJour) {
    const seanceDebutDecimal = seance.heure_debut.getUTCHours() + seance.heure_debut.getUTCMinutes() / 60;
    const seanceFinDecimal = seance.heure_fin.getUTCHours() + seance.heure_fin.getUTCMinutes() / 60;

    // Vérifier si les horaires se chevauchent
    const chevauche = (
      (heureDebutDecimal >= seanceDebutDecimal && heureDebutDecimal < seanceFinDecimal) || // Début dans la séance
      (heureFinDecimal > seanceDebutDecimal && heureFinDecimal <= seanceFinDecimal) ||     // Fin dans la séance
      (heureDebutDecimal <= seanceDebutDecimal && heureFinDecimal >= seanceFinDecimal)     // Englobe la séance
    );

    if (!chevauche) continue;

    // Conflit de salle
    if (data.id_salle && seance.id_salle === data.id_salle) {
      conflits.push({
        type: 'salle',
        message: `La salle ${seance.salle.code} est déjà occupée pour ${seance.matiere.nom} (${seance.groupe.nom})`,
        details: seance
      });
    }

    // Conflit d'enseignant
    if (data.id_enseignant && seance.id_enseignant === data.id_enseignant && seance.enseignant) {
      conflits.push({
        type: 'enseignant',
        message: `L'enseignant ${seance.enseignant.utilisateur.nom} ${seance.enseignant.utilisateur.prenom} a déjà cours (${seance.matiere.nom} avec ${seance.groupe.nom})`,
        details: seance
      });
    }

    // Conflit de groupe
    if (data.id_groupe && seance.id_groupe === data.id_groupe) {
      conflits.push({
        type: 'groupe',
        message: `Le groupe ${seance.groupe.nom} a déjà cours (${seance.matiere.nom})`,
        details: seance
      });
    }
  }

  // Retirer les doublons (si une séance cause plusieurs types de conflits)
  const conflitsUniques = conflits.filter((conflit, index, self) =>
    index === self.findIndex((c) => c.details.id_emploi === conflit.details.id_emploi && c.type === conflit.type)
  );

  return conflitsUniques;
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

    // Récupérer les absences enseignant pour ces emplois
    const emploiIds = emplois.map(e => e.id_emploi);
    const absences = await prisma.absenceEnseignant.findMany({
      where: {
        id_emploi: { in: emploiIds }
      },
      select: {
        id_absence: true,
        id_emploi: true
      }
    });

    // Mapper les absences aux emplois
    const emploisAvecAbsences = emplois.map(emploi => ({
      ...emploi,
      absence_enseignant: absences.filter(a => a.id_emploi === emploi.id_emploi)
    }));

    return NextResponse.json({ success: true, data: emploisAvecAbsences });
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
