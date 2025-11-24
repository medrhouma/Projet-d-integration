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
function generateToken(
  userId: number, 
  role: string, 
  isChefDepartement?: boolean,
  departementId?: number
): string {
  return jwt.sign(
    { 
      userId, 
      role,
      isChefDepartement,
      departementId,
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

    if (!role || !['Etudiant', 'Enseignant', 'ChefDepartement', 'Admin'].includes(role)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Rôle invalide' 
        },
        { status: 400 }
      )
    }

    console.log(`Tentative de connexion: ${login}, rôle: ${role}`)

    // Pour ChefDepartement, on cherche un Enseignant qui est chef
    const searchRole = role === 'ChefDepartement' ? 'Enseignant' : role

    // Recherche de l'utilisateur avec les relations selon le rôle
    const utilisateur = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { identifiant: login },
          { email: login }
        ],
        role: searchRole
      },
      include: {
        etudiant: {
          include: {
            specialite: {
              include: {
                departement: true
              }
            },
            niveau: true,
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

    // Si le rôle demandé est ChefDepartement, vérifier que l'utilisateur est bien chef
    if (role === 'ChefDepartement') {
      if (!utilisateur.enseignant || !utilisateur.enseignant.est_chef_departement) {
        console.log('Utilisateur n\'est pas chef de département')
        return NextResponse.json(
          { 
            success: false,
            message: 'Vous n\'êtes pas autorisé à accéder à cet espace' 
          },
          { status: 403 }
        )
      }
    }

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

    // Déterminer si l'utilisateur est chef de département
    let isChefDepartement = false
    let departementId: number | undefined = undefined
    
    if (utilisateur.enseignant) {
      isChefDepartement = utilisateur.enseignant.est_chef_departement
      departementId = utilisateur.enseignant.id_departement || undefined
      
      // Modifier le rôle UNIQUEMENT si l'utilisateur demande explicitement le rôle ChefDepartement
      if (role === 'ChefDepartement' && isChefDepartement) {
        utilisateur.role = 'ChefDepartement'
      }
      // Si l'utilisateur choisit "Enseignant", garder ce rôle même s'il est chef
    }

    console.log(`Rôle final: ${utilisateur.role}, Chef: ${isChefDepartement}`)

    // Génération du token JWT avec les informations de chef de département
    const token = generateToken(
      utilisateur.id_utilisateur, 
      utilisateur.role,
      isChefDepartement,
      departementId
    )

    // Construction de la réponse utilisateur
    const userResponse: any = {
      id_utilisateur: utilisateur.id_utilisateur,
      nom: utilisateur.nom,
      prenom: utilisateur.prenom,
      email: utilisateur.email,
      identifiant: utilisateur.identifiant,
      role: utilisateur.role,
      date_creation: utilisateur.date_creation,
      date_modification: utilisateur.date_modification
    }

    // Ajout des données spécifiques au rôle ÉTUDIANT
    if (role === 'Etudiant' && utilisateur.etudiant) {
      userResponse.id_etudiant = utilisateur.etudiant.id_etudiant; // ⚠️ IMPORTANT !
      userResponse.numero_inscription = utilisateur.etudiant.numero_inscription;
      userResponse.departement = utilisateur.etudiant.departement;
      userResponse.specialite_nom = utilisateur.etudiant.specialite_nom;
      userResponse.niveau_nom = utilisateur.etudiant.niveau_nom;
      userResponse.groupe_nom = utilisateur.etudiant.groupe_nom;
      
      userResponse.etudiant = {
        id_etudiant: utilisateur.etudiant.id_etudiant,
        numero_inscription: utilisateur.etudiant.numero_inscription,
        departement: utilisateur.etudiant.departement,
        specialite_nom: utilisateur.etudiant.specialite_nom,
        niveau_nom: utilisateur.etudiant.niveau_nom,
        groupe_nom: utilisateur.etudiant.groupe_nom,
        specialite: utilisateur.etudiant.specialite ? {
          id_specialite: utilisateur.etudiant.specialite.id_specialite,
          nom: utilisateur.etudiant.specialite.nom,
          departement: utilisateur.etudiant.specialite.departement
        } : null,
        niveau: utilisateur.etudiant.niveau ? {
          id_niveau: utilisateur.etudiant.niveau.id_niveau,
          nom: utilisateur.etudiant.niveau.nom
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

    // Ajout des données spécifiques au rôle ENSEIGNANT
    if ((role === 'Enseignant' || role === 'ChefDepartement') && utilisateur.enseignant) {
      userResponse.id_enseignant = utilisateur.enseignant.id_enseignant; // ⚠️ IMPORTANT !
      userResponse.matricule = utilisateur.enseignant.matricule;
      userResponse.departement_nom = utilisateur.enseignant.departement_nom;
      userResponse.est_chef_departement = utilisateur.enseignant.est_chef_departement;
      userResponse.id_departement = utilisateur.enseignant.id_departement;
      
      userResponse.enseignant = {
        id_enseignant: utilisateur.enseignant.id_enseignant,
        matricule: utilisateur.enseignant.matricule,
        departement_nom: utilisateur.enseignant.departement_nom,
        est_chef_departement: utilisateur.enseignant.est_chef_departement,
        id_departement: utilisateur.enseignant.id_departement,
        departement: utilisateur.enseignant.departement ? {
          id_departement: utilisateur.enseignant.departement.id_departement,
          nom: utilisateur.enseignant.departement.nom
        } : null,
        matieres: utilisateur.enseignant.matieres?.map(matiere => ({
          id_matiere: matiere.id_matiere,
          nom: matiere.nom,
          niveau: {
            id_niveau: matiere.niveau.id_niveau,
            nom: matiere.niveau.nom,
            specialite: matiere.niveau.specialite
          }
        })) || []
      }
    }

    // Si c'est un admin
    if (role === 'Admin') {
      userResponse.admin = {
        id_admin: utilisateur.id_utilisateur
      }
    }

    console.log('✅ Données utilisateur à retourner:', JSON.stringify(userResponse, null, 2))

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

    // Cookie pour le rôle
    response.cookies.set('userRole', utilisateur.role, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/'
    })

    console.log(`✅ Connexion réussie pour ${userResponse.prenom} ${userResponse.nom} (${userResponse.role})`)
    
    return response

  } catch (error) {
    console.error('❌ Erreur lors de la connexion:', error)

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