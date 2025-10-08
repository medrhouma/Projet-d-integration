import { NextRequest, NextResponse } from 'next/server'
import { withRoles, AuthUser } from '@/middleware/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError, validatePagination } from '@/lib/errorHandler'

/**
 * GET /api/users
 * Liste de tous les utilisateurs (Admin uniquement)
 * Query params: page, limit, role
 */
async function getUsers(request: NextRequest, user: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination
    const { page, limit, skip } = validatePagination(
      searchParams.get('page') || undefined,
      searchParams.get('limit') || undefined
    )

    // Filtrage par rôle (optionnel)
    const roleFilter = searchParams.get('role')
    const whereClause: any = {}
    
    if (roleFilter && ['Etudiant', 'Enseignant', 'Admin'].includes(roleFilter)) {
      whereClause.role = roleFilter
    }

    // Recherche (optionnel)
    const search = searchParams.get('search')
    if (search) {
      whereClause.OR = [
        { nom: { contains: search } },
        { prenom: { contains: search } },
        { email: { contains: search } },
        { identifiant: { contains: search } }
      ]
    }

    // Récupérer les utilisateurs avec pagination
    const [utilisateurs, total] = await Promise.all([
      prisma.utilisateur.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { date_creation: 'desc' },
        select: {
          id_utilisateur: true,
          nom: true,
          prenom: true,
          email: true,
          identifiant: true,
          role: true,
          date_creation: true,
          date_modification: true,
          etudiant: {
            select: {
              numero_inscription: true,
              specialite: {
                select: {
                  nom: true,
                  departement: {
                    select: {
                      nom: true
                    }
                  }
                }
              },
              groupe: {
                select: {
                  nom: true
                }
              }
            }
          },
          enseignant: {
            select: {
              matricule: true,
              departement: {
                select: {
                  nom: true
                }
              }
            }
          }
        }
      }),
      prisma.utilisateur.count({ where: whereClause })
    ])

    return NextResponse.json({
      success: true,
      data: utilisateurs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    return handleApiError(error)
  }
}

// Exporter la route protégée (Admin uniquement)
export const GET = withRoles(['Admin'], getUsers)

// Bloquer les autres méthodes
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée' },
    { status: 405 }
  )
}
