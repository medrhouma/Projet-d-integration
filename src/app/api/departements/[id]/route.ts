import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errorHandler';
import prisma from '@/lib/prisma';

// GET - Récupérer un département par ID
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

    const departement = await prisma.departement.findUnique({
      where: { id_departement: id },
      include: {
        specialites: {
          include: {
            niveaux: {
              include: {
                groupes: {
                  include: {
                    _count: {
                      select: { etudiants: true }
                    }
                  }
                },
                matieres: true
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
                email: true
              }
            }
          }
        }
      }
    });

    if (!departement) {
      return NextResponse.json(
        { error: 'Département non trouvé' },
        { status: 404 }
      );
    }

    // Calculate statistics
    let nombre_etudiants = 0;
    let nombre_matieres = 0;
    
    const specialitesWithStats = departement.specialites.map(spec => {
      let spec_etudiants = 0;
      let spec_groupes = 0;
      
      spec.niveaux.forEach(niveau => {
        nombre_matieres += niveau.matieres.length;
        spec_groupes += niveau.groupes.length;
        
        niveau.groupes.forEach(groupe => {
          spec_etudiants += groupe._count.etudiants;
        });
      });
      
      nombre_etudiants += spec_etudiants;
      
      return {
        id_specialite: spec.id_specialite,
        nom: spec.nom,
        code: '', // Code not in schema
        nombre_etudiants: spec_etudiants,
        nombre_groupes: spec_groupes
      };
    });

    const response = {
      id_departement: departement.id_departement,
      nom: departement.nom,
      code: '', // Code not in schema
      nombre_enseignants: departement.enseignants.length,
      nombre_etudiants,
      nombre_matieres,
      specialites: specialitesWithStats,
      enseignants: departement.enseignants
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT - Mettre à jour un département
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { nom } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'ID invalide' },
        { status: 400 }
      );
    }

    if (!nom) {
      return NextResponse.json(
        { error: 'Le nom du département est requis' },
        { status: 400 }
      );
    }

    const departement = await prisma.departement.update({
      where: { id_departement: id },
      data: { nom },
      include: {
        specialites: true,
        enseignants: {
          include: {
            utilisateur: {
              select: {
                nom: true,
                prenom: true,
                email: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(departement, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE - Supprimer un département
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

    await prisma.departement.delete({
      where: { id_departement: id }
    });

    return NextResponse.json(
      { message: 'Département supprimé avec succès' },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
