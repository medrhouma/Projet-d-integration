/**
 * Script de test pour le middleware d'authentification
 * Usage: node test-middleware.js
 */

const BASE_URL = 'http://localhost:3000'

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
}

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function logTest(name) {
  console.log(`\n${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
  console.log(`${colors.blue}🧪 TEST: ${name}${colors.reset}`)
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`)
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green')
}

function logError(message) {
  log(`❌ ${message}`, 'red')
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow')
}

// Variable pour stocker le cookie
let authCookie = ''

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  if (authCookie) {
    headers['Cookie'] = authCookie
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

    // Capturer le cookie de la réponse
    const setCookie = response.headers.get('set-cookie')
    if (setCookie) {
      authCookie = setCookie.split(';')[0]
    }

    const data = await response.json()
    return { status: response.status, data }
  } catch (error) {
    return { status: 0, error: error.message }
  }
}

async function testLogin() {
  logTest('1. Login avec Admin')
  
  const response = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      login: 'admin',
      password: 'Admin123',
      role: 'Admin'
    })
  })

  if (response.status === 200 && response.data.success) {
    logSuccess('Login réussi')
    console.log('   Token reçu:', authCookie ? 'Oui ✓' : 'Non ✗')
    console.log('   User:', response.data.user?.prenom, response.data.user?.nom)
    return true
  } else {
    logError('Login échoué')
    console.log('   Status:', response.status)
    console.log('   Message:', response.data.message || response.data.error)
    return false
  }
}

async function testProfile() {
  logTest('2. Accès au profil (route protégée)')
  
  const response = await makeRequest('/api/profile')

  if (response.status === 200 && response.data.success) {
    logSuccess('Accès autorisé')
    console.log('   User ID:', response.data.data.id)
    console.log('   Nom:', response.data.data.prenom, response.data.data.nom)
    console.log('   Role:', response.data.data.role)
    return true
  } else if (response.status === 401) {
    logError('Non authentifié (normal si pas de login)')
    console.log('   Message:', response.data.error)
    return false
  } else {
    logError('Erreur inattendue')
    console.log('   Status:', response.status)
    return false
  }
}

async function testUsers() {
  logTest('3. Liste des utilisateurs (Admin uniquement)')
  
  const response = await makeRequest('/api/users')

  if (response.status === 200 && response.data.success) {
    logSuccess('Accès autorisé')
    console.log('   Total utilisateurs:', response.data.pagination.total)
    console.log('   Page:', response.data.pagination.page)
    console.log('   Limit:', response.data.pagination.limit)
    console.log('   Utilisateurs retournés:', response.data.data.length)
    return true
  } else if (response.status === 403) {
    logWarning('Accès refusé (normal si pas Admin)')
    console.log('   Message:', response.data.error)
    return false
  } else if (response.status === 401) {
    logError('Non authentifié')
    console.log('   Message:', response.data.error)
    return false
  } else {
    logError('Erreur inattendue')
    console.log('   Status:', response.status)
    return false
  }
}

async function testUsersPagination() {
  logTest('4. Pagination des utilisateurs')
  
  const response = await makeRequest('/api/users?page=1&limit=3')

  if (response.status === 200 && response.data.success) {
    logSuccess('Pagination fonctionne')
    console.log('   Page demandée:', 1)
    console.log('   Limit demandée:', 3)
    console.log('   Utilisateurs retournés:', response.data.data.length)
    console.log('   Total pages:', response.data.pagination.totalPages)
    return true
  } else {
    logError('Pagination échouée')
    console.log('   Status:', response.status)
    return false
  }
}

async function testUsersSearch() {
  logTest('5. Recherche d\'utilisateurs')
  
  const response = await makeRequest('/api/users?search=admin')

  if (response.status === 200 && response.data.success) {
    logSuccess('Recherche fonctionne')
    console.log('   Résultats trouvés:', response.data.data.length)
    if (response.data.data.length > 0) {
      console.log('   Premier résultat:', response.data.data[0].prenom, response.data.data[0].nom)
    }
    return true
  } else {
    logError('Recherche échouée')
    console.log('   Status:', response.status)
    return false
  }
}

async function testUsersFilter() {
  logTest('6. Filtrage par rôle')
  
  const response = await makeRequest('/api/users?role=Admin')

  if (response.status === 200 && response.data.success) {
    logSuccess('Filtrage fonctionne')
    console.log('   Admins trouvés:', response.data.data.length)
    return true
  } else {
    logError('Filtrage échoué')
    console.log('   Status:', response.status)
    return false
  }
}

async function testLogout() {
  logTest('7. Logout')
  
  const response = await makeRequest('/api/auth/logout', {
    method: 'POST'
  })

  if (response.status === 200 && response.data.success) {
    logSuccess('Logout réussi')
    authCookie = '' // Clear cookie
    return true
  } else {
    logError('Logout échoué')
    console.log('   Status:', response.status)
    return false
  }
}

async function testAfterLogout() {
  logTest('8. Accès après logout (doit échouer)')
  
  const response = await makeRequest('/api/profile')

  if (response.status === 401) {
    logSuccess('Accès correctement refusé après logout')
    console.log('   Message:', response.data.error)
    return true
  } else if (response.status === 200) {
    logError('PROBLÈME: Accès autorisé après logout!')
    return false
  } else {
    logWarning('Statut inattendu')
    console.log('   Status:', response.status)
    return false
  }
}

async function testWithoutAuth() {
  logTest('9. Accès sans authentification (doit échouer)')
  
  authCookie = '' // Clear cookie
  const response = await makeRequest('/api/profile')

  if (response.status === 401) {
    logSuccess('Accès correctement refusé sans auth')
    console.log('   Message:', response.data.error)
    return true
  } else {
    logError('PROBLÈME: Accès autorisé sans auth!')
    return false
  }
}

async function runAllTests() {
  console.log('\n')
  log('╔════════════════════════════════════════════════════════╗', 'cyan')
  log('║   🧪 TEST SUITE - MIDDLEWARE D\'AUTHENTIFICATION       ║', 'cyan')
  log('╚════════════════════════════════════════════════════════╝', 'cyan')
  console.log('\n')
  log(`📍 Base URL: ${BASE_URL}`, 'yellow')
  log('⏳ Démarrage des tests...', 'yellow')

  const results = []

  // Test sans auth
  results.push(await testWithoutAuth())

  // Test login
  const loginSuccess = await testLogin()
  results.push(loginSuccess)

  if (loginSuccess) {
    // Tests avec auth
    results.push(await testProfile())
    results.push(await testUsers())
    results.push(await testUsersPagination())
    results.push(await testUsersSearch())
    results.push(await testUsersFilter())
    results.push(await testLogout())
    results.push(await testAfterLogout())
  } else {
    logWarning('\n⚠️  Tests suivants ignorés car login a échoué')
    logWarning('   Vérifiez que:')
    logWarning('   1. Le serveur est démarré (npm run dev)')
    logWarning('   2. Un utilisateur admin existe')
    logWarning('   3. Les credentials sont corrects')
  }

  // Résumé
  console.log('\n')
  log('╔════════════════════════════════════════════════════════╗', 'cyan')
  log('║                    📊 RÉSUMÉ                           ║', 'cyan')
  log('╚════════════════════════════════════════════════════════╝', 'cyan')
  console.log('\n')

  const passed = results.filter(r => r).length
  const total = results.length
  const percentage = Math.round((passed / total) * 100)

  log(`Tests réussis: ${passed}/${total} (${percentage}%)`, passed === total ? 'green' : 'yellow')
  
  if (passed === total) {
    log('\n🎉 Tous les tests sont passés!', 'green')
  } else {
    log(`\n⚠️  ${total - passed} test(s) ont échoué`, 'red')
  }
  
  console.log('\n')
}

// Exécuter les tests
runAllTests().catch(error => {
  logError(`\n💥 Erreur fatale: ${error.message}`)
  console.error(error)
  process.exit(1)
})
