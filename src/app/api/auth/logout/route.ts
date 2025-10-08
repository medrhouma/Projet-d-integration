import { NextRequest, NextResponse } from 'next/server'
<<<<<<< HEAD
import { withAuth, AuthUser } from '@/middleware/auth'

/**
 * POST /api/auth/logout
 * Déconnexion de l'utilisateur
 * Supprime les cookies d'authentification
 */
async function logout(request: NextRequest, user: AuthUser) {
  try {
    console.log(`Déconnexion de l'utilisateur ${user.userId} (${user.role})`)

=======

/**
 * POST /api/auth/logout
 * Déconnecte l'utilisateur en supprimant les cookies d'authentification
 */
export async function POST(request: NextRequest) {
  try {
>>>>>>> 20236f14b23660c5eeea05070d0f3a8fd588f539
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    })

<<<<<<< HEAD
    // Supprimer les cookies
    response.cookies.delete('token')
    response.cookies.delete('userRole')

=======
    // Supprimer le cookie du token
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immédiatement
      path: '/'
    })

    // Supprimer le cookie du rôle
    response.cookies.set('userRole', '', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    console.log('Déconnexion réussie')
>>>>>>> 20236f14b23660c5eeea05070d0f3a8fd588f539
    return response

  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
<<<<<<< HEAD
    
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la déconnexion'
=======
    return NextResponse.json(
      { 
        success: false,
        message: 'Erreur lors de la déconnexion' 
>>>>>>> 20236f14b23660c5eeea05070d0f3a8fd588f539
      },
      { status: 500 }
    )
  }
}

<<<<<<< HEAD
// Exporter la route protégée
export const POST = withAuth(logout)

// Bloquer les autres méthodes
export async function GET() {
  return NextResponse.json(
    { success: false, error: 'Méthode non autorisée. Utilisez POST.' },
=======
// Gestion des méthodes non autorisées
export async function GET() {
  return NextResponse.json(
    { message: 'Méthode non autorisée' },
>>>>>>> 20236f14b23660c5eeea05070d0f3a8fd588f539
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
<<<<<<< HEAD
    { success: false, error: 'Méthode non autorisée' },
=======
    { message: 'Méthode non autorisée' },
>>>>>>> 20236f14b23660c5eeea05070d0f3a8fd588f539
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
<<<<<<< HEAD
    { success: false, error: 'Méthode non autorisée' },
=======
    { message: 'Méthode non autorisée' },
>>>>>>> 20236f14b23660c5eeea05070d0f3a8fd588f539
    { status: 405 }
  )
}
