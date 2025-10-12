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
    // Vérifier que l'ID existe et est valide
    if (!params.id || params.id === 'undefined' || params.id === 'null') {
      return NextResponse.json(
        { error: 'ID étudiant manquant ou invalide' },
        { status: 400 }
      );
    }

    const id = parseInt(params.id);

    // Vérifier que l'ID est un nombre valide
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID étudiant invalide' },
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
            role: true,
            date_creation: true
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

    if (!etudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json(etudiant, { status: 200 });
  } catch (error) {
    console.error('Erreur GET etudiant:', error);
    return handleApiError(error);
  }
}

// PUT - Mettre à jour un étudiant
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id || params.id === 'undefined' || params.id === 'null') {
      return NextResponse.json(
        { error: 'ID étudiant manquant ou invalide' },
        { status: 400 }
      );
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID étudiant invalide' },
        { status: 400 }
      );
    }

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

    // Vérifier si l'étudiant existe
    const existingEtudiant = await prisma.etudiant.findUnique({
      where: { id_etudiant: id },
      include: { utilisateur: true }
    });

    if (!existingEtudiant) {
      return NextResponse.json(
        { error: 'Étudiant non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier les doublons
    if (email || identifiant) {
      const duplicateUser = await prisma.utilisateur.findFirst({
        where: {
          AND: [
            { id_utilisateur: { not: id } },
            {
              OR: [
                email ? { email } : {},
                identifiant ? { identifiant } : {}
              ]
            }
          ]
        }
      });

      if (duplicateUser) {
        return NextResponse.json(
          { error: 'Un utilisateur avec cet email ou identifiant existe déjà' },
          { status: 400 }
        );
      }
    }

    // Vérifier le numéro d'inscription
    if (numero_inscription && numero_inscription !== existingEtudiant.numero_inscription) {
      const duplicateNumero = await prisma.etudiant.findUnique({
        where: { numero_inscription }
      });

      if (duplicateNumero) {
        return NextResponse.json(
          { error: 'Un étudiant avec ce numéro d\'inscription existe déjà' },
          { status: 400 }
        );
      }
    }

    // Récupérer les informations pour les champs dénormalisés
    let departement = existingEtudiant.departement;
    let specialite_nom = existingEtudiant.specialite_nom;
    let niveau_nom = existingEtudiant.niveau_nom;
    let groupe_nom = existingEtudiant.groupe_nom;

    if (id_specialite && id_specialite !== existingEtudiant.id_specialite) {
      const specialite = await prisma.specialite.findUnique({
        where: { id_specialite: parseInt(id_specialite) },
        include: { departement: true }
      });
      if (specialite) {
        departement = specialite.departement.nom;
        specialite_nom = specialite.nom;
      }
    }

    if (id_niveau && id_niveau !== existingEtudiant.id_niveau) {
      const niveau = await prisma.niveau.findUnique({
        where: { id_niveau: parseInt(id_niveau) }
      });
      if (niveau) {
        niveau_nom = niveau.nom;
      }
    }

    if (id_groupe && id_groupe !== existingEtudiant.id_groupe) {
      const groupe = await prisma.groupe.findUnique({
        where: { id_groupe: parseInt(id_groupe) }
      });
      if (groupe) {
        groupe_nom = groupe.nom;
      }
    }

    // Mettre à jour dans une transaction
    const etudiant = await prisma.$transaction(async (tx) => {
      // Préparer les données utilisateur
      const userData: any = {};
      if (nom) userData.nom = nom;
      if (prenom) userData.prenom = prenom;
      if (email) userData.email = email;
      if (identifiant) userData.identifiant = identifiant;
      if (mot_de_passe) {
        userData.mot_de_passe_hash = await bcrypt.hash(mot_de_passe, 10);
      }

      // Mettre à jour l'utilisateur
      if (Object.keys(userData).length > 0) {
        await tx.utilisateur.update({
          where: { id_utilisateur: id },
          data: userData
        });
      }

      // Préparer les données étudiant
      const etudiantData: any = {};
      if (numero_inscription) etudiantData.numero_inscription = numero_inscription;
      if (id_specialite !== undefined) {
        etudiantData.id_specialite = id_specialite ? parseInt(id_specialite) : null;
        etudiantData.departement = departement;
        etudiantData.specialite_nom = specialite_nom;
      }
      if (id_niveau !== undefined) {
        etudiantData.id_niveau = id_niveau ? parseInt(id_niveau) : null;
        etudiantData.niveau_nom = niveau_nom;
      }
      if (id_groupe !== undefined) {
        etudiantData.id_groupe = id_groupe ? parseInt(id_groupe) : null;
        etudiantData.groupe_nom = groupe_nom;
      }

      // Mettre à jour l'étudiant
      return await tx.etudiant.update({
        where: { id_etudiant: id },
        data: etudiantData,
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

    return NextResponse.json(etudiant, { status: 200 });
  } catch (error) {
    console.error('Erreur PUT etudiant:', error);
    return handleApiError(error);
  }
}

// DELETE - Supprimer un étudiant
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id || params.id === 'undefined' || params.id === 'null') {
      return NextResponse.json(
        { error: 'ID étudiant manquant ou invalide' },
        { status: 400 }
      );
    }

    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID étudiant invalide' },
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

    // Supprimer l'étudiant (l'utilisateur sera supprimé en cascade)
    await prisma.etudiant.delete({
      where: { id_etudiant: id }
    });

    // Supprimer l'utilisateur
    await prisma.utilisateur.delete({
      where: { id_utilisateur: id }
    });

    return NextResponse.json(
      { message: 'Étudiant supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur DELETE etudiant:', error);
    return handleApiError(error);
  }
}