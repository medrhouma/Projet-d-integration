# 🧪 Guide de Test - Middleware d'Authentification

## 📋 Prérequis

1. ✅ Serveur démarré: `npm run dev`
2. ✅ Base de données configurée
3. ✅ Au moins un utilisateur Admin créé

---

## 🚀 Méthode 1: Script Automatique (Recommandé)

### Exécution
```bash
node test-middleware.js
```

### Ce que le script teste:
1. ✅ Accès sans authentification (doit échouer)
2. ✅ Login Admin
3. ✅ Accès au profil (route protégée)
4. ✅ Liste des utilisateurs (Admin uniquement)
5. ✅ Pagination (`?page=1&limit=3`)
6. ✅ Recherche (`?search=admin`)
7. ✅ Filtrage par rôle (`?role=Admin`)
8. ✅ Logout
9. ✅ Accès après logout (doit échouer)

### Résultat attendu:
```
╔════════════════════════════════════════════════════════╗
║   🧪 TEST SUITE - MIDDLEWARE D'AUTHENTIFICATION       ║
╚════════════════════════════════════════════════════════╝

📍 Base URL: http://localhost:3000
⏳ Démarrage des tests...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TEST: 1. Login avec Admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Login réussi
   Token reçu: Oui ✓
   User: Mohamed Admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TEST: 2. Accès au profil (route protégée)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Accès autorisé
   User ID: 1
   Nom: Mohamed Admin
   Role: Admin

...

╔════════════════════════════════════════════════════════╗
║                    📊 RÉSUMÉ                           ║
╚════════════════════════════════════════════════════════╝

Tests réussis: 9/9 (100%)

🎉 Tous les tests sont passés!
```

---

## 🔧 Méthode 2: Postman

### Collection Postman à créer:

#### 1. Login
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "login": "admin",
  "password": "Admin123",
  "role": "Admin"
}
```

#### 2. Get Profile
```
GET http://localhost:3000/api/profile
```

#### 3. Get Users (Admin)
```
GET http://localhost:3000/api/users
```

#### 4. Get Users avec Pagination
```
GET http://localhost:3000/api/users?page=1&limit=5
```

#### 5. Get Users avec Recherche
```
GET http://localhost:3000/api/users?search=mohamed
```

#### 6. Get Users par Rôle
```
GET http://localhost:3000/api/users?role=Etudiant
```

#### 7. Logout
```
POST http://localhost:3000/api/auth/logout
```

### Tests à vérifier dans Postman:

**Test 1: Login réussi**
- Status: 200
- Response contient: `success: true`, `token`, `user`
- Cookie `token` est défini

**Test 2: Profile avec auth**
- Status: 200
- Response contient les infos utilisateur

**Test 3: Profile sans auth**
- Supprimer le cookie
- Status: 401
- Response: `error: "Token manquant..."`

**Test 4: Users avec Admin**
- Status: 200
- Response contient liste + pagination

**Test 5: Users avec Enseignant**
- Login comme Enseignant
- Accéder à `/api/users`
- Status: 403
- Response: `error: "Accès refusé..."`

**Test 6: Pagination invalide**
- `/api/users?page=0`
- Status: 400
- Response: `error: "Numéro de page invalide"`

**Test 7: Logout**
- Status: 200
- Cookie supprimé

---

## 💻 Méthode 3: Browser Console

Ouvrir DevTools (F12) et coller:

```javascript
// Configuration
const API = 'http://localhost:3000/api'

// Helper function
async function test(name, fn) {
  console.log(`\n🧪 ${name}`)
  try {
    const result = await fn()
    console.log('✅ Succès:', result)
    return true
  } catch (error) {
    console.log('❌ Échec:', error.message)
    return false
  }
}

// Test 1: Login
await test('Login', async () => {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      login: 'admin',
      password: 'Admin123',
      role: 'Admin'
    })
  })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data.user
})

// Test 2: Profile
await test('Profile', async () => {
  const res = await fetch(`${API}/profile`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data.data
})

// Test 3: Users
await test('Users', async () => {
  const res = await fetch(`${API}/users`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return `${data.data.length} utilisateurs`
})

// Test 4: Pagination
await test('Pagination', async () => {
  const res = await fetch(`${API}/users?page=1&limit=3`)
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return `Page ${data.pagination.page}, ${data.data.length} résultats`
})

// Test 5: Logout
await test('Logout', async () => {
  const res = await fetch(`${API}/auth/logout`, { method: 'POST' })
  const data = await res.json()
  if (!data.success) throw new Error(data.error)
  return data.message
})

// Test 6: Après logout
await test('Après logout (doit échouer)', async () => {
  const res = await fetch(`${API}/profile`)
  const data = await res.json()
  if (res.status === 401) return 'Correctement refusé'
  throw new Error('Accès autorisé après logout!')
})
```

---

## 🐛 Dépannage

### Problème 1: "Cannot connect to server"
```bash
# Vérifier que le serveur tourne
npm run dev

# Vérifier le port
netstat -ano | findstr :3000
```

### Problème 2: "Login failed"
```bash
# Vérifier qu'un utilisateur existe
npx prisma studio
# Aller dans la table "utilisateur"
# Vérifier identifiant et rôle
```

### Problème 3: "Token manquant"
- Vérifier que le cookie est envoyé
- Dans Postman: Settings > Cookies > Activer
- Dans curl: Utiliser `-c cookies.txt` puis `-b cookies.txt`

### Problème 4: "Accès refusé"
- Vérifier le rôle de l'utilisateur
- `/api/users` nécessite rôle Admin
- `/api/profile` accepte tous les rôles

### Problème 5: "JWT_SECRET not defined"
```bash
# Vérifier .env
echo %JWT_SECRET%  # Windows
echo $JWT_SECRET   # Linux/Mac

# Ajouter dans .env si manquant
JWT_SECRET=votre_secret_super_securise_123
```

---

## ✅ Checklist de Test

Avant de passer à la suite, vérifier:

- [ ] Login fonctionne
- [ ] Cookie est défini après login
- [ ] `/api/profile` accessible avec auth
- [ ] `/api/profile` refusé sans auth
- [ ] `/api/users` accessible pour Admin
- [ ] `/api/users` refusé pour Enseignant/Etudiant
- [ ] Pagination fonctionne (`?page=1&limit=5`)
- [ ] Recherche fonctionne (`?search=text`)
- [ ] Filtrage fonctionne (`?role=Admin`)
- [ ] Logout supprime le cookie
- [ ] Accès refusé après logout

---

## 🎯 Prochaines étapes

Une fois tous les tests passent:
1. ✅ Créer CRUD Départements
2. ✅ Créer CRUD Matières
3. ✅ Créer CRUD Salles
4. ✅ Créer Service Emploi du Temps

Le middleware est maintenant prêt à protéger toutes les futures APIs! 🔐
