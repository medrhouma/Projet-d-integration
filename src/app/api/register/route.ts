import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Fonction pour hacher le mot de passe
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Fonction pour vérifier si un identifiant ou email existe déjà
async function checkExistingUser(identifiant: string, email: string) {
  const existingUser = await prisma.utilisateur.findFirst({
    where: {
      OR: [
        { identifiant },
        { email }
      ]
    }
  })
  return existingUser
}

// Fonction pour vérifier si un numéro d'inscription existe déjà
async function checkExistingNumeroInscription(numeroInscription: string) {
  const existingEtudiant = await prisma.etudiant.findUnique({
    where: { numero_inscription: numeroInscription }
  })
  return existingEtudiant
}

// Fonction pour vérifier si un matricule existe déjà
async function checkExistingMatricule(matricule: string) {
  const existingEnseignant = await prisma.enseignant.findUnique({
    where: { matricule }
  })
  return existingEnseignant
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validation des données
    const { 
      nom, 
      prenom, 
      email, 
      login, 
      password, 
      role,
      numInsc,  // Pour étudiant
      matricule // Pour enseignant/admin
    } = body

    // Validation basique
    if (!nom || !prenom || !email || !login || !password || !role) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Tous les champs obligatoires doivent être remplis'
        },
        { status: 400 }
      )
    }

    // Validation de l'email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Format d\'email invalide'
        },
        { status: 400 }
      )
    }

    // Validation du mot de passe
    if (password.length < 8) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Le mot de passe doit contenir au moins 8 caractères'
        },
        { status: 400 }
      )
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre'
        },
        { status: 400 }
      )
    }

    // Validation de l'identifiant
    if (login.length < 3) {
      return NextResponse.json(
        { 
          success: false,
          error: 'L\'identifiant doit contenir au moins 3 caractères'
        },
        { status: 400 }
      )
    }

    // Validation du rôle
    if (!['Etudiant', 'Enseignant', 'Admin'].includes(role)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Rôle invalide' 
        },
        { status: 400 }
      )
    }

    console.log(`Tentative d'inscription: ${prenom} ${nom}, rôle: ${role}`)

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await checkExistingUser(login, email)
    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Un utilisateur avec cet identifiant ou email existe déjà' 
        },
        { status: 409 }
      )
    }

    // Vérifications spécifiques au rôle
    if (role === 'Etudiant') {
      if (!numInsc || !/^\d{6}$/.test(numInsc)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Numéro d\'inscription invalide (6 chiffres requis)' 
          },
          { status: 400 }
        )
      }

      const existingNumero = await checkExistingNumeroInscription(numInsc)
      if (existingNumero) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Ce numéro d\'inscription est déjà utilisé' 
          },
          { status: 409 }
        )
      }
    }

    if (role === 'Enseignant' || role === 'Admin') {
      if (!matricule || !/^\d{4}$/.test(matricule)) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Matricule invalide (4 chiffres requis)' 
          },
          { status: 400 }
        )
      }

      const existingMatricule = await checkExistingMatricule(matricule)
      if (existingMatricule) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Ce matricule est déjà utilisé' 
          },
          { status: 409 }
        )
      }
    }

    // Hacher le mot de passe
    const hashedPassword = await hashPassword(password)

    // Créer l'utilisateur dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur de base
      const utilisateur = await tx.utilisateur.create({
        data: {
          nom: nom.trim(),
          prenom: prenom.trim(),
          email: email.trim().toLowerCase(),
          identifiant: login.trim(),
          mot_de_passe_hash: hashedPassword,
          role: role as any
        }
      })

      // Créer les données spécifiques au rôle
      if (role === 'Etudiant') {
        await tx.etudiant.create({
          data: {
            id_etudiant: utilisateur.id_utilisateur,
            numero_inscription: numInsc
            // id_specialite et id_groupe peuvent être null initialement
          }
        })
      }

      if (role === 'Enseignant') {
        // Pour l'instant, on assigne un département par défaut (à adapter)
        const defaultDepartement = await tx.departement.findFirst()
        if (!defaultDepartement) {
          throw new Error('Aucun département disponible')
        }

        await tx.enseignant.create({
          data: {
            id_enseignant: utilisateur.id_utilisateur,
            matricule: matricule,
            id_departement: defaultDepartement.id_departement
          }
        })
      }

      if (role === 'Admin') {
        // Pour les admins, créer aussi un enregistrement enseignant avec le matricule
        const defaultDepartement = await tx.departement.findFirst()
        if (!defaultDepartement) {
          throw new Error('Aucun département disponible')
        }

        await tx.enseignant.create({
          data: {
            id_enseignant: utilisateur.id_utilisateur,
            matricule: matricule,
            id_departement: defaultDepartement.id_departement
          }
        })
        console.log('Compte admin créé avec accès enseignant')
      }

      return utilisateur
    })

    // Réponse de succès
    const responseData = {
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: result.id_utilisateur,
        nom: result.nom,
        prenom: result.prenom,
        email: result.email,
        identifiant: result.identifiant,
        role: result.role,
        date_creation: result.date_creation
      }
    }

    console.log(`Inscription réussie pour ${prenom} ${nom} (${role})`)
    
    return NextResponse.json(responseData)

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error)

    // Gestion des erreurs spécifiques
    if (error instanceof Error) {
      if (error.message.includes('Aucun département disponible')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Configuration système incomplète. Veuillez contacter l\'administrateur.' 
          },
          { status: 500 }
        )
      }

      // Erreurs Prisma
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Cet identifiant, email, numéro d\'inscription ou matricule existe déjà'
          },
          { status: 409 }
        )
      }

      if (error.message.includes('Foreign key constraint')) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Erreur de référence dans la base de données'
          },
          { status: 500 }
        )
      }
    }

    // Erreur générale
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la création du compte. Veuillez réessayer.' 
      },
      { status: 500 }
    )
  }
}

// Gestion des méthodes non autorisées
export async function GET() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Méthode non autorisée' },
    { status: 405 }
  )
} 