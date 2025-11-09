// Vérifier les dates des séances
const dates = ['2025-10-11', '2025-10-21', '2025-10-22', '2025-10-23', '2025-11-10'];

console.log('📅 Analyse des dates des séances:\n');

dates.forEach(d => {
  const date = new Date(d + 'T00:00:00Z');
  const dayName = date.toUTCDay === 0 ? 'dimanche' :
                  date.getUTCDay() === 1 ? 'lundi' :
                  date.getUTCDay() === 2 ? 'mardi' :
                  date.getUTCDay() === 3 ? 'mercredi' :
                  date.getUTCDay() === 4 ? 'jeudi' :
                  date.getUTCDay() === 5 ? 'vendredi' : 'samedi';
  
  console.log(`${d} -> ${dayName} (jour ${date.getUTCDay()})`);
  
  // Calculer le lundi de cette semaine
  const dayOfWeek = date.getUTCDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(date);
  monday.setUTCDate(date.getUTCDate() + diff);
  
  console.log(`   Semaine du ${monday.toISOString().split('T')[0]}\n`);
});

// Date actuelle
const now = new Date();
console.log(`📅 Aujourd'hui: ${now.toISOString().split('T')[0]}`);
console.log(`   Jour de la semaine: ${now.getDay()} (0=dimanche, 1=lundi, etc.)`);

// Calculer le lundi de cette semaine
const today = new Date();
const dayOfWeek = today.getDay();
const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
const thisMonday = new Date(today);
thisMonday.setDate(today.getDate() + diff);
thisMonday.setHours(0, 0, 0, 0);

console.log(`   Lundi de cette semaine: ${thisMonday.toISOString().split('T')[0]}`);
