'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, BookOpen, ChevronLeft, ChevronRight, Filter, List, CalendarDays, Plus, Trash2, X } from 'lucide-react';

interface Departement {
  id_departement: number;
  nom: string;
}

interface Groupe {
  id_groupe: number;
  nom: string;
  niveau: {
    nom: string;
    specialite: {
      nom: string;
      departement: {
        nom: string;
      };
    };
  };
}

interface Enseignant {
  id_enseignant: number;
  matricule: string;
  utilisateur: {
    nom: string;
    prenom: string;
  };
  departement: {
    nom: string;
  };
}

interface Salle {
  id_salle: number;
  code: string;
  type: string;
  capacité: number;
}

interface Matiere {
  id_matiere: number;
  nom: string;
  niveau: {
    nom: string;
  };
}

interface EmploiTemps {
  id_emploi: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  matiere: Matiere;
  salle: Salle;
  groupe: Groupe;
  enseignant: Enseignant;
}

export default function EmploiTempsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [emplois, setEmplois] = useState<EmploiTemps[]>([]);
  
  // Filtres
  const [selectedDepartement, setSelectedDepartement] = useState<number | null>(null);
  const [selectedGroupe, setSelectedGroupe] = useState<number | null>(null);
  const [selectedEnseignant, setSelectedEnseignant] = useState<number | null>(null);
  const [selectedSalle, setSelectedSalle] = useState<number | null>(null);
  
  // Semaine actuelle
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Modal pour ajouter un cours
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null);
  const [formData, setFormData] = useState({
    id_matiere: '',
    id_groupe: '',
    id_enseignant: '',
    id_salle: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAllSessions, setShowAllSessions] = useState(false);

  // Heures de cours (séances de 1h30)
  // Matin: 8:30-10:00, 10:00-11:30, 11:30-13:00
  // Pause: 13:00-14:00
  // Après-midi: 14:00-15:30, 15:30-17:00
  const heures = [
    { label: '08:30 - 10:00', start: 8.5, end: 10 },
    { label: '10:00 - 11:30', start: 10, end: 11.5 },
    { label: '11:30 - 13:00', start: 11.5, end: 13 },
    { label: 'PAUSE', start: 13, end: 14, isPause: true },
    { label: '14:00 - 15:30', start: 14, end: 15.5 },
    { label: '15:30 - 17:00', start: 15.5, end: 17 },
  ];
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadEmplois();
  }, [selectedDepartement, selectedGroupe, selectedEnseignant, selectedSalle, currentWeek]);

  const loadData = async () => {
    try {
      const [deptRes, groupesRes, enseignantsRes, sallesRes, matieresRes] = await Promise.all([
        fetch('/api/departements'),
        fetch('/api/groupes'),
        fetch('/api/enseignants'),
        fetch('/api/salles'),
        fetch('/api/matieres'),
      ]);

      const [deptData, groupesData, enseignantsData, sallesData, matieresData] = await Promise.all([
        deptRes.json(),
        groupesRes.json(),
        enseignantsRes.json(),
        sallesRes.json(),
        matieresRes.json(),
      ]);

      setDepartements(deptData);
      setGroupes(groupesData);
      setEnseignants(enseignantsData);
      setSalles(sallesData);
      setMatieres(matieresData);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadEmplois = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDepartement) params.append('departementId', selectedDepartement.toString());
      if (selectedGroupe) params.append('groupeId', selectedGroupe.toString());
      if (selectedEnseignant) params.append('enseignantId', selectedEnseignant.toString());
      if (selectedSalle) params.append('salleId', selectedSalle.toString());

      const res = await fetch(`/api/emploi-temps/public?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEmplois(data);
      }
    } catch (error) {
      console.error('Erreur de chargement des emplois:', error);
    }
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi
    return new Date(d.setDate(diff));
  };

  const getDateForDayAndHour = (dayIndex: number, hour: number) => {
    const startOfWeek = getStartOfWeek(currentWeek);
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + dayIndex);
    
    // Gérer les heures décimales (ex: 8.5 = 8h30)
    const hours = Math.floor(hour);
    const minutes = (hour % 1) * 60;
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const getDateForDay = (dayIndex: number) => {
    const startOfWeek = getStartOfWeek(currentWeek);
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + dayIndex);
    return date;
  };

  const getEmploiForSlot = (dayIndex: number, slotStart: number, slotEnd: number) => {
    const slotDate = getDateForDay(dayIndex);
    const slotDateStr = slotDate.toISOString().split('T')[0];
    
    return emplois.filter(emploi => {
      const emploiDate = new Date(emploi.date).toISOString().split('T')[0];
      if (emploiDate !== slotDateStr) return false;
      
      const heureDebut = new Date(emploi.heure_debut);
      // Utiliser getUTCHours et getUTCMinutes pour éviter les problèmes de fuseau horaire
      const emploiHeureDebut = heureDebut.getUTCHours() + heureDebut.getUTCMinutes() / 60;
      const heureFin = new Date(emploi.heure_fin);
      const emploiHeureFin = heureFin.getUTCHours() + heureFin.getUTCMinutes() / 60;
      
      // Vérifier si la séance chevauche le créneau
      return (emploiHeureDebut >= slotStart && emploiHeureDebut < slotEnd) ||
             (emploiHeureFin > slotStart && emploiHeureFin <= slotEnd) ||
             (emploiHeureDebut <= slotStart && emploiHeureFin >= slotEnd);
    });
  };

  const handleSlotClick = (dayIndex: number, hour: number) => {
    setSelectedSlot({ day: dayIndex, hour });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSlot) return;

    try {
      const date = getDateForDayAndHour(selectedSlot.day, selectedSlot.hour);
      const heure_debut = new Date(date);
      const heure_fin = new Date(date);
      
      // Ajouter 1h30 pour la fin du cours
      heure_fin.setMinutes(heure_fin.getMinutes() + 90);

      const res = await fetch('/api/emploi-temps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date.toISOString().split('T')[0],
          heure_debut: heure_debut.toISOString(),
          heure_fin: heure_fin.toISOString(),
          id_matiere: parseInt(formData.id_matiere),
          id_groupe: parseInt(formData.id_groupe),
          id_enseignant: formData.id_enseignant ? parseInt(formData.id_enseignant) : undefined,
          id_salle: formData.id_salle ? parseInt(formData.id_salle) : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Cours ajouté avec succès !');
        setShowModal(false);
        setFormData({ id_matiere: '', id_groupe: '', id_enseignant: '', id_salle: '' });
        loadEmplois();
      } else if (res.status === 409) {
        // Conflits détectés
        const conflitsMsg = data.conflits.map((c: any) => c.message).join('\n');
        setError(`Conflits détectés:\n${conflitsMsg}`);
      } else {
        setError(data.error || 'Erreur lors de l\'ajout du cours');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de l\'ajout du cours');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce cours ?')) return;

    try {
      const res = await fetch(`/api/emploi-temps/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Cours supprimé avec succès !');
        loadEmplois();
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la suppression');
    }
  };

  const previousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const nextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const formatWeekRange = () => {
    const start = getStartOfWeek(currentWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${start.toLocaleDateString('fr-FR', options)} - ${end.toLocaleDateString('fr-FR', options)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          Gestion de l'Emploi du Temps
        </h1>
        <p className="text-gray-600">Planification et gestion des séances avec détection automatique de conflits</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-blue-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Filtres de recherche</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Département
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedDepartement || ''}
              onChange={(e) => setSelectedDepartement(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Tous les départements</option>
              {departements.map((dept) => (
                <option key={dept.id_departement} value={dept.id_departement}>
                  {dept.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Groupe
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedGroupe || ''}
              onChange={(e) => setSelectedGroupe(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Tous les groupes</option>
              {groupes
                .filter(g => !selectedDepartement || g.niveau.specialite.departement.nom === departements.find(d => d.id_departement === selectedDepartement)?.nom)
                .map((groupe) => (
                  <option key={groupe.id_groupe} value={groupe.id_groupe}>
                    {groupe.nom} - {groupe.niveau.nom}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enseignant
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedEnseignant || ''}
              onChange={(e) => setSelectedEnseignant(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Tous les enseignants</option>
              {enseignants.map((ens) => (
                <option key={ens.id_enseignant} value={ens.id_enseignant}>
                  {ens.utilisateur.nom} {ens.utilisateur.prenom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salle
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={selectedSalle || ''}
              onChange={(e) => setSelectedSalle(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Toutes les salles</option>
              {salles.map((salle) => (
                <option key={salle.id_salle} value={salle.id_salle}>
                  {salle.code} ({salle.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4 shadow">
          <p className="font-bold">Erreur</p>
          <p className="whitespace-pre-line">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded-lg mb-4 shadow">
          <p className="font-bold">Succès</p>
          <p>{success}</p>
        </div>
      )}

      {/* Navigation semaine */}
      <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={previousWeek}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Semaine précédente</span>
          </button>
          
          <div className="text-center flex-1 mx-4">
            <div className="flex items-center gap-2 justify-center text-gray-600 mb-1">
              <Calendar size={20} />
              <span className="text-sm">Semaine du</span>
            </div>
            <div className="text-lg font-bold text-gray-800">{formatWeekRange()}</div>
          </div>
          
          <button
            onClick={nextWeek}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl"
          >
            <span className="hidden sm:inline">Semaine suivante</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Info totale des séances */}
      {emplois.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-6 mb-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex-1">
              <p className="font-bold text-blue-800 text-lg flex items-center gap-2">
                <BookOpen size={24} />
                Total de {emplois.length} séance(s) enregistrée(s)
              </p>
              <p className="text-sm text-blue-600 mt-2">
                💡 Utilisez les filtres ci-dessus pour affiner la recherche, ou naviguez entre les semaines pour voir les cours planifiés.
              </p>
            </div>
            <button
              onClick={() => setShowAllSessions(!showAllSessions)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl whitespace-nowrap"
            >
              {showAllSessions ? (
                <>
                  <CalendarDays size={20} />
                  <span>Voir le calendrier</span>
                </>
              ) : (
                <>
                  <List size={20} />
                  <span>Voir toutes les séances</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {showAllSessions ? (
        /* Vue Liste - Toutes les séances */
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <List size={28} className="text-blue-600" />
            Toutes les séances ({emplois.length})
          </h2>
          
          {emplois.length === 0 ? (
            <div className="text-center py-16">
              <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg font-semibold">Aucune séance enregistrée</p>
              <p className="text-gray-400 text-sm mt-2">Cliquez sur une case du calendrier pour ajouter un cours</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emplois
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((emploi) => (
                  <div
                    key={emploi.id_emploi}
                    className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl hover:shadow-xl transition-all"
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <BookOpen size={22} className="text-blue-600" />
                          {emploi.matiere.nom}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Calendar size={16} className="text-blue-500" />
                            <span className="font-medium">
                              {new Date(emploi.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock size={16} className="text-blue-500" />
                            <span className="font-medium">
                              {new Date(emploi.heure_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - 
                              {new Date(emploi.heure_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-700">
                            <Users size={16} className="text-blue-500" />
                            <span>{emploi.groupe.nom} - {emploi.groupe.niveau.nom}</span>
                          </div>
                          {emploi.enseignant && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Users size={16} className="text-blue-500" />
                              <span>{emploi.enseignant.utilisateur.nom} {emploi.enseignant.utilisateur.prenom}</span>
                            </div>
                          )}
                          {emploi.salle && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin size={16} className="text-blue-500" />
                              <span>{emploi.salle.code} ({emploi.salle.type})</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(emploi.id_emploi)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow hover:shadow-lg"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      ) : (
        /* Vue Calendrier */
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <th className="border border-blue-300 p-3 text-white font-semibold sticky left-0 bg-blue-600 z-10">
                  <Clock size={20} className="mx-auto" />
                </th>
                {jours.map((jour, index) => (
                  <th key={index} className="border border-blue-300 p-3 text-white font-semibold min-w-[180px]">
                    <div className="font-bold">{jour}</div>
                    <div className="text-xs font-normal mt-1 opacity-90">
                      {getDateForDay(index).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
          <tbody>
            {heures.map((heure, index) => (
              <tr key={index} className={heure.isPause ? 'bg-gray-100' : 'hover:bg-blue-50 transition-colors'}>
                <td className={`border border-gray-200 p-2 text-sm font-medium text-center sticky left-0 z-10 ${
                  heure.isPause ? 'bg-gray-100' : 'bg-white'
                }`}>
                  <div className="flex flex-col items-center">
                    <span className={`font-bold ${heure.isPause ? 'text-gray-600' : 'text-blue-600'}`}>
                      {heure.label}
                    </span>
                  </div>
                </td>
                {heure.isPause ? (
                  <td colSpan={6} className="border border-gray-200 p-4 text-center bg-gray-50">
                    <span className="text-gray-500 font-semibold">🍽️ PAUSE DÉJEUNER</span>
                  </td>
                ) : (
                  jours.map((_, dayIndex) => {
                    const emploisSlot = getEmploiForSlot(dayIndex, heure.start, heure.end);
                    const emploi = emploisSlot[0]; // Prendre le premier cours du créneau
                    return (
                      <td
                        key={dayIndex}
                        className={`border border-gray-200 p-2 cursor-pointer align-top ${
                          emploi ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => !emploi && handleSlotClick(dayIndex, heure.start)}
                      >
                      {emploi ? (
                        <div className="bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg p-2 shadow-md hover:shadow-lg transition-all">
                          <div className="font-bold mb-1 flex items-start gap-1 text-sm">
                            <BookOpen size={14} className="flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-2">{emploi.matiere.nom}</span>
                          </div>
                          <div className="text-xs opacity-90 mb-1 flex items-center gap-1">
                            <Users size={12} />
                            <span>{emploi.groupe.nom}</span>
                          </div>
                          {emploi.enseignant && (
                            <div className="text-xs opacity-90 mb-1 truncate">
                              {emploi.enseignant.utilisateur.nom} {emploi.enseignant.utilisateur.prenom}
                            </div>
                          )}
                          {emploi.salle && (
                            <div className="text-xs opacity-90 mb-2 flex items-center gap-1">
                              <MapPin size={12} />
                              <span>{emploi.salle.code}</span>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(emploi.id_emploi);
                            }}
                            className="mt-1 px-2 py-1 bg-red-500 hover:bg-red-600 rounded text-xs flex items-center gap-1 w-full justify-center transition-colors"
                          >
                            <Trash2 size={12} />
                            <span>Supprimer</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-20 text-gray-400 hover:text-blue-500 transition-colors">
                          <Plus size={24} />
                        </div>
                      )}
                    </td>
                  );
                  })
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        </div>
      )}

      {/* Modal Ajouter un cours */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Plus size={28} className="text-blue-600" />
                Ajouter un cours
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  setError('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 mb-4 rounded">
              <p className="text-sm text-blue-800 font-semibold">
                📅 {jours[selectedSlot.day]} • {(() => {
                  const hours = Math.floor(selectedSlot.hour);
                  const minutes = Math.round((selectedSlot.hour % 1) * 60);
                  const endHour = selectedSlot.hour + 1.5;
                  const endHours = Math.floor(endHour);
                  const endMinutes = Math.round((endHour % 1) * 60);
                  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} - ${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
                })()}
              </p>
            </div>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-4">
                <p className="font-bold">Erreur</p>
                <p className="text-sm whitespace-pre-line">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matière *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.id_matiere}
                  onChange={(e) => setFormData({ ...formData, id_matiere: e.target.value })}
                >
                  <option value="">Sélectionner une matière</option>
                  {matieres.map((mat) => (
                    <option key={mat.id_matiere} value={mat.id_matiere}>
                      {mat.nom} - {mat.niveau.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Groupe *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.id_groupe}
                  onChange={(e) => setFormData({ ...formData, id_groupe: e.target.value })}
                >
                  <option value="">Sélectionner un groupe</option>
                  {groupes.map((groupe) => (
                    <option key={groupe.id_groupe} value={groupe.id_groupe}>
                      {groupe.nom} - {groupe.niveau.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enseignant
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.id_enseignant}
                  onChange={(e) => setFormData({ ...formData, id_enseignant: e.target.value })}
                >
                  <option value="">Sélectionner un enseignant</option>
                  {enseignants.map((ens) => (
                    <option key={ens.id_enseignant} value={ens.id_enseignant}>
                      {ens.utilisateur.nom} {ens.utilisateur.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salle
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.id_salle}
                  onChange={(e) => setFormData({ ...formData, id_salle: e.target.value })}
                >
                  <option value="">Sélectionner une salle</option>
                  {salles.map((salle) => (
                    <option key={salle.id_salle} value={salle.id_salle}>
                      {salle.code} - {salle.type} (Cap: {salle.capacité})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
