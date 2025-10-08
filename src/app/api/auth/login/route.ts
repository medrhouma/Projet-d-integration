import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_par_defaut_pour_le_dev'

// Fonction pour vérifier le mot de passe
async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Fonction pour générer le token JWT
function generateToken(userId: number, role: string): string {
  return jwt.sign(
    { 
      userId, 
      role,
      iss: 'school-management',
      aud: 'school-management'
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation manuelle des données
    const { login, password, role } = body

    if (!login || login.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'L\'identifiant est requis' 
        },
        { status: 400 }
      )
    }

    if (!password || password.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Le mot de passe est requis' 
        },
        { status: 400 }
      )
    }

    if (!role || !['Etudiant', 'Enseignant', 'Admin'].includes(role)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Rôle invalide' 
        },
        { status: 400 }
      )
    }

    console.log(`Tentative de connexion: ${login}, rôle: ${role}`)

    // Recherche de l'utilisateur avec les relations selon le rôle
    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { identifiant: login },
          { email: login }
        ],
        role: role
      },
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
      console.log('Utilisateur non trouvé')
      return NextResponse.json(
        { 
          success: false,
          message: 'Identifiant ou mot de passe incorrect' 
        },
        { status: 401 }
      )
    }

    console.log(`Utilisateur trouvé: ${utilisateur.prenom} ${utilisateur.nom}`)

    // Vérification du mot de passe
    const isPasswordValid = await verifyPassword(password, utilisateur.mot_de_passe_hash)
    
    if (!isPasswordValid) {
      console.log('Mot de passe incorrect')
      return NextResponse.json(
        { 
          success: false,
          message: 'Identifiant ou mot de passe incorrect' 
        },
        { status: 401 }
      )
    }

    // Génération du token JWT
    const token = generateToken(utilisateur.id_utilisateur, utilisateur.role)

    // Construction de la réponse utilisateur
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

    if (role === 'Enseignant' && utilisateur.enseignant) {
      userResponse.enseignant = {
        id_enseignant: utilisateur.enseignant.id_enseignant,
        matricule: utilisateur.enseignant.matricule,
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

    // Si c'est un admin, on peut ajouter des données spécifiques si nécessaire
    if (role === 'Admin') {
      userResponse.admin = {
        id_admin: utilisateur.id_utilisateur
      }
    }

    const response = NextResponse.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: userResponse
    })

    // Définir le cookie HTTP-only pour le token
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 jours
      path: '/'
    })

    // Cookie pour le rôle (facultatif, pour faciliter l'accès côté client)
    response.cookies.set('userRole', utilisateur.role, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    console.log(`Connexion réussie pour ${userResponse.prenom} ${userResponse.nom} (${userResponse.role})`)
    
    return response

  } catch (error) {
    console.error('Erreur lors de la connexion:', error)

    // Erreur générale
    return NextResponse.json(
      { 
        success: false,
        message: 'Erreur lors de la connexion. Veuillez réessayer.' 
      },
      { status: 500 }
    )
  }
}

// Gestion des méthodes non autorisées
export async function GET() {
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