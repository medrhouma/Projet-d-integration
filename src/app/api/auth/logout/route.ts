import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/middleware/auth'

/**
 * POST /api/auth/logout
 * Déconnexion de l'utilisateur
 * Supprime les cookies d'authentification
 */
async function logout(request: NextRequest, user: AuthUser) {
  try {
    console.log(`Déconnexion de l'utilisateur ${user.userId} (${user.role})`)

    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    })

    // Supprimer les cookies
    response.cookies.delete('token')
    response.cookies.delete('userRole')

    return response

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la déconnexion'
      },
      { status: 500 }
    )
  }
}

// Exporter la route protégée
export const POST = withAuth(logout)

// Bloquer les autres méthodes
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée. Utilisez POST.' },
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
