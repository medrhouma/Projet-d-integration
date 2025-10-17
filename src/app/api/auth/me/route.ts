import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

/**
 * GET /api/auth/me
 * Récupère les informations de l'utilisateur connecté à partir du token JWT
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis le cookie
    const token = request.cookies.get('token')?.value

    if (!token) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Non authentifié' 
        },
        { status: 401 }
      )
    }

    // Vérifier et décoder le token
    let decoded
    try {
      decoded = verifyToken(token)
    } catch (error) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Token invalide ou expiré' 
        },
        { status: 401 }
      )
    }

    const { userId, role } = decoded

    // Récupérer l'utilisateur avec ses relations
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: userId },
      include: {
        etudiant: {
          include: {
            specialite: {
              include: {
                departement: true
              }
            },
            groupe: {
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
            }
          }
        },
        enseignant: {
          include: {
            departement: true,
            matieres: {
              include: {
                niveau: {
                  include: {
                    specialite: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!utilisateur) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Utilisateur non trouvé' 
        },
        { status: 404 }
      )
    }

    // Construction de la réponse
    const userResponse: any = {
      id: utilisateur.id_utilisateur,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      identifiant: utilisateur.identifiant,
      role: utilisateur.role,
      date_creation: utilisateur.date_creation,
      date_modification: utilisateur.date_modification
    }

    // Si l'utilisateur est un enseignant chef de département, ajuster le rôle
    if (utilisateur.enseignant?.est_chef_departement) {
      userResponse.role = 'ChefDepartement';
    }

    // Ajout des données spécifiques au rôle
    if (role === 'Etudiant' && utilisateur.etudiant) {
      userResponse.etudiant = {
        id_etudiant: utilisateur.etudiant.id_etudiant,
        numero_inscription: utilisateur.etudiant.numero_inscription,
        specialite: utilisateur.etudiant.specialite ? {
          id_specialite: utilisateur.etudiant.specialite.id_specialite,
          nom: utilisateur.etudiant.specialite.nom,
          departement: utilisateur.etudiant.specialite.departement
        } : null,
        groupe: utilisateur.etudiant.groupe ? {
          id_groupe: utilisateur.etudiant.groupe.id_groupe,
          nom: utilisateur.etudiant.groupe.nom,
          niveau: utilisateur.etudiant.groupe.niveau ? {
            id_niveau: utilisateur.etudiant.groupe.niveau.id_niveau,
            nom: utilisateur.etudiant.groupe.niveau.nom,
            specialite: utilisateur.etudiant.groupe.niveau.specialite
          } : null
        } : null
      }
    }

    if ((role === 'Enseignant' || role === 'ChefDepartement') && utilisateur.enseignant) {
      userResponse.id_enseignant = utilisateur.enseignant.id_enseignant;
      userResponse.matricule = utilisateur.enseignant.matricule;
      userResponse.departement_nom = utilisateur.enseignant.departement_nom;
      userResponse.est_chef_departement = utilisateur.enseignant.est_chef_departement;
      userResponse.id_departement = utilisateur.enseignant.id_departement;
      
      userResponse.enseignant = {
        id_enseignant: utilisateur.enseignant.id_enseignant,
        matricule: utilisateur.enseignant.matricule,
        est_chef_departement: utilisateur.enseignant.est_chef_departement,
        departement_nom: utilisateur.enseignant.departement_nom,
        id_departement: utilisateur.enseignant.id_departement,
        departement: utilisateur.enseignant.departement ? {
          id_departement: utilisateur.enseignant.departement.id_departement,
          nom: utilisateur.enseignant.departement.nom
        } : null,
        matieres: utilisateur.enseignant.matieres.map(matiere => ({
          id_matiere: matiere.id_matiere,
          nom: matiere.nom,
          niveau: {
            id_niveau: matiere.niveau.id_niveau,
            nom: matiere.niveau.nom,
            specialite: matiere.niveau.specialite
          }
        }))
      }
    }

    if (role === 'Admin') {
      userResponse.admin = {
        id_admin: utilisateur.id_utilisateur
      }
    }

    return NextResponse.json({
      success: true,
      user: userResponse
    })

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Erreur serveur' 
      },
      { status: 500 }
    )
  }
}

// Gestion des méthodes non autorisées
export async function POST() {
  return NextResponse.json(
    { message: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Méthode non autorisée' },
    { status: 405 }
  )
}
