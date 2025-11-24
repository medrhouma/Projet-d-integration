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
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Emploi du Temps</h1>
            <p className="text-gray-600 mt-1">
              {userInfo?.enseignant?.departement_nom}
            </p>
          </div>
          <Link href="/dashboard-chef-departement/emploi-temps/gestion">
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-all shadow-sm">
              Gérer
            </button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-3">
          <select
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500"
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

          {viewMode === 'groupe' && (
            <select
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500"
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
          )}

          {viewMode === 'enseignant' && (
            <select
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-gray-500"
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
          )}
        </div>
      </div>

      {/* Navigation semaine */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={previousWeek}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-all"
          >
            ← Précédent
          </button>
          
          <div className="text-center">
            <div className="font-semibold text-gray-800">{formatWeekRange()}</div>
          </div>
          
          <button
            onClick={nextWeek}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg transition-all"
          >
            Suivant →
          </button>
        </div>
      </div>

      {/* Calendrier */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-700">
                <th className="border border-gray-600 p-2 text-white text-sm sticky left-0 bg-gray-700 z-10 w-20">
                  Heure
                </th>
                {jours.map((jour, index) => {
                  const date = getDateForDay(index);
                  const isToday = new Date().toDateString() === date.toDateString();
                  return (
                    <th 
                      key={index} 
                      className={`border border-gray-600 p-2 text-white text-sm min-w-[150px] ${
                        isToday ? 'bg-gray-800' : ''
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
                <tr key={heure}>
                  <td className="border border-gray-200 p-2 text-sm text-center sticky left-0 bg-white z-10">
                    <div className="font-semibold text-gray-700">{heure}h-{heure + 1}h</div>
                  </td>
                  {jours.map((_, dayIndex) => {
                    const emploisSlot = getEmploiForSlot(dayIndex, heure);
                    
                    return (
                      <td
                        key={dayIndex}
                        className="border border-gray-200 p-2 align-top bg-white"
                      >
                        {emploisSlot.map((emploi) => (
                          <div
                            key={emploi.id_emploi}
                            className="bg-gray-600 text-white rounded-lg p-2 mb-2 text-xs shadow-sm"
                          >
                            <div className="font-semibold mb-1">{emploi.matiere.nom}</div>
                            <div>{emploi.groupe.nom}</div>
                            <div className="text-xs mt-1">
                              {emploi.enseignant.utilisateur.prenom.charAt(0)}. {emploi.enseignant.utilisateur.nom}
                            </div>
                            {emploi.salle && (
                              <div className="text-xs">{emploi.salle.code}</div>
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-400 transition-all">
          <p className="text-sm text-gray-600 font-medium">Séances</p>
          <p className="text-3xl font-bold text-gray-900">{emplois.length}</p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-400 transition-all">
          <p className="text-sm text-gray-600 font-medium">Heures</p>
          <p className="text-3xl font-bold text-gray-900">
            {emplois.reduce((acc, emploi) => {
              const debut = new Date(emploi.heure_debut);
              const fin = new Date(emploi.heure_fin);
              return acc + (fin.getTime() - debut.getTime()) / (1000 * 60 * 60);
            }, 0).toFixed(1)}h
          </p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-400 transition-all">
          <p className="text-sm text-gray-600 font-medium">Groupes</p>
          <p className="text-3xl font-bold text-gray-900">
            {new Set(emplois.map(e => e.groupe.nom)).size}
          </p>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-gray-400 transition-all">
          <p className="text-sm text-gray-600 font-medium">Salles</p>
          <p className="text-3xl font-bold text-gray-900">
            {new Set(emplois.map(e => e.salle?.code).filter(Boolean)).size}
          </p>
        </div>
      </div>
    </div>
  );
}
