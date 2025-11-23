import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-key';

// GET - Récupérer la liste des contacts possibles selon le rôle
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; role: string };
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    let contacts: any[] = [];

    // Selon le rôle, on récupère différents contacts
    switch (decoded.role) {
      case 'Etudiant':
        // Les étudiants peuvent contacter les enseignants et l'administration
        contacts = await prisma.utilisateur.findMany({
          where: {
            AND: [
              {
                id_utilisateur: { not: decoded.userId },
              },
              {
                role: { in: ['Enseignant', 'ChefDepartement', 'Admin'] },
              },
              {
                OR: [
                  { nom: { contains: search } },
                  { prenom: { contains: search } },
                  { email: { contains: search } },
                ],
              },
            ],
          },
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
            enseignant: {
              select: {
                departement_nom: true,
                est_chef_departement: true,
              },
            },
          },
          orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
        });
        break;

      case 'Enseignant':
        // Les enseignants peuvent contacter les étudiants, autres enseignants et l'administration
        contacts = await prisma.utilisateur.findMany({
          where: {
            AND: [
              {
                id_utilisateur: { not: decoded.userId },
              },
              {
                OR: [
                  { nom: { contains: search } },
                  { prenom: { contains: search } },
                  { email: { contains: search } },
                ],
              },
            ],
          },
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
            etudiant: {
              select: {
                numero_inscription: true,
                specialite_nom: true,
                niveau_nom: true,
                groupe_nom: true,
              },
            },
            enseignant: {
              select: {
                departement_nom: true,
                est_chef_departement: true,
              },
            },
          },
          orderBy: [{ role: 'asc' }, { nom: 'asc' }, { prenom: 'asc' }],
        });
        break;

      case 'ChefDepartement':
        // Le chef de département peut contacter uniquement les utilisateurs de son département
        // D'abord, récupérer le département du chef
        const chef = await prisma.enseignant.findUnique({
          where: { id_enseignant: decoded.userId },
          select: { departement_nom: true },
        });

        if (!chef || !chef.departement_nom) {
          return NextResponse.json({ error: 'Département non trouvé' }, { status: 404 });
        }

        contacts = await prisma.utilisateur.findMany({
          where: {
            AND: [
              {
                id_utilisateur: { not: decoded.userId },
              },
              {
                OR: [
                  // Enseignants du même département
                  {
                    enseignant: {
                      departement_nom: chef.departement_nom,
                    },
                  },
                  // Étudiants dont la spécialité appartient au département
                  {
                    etudiant: {
                      departement: chef.departement_nom,
                    },
                  },
                  // Admin (pour pouvoir contacter l'administration)
                  {
                    role: 'Admin',
                  },
                ],
              },
              {
                OR: [
                  { nom: { contains: search } },
                  { prenom: { contains: search } },
                  { email: { contains: search } },
                ],
              },
            ],
          },
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
            etudiant: {
              select: {
                numero_inscription: true,
                specialite_nom: true,
                niveau_nom: true,
                groupe_nom: true,
                departement: true,
              },
            },
            enseignant: {
              select: {
                departement_nom: true,
                est_chef_departement: true,
              },
            },
          },
          orderBy: [{ role: 'asc' }, { nom: 'asc' }, { prenom: 'asc' }],
        });
        break;

      case 'Admin':
        // L'administration peut contacter tout le monde
        contacts = await prisma.utilisateur.findMany({
          where: {
            AND: [
              {
                id_utilisateur: { not: decoded.userId },
              },
              {
                OR: [
                  { nom: { contains: search } },
                  { prenom: { contains: search } },
                  { email: { contains: search } },
                ],
              },
            ],
          },
          select: {
            id_utilisateur: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
            etudiant: {
              select: {
                numero_inscription: true,
                specialite_nom: true,
                niveau_nom: true,
                groupe_nom: true,
              },
            },
            enseignant: {
              select: {
                departement_nom: true,
                est_chef_departement: true,
              },
            },
          },
          orderBy: [{ role: 'asc' }, { nom: 'asc' }, { prenom: 'asc' }],
        });
        break;

      default:
        return NextResponse.json({ error: 'Rôle non valide' }, { status: 400 });
    }

    return NextResponse.json(contacts);
  } catch (error) {
    console.error('Erreur lors de la récupération des contacts:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
