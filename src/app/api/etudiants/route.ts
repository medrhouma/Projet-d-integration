import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Récupérer tous les étudiants
export async function GET(request: NextRequest) {
  try {
    const etudiants = await prisma.etudiant.findMany({
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
      },
      orderBy: {
        utilisateur: {
          nom: 'asc'
        }
      }
    });

    return NextResponse.json(etudiants, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST - Créer un nouvel étudiant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      nom, 
      prenom, 
      email, 
      identifiant, 
      mot_de_passe, 
      numero_inscription, 
      id_specialite, 
      id_niveau,
      id_groupe 
    } = body;

    // Validation des champs obligatoires
    if (!nom || !prenom || !email || !identifiant || !mot_de_passe || !numero_inscription) {
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

    // Vérifier si le numéro d'inscription existe déjà
    const existingEtudiant = await prisma.etudiant.findUnique({
      where: { numero_inscription }
    });

    if (existingEtudiant) {
      return NextResponse.json(
        { error: 'Un étudiant avec ce numéro d\'inscription existe déjà' },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(mot_de_passe, 10);

    // Récupérer les informations de spécialité, niveau et groupe pour les champs dénormalisés
    let departement = null;
    let specialite_nom = null;
    let niveau_nom = null;
    let groupe_nom = null;

    if (id_specialite) {
      const specialite = await prisma.specialite.findUnique({
        where: { id_specialite: parseInt(id_specialite) },
        include: { departement: true }
      });
      if (specialite) {
        departement = specialite.departement.nom;
        specialite_nom = specialite.nom;
      }
    }

    if (id_niveau) {
      const niveau = await prisma.niveau.findUnique({
        where: { id_niveau: parseInt(id_niveau) }
      });
      if (niveau) {
        niveau_nom = niveau.nom;
      }
    }

    if (id_groupe) {
      const groupe = await prisma.groupe.findUnique({
        where: { id_groupe: parseInt(id_groupe) }
      });
      if (groupe) {
        groupe_nom = groupe.nom;
      }
    }

    // Créer l'utilisateur et l'étudiant dans une transaction
    const etudiant = await prisma.$transaction(async (tx) => {
      const utilisateur = await tx.utilisateur.create({
        data: {
          nom,
          prenom,
          email,
          identifiant,
          mot_de_passe_hash: hashedPassword,
          role: 'Etudiant'
        }
      });

      return await tx.etudiant.create({
        data: {
          id_etudiant: utilisateur.id_utilisateur,
          numero_inscription,
          id_specialite: id_specialite ? parseInt(id_specialite) : null,
          id_niveau: id_niveau ? parseInt(id_niveau) : null,
          id_groupe: id_groupe ? parseInt(id_groupe) : null,
          // Champs dénormalisés
          departement,
          specialite_nom,
          niveau_nom,
          groupe_nom
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
                  specialite: true
                }
              }
            }
          }
        }
      });
    });

    return NextResponse.json(etudiant, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}