import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Récupérer tous les enseignants
export async function GET(request: NextRequest) {
  try {
    const enseignants = await prisma.enseignant.findMany({
      include: {
        utilisateur: {
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            email: true,
            identifiant: true,
            role: true
          }
        },
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
      },
      orderBy: {
        utilisateur: {
          nom: 'asc'
        }
      }
    });

    return NextResponse.json(enseignants, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Créer un nouvel enseignant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nom, prenom, email, identifiant, mot_de_passe, matricule, id_departement } = body;

    if (!nom || !prenom || !email || !identifiant || !mot_de_passe || !matricule) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Vérifier si l'email ou l'identifiant existe déjà
    const existingUser = await prisma.utilisateur.findFirst({
      where: {
        OR: [
          { email },
          { identifiant }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email ou identifiant existe déjà' },
        { status: 400 }
      );
    }

    // Vérifier si le matricule existe déjà
    const existingEnseignant = await prisma.enseignant.findUnique({
      where: { matricule }
    });

    if (existingEnseignant) {
      return NextResponse.json(
        { error: 'Un enseignant avec ce matricule existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Créer l'utilisateur et l'enseignant dans une transaction
    const enseignant = await prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.create({
        data: {
          nom,
          prenom,
          email,
          identifiant,
          mot_de_passe_hash: hashedPassword,
          role: 'Enseignant'
        }
      });

      return await tx.enseignant.create({
        data: {
          id_enseignant: utilisateur.id_utilisateur,
          matricule,
          id_departement: id_departement ? parseInt(id_departement) : null
        },
        include: {
          utilisateur: {
            select: {
              id_utilisateur: true,
              nom: true,
              prenom: true,
              email: true,
              identifiant: true,
              role: true
            }
          },
          departement: true
        }
      });
    });

    return NextResponse.json(enseignant, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
