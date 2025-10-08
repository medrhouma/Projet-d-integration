import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/middleware/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError, NotFoundError } from '@/lib/errorHandler'

/**
 * GET /api/profile
 * Récupérer le profil de l'utilisateur connecté
 * Route protégée - nécessite authentification
 */
async function getProfile(request: NextRequest, user: AuthUser) {
  try {
    // Récupérer l'utilisateur avec toutes ses relations
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: user.userId },
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
                    specialite: true
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
      throw new NotFoundError('Utilisateur non trouvé')
    }

    // Construire la réponse selon le rôle
    const response: any = {
      id: utilisateur.id_utilisateur,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      identifiant: utilisateur.identifiant,
      role: utilisateur.role,
      date_creation: utilisateur.date_creation,
      date_modification: utilisateur.date_modification
    }

    // Ajouter les données spécifiques au rôle
    if (user.role === 'Etudiant' && utilisateur.etudiant) {
      response.etudiant = {
        id_etudiant: utilisateur.etudiant.id_etudiant,
        numero_inscription: utilisateur.etudiant.numero_inscription,
        specialite: utilisateur.etudiant.specialite,
        groupe: utilisateur.etudiant.groupe
      }
    }

    if (user.role === 'Enseignant' && utilisateur.enseignant) {
      response.enseignant = {
        id_enseignant: utilisateur.enseignant.id_enseignant,
        matricule: utilisateur.enseignant.matricule,
        departement: utilisateur.enseignant.departement,
        matieres: utilisateur.enseignant.matieres
      }
    }

    if (user.role === 'Admin' && utilisateur.enseignant) {
      response.admin = {
        id_admin: utilisateur.id_utilisateur,
        matricule: utilisateur.enseignant.matricule,
        departement: utilisateur.enseignant.departement
      }
    }

    return NextResponse.json({
      success: true,
      data: response
    })

  } catch (error) {
    return handleApiError(error)
  }
}

// Exporter la route protégée
export const GET = withAuth(getProfile)

// Bloquer les autres méthodes
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée' },
    { status: 405 }
  )
}
