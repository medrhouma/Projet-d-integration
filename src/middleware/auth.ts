import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_par_defaut_pour_le_dev'

export interface AuthUser {
  userId: number
  role: 'Etudiant' | 'Enseignant' | 'ChefDepartement' | 'Admin'
  isChefDepartement?: boolean
  departementId?: number
  iss?: string
  aud?: string
  iat?: number
  exp?: number
}

/**
 * Middleware pour vérifier l'authentification JWT
 * Extrait le token du cookie ou du header Authorization
 */
export async function verifyAuth(request: NextRequest): Promise<{ 
  authenticated: boolean
  user?: AuthUser
  error?: string 
}> {
  try {
    // 1. Essayer de récupérer le token depuis le cookie
    let token = request.cookies.get('token')?.value

    // 2. Si pas de cookie, essayer le header Authorization
    if (!token) {
      const authHeader = request.headers.get('authorization')
      if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.substring(7)
      }
    }

    // 3. Vérifier si le token existe
    if (!token) {
      return {
        authenticated: false,
        error: 'Token manquant. Veuillez vous connecter.'
      }
    }

    // 4. Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser

    // 5. Vérifier que le token contient les informations nécessaires
    if (!decoded.userId || !decoded.role) {
      return {
        authenticated: false,
        error: 'Token invalide ou corrompu.'
      }
    }

    // 6. Retourner l'utilisateur authentifié
    return {
      authenticated: true,
      user: decoded
    }

  } catch (error) {
    // Gestion des erreurs JWT
    if (error instanceof jwt.TokenExpiredError) {
      return {
        authenticated: false,
        error: 'Token expiré. Veuillez vous reconnecter.'
      }
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return {
        authenticated: false,
        error: 'Token invalide.'
      }
    }

    return {
      authenticated: false,
      error: 'Erreur d\'authentification.'
    }
  }
}

/**
 * Middleware wrapper pour protéger les routes API
 * Utilisation: const handler = withAuth(async (req, user) => { ... })
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await verifyAuth(request)

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Non authentifié'
        },
        { status: 401 }
      )
    }

    // Ajouter l'utilisateur au request pour y accéder facilement
    // @ts-ignore - Extension de NextRequest
    request.user = authResult.user

    return handler(request, authResult.user)
  }
}

/**
 * Middleware pour vérifier l'authentification avec rôles spécifiques
 * Utilisation: const handler = withRoles(['Admin', 'Enseignant'], async (req, user) => { ... })
 */
export function withRoles(
  allowedRoles: Array<'Etudiant' | 'Enseignant' | 'ChefDepartement' | 'Admin'>,
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await verifyAuth(request)

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Non authentifié'
        },
        { status: 401 }
      )
    }

    // Vérifier si l'utilisateur a le rôle requis
    if (!allowedRoles.includes(authResult.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Accès refusé. Permissions insuffisantes.'
        },
        { status: 403 }
      )
    }

    // @ts-ignore - Extension de NextRequest
    request.user = authResult.user

    return handler(request, authResult.user)
  }
}

/**
 * Middleware pour vérifier que l'utilisateur est chef de département
 * Utilisation: const handler = withChefDepartement(async (req, user) => { ... })
 */
export function withChefDepartement(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await verifyAuth(request)

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          error: authResult.error || 'Non authentifié'
        },
        { status: 401 }
      )
    }

    // Vérifier si l'utilisateur est chef de département
    if (authResult.user.role !== 'ChefDepartement' && !authResult.user.isChefDepartement && authResult.user.role !== 'Admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'Accès refusé. Cette fonctionnalité est réservée aux chefs de département.'
        },
        { status: 403 }
      )
    }

    // @ts-ignore - Extension de NextRequest
    request.user = authResult.user

    return handler(request, authResult.user)
  }
}

/**
 * Helper pour vérifier si un utilisateur est chef de département
 */
export function isChefDepartement(user: AuthUser): boolean {
  return user.role === 'ChefDepartement' || user.isChefDepartement === true
}

/**
 * Helper pour vérifier si un utilisateur peut accéder aux ressources d'un département
 */
export function canAccessDepartement(user: AuthUser, departementId: number): boolean {
  // Admin a accès à tout
  if (user.role === 'Admin') return true
  
  // Chef de département a accès uniquement à son département
  if (isChefDepartement(user) && user.departementId === departementId) return true
  
  return false
}

/**
 * Helper pour extraire l'utilisateur du request dans les routes protégées
 */
export function getAuthUser(request: NextRequest): AuthUser | null {
  // @ts-ignore
  return request.user || null
}
