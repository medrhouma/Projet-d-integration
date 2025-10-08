# 🔐 Guide d'utilisation du Middleware d'authentification

## 📚 Table des matières
1. [Introduction](#introduction)
2. [Installation](#installation)
3. [Utilisation basique](#utilisation-basique)
4. [Protection par rôles](#protection-par-rôles)
5. [Gestion des erreurs](#gestion-des-erreurs)
6. [Exemples complets](#exemples-complets)

---

## 🎯 Introduction

Le système de middleware fournit:
- ✅ Authentification JWT automatique
- ✅ Protection des routes par rôle
- ✅ Gestion centralisée des erreurs
- ✅ Validation des données
- ✅ Support cookie et header Authorization

---

## 📦 Installation

Les fichiers créés:
```
src/
├── middleware/
│   └── auth.ts              # Middleware d'authentification
├── lib/
│   └── errorHandler.ts      # Gestion des erreurs
└── app/api/
    ├── profile/route.ts     # Exemple: route protégée
    ├── users/route.ts       # Exemple: route Admin uniquement
    └── auth/logout/route.ts # Exemple: déconnexion
```

---

## 🔧 Utilisation basique

### 1. Route protégée simple (tous les utilisateurs connectés)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/middleware/auth'
import { handleApiError } from '@/lib/errorHandler'

async function handler(request: NextRequest, user: AuthUser) {
  try {
    // user.userId - ID de l'utilisateur
    // user.role - Rôle (Etudiant, Enseignant, Admin)
    
    return NextResponse.json({
      success: true,
      message: `Bonjour utilisateur ${user.userId}`,
      role: user.role
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export const GET = withAuth(handler)
```

### 2. Accès aux informations utilisateur

```typescript
async function handler(request: NextRequest, user: AuthUser) {
  console.log('User ID:', user.userId)
  console.log('Role:', user.role)
  
  // Récupérer les détails depuis la DB
  const utilisateur = await prisma.utilisateur.findUnique({
    where: { id_utilisateur: user.userId }
  })
  
  return NextResponse.json({ data: utilisateur })
}
```

---

## 🛡️ Protection par rôles

### 1. Route Admin uniquement

```typescript
import { withRoles } from '@/middleware/auth'

async function adminHandler(request: NextRequest, user: AuthUser) {
  // Seuls les Admins peuvent accéder ici
  return NextResponse.json({
    success: true,
    message: 'Accès Admin autorisé'
  })
}

export const GET = withRoles(['Admin'], adminHandler)
```

### 2. Route Admin + Enseignant

```typescript
export const GET = withRoles(['Admin', 'Enseignant'], handler)
```

### 3. Route Enseignant uniquement

```typescript
export const GET = withRoles(['Enseignant'], handler)
```

### 4. Tous les rôles (équivalent à withAuth)

```typescript
export const GET = withRoles(['Admin', 'Enseignant', 'Etudiant'], handler)
```

---

## ⚠️ Gestion des erreurs

### 1. Erreurs personnalisées

```typescript
import { 
  ValidationError, 
  NotFoundError, 
  UnauthorizedError,
  ForbiddenError,
  ConflictError 
} from '@/lib/errorHandler'

async function handler(request: NextRequest, user: AuthUser) {
  // Validation
  if (!data.email) {
    throw new ValidationError('Email requis')
  }
  
  // Ressource non trouvée
  const item = await prisma.item.findUnique({ where: { id } })
  if (!item) {
    throw new NotFoundError('Item non trouvé')
  }
  
  // Conflit (doublon)
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    throw new ConflictError('Cet email existe déjà')
  }
  
  // Accès refusé
  if (item.userId !== user.userId) {
    throw new ForbiddenError('Vous ne pouvez pas modifier cet item')
  }
}
```

### 2. Wrapper automatique des erreurs

```typescript
import { asyncHandler } from '@/lib/errorHandler'

export const GET = asyncHandler(async (request) => {
  // Les erreurs sont automatiquement gérées
  const data = await prisma.item.findMany()
  return NextResponse.json({ data })
})
```

### 3. Validation des champs requis

```typescript
import { validateRequired } from '@/lib/errorHandler'

async function handler(request: NextRequest, user: AuthUser) {
  const body = await request.json()
  
  // Lève une ValidationError si des champs manquent
  validateRequired(body, ['nom', 'prenom', 'email'])
  
  // Continue...
}
```

### 4. Validation de pagination

```typescript
import { validatePagination } from '@/lib/errorHandler'

async function handler(request: NextRequest, user: AuthUser) {
  const { searchParams } = new URL(request.url)
  
  const { page, limit, skip } = validatePagination(
    searchParams.get('page'),
    searchParams.get('limit')
  )
  
  const items = await prisma.item.findMany({
    skip,
    take: limit
  })
}
```

---

## 📝 Exemples complets

### Exemple 1: CRUD Département (Admin uniquement)

```typescript
// src/app/api/departements/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withRoles, AuthUser } from '@/middleware/auth'
import { prisma } from '@/lib/prisma'
import { 
  handleApiError, 
  validateRequired,
  validatePagination,
  ConflictError 
} from '@/lib/errorHandler'

// GET - Liste des départements
async function getDepartements(request: NextRequest, user: AuthUser) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip } = validatePagination(
      searchParams.get('page'),
      searchParams.get('limit')
    )

    const [departements, total] = await Promise.all([
      prisma.departement.findMany({
        skip,
        take: limit,
        orderBy: { nom: 'asc' },
        include: {
          _count: {
            select: {
              enseignants: true,
              specialites: true
            }
          }
        }
      }),
      prisma.departement.count()
    ])

    return NextResponse.json({
      success: true,
      data: departements,
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

// POST - Créer un département
async function createDepartement(request: NextRequest, user: AuthUser) {
  try {
    const body = await request.json()
    
    // Validation
    validateRequired(body, ['nom'])
    
    // Vérifier si le département existe déjà
    const existing = await prisma.departement.findUnique({
      where: { nom: body.nom }
    })
    
    if (existing) {
      throw new ConflictError('Ce département existe déjà')
    }
    
    // Créer le département
    const departement = await prisma.departement.create({
      data: {
        nom: body.nom.trim()
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Département créé avec succès',
      data: departement
    }, { status: 201 })
    
  } catch (error) {
    return handleApiError(error)
  }
}

// Exporter les routes protégées (Admin uniquement)
export const GET = withRoles(['Admin', 'Enseignant'], getDepartements)
export const POST = withRoles(['Admin'], createDepartement)
```

### Exemple 2: Profil utilisateur (route protégée)

```typescript
// src/app/api/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthUser } from '@/middleware/auth'
import { prisma } from '@/lib/prisma'
import { handleApiError, NotFoundError } from '@/lib/errorHandler'

async function getProfile(request: NextRequest, user: AuthUser) {
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id_utilisateur: user.userId },
      include: {
        etudiant: true,
        enseignant: {
          include: {
            departement: true
          }
        }
      }
    })

    if (!utilisateur) {
      throw new NotFoundError('Utilisateur non trouvé')
    }

    return NextResponse.json({
      success: true,
      data: utilisateur
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export const GET = withAuth(getProfile)
```

### Exemple 3: Vérification manuelle du token

```typescript
import { verifyAuth } from '@/middleware/auth'

export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request)
  
  if (!authResult.authenticated) {
    return NextResponse.json({
      error: authResult.error
    }, { status: 401 })
  }
  
  // Utiliser authResult.user
  console.log('User:', authResult.user)
}
```

---

## 🔑 Authentification côté client

### 1. Avec cookie (automatique)

```typescript
// Le cookie est envoyé automatiquement
const response = await fetch('/api/profile')
```

### 2. Avec header Authorization

```typescript
const token = localStorage.getItem('token')

const response = await fetch('/api/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

---

## 🧪 Tests

### Test avec curl

```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"login":"admin","password":"password","role":"Admin"}' \
  -c cookies.txt

# 2. Accéder à une route protégée
curl http://localhost:3000/api/profile \
  -b cookies.txt

# 3. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

### Test avec Postman

1. **Login**: POST `/api/auth/login`
2. Le cookie `token` est automatiquement sauvegardé
3. **Routes protégées**: Les requêtes suivantes incluent automatiquement le cookie

---

## 📊 Codes de statut HTTP

| Code | Signification | Quand l'utiliser |
|------|---------------|------------------|
| 200 | OK | Succès (GET, PUT) |
| 201 | Created | Ressource créée (POST) |
| 400 | Bad Request | Données invalides |
| 401 | Unauthorized | Non authentifié |
| 403 | Forbidden | Pas de permission |
| 404 | Not Found | Ressource introuvable |
| 409 | Conflict | Doublon/conflit |
| 500 | Server Error | Erreur serveur |

---

## ✅ Checklist pour créer une nouvelle API

- [ ] Importer `withAuth` ou `withRoles`
- [ ] Importer `handleApiError`
- [ ] Wrapper le handler avec le middleware
- [ ] Utiliser try/catch
- [ ] Valider les données avec `validateRequired`
- [ ] Gérer les erreurs avec les classes d'erreur
- [ ] Retourner des réponses JSON cohérentes
- [ ] Bloquer les méthodes HTTP non utilisées

---

## 🎓 Bonnes pratiques

1. **Toujours utiliser try/catch**
2. **Valider les données avant de les utiliser**
3. **Utiliser les erreurs personnalisées** (ValidationError, NotFoundError, etc.)
4. **Logger les actions importantes** (console.log)
5. **Retourner des messages clairs**
6. **Utiliser la pagination pour les listes**
7. **Inclure les relations nécessaires uniquement**
8. **Vérifier les permissions métier** (ex: un étudiant ne peut modifier que ses propres données)

---

## 🚀 Prochaines étapes

Maintenant que le middleware est en place, vous pouvez créer:
1. ✅ CRUD Départements
2. ✅ CRUD Matières
3. ✅ CRUD Salles
4. ✅ CRUD Enseignants/Étudiants
5. ✅ Service Emploi du temps
6. ✅ Service Absences
7. ✅ Service Messagerie

Tous ces services utiliseront ce middleware pour la sécurité! 🔐
