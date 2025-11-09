import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

// GET - Récupérer les absences des enseignants (chef de département)
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    if (decoded.role !== 'ChefDepartement') {
      return NextResponse.json({ error: 'Accès réservé aux chefs de département' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id_enseignant = searchParams.get('id_enseignant');
    const dateDebut = searchParams.get('dateDebut');
    const dateFin = searchParams.get('dateFin');

    // Récupérer le département du chef
    const chef = await prisma.enseignant.findUnique({
      where: { id_enseignant: decoded.enseignant?.id_enseignant }
    });

    if (!chef || !chef.id_departement) {
      return NextResponse.json({ error: 'Chef de département non trouvé' }, { status: 404 });
    }

    // Construire la requête
    const where: any = {
      enseignant: {
        id_departement: chef.id_departement
      }
    };

    if (id_enseignant) {
      where.id_enseignant = parseInt(id_enseignant);
    }

    // Récupérer les absences
    const absences = await prisma.absenceEnseignant.findMany({
      where,
      include: {
        enseignant: {
          include: {
            utilisateur: true
          }
        }
      },
      orderBy: {
        date_creation: 'desc'
      }
    });

    // Récupérer aussi les statistiques
    const enseignants = await prisma.enseignant.findMany({
      where: {
        id_departement: chef.id_departement
      },
      include: {
        utilisateur: true,
        absences: true
      }
    });

    const stats = enseignants.map(ens => ({
      id_enseignant: ens.id_enseignant,
      nom: ens.utilisateur.nom,
      prenom: ens.utilisateur.prenom,
      total_absences: ens.absences.length,
      absences_non_justifiees: ens.absences.filter(a => a.statut === 'NonJustifiee').length
    }));

    return NextResponse.json({
      success: true,
      absences,
      stats
    });

  } catch (error: any) {
    console.error('❌ Erreur GET /api/absences/enseignants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des absences' },
      { status: 500 }
    );
  }
}

// POST - Marquer un enseignant absent (chef de département)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    if (decoded.role !== 'ChefDepartement') {
      return NextResponse.json({ error: 'Accès réservé aux chefs de département' }, { status: 403 });
    }

    const body = await request.json();
    const { id_enseignant, id_emploi, motif, statut } = body;

    if (!id_enseignant || !id_emploi) {
      return NextResponse.json(
        { error: 'id_enseignant et id_emploi requis' },
        { status: 400 }
      );
    }

    // Vérifier que l'enseignant est dans le même département
    const chef = await prisma.enseignant.findUnique({
      where: { id_enseignant: decoded.enseignant?.id_enseignant }
    });

    const enseignant = await prisma.enseignant.findUnique({
      where: { id_enseignant: parseInt(id_enseignant) }
    });

    if (!enseignant || enseignant.id_departement !== chef?.id_departement) {
      return NextResponse.json({ error: 'Enseignant non trouvé ou pas dans votre département' }, { status: 403 });
    }

    // Vérifier si une absence existe déjà
    const absenceExistante = await prisma.absenceEnseignant.findFirst({
      where: {
        id_emploi: parseInt(id_emploi),
        id_enseignant: parseInt(id_enseignant)
      }
    });

    if (absenceExistante) {
      return NextResponse.json(
        { error: 'Absence déjà enregistrée' },
        { status: 409 }
      );
    }

    // Créer l'absence
    const absence = await prisma.absenceEnseignant.create({
      data: {
        id_emploi: parseInt(id_emploi),
        id_enseignant: parseInt(id_enseignant),
        motif: motif || null,
        statut: statut || 'NonJustifiee'
      },
      include: {
        enseignant: {
          include: {
            utilisateur: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, absence }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Erreur POST /api/absences/enseignants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'enregistrement de l\'absence' },
      { status: 500 }
    );
  }
}

// PUT - Justifier une absence (chef de département)
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    if (decoded.role !== 'ChefDepartement') {
      return NextResponse.json({ error: 'Accès réservé aux chefs de département' }, { status: 403 });
    }

    const body = await request.json();
    const { id_absence, statut, motif } = body;

    if (!id_absence) {
      return NextResponse.json({ error: 'id_absence requis' }, { status: 400 });
    }

    // Mettre à jour l'absence
    const absence = await prisma.absenceEnseignant.update({
      where: { id_absence: parseInt(id_absence) },
      data: {
        statut: statut || 'Justifiee',
        ...(motif && { motif })
      },
      include: {
        enseignant: {
          include: {
            utilisateur: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, absence });

  } catch (error: any) {
    console.error('❌ Erreur PUT /api/absences/enseignants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour de l\'absence' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une absence (chef de département)
export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token.value, JWT_SECRET) as any;

    if (decoded.role !== 'ChefDepartement') {
      return NextResponse.json({ error: 'Accès réservé aux chefs de département' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id_absence = searchParams.get('id_absence');

    if (!id_absence) {
      return NextResponse.json({ error: 'id_absence requis' }, { status: 400 });
    }

    // Supprimer l'absence
    await prisma.absenceEnseignant.delete({
      where: { id_absence: parseInt(id_absence) }
    });

    return NextResponse.json({ success: true, message: 'Absence supprimée' });

  } catch (error: any) {
    console.error('❌ Erreur DELETE /api/absences/enseignants:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'absence' },
      { status: 500 }
    );
  }
}
