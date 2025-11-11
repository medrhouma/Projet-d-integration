'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, MapPin, Users, BookOpen, ChevronLeft, ChevronRight, Filter, Download } from 'lucide-react';

interface EmploiTemps {
  id_emploi: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  matiere: {
    nom: string;
    niveau: {
      nom: string;
      specialite: {
        nom: string;
      };
    };
  };
  salle: {
    code: string;
    type: string;
  };
  groupe: {
    nom: string;
  };
  enseignant: {
    utilisateur: {
      nom: string;
      prenom: string;
    };
  };
}

interface Groupe {
  id_groupe: number;
  nom: string;
  niveau: {
    nom: string;
  };
}

interface Enseignant {
  id_enseignant: number;
  utilisateur: {
    nom: string;
    prenom: string;
  };
}

interface UserInfo {
  nom: string;
  prenom: string;
  enseignant?: {
    departement_nom: string;
    id_departement: number;
  };
}

export default function EmploiTempsChefPage() {
  const [loading, setLoading] = useState(true);
  const [emplois, setEmplois] = useState<EmploiTemps[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [error, setError] = useState('');
  
  // Filtres
  const [selectedGroupe, setSelectedGroupe] = useState<number | null>(null);
  const [selectedEnseignant, setSelectedEnseignant] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'groupe' | 'enseignant' | 'all'>('all');

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const heures = Array.from({ length: 10 }, (_, i) => i + 8); // 8h à 18h

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userInfo?.enseignant?.id_departement) {
      loadEmplois();
    }
  }, [currentWeek, selectedGroupe, selectedEnseignant, userInfo]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les infos de l'utilisateur
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) throw new Error('Non authentifié');
      const userData = await userRes.json();
      setUserInfo(userData);

      // Charger les groupes et enseignants du département
      if (userData.enseignant?.id_departement) {
        const [groupesRes, enseignantsRes] = await Promise.all([
          fetch(`/api/groupes?departementId=${userData.enseignant.id_departement}`),
          fetch(`/api/enseignants?departementId=${userData.enseignant.id_departement}`)
        ]);

        if (groupesRes.ok) {
          const groupesData = await groupesRes.json();
          setGroupes(groupesData);
        }

        if (enseignantsRes.ok) {
          const enseignantsData = await enseignantsRes.json();
          setEnseignants(enseignantsData);
        }
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadEmplois = async () => {
    try {
      if (!userInfo?.enseignant?.id_departement) return;

      const startOfWeek = getStartOfWeek(currentWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      const params = new URLSearchParams({
        departementId: userInfo.enseignant.id_departement.toString(),
        dateDebut: startOfWeek.toISOString().split('T')[0],
        dateFin: endOfWeek.toISOString().split('T')[0],
      });

      if (selectedGroupe) {
        params.append('groupeId', selectedGroupe.toString());
      }
      if (selectedEnseignant) {
        params.append('enseignantId', selectedEnseignant.toString());
      }

      const emploiRes = await fetch(`/api/emploi-temps?${params.toString()}`);
      if (emploiRes.ok) {
        const emploiData = await emploiRes.json();
        setEmplois(emploiData);
      } else {
        setError('Erreur lors du chargement de l\'emploi du temps');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement de l\'emploi du temps');
    }
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const getDateForDay = (dayIndex: number) => {
    const startOfWeek = getStartOfWeek(currentWeek);
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + dayIndex);
    return date;
  };

  const getEmploiForSlot = (dayIndex: number, hour: number) => {
    const slotDate = getDateForDay(dayIndex);
    const slotDateStr = slotDate.toISOString().split('T')[0];
    
    return emplois.filter(emploi => {
      const emploiDate = new Date(emploi.date).toISOString().split('T')[0];
      const emploiHeure = new Date(emploi.heure_debut).getHours();
      return emploiDate === slotDateStr && emploiHeure === hour;
    });
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

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const resetFilters = () => {
    setSelectedGroupe(null);
    setSelectedEnseignant(null);
    setViewMode('all');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      {/* En-tête */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Emploi du Temps du Département
            </h1>
            <p className="text-gray-600">
              {userInfo?.nom} {userInfo?.prenom} • {userInfo?.enseignant?.departement_nom}
            </p>
          </div>
          <Link href="/dashboard-chef-departement/emploi-temps/gestion">
            <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl">
              <Calendar size={20} />
              <span className="font-semibold">Gérer l'emploi du temps</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">Filtres</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mode d'affichage
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
              value={viewMode}
              onChange={(e) => {
                setViewMode(e.target.value as 'groupe' | 'enseignant' | 'all');
                resetFilters();
              }}
            >
              <option value="all">Vue globale</option>
              <option value="groupe">Par groupe</option>
              <option value="enseignant">Par enseignant</option>
            </select>
          </div>

          {viewMode === 'groupe' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Groupe
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
                value={selectedGroupe || ''}
                onChange={(e) => setSelectedGroupe(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Tous les groupes</option>
                {groupes.map((groupe) => (
                  <option key={groupe.id_groupe} value={groupe.id_groupe}>
                    {groupe.nom} - {groupe.niveau.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          {viewMode === 'enseignant' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enseignant
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
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
          )}

          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Navigation semaine */}
      <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={previousWeek}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
          >
            <ChevronLeft size={20} />
            <span className="hidden sm:inline">Semaine précédente</span>
          </button>
          
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center text-gray-600 mb-1">
              <Calendar size={20} />
              <span className="text-sm">Semaine du</span>
            </div>
            <div className="text-lg font-bold text-gray-800">{formatWeekRange()}</div>
          </div>
          
          <button
            onClick={nextWeek}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg hover:shadow-xl"
          >
            <span className="hidden sm:inline">Semaine suivante</span>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gradient-to-r from-indigo-600 to-purple-600">
                <th className="border border-indigo-300 p-3 text-white font-semibold sticky left-0 bg-indigo-600 z-10">
                  <Clock size={20} className="mx-auto" />
                </th>
                {jours.map((jour, index) => {
                  const date = getDateForDay(index);
                  const isToday = new Date().toDateString() === date.toDateString();
                  return (
                    <th 
                      key={index} 
                      className={`border border-indigo-300 p-3 text-white font-semibold min-w-[180px] ${
                        isToday ? 'bg-yellow-500' : ''
                      }`}
                    >
                      <div>{jour}</div>
                      <div className="text-xs font-normal mt-1">
                        {date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {heures.map((heure) => (
                <tr key={heure} className="hover:bg-indigo-50 transition-colors">
                  <td className="border border-gray-200 p-2 text-sm font-medium text-center sticky left-0 bg-white z-10">
                    <div className="flex flex-col items-center">
                      <span className="text-indigo-600 font-bold">{heure}h</span>
                      <span className="text-gray-400 text-xs">-</span>
                      <span className="text-indigo-600 font-bold">{heure + 1}h</span>
                    </div>
                  </td>
                  {jours.map((_, dayIndex) => {
                    const emploisSlot = getEmploiForSlot(dayIndex, heure);
                    
                    return (
                      <td
                        key={dayIndex}
                        className={`border border-gray-200 p-1 align-top ${
                          emploisSlot.length > 0 ? 'bg-gradient-to-br from-indigo-50 to-purple-50' : 'bg-white'
                        }`}
                      >
                        {emploisSlot.map((emploi) => (
                          <div
                            key={emploi.id_emploi}
                            className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-lg p-2 mb-1 shadow-md hover:shadow-lg transition-all text-xs"
                          >
                            {/* Matière */}
                            <div className="font-bold mb-1 flex items-start gap-1">
                              <BookOpen size={12} className="flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{emploi.matiere.nom}</span>
                            </div>
                            
                            {/* Groupe */}
                            <div className="flex items-center gap-1 opacity-90 mb-1">
                              <Users size={10} />
                              <span className="truncate">{emploi.groupe.nom}</span>
                            </div>
                            
                            {/* Enseignant */}
                            <div className="flex items-center gap-1 opacity-90 mb-1 truncate">
                              <span className="truncate">
                                {emploi.enseignant.utilisateur.nom} {emploi.enseignant.utilisateur.prenom}
                              </span>
                            </div>
                            
                            {/* Salle */}
                            {emploi.salle && (
                              <div className="flex items-center gap-1 opacity-90">
                                <MapPin size={10} />
                                <span>{emploi.salle.code}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-lg">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total séances</p>
              <p className="text-2xl font-bold text-gray-800">{emplois.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-lg">
              <Clock className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Heures totales</p>
              <p className="text-2xl font-bold text-gray-800">
                {emplois.reduce((acc, emploi) => {
                  const debut = new Date(emploi.heure_debut);
                  const fin = new Date(emploi.heure_fin);
                  return acc + (fin.getTime() - debut.getTime()) / (1000 * 60 * 60);
                }, 0).toFixed(1)}h
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-lg">
              <Users className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Groupes actifs</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(emplois.map(e => e.groupe.nom)).size}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-lg">
              <MapPin className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Salles utilisées</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(emplois.map(e => e.salle?.code).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
