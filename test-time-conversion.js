// Test de conversion des heures
const testTimes = [
  '2025-10-11T08:30:00.000Z',
  '2025-10-23T08:00:00.000Z',
  '2025-10-22T10:00:00.000Z',
  '2025-10-22T09:00:00.000Z',
];

console.log('Test de conversion des heures:\n');

testTimes.forEach(timeStr => {
  const date = new Date(timeStr);
  const heureDecimale = date.getHours() + date.getMinutes() / 60;
  
  console.log(`Original: ${timeStr}`);
  console.log(`  Date object: ${date}`);
  console.log(`  Heures: ${date.getHours()}, Minutes: ${date.getMinutes()}`);
  console.log(`  Heure décimale: ${heureDecimale}`);
  console.log('');
});

console.log('\nCréneaux horaires:');
const creneaux = [
  { label: '08:30 - 10:00', start: 8.5, end: 10 },
  { label: '10:00 - 11:30', start: 10, end: 11.5 },
  { label: '11:30 - 13:00', start: 11.5, end: 13 },
];

creneaux.forEach(c => {
  console.log(`${c.label}: start=${c.start}, end=${c.end}`);
});

console.log('\n\nTest de correspondance:');
// Simuler une séance à 08:30
const seance830 = new Date('2025-10-11T08:30:00.000Z');
const heureSeance = seance830.getHours() + seance830.getMinutes() / 60;
const creneau1 = { start: 8.5, end: 10 };

console.log(`Séance à ${seance830.toLocaleTimeString('fr-FR')}`);
console.log(`  Heure décimale: ${heureSeance}`);
console.log(`  Créneau: ${creneau1.start} - ${creneau1.end}`);
console.log(`  ${heureSeance} >= ${creneau1.start}? ${heureSeance >= creneau1.start}`);
console.log(`  ${heureSeance} < ${creneau1.end}? ${heureSeance < creneau1.end}`);
console.log(`  Dans le créneau? ${heureSeance >= creneau1.start && heureSeance < creneau1.end}`);
