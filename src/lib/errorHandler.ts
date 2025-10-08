import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

/**
 * Types d'erreurs personnalisées
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Ressource non trouvée') {
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Non authentifié') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Accès refusé') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
    this.name = 'ConflictError'
  }
}

/**
 * Handler global des erreurs pour les routes API
 */
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Erreurs personnalisées
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        code: error.code
      },
      { status: error.statusCode }
    )
  }

  // Erreurs Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaError(error)
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return NextResponse.json(
      {
        success: false,
        error: 'Données invalides',
        code: 'VALIDATION_ERROR'
      },
      { status: 400 }
    )
  }

  // Erreurs JavaScript standard
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur interne du serveur'
      },
      { status: 500 }
    )
  }

  // Erreur inconnue
  return NextResponse.json(
    {
      success: false,
      error: 'Erreur interne du serveur'
    },
    { status: 500 }
  )
}

/**
 * Gestion spécifique des erreurs Prisma
 */
function handlePrismaError(error: Prisma.PrismaClientKnownRequestError): NextResponse {
  switch (error.code) {
    case 'P2002':
      // Violation de contrainte unique
      const target = (error.meta?.target as string[]) || []
      const field = target[0] || 'champ'
      return NextResponse.json(
        {
          success: false,
          error: `Ce ${field} existe déjà`,
          code: 'UNIQUE_CONSTRAINT'
        },
        { status: 409 }
      )

    case 'P2003':
      // Violation de clé étrangère
      return NextResponse.json(
        {
          success: false,
          error: 'Référence invalide. Vérifiez les données liées.',
          code: 'FOREIGN_KEY_CONSTRAINT'
        },
        { status: 400 }
      )

    case 'P2025':
      // Enregistrement non trouvé
      return NextResponse.json(
        {
          success: false,
          error: 'Ressource non trouvée',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      )

    case 'P2014':
      // Violation de relation requise
      return NextResponse.json(
        {
          success: false,
          error: 'Impossible de supprimer. Des données dépendantes existent.',
          code: 'RELATION_VIOLATION'
        },
        { status: 400 }
      )

    default:
      return NextResponse.json(
        {
          success: false,
          error: 'Erreur de base de données',
          code: error.code
        },
        { status: 500 }
      )
  }
}

/**
 * Wrapper pour gérer les erreurs dans les routes API
 * Utilisation: export const GET = asyncHandler(async (req) => { ... })
 */
export function asyncHandler(
  handler: (request: Request, context?: any) => Promise<NextResponse>
) {
  return async (request: Request, context?: any) => {
    try {
      return await handler(request, context)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Validation helper
 */
export function validateRequired(
  data: Record<string, any>,
  requiredFields: string[]
): void {
  const missing = requiredFields.filter(field => !data[field])
  
  if (missing.length > 0) {
    throw new ValidationError(
      `Champs requis manquants: ${missing.join(', ')}`
    )
  }
}

/**
 * Validation d'email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return emailRegex.test(email)
}

/**
 * Validation de pagination
 */
export function validatePagination(page?: string, limit?: string) {
  const pageNum = parseInt(page || '1')
  const limitNum = parseInt(limit || '10')

  if (isNaN(pageNum) || pageNum < 1) {
    throw new ValidationError('Numéro de page invalide')
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new ValidationError('Limite invalide (1-100)')
  }

  return {
    page: pageNum,
    limit: limitNum,
    skip: (pageNum - 1) * limitNum
  }
}
