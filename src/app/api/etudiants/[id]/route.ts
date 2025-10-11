import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Récupérer un étudiant par ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    const etudiant = await prisma.etudiant.findUnique({
      where: { id_etudiant: id },
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
        },
        absences: {
          include: {
            emploi_temps: {
              include: {
                matiere: true,
                salle: true
              }
            }
          }
        }
      }
    });

    if (!etudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(etudiant, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Mettre à jour un étudiant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nom, prenom, email, identifiant, mot_de_passe, numero_inscription, id_specialite, id_groupe } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    if (!nom || !prenom || !email || !identifiant || !numero_inscription) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Vérifier si l'étudiant existe
    const existingEtudiant = await prisma.etudiant.findUnique({
      where: { id_etudiant: id }
    });

    if (!existingEtudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier si l'email ou l'identifiant existe déjà pour un autre utilisateur
    const existingUser = await prisma.utilisateur.findFirst({
      where: {
        AND: [
          { id_utilisateur: { not: id } },
          {
            OR: [
              { email },
              { identifiant }
            ]
          }
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email ou identifiant existe déjà' },
        { status: 400 }
      );
    }

    // Vérifier si le numéro d'inscription existe déjà pour un autre étudiant
    const existingNumero = await prisma.etudiant.findFirst({
      where: {
        AND: [
          { id_etudiant: { not: id } },
          { numero_inscription }
        ]
      }
    });

    if (existingNumero) {
      return NextResponse.json(
        { error: 'Un étudiant avec ce numéro d\'inscription existe déjà' },
        { status: 400 }
      );
    }

    // Mettre à jour dans une transaction
    const etudiant = await prisma.$transaction(async (tx) => {
      // Préparer les données de mise à jour de l'utilisateur
      const updateData: any = {
        nom,
        prenom,
        email,
        identifiant
      };

      // Si un nouveau mot de passe est fourni, le hasher
      if (mot_de_passe) {
        updateData.mot_de_passe_hash = await bcrypt.hash(mot_de_passe, 10);
      }

      await tx.utilisateur.update({
        where: { id_utilisateur: id },
        data: updateData
      });

      return await tx.etudiant.update({
        where: { id_etudiant: id },
        data: {
          numero_inscription,
          id_specialite: id_specialite ? parseInt(id_specialite) : null,
          id_groupe: id_groupe ? parseInt(id_groupe) : null
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

    return NextResponse.json(etudiant, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Supprimer un étudiant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    // Supprimer l'utilisateur (cascade supprimera l'étudiant)
    await prisma.utilisateur.delete({
      where: { id_utilisateur: id }
    });

    return NextResponse.json(
      { message: 'Étudiant supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
