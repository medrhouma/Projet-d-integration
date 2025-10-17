import { NextRequest, NextResponse } from 'next/server'

/**
 * POST /api/auth/logout
 * Déconnecte l'utilisateur en supprimant les cookies d'authentification
 */
export async function POST(request: NextRequest) {
  try {
    // Supprimer les cookies d'authentification
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    })

    // Supprimer le cookie du token
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    // Supprimer le cookie du rôle
    response.cookies.set('userRole', '', {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    console.log('✅ Déconnexion réussie')
    return response

  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion:', error)
    return NextResponse.json(
      { 
        success: false,
        message: 'Erreur lors de la déconnexion' 
      },
      { status: 500 }
    )
  }
}

// Gestion des méthodes non autorisées
export async function GET() {
  return NextResponse.json(
    { message: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { message: 'Méthode non autorisée' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { message: 'Méthode non autorisée' },
    { status: 405 }
  )
}
