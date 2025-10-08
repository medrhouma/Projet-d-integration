import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_par_defaut_pour_le_dev'

export interface AuthUser {
  userId: number
  role: 'Etudiant' | 'Enseignant' | 'Admin'
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
  allowedRoles: Array<'Etudiant' | 'Enseignant' | 'Admin'>,
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
 * Helper pour extraire l'utilisateur du request dans les routes protégées
 */
export function getAuthUser(request: NextRequest): AuthUser | null {
  // @ts-ignore
  return request.user || null
}
