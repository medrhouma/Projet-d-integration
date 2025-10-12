const bcrypt = require('bcryptjs');

async function generateAllHashes() {
  console.log('🔐 Génération des hash bcrypt...\n');
  
  const passwords = {
    admin: 'Admin123!',
    teacher: 'Teacher123!',
    student: 'Student123!'
  };

  for (const [role, password] of Object.entries(passwords)) {
    const hash = await bcrypt.hash(password, 10);
    console.log(`${role.toUpperCase()} - Mot de passe: ${password}`);
    console.log(`Hash: ${hash}\n`);
  }
}

generateAllHashes();