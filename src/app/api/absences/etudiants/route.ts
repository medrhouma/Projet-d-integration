// src/app/api/absences/etudiants/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

// GET - Récupérer les absences pour une séance (enseignant) ou toutes les absences (chef de département)
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
    const all = searchParams.get('all');

    console.log('🔍 GET /api/absences/etudiants - Role:', decoded.role, 'All:', all);

    // Chef de département : récupérer toutes les absences des étudiants de son département
    if (decoded.role === 'ChefDepartement' && all) {
      // Récupérer l'enseignant qui est chef de département
      const enseignantChef = await prisma.enseignant.findFirst({
        where: { 
          utilisateur: {
            id_utilisateur: decoded.userId
          },
          est_chef_departement: true
        },
        include: { 
          departement: true,
          utilisateur: true 
        }
      });

      console.log('🔍 Enseignant chef trouvé:', enseignantChef);

      if (!enseignantChef) {
        return NextResponse.json({ 
          success: false, 
          error: 'Enseignant chef de département non trouvé' 
        }, { status: 404 });
      }

      if (!enseignantChef.departement) {
        return NextResponse.json({ 
          success: false, 
          error: 'Aucun département associé à cet enseignant chef' 
        }, { status: 404 });
      }

      // Récupérer tous les étudiants du département avec leurs utilisateurs
      const etudiants = await prisma.etudiant.findMany({
        where: { 
          departement: enseignantChef.departement.nom
        },
        include: {
          utilisateur: true,
          groupe: true
        }
      });

      console.log(`📊 ${etudiants.length} étudiants trouvés dans le département:`, enseignantChef.departement.nom);

      const etudiantIds = etudiants.map(e => e.id_etudiant);

      // Récupérer toutes les absences de ces étudiants
      const absences = await prisma.absence.findMany({
        where: {
          id_etudiant: { in: etudiantIds }
        },
        include: {
          etudiant: {
            include: {
              utilisateur: true,
              groupe: true
            }
          },
          emploi_temps: {
            include: {
              matiere: true
            }
          }
        },
        orderBy: { 
          emploi_temps: {
            date: 'desc'
          }
        }
      });

      console.log(`📊 ${absences.length} absences trouvées`);

      // Formater les données de manière cohérente
      const absencesFormatted = absences.map(abs => ({
        id_absence: abs.id_absence,
        date_absence: abs.emploi_temps?.date || '',
        justifiee: abs.statut === 'Justifiee',
        motif: abs.motif,
        etudiant: {
          nom: abs.etudiant?.utilisateur?.nom || 'Inconnu',
          prenom: abs.etudiant?.utilisateur?.prenom || 'Inconnu',
          matricule: abs.etudiant?.numero_inscription || 'N/A',
          groupe: { 
            nom: abs.etudiant?.groupe?.nom || 'Non assigné' 
          }
        },
        matiere: {
          nom: abs.emploi_temps?.matiere?.nom || 'Matière inconnue',
          code: abs.emploi_temps?.matiere?.nom?.substring(0, 3).toUpperCase() || 'N/A' // Générer un code à partir du nom
        }
      }));

      return NextResponse.json({ 
        success: true, 
        absences: absencesFormatted,
        count: absencesFormatted.length
      });
    }

    // Si c'est un étudiant, récupérer SES absences
    if (decoded.role === 'Etudiant') {
      // Récupérer l'id_etudiant depuis la base de données
      const etudiant = await prisma.etudiant.findFirst({
        where: {
          utilisateur: {
            id_utilisateur: decoded.userId
          }
        }
      });

      if (!etudiant) {
        return NextResponse.json({ 
          success: false, 
          error: 'Étudiant non trouvé' 
        }, { status: 404 });
      }

      const absences = await prisma.absence.findMany({
        where: {
          id_etudiant: etudiant.id_etudiant
        },
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
                  code: true
                }
              },
              enseignant: {
                include: {
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

      // Formater les données pour l'étudiant
      const absencesFormatted = absences.map(abs => ({
        id_absence: abs.id_absence,
        date_absence: abs.emploi_temps?.date || '',
        justifiee: abs.statut === 'Justifiee',
        motif: abs.motif,
        matiere: {
          nom: abs.emploi_temps?.matiere?.nom || 'Matière inconnue',
          code: abs.emploi_temps?.matiere?.nom?.substring(0, 3).toUpperCase() || 'N/A'
        },
        enseignant: {
          nom: abs.emploi_temps?.enseignant?.utilisateur?.nom || 'Inconnu',
          prenom: abs.emploi_temps?.enseignant?.utilisateur?.prenom || 'Inconnu'
        },
        salle: abs.emploi_temps?.salle?.code || 'N/A'
      }));

      return NextResponse.json({ success: true, absences: absencesFormatted });
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
        return NextResponse.json({ 
          success: false, 
          error: 'Séance non trouvée' 
        }, { status: 404 });
      }

      // Vérifier que c'est bien sa séance
      if (emploi.id_enseignant !== decoded.userId) {
        return NextResponse.json({ 
          success: false, 
          error: 'Non autorisé' 
        }, { status: 403 });
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

    return NextResponse.json({ 
      success: false, 
      error: 'Paramètres manquants ou rôle non autorisé' 
    }, { status: 400 });

  } catch (error: any) {
    console.error('❌ Erreur GET /api/absences/etudiants:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la récupération des absences',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// PUT - Justifier une absence d'étudiant (chef de département)
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ 
        success: false,
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    // Vérifier si c'est un chef de département
    const enseignantChef = await prisma.enseignant.findFirst({
      where: { 
        utilisateur: {
          id_utilisateur: decoded.userId
        },
        est_chef_departement: true
      }
    });

    if (!enseignantChef) {
      return NextResponse.json({ 
        success: false,
        error: 'Accès réservé au chef de département' 
      }, { status: 403 });
    }

    const body = await request.json();
    console.log('PUT /api/absences/etudiants body:', body);
    
    let { id_absence, statut, motif } = body;

    // Vérification stricte des types
    if (typeof id_absence === 'string') id_absence = parseInt(id_absence);
    if (typeof id_absence !== 'number' || isNaN(id_absence) || !statut || !motif) {
      return NextResponse.json({ 
        success: false,
        error: 'id_absence (number), statut et motif requis' 
      }, { status: 400 });
    }

    // Vérifier que l'absence existe
    const absence = await prisma.absence.findUnique({
      where: { id_absence }
    });

    if (!absence) {
      return NextResponse.json({ 
        success: false,
        error: 'Absence non trouvée' 
      }, { status: 404 });
    }

    // Mettre à jour l'absence
    const updatedAbsence = await prisma.absence.update({
      where: { id_absence },
      data: {
        statut: statut,
        motif
      }
    });

    return NextResponse.json({ 
      success: true, 
      absence: updatedAbsence 
    });

  } catch (error: any) {
    console.error('❌ Erreur PUT /api/absences/etudiants:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la justification de l\'absence',
        details: error.message
      },
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
      return NextResponse.json({ 
        success: false,
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    if (decoded.role !== 'Enseignant') {
      return NextResponse.json({ 
        success: false,
        error: 'Accès réservé aux enseignants' 
      }, { status: 403 });
    }

    const body = await request.json();
    const { id_emploi, id_etudiant, motif, statut } = body;

    if (!id_emploi || !id_etudiant) {
      return NextResponse.json(
        { 
          success: false,
          error: 'id_emploi et id_etudiant requis' 
        },
        { status: 400 }
      );
    }

    // Vérifier que la séance appartient à cet enseignant
    const emploi = await prisma.emploiTemps.findUnique({
      where: { id_emploi: parseInt(id_emploi) }
    });

    if (!emploi) {
      return NextResponse.json({ 
        success: false,
        error: 'Séance non trouvée' 
      }, { status: 404 });
    }

    if (emploi.id_enseignant !== decoded.userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Non autorisé' 
      }, { status: 403 });
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
        { 
          success: false,
          error: 'Absence déjà enregistrée' 
        },
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

    return NextResponse.json({ 
      success: true, 
      absence 
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Erreur POST /api/absences/etudiants:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de l\'enregistrement de l\'absence',
        details: error.message
      },
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
      return NextResponse.json({ 
        success: false,
        error: 'Non authentifié' 
      }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    if (decoded.role !== 'Enseignant') {
      return NextResponse.json({ 
        success: false,
        error: 'Accès réservé aux enseignants' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id_absence = searchParams.get('id_absence');

    if (!id_absence) {
      return NextResponse.json({ 
        success: false,
        error: 'id_absence requis' 
      }, { status: 400 });
    }

    // Récupérer l'absence avec la séance
    const absence = await prisma.absence.findUnique({
      where: { id_absence: parseInt(id_absence) },
      include: {
        emploi_temps: true
      }
    });

    if (!absence) {
      return NextResponse.json({ 
        success: false,
        error: 'Absence non trouvée' 
      }, { status: 404 });
    }

    // Vérifier que la séance appartient à cet enseignant
    if (absence.emploi_temps.id_enseignant !== decoded.userId) {
      return NextResponse.json({ 
        success: false,
        error: 'Non autorisé' 
      }, { status: 403 });
    }

    // Supprimer l'absence
    await prisma.absence.delete({
      where: { id_absence: parseInt(id_absence) }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Absence annulée' 
    });

  } catch (error: any) {
    console.error('❌ Erreur DELETE /api/absences/etudiants:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la suppression de l\'absence',
        details: error.message
      },
      { status: 500 }
    );
  }
}