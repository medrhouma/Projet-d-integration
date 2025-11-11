'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Styles personnalisés pour les animations
const customStyles = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  .animate-slide-in {
    animation: slideIn 0.3s ease-out;
  }
  
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out;
  }
  
  .drag-preview {
    opacity: 0.8;
    transform: rotate(3deg);
  }
`;

interface Matiere {
  id_matiere: number;
  nom: string;
  code?: string;
  heures_cours?: number;
  heures_td?: number;
  heures_tp?: number;
  id_niveau: number;
  id_enseignant: number;
  niveau?: {
    id_niveau: number;
    nom: string;
  };
}

interface Enseignant {
  id_enseignant: number;
  utilisateur: {
    nom: string;
    prenom: string;
    email: string;
  };
  matricule?: string;
  grade?: string;
}

interface Salle {
  id_salle: number;
  code: string;
  nom?: string;
  type: string;
  capacite: number;
}

interface Groupe {
  id_groupe: number;
  nom: string;
  id_niveau: number;
  niveau?: {
    id_niveau: number;
    nom: string;
  };
  specialite?: {
    id_specialite: number;
    nom: string;
  };
}

interface SeanceTemplate {
  id: string;
  matiere: Matiere;
  enseignant: Enseignant;
  salle: Salle;
  color: string;
}

interface PlacedSeance {
  id?: number;
  templateId: string;
  jour: number;
  slotIndex: number;
  matiere: Matiere;
  enseignant: Enseignant;
  salle: Salle;
  color: string;
  heureDebut: string;
  heureFin: string;
}

const JOURS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const TIME_SLOTS = [
  { debut: '08:30', fin: '10:00' },
  { debut: '10:15', fin: '11:45' },
  { debut: '11:50', fin: '13:20' },
  { debut: 'PAUSE', fin: 'DÉJEUNER' }, // Pause déjeuner 13:20 - 14:30
  { debut: '14:30', fin: '16:00' },
  { debut: '16:15', fin: '17:45' },
];

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'
];

export default function GestionEmploiTemps() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Data states
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);

  // Selection states
  const [selectedGroupe, setSelectedGroupe] = useState<number | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<number | null>(null);
  const [selectedEnseignant, setSelectedEnseignant] = useState<number | null>(null);
  const [selectedSalle, setSelectedSalle] = useState<number | null>(null);

  // Template and schedule states
  const [templates, setTemplates] = useState<SeanceTemplate[]>([]);
  const [placedSeances, setPlacedSeances] = useState<PlacedSeance[]>([]);
  const [draggedTemplate, setDraggedTemplate] = useState<SeanceTemplate | null>(null);
  const [hoveredCell, setHoveredCell] = useState<{ jour: number; slot: number } | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedGroupe) {
      // Réinitialiser d'abord les séances placées avant de charger les nouvelles
      setPlacedSeances([]);
      fetchExistingSchedule();
      // Réinitialiser les sélections quand le groupe change
      setSelectedMatiere(null);
      setSelectedEnseignant(null);
      setSelectedSalle(null);
      setTemplates([]);
    } else {
      // Si aucun groupe sélectionné, vider les séances
      setPlacedSeances([]);
    }
  }, [selectedGroupe]);

  // Auto-sélectionner l'enseignant quand une matière est choisie
  useEffect(() => {
    if (selectedMatiere) {
      const matiere = matieres.find(m => m.id_matiere === selectedMatiere);
      if (matiere) {
        setSelectedEnseignant(matiere.id_enseignant);
      }
    }
  }, [selectedMatiere, matieres]);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      const userData = data.success ? data.user : data;

      if (userData.role !== 'ChefDepartement') {
        router.push('/login');
        return;
      }

      setUserRole(userData.role);
      setUserId(userData.id);
      setLoading(false);
    } catch (error) {
      console.error('Erreur auth:', error);
      router.push('/login');
    }
  };

  const fetchData = async () => {
    try {
      const [groupesRes, matieresRes, enseignantsRes, sallesRes] = await Promise.all([
        fetch('/api/groupes'),
        fetch('/api/matieres'),
        fetch('/api/enseignants'),
        fetch('/api/salles'),
      ]);

      const [groupesData, matieresData, enseignantsData, sallesData] = await Promise.all([
        groupesRes.json(),
        matieresRes.json(),
        enseignantsRes.json(),
        sallesRes.json(),
      ]);

      setGroupes(groupesData);
      setMatieres(matieresData);
      setEnseignants(enseignantsData);
      setSalles(sallesData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      alert('Erreur lors du chargement des données');
    }
  };

  const fetchExistingSchedule = async () => {
    if (!selectedGroupe) {
      console.log('⚠️ Pas de groupe sélectionné');
      return;
    }

    try {
      console.log('🔄 Chargement des séances pour le groupe:', selectedGroupe);
      const response = await fetch(`/api/emploi-temps?groupeId=${selectedGroupe}`);
      
      if (!response.ok) {
        console.error('❌ Erreur API:', response.status, response.statusText);
        return;
      }
      
      const data = await response.json();
      console.log('📦 Données reçues de l\'API:', data);
      console.log('📊 Nombre de séances:', data.length);

      if (data.length === 0) {
        console.log('ℹ️ Aucune séance trouvée pour ce groupe');
        setPlacedSeances([]);
        return;
      }

      const placed: PlacedSeance[] = data.map((seance: any) => {
        const dateObj = new Date(seance.date);
        const jour = dateObj.getDay() - 1; // 0 = Monday (dimanche=0, donc lundi=1-1=0)
        
        // Fonction pour extraire HH:MM d'une heure (plusieurs formats possibles)
        const extraireHeure = (heureValue: any): string => {
          if (!heureValue) return '00:00';
          
          const str = String(heureValue);
          
          // Format ISO DateTime: "1970-01-01T08:30:00.000Z" ou "2025-01-13T08:30:00Z"
          if (str.includes('T')) {
            const dateTime = new Date(str);
            // Utiliser getUTCHours/getUTCMinutes pour éviter la conversion de fuseau horaire
            const hours = String(dateTime.getUTCHours()).padStart(2, '0');
            const minutes = String(dateTime.getUTCMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
          }
          
          // Format Time: "08:30:00" ou "08:30"
          if (str.includes(':')) {
            return str.substring(0, 5); // Prend "HH:MM"
          }
          
          return '00:00';
        };
        
        const heureDebut = extraireHeure(seance.heure_debut);
        const heureFin = extraireHeure(seance.heure_fin);
        
        const slotIndex = TIME_SLOTS.findIndex(slot => slot.debut === heureDebut);

        const joursNoms = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        console.log(`  📌 Séance ${seance.id_emploi}:`);
        console.log(`     - Matière: ${seance.matiere.nom}`);
        console.log(`     - Date brute: ${seance.date}`);
        console.log(`     - Date objet: ${dateObj}`);
        console.log(`     - getDay(): ${dateObj.getDay()} → jour calculé: ${jour} (${joursNoms[jour] || 'INVALIDE'})`);
        console.log(`     - Heure BRUTE début: "${seance.heure_debut}"`);
        console.log(`     - Heure BRUTE fin: "${seance.heure_fin}"`);
        console.log(`     - Heure EXTRAITE: ${heureDebut} - ${heureFin}`);
        console.log(`     - Slot trouvé: ${slotIndex} ${slotIndex === -1 ? '❌ AUCUN SLOT NE CORRESPOND!' : '✅'}`);
        console.log(`     - TIME_SLOTS disponibles:`, TIME_SLOTS.map(s => s.debut));
        console.log(`     - Enseignant: ${seance.enseignant ? seance.enseignant.utilisateur.nom : 'AUCUN'}`);
        console.log(`     - Salle: ${seance.salle ? seance.salle.code : 'AUCUNE'}`);

        const placedSeance = {
          id: seance.id_emploi,
          templateId: `existing-${seance.id_emploi}`,
          jour,
          slotIndex,
          matiere: seance.matiere,
          enseignant: seance.enseignant,
          salle: seance.salle,
          color: COLORS[seance.matiere.id_matiere % COLORS.length],
          heureDebut,
          heureFin,
        };

        console.log(`     - ✅ Objet créé:`, placedSeance);
        return placedSeance;
      });

      setPlacedSeances(placed);
      console.log('✅ Séances placées dans l\'état:', placed.length);
    } catch (error) {
      console.error('❌ Erreur chargement emploi du temps:', error);
    }
  };

  const createTemplate = () => {
    if (!selectedMatiere || !selectedEnseignant || !selectedSalle) {
      alert('Veuillez sélectionner une matière, un enseignant et une salle');
      return;
    }

    const matiere = matieres.find(m => m.id_matiere === selectedMatiere)!;
    const enseignant = enseignants.find(e => e.id_enseignant === selectedEnseignant)!;
    const salle = salles.find(s => s.id_salle === selectedSalle)!;

    const template: SeanceTemplate = {
      id: `template-${Date.now()}`,
      matiere,
      enseignant,
      salle,
      color: COLORS[templates.length % COLORS.length],
    };

    setTemplates([...templates, template]);
    setSelectedMatiere(null);
    setSelectedEnseignant(null);
    setSelectedSalle(null);
  };

  const handleDragStart = (e: React.DragEvent, template: SeanceTemplate) => {
    setDraggedTemplate(template);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent, jour: number, slotIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setHoveredCell({ jour, slot: slotIndex });
  };

  const handleDragLeave = () => {
    setHoveredCell(null);
  };

  const handleDrop = async (e: React.DragEvent, jour: number, slotIndex: number) => {
    e.preventDefault();
    setHoveredCell(null);

    if (!draggedTemplate || !selectedGroupe) {
      alert('Veuillez sélectionner un groupe');
      return;
    }

    // Check if slot is already occupied
    const existing = placedSeances.find(
      s => s.jour === jour && s.slotIndex === slotIndex
    );
    if (existing) {
      alert('Ce créneau est déjà occupé');
      return;
    }

    const timeSlot = TIME_SLOTS[slotIndex];

    // Check conflicts
    try {
      const conflictResponse = await fetch('/api/emploi-temps/check-conflicts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jour,
          heure_debut: timeSlot.debut,
          heure_fin: timeSlot.fin,
          id_salle: draggedTemplate.salle.id_salle,
          id_enseignant: draggedTemplate.enseignant.id_enseignant,
          id_groupe: selectedGroupe,
        }),
      });

      const conflictData = await conflictResponse.json();

      if (conflictData.conflits && conflictData.conflits.length > 0) {
        const messages = conflictData.conflits.map((c: any) => c.message).join('\n');
        alert(`Conflits détectés:\n${messages}`);
        return;
      }

      // Save to database
      const dateStr = getDateForDay(jour);
      
      // Créer les dates en UTC pour éviter les problèmes de fuseau horaire
      // Format: "1970-01-01T10:15:00.000Z" (UTC explicite)
      const heureDebutStr = `1970-01-01T${timeSlot.debut}:00.000Z`;
      const heureFinStr = `1970-01-01T${timeSlot.fin}:00.000Z`;

      const createResponse = await fetch('/api/emploi-temps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          heure_debut: heureDebutStr,
          heure_fin: heureFinStr,
          id_matiere: draggedTemplate.matiere.id_matiere,
          id_enseignant: draggedTemplate.enseignant.id_enseignant,
          id_salle: draggedTemplate.salle.id_salle,
          id_groupe: selectedGroupe,
        }),
      });

      if (!createResponse.ok) {
        const errorData = await createResponse.json();
        console.error('Erreur API:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la création de la séance');
      }

      const createdSeance = await createResponse.json();

      const newSeance: PlacedSeance = {
        id: createdSeance.id_emploi,
        templateId: draggedTemplate.id,
        jour,
        slotIndex,
        matiere: draggedTemplate.matiere,
        enseignant: draggedTemplate.enseignant,
        salle: draggedTemplate.salle,
        color: draggedTemplate.color,
        heureDebut: timeSlot.debut,
        heureFin: timeSlot.fin,
      };

      setPlacedSeances([...placedSeances, newSeance]);
      setDraggedTemplate(null);
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la séance');
    }
  };

  const deleteSeance = async (seance: PlacedSeance) => {
    if (!seance.id) {
      console.error('Pas d\'ID pour cette séance:', seance);
      alert('Impossible de supprimer cette séance (pas d\'ID)');
      return;
    }

    try {
      console.log('Suppression de la séance ID:', seance.id);
      const response = await fetch(`/api/emploi-temps/${seance.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur API:', errorData);
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      setPlacedSeances(placedSeances.filter(s => s.id !== seance.id));
      console.log('Séance supprimée avec succès');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression de la séance');
    }
  };

  const deleteAllSeances = async () => {
    if (!selectedGroupe) return;

    const seancesWithId = placedSeances.filter(s => s.id);
    
    if (seancesWithId.length === 0) {
      alert('Aucune séance enregistrée à supprimer');
      return;
    }

    const confirmed = confirm(
      `Êtes-vous sûr de vouloir supprimer TOUTES les ${seancesWithId.length} séances de ce groupe ?\n\nCette action est irréversible.`
    );

    if (!confirmed) return;

    try {
      console.log(`Suppression de ${seancesWithId.length} séances...`);
      
      // Supprimer toutes les séances une par une
      const deletePromises = seancesWithId.map(async (s) => {
        console.log(`Suppression séance ID: ${s.id}`);
        const response = await fetch(`/api/emploi-temps/${s.id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          console.error(`Erreur suppression ${s.id}:`, errorData);
          throw new Error(`Erreur suppression séance ${s.id}`);
        }
        return response;
      });

      await Promise.all(deletePromises);

      setPlacedSeances([]);
      setTemplates([]);
      alert(`✓ Toutes les ${seancesWithId.length} séances ont été supprimées avec succès`);
      console.log('Toutes les séances supprimées');
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression des séances. Vérifiez la console pour plus de détails.');
    }
  };

  const getFilteredMatieres = () => {
    if (!selectedGroupe) return [];
    
    const groupe = groupes.find(g => g.id_groupe === selectedGroupe);
    if (!groupe) return [];
    
    // Filtrer les matières qui appartiennent au même niveau que le groupe
    return matieres.filter(m => m.id_niveau === groupe.id_niveau);
  };

  const getFilteredEnseignants = () => {
    // Si une matière est sélectionnée, afficher uniquement l'enseignant de cette matière
    if (selectedMatiere) {
      const matiere = matieres.find(m => m.id_matiere === selectedMatiere);
      if (matiere) {
        return enseignants.filter(e => e.id_enseignant === matiere.id_enseignant);
      }
      return [];
    }
    
    // Sinon, si un groupe est sélectionné, afficher tous les enseignants du niveau
    if (selectedGroupe) {
      const groupe = groupes.find(g => g.id_groupe === selectedGroupe);
      if (!groupe) return [];
      
      const matieresIds = matieres
        .filter(m => m.id_niveau === groupe.id_niveau)
        .map(m => m.id_enseignant);
      
      return enseignants.filter(e => matieresIds.includes(e.id_enseignant));
    }
    
    return [];
  };

  const getDateForDay = (jour: number) => {
    // Get next occurrence of the day (0=Monday, 1=Tuesday, etc.)
    const today = new Date();
    const currentDay = today.getDay() - 1; // Convert to 0=Monday
    const daysUntil = (jour - currentDay + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    return targetDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 border-8 border-orange-500/30 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-t-8 border-orange-400 rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Chargement en cours...</h2>
          <p className="text-gray-300">Préparation de votre emploi du temps</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{customStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 p-6 animate-fade-in">
        <div className="max-w-[1800px] mx-auto">
        {/* Header amélioré */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-8 mb-6 animate-slide-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-orange-500/30 to-red-500/30 backdrop-blur-lg rounded-xl shadow-lg transform hover:scale-105 transition border border-orange-400/30">
                <svg className="w-10 h-10 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent">
                  Gestion de l&apos;Emploi du Temps
                </h1>
                <p className="text-gray-300 mt-1">Interface drag & drop pour organiser facilement vos cours</p>
              </div>
            </div>
            {selectedGroupe && placedSeances.length > 0 && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-300 rounded-lg border border-green-400/30 backdrop-blur-lg">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">{placedSeances.length} séance(s) programmée(s)</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-bold text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Sélectionner le groupe
            </label>
            <select
              value={selectedGroupe || ''}
              onChange={(e) => setSelectedGroupe(Number(e.target.value))}
              className="w-full md:w-96 px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition text-white placeholder-gray-400"
            >
              <option value="" className="bg-gray-900">-- Choisir un groupe --</option>
              {groupes.map((groupe) => (
                <option key={groupe.id_groupe} value={groupe.id_groupe} className="bg-gray-900">
                  {groupe.nom} - {groupe.niveau?.nom} - {groupe.specialite?.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!selectedGroupe && (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-500/30 to-red-500/30 backdrop-blur-lg rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-400/30">
                <svg className="w-12 h-12 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Aucun groupe sélectionné</h3>
              <p className="text-gray-300 mb-6">
                Veuillez sélectionner un groupe ci-dessus pour commencer à créer et gérer l'emploi du temps.
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Interface drag & drop intuitive</span>
              </div>
            </div>
          </div>
        )}

        {selectedGroupe && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Templates */}
            <div className="lg:col-span-1 space-y-6">
              {/* Carte de création de séances */}
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden shadow-xl">
                <div className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 backdrop-blur-lg px-6 py-4 border-b border-white/20">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Créer des Séances
                  </h2>
                  <p className="text-green-200 text-sm mt-1">Composez votre cours</p>
                </div>

                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">📚</span>
                      Matière
                    </label>
                    <select
                      value={selectedMatiere || ''}
                      onChange={(e) => setSelectedMatiere(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-white"
                      disabled={!selectedGroupe}
                    >
                      <option value="" className="bg-gray-900">-- Choisir --</option>
                      {getFilteredMatieres().map((matiere) => (
                        <option key={matiere.id_matiere} value={matiere.id_matiere} className="bg-gray-900">
                          {matiere.nom} {matiere.code ? `(${matiere.code})` : ''}
                        </option>
                      ))}
                    </select>
                    {!selectedGroupe && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Veuillez d'abord sélectionner un groupe
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">👨‍🏫</span>
                      Enseignant
                    </label>
                    <select
                      value={selectedEnseignant || ''}
                      onChange={(e) => setSelectedEnseignant(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-white"
                      disabled={!selectedGroupe || selectedMatiere !== null}
                    >
                      <option value="" className="bg-gray-900">-- Choisir --</option>
                      {getFilteredEnseignants().map((enseignant) => (
                        <option key={enseignant.id_enseignant} value={enseignant.id_enseignant} className="bg-gray-900">
                          {enseignant.utilisateur.nom} {enseignant.utilisateur.prenom}
                        </option>
                      ))}
                    </select>
                    {!selectedGroupe ? (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Veuillez d'abord sélectionner un groupe
                      </p>
                    ) : selectedMatiere ? (
                      <p className="text-xs text-green-300 mt-2 flex items-center gap-1 font-medium">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Enseignant auto-sélectionné
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <span className="text-lg">🏫</span>
                      Salle
                    </label>
                    <select
                      value={selectedSalle || ''}
                      onChange={(e) => setSelectedSalle(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition text-white"
                      disabled={!selectedGroupe}
                    >
                      <option value="" className="bg-gray-900">-- Choisir --</option>
                      {salles.map((salle) => (
                        <option key={salle.id_salle} value={salle.id_salle} className="bg-gray-900">
                          {salle.code} - {salle.type} (Cap: {salle.capacite})
                        </option>
                      ))}
                    </select>
                    {!selectedGroupe && (
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Veuillez d'abord sélectionner un groupe
                      </p>
                    )}
                  </div>

                  <button
                    onClick={createTemplate}
                    className="w-full bg-gradient-to-r from-green-500/30 to-emerald-500/30 hover:from-green-500/40 hover:to-emerald-500/40 backdrop-blur-lg border border-green-400/30 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer le modèle
                  </button>
                </div>
              </div>

              {/* Liste des modèles créés */}
              {templates.length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-gradient-to-r from-purple-500/30 to-pink-500/30 backdrop-blur-lg px-6 py-4 border-b border-white/20">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Modèles Créés ({templates.length})
                    </h3>
                    <p className="text-purple-200 text-sm mt-1">✨ Glissez-déposez dans la grille</p>
                  </div>
                  <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, template)}
                        className="p-4 rounded-xl cursor-move shadow-md hover:shadow-xl transition transform hover:scale-105 border-2 border-white"
                        style={{ backgroundColor: template.color, color: 'white' }}
                      >
                        <div className="flex items-start gap-3">
                          <svg className="w-6 h-6 flex-shrink-0 mt-0.5 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                          <div className="flex-1">
                            <div className="font-bold text-lg">{template.matiere.nom}</div>
                            <div className="text-sm opacity-95 mt-1 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              {template.enseignant.utilisateur.nom} {template.enseignant.utilisateur.prenom}
                            </div>
                            <div className="text-sm opacity-95 mt-1 flex items-center gap-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              Salle {template.salle.code}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Schedule Grid */}
            <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6 overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Emploi du temps - {groupes.find(g => g.id_groupe === selectedGroupe)?.nom}
                </h2>
                {placedSeances.length > 0 && (
                  <button
                    onClick={deleteAllSeances}
                    className="px-4 py-2 bg-red-500/30 hover:bg-red-500/40 backdrop-blur-lg border border-red-400/30 text-white rounded-xl text-sm font-medium transition hover:scale-105"
                  >
                    🗑️ Supprimer tout
                  </button>
                )}
              </div>

              <div className="min-w-[800px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-white/20 bg-gray-900/30 p-2 text-sm font-semibold text-orange-300">
                        Horaire
                      </th>
                      {JOURS.map((jour) => (
                        <th
                          key={jour}
                          className="border border-white/20 bg-gray-900/30 p-2 text-sm font-semibold text-orange-300"
                        >
                          {jour}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {TIME_SLOTS.map((slot, slotIndex) => {
                      // Ligne de pause déjeuner
                      if (slot.debut === 'PAUSE') {
                        return (
                          <tr key={slotIndex}>
                            <td 
                              colSpan={7} 
                              className="border border-white/20 bg-gradient-to-r from-orange-500/20 to-yellow-500/20 backdrop-blur-lg p-3 text-center"
                            >
                              <div className="flex items-center justify-center gap-2">
                                <span className="text-2xl">🍽️</span>
                                <span className="font-bold text-orange-300 text-base">
                                  PAUSE DÉJEUNER
                                </span>
                                <span className="text-sm text-orange-400">
                                  13:20 - 14:30
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      // Ligne de séance normale
                      return (
                        <tr key={slotIndex}>
                          <td className="border border-white/20 bg-gray-900/30 p-2 text-xs font-medium text-center text-gray-300">
                            {slot.debut}<br />-<br />{slot.fin}
                          </td>
                          {JOURS.map((_, jourIndex) => {
                            const seance = placedSeances.find(
                              s => s.jour === jourIndex && s.slotIndex === slotIndex
                            );
                            
                            // Debug: Log pour chaque cellule lors du premier rendu
                            if (slotIndex === 0 && jourIndex === 0 && placedSeances.length > 0) {
                              console.log(`🔍 Recherche de séances dans placedSeances (${placedSeances.length} séances):`, placedSeances);
                            }
                            
                            const isHovered = hoveredCell?.jour === jourIndex && hoveredCell?.slot === slotIndex;

                            return (
                              <td
                                key={jourIndex}
                                onDragOver={(e) => handleDragOver(e, jourIndex, slotIndex)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, jourIndex, slotIndex)}
                                className={`border border-white/20 p-1 h-24 transition ${
                                  isHovered ? 'bg-orange-500/20' : seance ? '' : 'bg-white/5 hover:bg-white/10'
                                }`}
                              >
                                {seance ? (
                                  <div
                                    className="h-full p-2 rounded text-white text-xs flex flex-col justify-between relative"
                                    style={{ backgroundColor: seance.color }}
                                  >
                                    <button
                                      onClick={() => deleteSeance(seance)}
                                      className="absolute top-1 right-1 bg-white text-red-600 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-100 transition"
                                    >
                                      ×
                                    </button>
                                    <div>
                                      <div className="font-semibold">{seance.matiere.nom}</div>
                                      <div className="opacity-90">
                                        {seance.enseignant.utilisateur.nom} {seance.enseignant.utilisateur.prenom}
                                      </div>
                                      <div className="opacity-90">Salle {seance.salle.code}</div>
                                    </div>
                                  </div>
                                ) : (
                                  isHovered && (
                                    <div className="h-full flex items-center justify-center text-orange-300 text-sm font-medium">
                                      Déposer ici
                                    </div>
                                  )
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Footer informatif */}
              <div className="mt-4 p-4 bg-gradient-to-r from-orange-500/10 to-red-500/10 backdrop-blur-lg rounded-xl border border-orange-400/30">
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-orange-300">
                      <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">5 seances par jour</span>
                    </div>
                    
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs">Glissez-déposez les modèles dans la grille</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
