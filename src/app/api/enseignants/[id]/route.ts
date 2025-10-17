import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Récupérer un enseignant par ID
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

    const enseignant = await prisma.enseignant.findUnique({
      where: { id_enseignant: id },
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
      }
    });

    if (!enseignant) {
      return NextResponse.json(
        { error: 'Enseignant non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(enseignant, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Mettre à jour un enseignant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nom, prenom, email, identifiant, mot_de_passe, matricule, id_departement, est_chef_departement } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    if (!nom || !prenom || !email || !identifiant || !matricule) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Vérifier si l'enseignant existe
    const existingEnseignant = await prisma.enseignant.findUnique({
      where: { id_enseignant: id }
    });

    if (!existingEnseignant) {
      return NextResponse.json(
        { error: 'Enseignant non trouvé' },
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

    // Vérifier si le matricule existe déjà pour un autre enseignant
    const existingMatricule = await prisma.enseignant.findFirst({
      where: {
        AND: [
          { id_enseignant: { not: id } },
          { matricule }
        ]
      }
    });

    if (existingMatricule) {
      return NextResponse.json(
        { error: 'Un enseignant avec ce matricule existe déjà' },
        { status: 400 }
      );
    }

    // Mettre à jour dans une transaction
    const enseignant = await prisma.$transaction(async (tx) => {
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

      // Mettre à jour le rôle si nécessaire
      if (est_chef_departement !== undefined) {
        updateData.role = est_chef_departement ? 'ChefDepartement' : 'Enseignant';
      }

      await tx.utilisateur.update({
        where: { id_utilisateur: id },
        data: updateData
      });

      // Récupérer le nom du département si un id_departement est fourni
      let departement_nom = null;
      if (id_departement) {
        const departement = await tx.departement.findUnique({
          where: { id_departement: parseInt(id_departement) }
        });
        departement_nom = departement?.nom || null;
      }

      // Préparer les données de mise à jour de l'enseignant
      const enseignantUpdateData: any = {
        matricule,
        id_departement: id_departement ? parseInt(id_departement) : null
      };

      if (departement_nom) {
        enseignantUpdateData.departement_nom = departement_nom;
      }

      if (est_chef_departement !== undefined) {
        enseignantUpdateData.est_chef_departement = est_chef_departement;
      }

      return await tx.enseignant.update({
        where: { id_enseignant: id },
        data: enseignantUpdateData,
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

    return NextResponse.json(enseignant, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Supprimer un enseignant
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

    // Supprimer l'utilisateur (cascade supprimera l'enseignant)
    await prisma.utilisateur.delete({
      where: { id_utilisateur: id }
    });

    return NextResponse.json(
      { message: 'Enseignant supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
