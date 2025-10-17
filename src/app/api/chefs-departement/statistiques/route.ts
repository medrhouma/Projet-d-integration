import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';
import { withChefDepartement } from '@/middleware/auth';

/**
 * GET /api/chefs-departement/statistiques
 * Récupérer les statistiques du département du chef
 * Accessible par: ChefDepartement, Admin
 */
export const GET = withChefDepartement(async (request: NextRequest, user) => {
  try {
    const { searchParams } = new URL(request.url);
    const departementIdParam = searchParams.get('departementId');

    // Si pas d'ID fourni et que l'utilisateur est chef, utiliser son département
    let departementId: number;
    
    if (departementIdParam) {
      departementId = parseInt(departementIdParam);
    } else if (user.departementId) {
      departementId = user.departementId;
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID du département requis' 
        },
        { status: 400 }
      );
    }

    // Vérifier l'accès (Admin peut tout voir, Chef uniquement son département)
    if (user.role !== 'Admin' && user.departementId !== departementId) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Accès refusé à ce département' 
        },
        { status: 403 }
      );
    }

    // Récupérer les informations du département
    const departement = await prisma.departement.findUnique({
      where: { id_departement: departementId },
      include: {
        specialites: {
          include: {
            niveaux: {
              include: {
                groupes: true,
                matieres: true,
                etudiants: true
              }
            }
          }
        },
        enseignants: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true,
                role: true
              }
            },
            matieres: true
          }
        }
      }
    });

    if (!departement) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Département non trouvé' 
        },
        { status: 404 }
      );
    }

    // Calculer les statistiques
    const nombreSpecialites = departement.specialites.length;
    const nombreEnseignants = departement.enseignants.length;
    
    let nombreNiveaux = 0;
    let nombreGroupes = 0;
    let nombreMatieres = 0;
    let nombreEtudiants = 0;

    departement.specialites.forEach(specialite => {
      nombreNiveaux += specialite.niveaux.length;
      
      specialite.niveaux.forEach(niveau => {
        nombreGroupes += niveau.groupes.length;
        nombreMatieres += niveau.matieres.length;
        nombreEtudiants += niveau.etudiants.length;
      });
    });

    const statistiques = {
      departement: {
        id: departement.id_departement,
        nom: departement.nom
      },
      nombre_specialites: nombreSpecialites,
      nombre_enseignants: nombreEnseignants,
      nombre_niveaux: nombreNiveaux,
      nombre_groupes: nombreGroupes,
      nombre_matieres: nombreMatieres,
      nombre_etudiants: nombreEtudiants,
      specialites: departement.specialites.map(specialite => ({
        id: specialite.id_specialite,
        nom: specialite.nom,
        nombre_niveaux: specialite.niveaux.length,
        nombre_groupes: specialite.niveaux.reduce((acc, niveau) => acc + niveau.groupes.length, 0),
        nombre_etudiants: specialite.niveaux.reduce((acc, niveau) => acc + niveau.etudiants.length, 0)
      })),
      enseignants: departement.enseignants.map(ens => ({
        id: ens.id_enseignant,
        nom: ens.utilisateur.nom,
        prenom: ens.utilisateur.prenom,
        email: ens.utilisateur.email,
        matricule: ens.matricule,
        est_chef: ens.est_chef_departement,
        nombre_matieres: ens.matieres.length
      }))
    };

    return NextResponse.json({
      success: true,
      data: statistiques
    }, { status: 200 });

  } catch (error) {
    return handleApiError(error);
  }
});
