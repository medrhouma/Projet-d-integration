'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  { debut: 'PAUSE', fin: 'DÉJEUNER' },
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
    // ...existing code...

    // --- Navigation Back Button ---
    // Place this at the top of the returned JSX
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);

  const [selectedGroupe, setSelectedGroupe] = useState<number | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<number | null>(null);
  const [selectedEnseignant, setSelectedEnseignant] = useState<number | null>(null);
  const [selectedSalle, setSelectedSalle] = useState<number | null>(null);

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
      setPlacedSeances([]);
      fetchExistingSchedule();
      setSelectedMatiere(null);
      setSelectedEnseignant(null);
      setSelectedSalle(null);
      setTemplates([]);
    } else {
      setPlacedSeances([]);
    }
  }, [selectedGroupe]);

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
      if (!data.success || !Array.isArray(data.data)) {
        setPlacedSeances([]);
        return;
      }
      console.log('📊 Nombre de séances:', data.data.length);

      if (data.data.length === 0) {
        console.log('ℹ️ Aucune séance trouvée pour ce groupe');
        setPlacedSeances([]);
        return;
      }

      const placed: PlacedSeance[] = data.data.map((seance: any) => {
        const dateObj = new Date(seance.date);
        const jour = dateObj.getDay() - 1;
        
        const extraireHeure = (heureValue: any): string => {
          if (!heureValue) return '00:00';
          
          const str = String(heureValue);
          
          if (str.includes('T')) {
            const dateTime = new Date(str);
            const hours = String(dateTime.getUTCHours()).padStart(2, '0');
            const minutes = String(dateTime.getUTCMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
          }
          
          if (str.includes(':')) {
            return str.substring(0, 5);
          }
          
          return '00:00';
        };
        
        const heureDebut = extraireHeure(seance.heure_debut);
        const heureFin = extraireHeure(seance.heure_fin);
        
        const slotIndex = TIME_SLOTS.findIndex(slot => slot.debut === heureDebut);

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

    const existing = placedSeances.find(
      s => s.jour === jour && s.slotIndex === slotIndex
    );
    if (existing) {
      alert('Ce créneau est déjà occupé');
      return;
    }

    const timeSlot = TIME_SLOTS[slotIndex];

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

      const dateStr = getDateForDay(jour);
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
      alert('Impossible de supprimer cette séance');
      return;
    }

    try {
      const response = await fetch(`/api/emploi-temps/${seance.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erreur lors de la suppression');

      setPlacedSeances(placedSeances.filter(s => s.id !== seance.id));
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
      `Êtes-vous sûr de vouloir supprimer TOUTES les ${seancesWithId.length} séances de ce groupe ?`
    );

    if (!confirmed) return;

    try {
      const deletePromises = seancesWithId.map(async (s) => {
        const response = await fetch(`/api/emploi-temps/${s.id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error(`Erreur suppression séance ${s.id}`);
        return response;
      });

      await Promise.all(deletePromises);

      setPlacedSeances([]);
      setTemplates([]);
      alert(`Toutes les ${seancesWithId.length} séances ont été supprimées`);
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression des séances');
    }
  };

  const getFilteredMatieres = () => {
    if (!selectedGroupe) return [];
    const groupe = groupes.find(g => g.id_groupe === selectedGroupe);
    if (!groupe) return [];
    return matieres.filter(m => m.id_niveau === groupe.id_niveau);
  };

  const getFilteredEnseignants = () => {
    if (selectedMatiere) {
      const matiere = matieres.find(m => m.id_matiere === selectedMatiere);
      if (matiere) {
        return enseignants.filter(e => e.id_enseignant === matiere.id_enseignant);
      }
      return [];
    }
    
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
    const today = new Date();
    const currentDay = today.getDay() - 1;
    const daysUntil = (jour - currentDay + 7) % 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    return targetDate.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Chargement...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Navigation Back Button */}
      <div className="mb-4">
        <button
          onClick={() => router.push('/dashboard-chef-departement')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold shadow"
        >
          &#8592; Retour au Dashboard
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Gestion de l'Emploi du Temps</h1>
              <p className="text-gray-600">Interface drag & drop pour organiser vos cours</p>
            </div>
            {selectedGroupe && placedSeances.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                <span>{placedSeances.length} séance(s) programmée(s)</span>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner le groupe
            </label>
            <select
              value={selectedGroupe || ''}
              onChange={(e) => setSelectedGroupe(Number(e.target.value))}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Choisir un groupe --</option>
              {groupes.map((groupe) => (
                <option key={groupe.id_groupe} value={groupe.id_groupe}>
                  {groupe.nom} - {groupe.niveau?.nom}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!selectedGroupe && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Aucun groupe sélectionné</h3>
              <p className="text-gray-600">
                Veuillez sélectionner un groupe pour commencer à créer l'emploi du temps.
              </p>
            </div>
          </div>
        )}

        {selectedGroupe && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Templates */}
            <div className="lg:col-span-1 space-y-6">
              {/* Création de séances */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="bg-blue-50 px-4 py-3 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-800">Créer des Séances</h2>
                </div>

                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Matière</label>
                    <select
                      value={selectedMatiere || ''}
                      onChange={(e) => setSelectedMatiere(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!selectedGroupe}
                    >
                      <option value="">-- Choisir --</option>
                      {getFilteredMatieres().map((matiere) => (
                        <option key={matiere.id_matiere} value={matiere.id_matiere}>
                          {matiere.nom} {matiere.code ? `(${matiere.code})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Enseignant</label>
                    <select
                      value={selectedEnseignant || ''}
                      onChange={(e) => setSelectedEnseignant(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!selectedGroupe || selectedMatiere !== null}
                    >
                      <option value="">-- Choisir --</option>
                      {getFilteredEnseignants().map((enseignant) => (
                        <option key={enseignant.id_enseignant} value={enseignant.id_enseignant}>
                          {enseignant.utilisateur.nom} {enseignant.utilisateur.prenom}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salle</label>
                    <select
                      value={selectedSalle || ''}
                      onChange={(e) => setSelectedSalle(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!selectedGroupe}
                    >
                      <option value="">-- Choisir --</option>
                      {salles.map((salle) => (
                        <option key={salle.id_salle} value={salle.id_salle}>
                          {salle.code} - {salle.type} (Cap: {salle.capacite})
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={createTemplate}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Créer le modèle
                  </button>
                </div>
              </div>

              {/* Liste des modèles */}
              {templates.length > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="bg-purple-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Modèles Créés ({templates.length})</h3>
                  </div>
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {templates.map((template) => (
                      <div
                        key={template.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, template)}
                        className="p-3 rounded-lg cursor-move border border-gray-200 hover:border-blue-300 transition"
                        style={{ backgroundColor: template.color, color: 'white' }}
                      >
                        <div className="font-semibold">{template.matiere.nom}</div>
                        <div className="text-sm opacity-90">
                          {template.enseignant.utilisateur.nom} {template.enseignant.utilisateur.prenom}
                        </div>
                        <div className="text-sm opacity-90">Salle {template.salle.code}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Panel - Schedule Grid */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6 overflow-x-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Emploi du temps - {groupes.find(g => g.id_groupe === selectedGroupe)?.nom}
                </h2>
                {placedSeances.length > 0 && (
                  <button
                    onClick={deleteAllSeances}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition"
                  >
                    Supprimer tout
                  </button>
                )}
              </div>

              <div className="min-w-[800px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="border border-gray-300 bg-gray-50 p-2 text-sm font-semibold text-gray-700">
                        Horaire
                      </th>
                      {JOURS.map((jour) => (
                        <th
                          key={jour}
                          className="border border-gray-300 bg-gray-50 p-2 text-sm font-semibold text-gray-700"
                        >
                          {jour}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TIME_SLOTS.map((slot, slotIndex) => {
                      if (slot.debut === 'PAUSE') {
                        return (
                          <tr key={slotIndex}>
                            <td 
                              colSpan={7} 
                              className="border border-gray-300 bg-yellow-50 p-3 text-center"
                            >
                              <div className="flex items-center justify-center gap-2 text-yellow-700">
                                <span className="font-medium">PAUSE DÉJEUNER</span>
                                <span className="text-sm">13:20 - 14:30</span>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={slotIndex}>
                          <td className="border border-gray-300 bg-gray-50 p-2 text-xs text-center text-gray-600">
                            {slot.debut}<br />-<br />{slot.fin}
                          </td>
                          {JOURS.map((_, jourIndex) => {
                            const seance = placedSeances.find(
                              s => s.jour === jourIndex && s.slotIndex === slotIndex
                            );
                            const isHovered = hoveredCell?.jour === jourIndex && hoveredCell?.slot === slotIndex;

                            return (
                              <td
                                key={jourIndex}
                                onDragOver={(e) => handleDragOver(e, jourIndex, slotIndex)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, jourIndex, slotIndex)}
                                className={`border border-gray-300 p-1 h-24 ${
                                  isHovered ? 'bg-blue-50' : seance ? '' : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                              >
                                {seance ? (
                                  <div
                                    className="h-full p-2 rounded text-white text-xs flex flex-col justify-between relative"
                                    style={{ backgroundColor: seance.color }}
                                  >
                                    <button
                                      onClick={() => deleteSeance(seance)}
                                      className="absolute top-1 right-1 bg-white text-red-600 rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-100 transition text-xs"
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
                                    <div className="h-full flex items-center justify-center text-blue-600 text-sm">
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}