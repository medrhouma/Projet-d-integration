'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, BookOpen, ChevronLeft, ChevronRight, List, CalendarDays } from 'lucide-react';

interface EmploiTemps {
  id_emploi: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  matiere: {
    nom: string;
    niveau: {
      nom: string;
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

interface UserInfo {
  nom: string;
  prenom: string;
  role: string;
  etudiant?: {
    id_etudiant: number;
    numero_inscription: string;
    groupe?: {
      id_groupe: number;
      nom: string;
      niveau?: {
        id_niveau: number;
        nom: string;
      };
    };
    specialite?: {
      id_specialite: number;
      nom: string;
    };
  };
}

export default function EmploiTempsEtudiantPage() {
  const [loading, setLoading] = useState(true);
  const [emplois, setEmplois] = useState<EmploiTemps[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

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
    loadUserAndEmplois();
  }, [currentWeek]);

  const loadUserAndEmplois = async () => {
    try {
      setLoading(true);
      
      // Récupérer les infos de l'utilisateur connecté
      const userRes = await fetch('/api/auth/me');
      if (!userRes.ok) {
        throw new Error('Non authentifié');
      }
      const response = await userRes.json();
      const userData = response.user; // Extraire l'objet user de la réponse
      setUserInfo(userData);

      // Récupérer l'emploi du temps du groupe de l'étudiant
      if (userData.etudiant?.groupe?.id_groupe) {
        const params = new URLSearchParams({
          groupeId: userData.etudiant.groupe.id_groupe.toString(),
        });

        const emploiRes = await fetch(`/api/emploi-temps/public?${params.toString()}`);
        if (emploiRes.ok) {
          const emploiData = await emploiRes.json();
          setEmplois(emploiData);
        } else {
          setError('Erreur lors du chargement de l\'emploi du temps');
        }
      } else {
        setError('Aucun groupe assigné. Contactez votre administration.');
      }
    } catch (err) {
      console.error('Erreur:', err);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi
    return new Date(d.setDate(diff));
  };

  const getDateForDay = (dayIndex: number) => {
    const startOfWeek = getStartOfWeek(currentWeek);
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + dayIndex);
    return date;
  };

  const getEmploiForSlot = (dayIndex: number, slotStart: number, slotEnd?: number) => {
    const slotDate = getDateForDay(dayIndex);
    const slotDateStr = slotDate.toISOString().split('T')[0];
    
    return emplois.filter(emploi => {
      const emploiDate = new Date(emploi.date).toISOString().split('T')[0];
      if (emploiDate !== slotDateStr) return false;
      
      const heureDebut = new Date(emploi.heure_debut);
      // Utiliser getUTCHours et getUTCMinutes pour éviter les problèmes de fuseau horaire
      const emploiHeureDebut = heureDebut.getUTCHours() + heureDebut.getUTCMinutes() / 60;
      
      // Si slotEnd est fourni, vérifier que la séance commence dans cet intervalle
      if (slotEnd !== undefined) {
        return emploiHeureDebut >= slotStart && emploiHeureDebut < slotEnd;
      }
      
      // Sinon, tolérance de 36 minutes
      return Math.abs(emploiHeureDebut - slotStart) < 0.6;
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'emploi du temps...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center bg-red-50 p-8 rounded-lg">
          <p className="text-red-600 text-lg">{error}</p>
        </div>
      </div>
    );
  }

  // Debug info
  console.log('🔍 État actuel:', {
    emploisCount: emplois.length,
    userInfo: userInfo?.nom,
    groupeId: userInfo?.etudiant?.groupe?.id_groupe,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      {/* En-tête avec informations étudiant */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Mon Emploi du Temps
            </h1>
            {userInfo && (
              <p className="text-gray-600">
                {userInfo.nom} {userInfo.prenom} • {userInfo.etudiant?.groupe?.nom} • {userInfo.etudiant?.groupe?.niveau?.nom}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Spécialité</p>
            <p className="font-semibold text-purple-600">{userInfo?.etudiant?.specialite?.nom}</p>
          </div>
        </div>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6">
          <p className="font-bold">Erreur</p>
          <p>{error}</p>
        </div>
      )}

      {/* Navigation semaine */}
      <div className="bg-white rounded-2xl shadow-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <button
            onClick={previousWeek}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
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
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
          >
            <span className="hidden sm:inline">Semaine suivante</span>
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Basculer entre vue calendrier et liste */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'calendar'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <CalendarDays size={18} />
            <span>Vue Calendrier</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              viewMode === 'list'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <List size={18} />
            <span>Vue Liste (Tous les cours)</span>
          </button>
        </div>
      </div>

      {/* Calendrier ou Liste */}
      {viewMode === 'calendar' ? (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-gradient-to-r from-purple-600 to-pink-600">
                  <th className="border border-purple-300 p-3 text-white font-semibold sticky left-0 bg-purple-600 z-10">
                    <Clock size={20} className="mx-auto" />
                  </th>
                  {jours.map((jour, index) => {
                    const date = getDateForDay(index);
                    const isToday = new Date().toDateString() === date.toDateString();
                    return (
                      <th 
                        key={index} 
                        className={`border border-purple-300 p-3 text-white font-semibold min-w-[150px] ${
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
                {heures.map((heure, index) => (
                  <tr key={index} className="hover:bg-purple-50 transition-colors">
                    <td className="border border-gray-200 p-2 text-sm font-medium text-center sticky left-0 bg-white z-10">
                      <div className="flex flex-col items-center">
                        <span className="text-purple-600 font-bold">{heure.label}</span>
                      </div>
                    </td>
                    {jours.map((_, dayIndex) => {
                      const emploisSlot = getEmploiForSlot(dayIndex, heure.start, heure.end);
                      const hasMultiple = emploisSlot.length > 1;
                      
                      return (
                        <td
                          key={dayIndex}
                          className={`border border-gray-200 p-1 align-top ${
                            emploisSlot.length > 0 ? 'bg-gradient-to-br from-purple-50 to-pink-50' : 'bg-white'
                          }`}
                        >
                          {emploisSlot.map((emploi, idx) => (
                            <div
                              key={emploi.id_emploi}
                              className={`bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-lg p-2 mb-1 shadow-md hover:shadow-lg transition-all ${
                                hasMultiple ? 'text-xs' : 'text-sm'
                              }`}
                            >
                              {/* Matière */}
                              <div className="font-bold mb-1 flex items-start gap-1">
                                <BookOpen size={14} className="flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{emploi.matiere.nom}</span>
                              </div>
                              
                              {/* Horaire */}
                              <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
                                <Clock size={12} />
                                <span>{formatTime(emploi.heure_debut)} - {formatTime(emploi.heure_fin)}</span>
                              </div>
                              
                              {/* Salle */}
                              {emploi.salle && (
                                <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
                                  <MapPin size={12} />
                                  <span>{emploi.salle.code}</span>
                                  {!hasMultiple && (
                                    <span className="ml-1">({emploi.salle.type})</span>
                                  )}
                                </div>
                              )}
                              
                              {/* Enseignant */}
                              {emploi.enseignant && (
                                <div className="flex items-center gap-1 text-xs opacity-90">
                                  <User size={12} />
                                  <span className="truncate">
                                    {emploi.enseignant.utilisateur.nom} {emploi.enseignant.utilisateur.prenom}
                                  </span>
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
      ) : (
        /* Vue Liste - Tous les cours */
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <List size={24} className="text-purple-600" />
            Tous mes cours ({emplois.length})
          </h2>
          
          {emplois.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={64} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Aucun cours enregistré</p>
              <p className="text-gray-400 text-sm mt-2">Contactez votre administration pour ajouter des cours</p>
            </div>
          ) : (
            <div className="space-y-4">
              {emplois
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map((emploi) => (
                  <div
                    key={emploi.id_emploi}
                    className="border-l-4 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg shadow hover:shadow-lg transition-all"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1 min-w-[200px]">
                        <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                          <BookOpen size={20} className="text-purple-600" />
                          {emploi.matiere.nom}
                        </h3>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span className="font-semibold">
                              {new Date(emploi.date).toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={16} />
                            <span>{formatTime(emploi.heure_debut)} - {formatTime(emploi.heure_fin)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-[200px] space-y-1 text-sm">
                        {emploi.salle && (
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-gray-500" />
                            <span className="font-medium">{emploi.salle.code}</span>
                            <span className="text-gray-500">({emploi.salle.type})</span>
                          </div>
                        )}
                        {emploi.enseignant && (
                          <div className="flex items-center gap-2">
                            <User size={16} className="text-gray-500" />
                            <span>{emploi.enseignant.utilisateur.nom} {emploi.enseignant.utilisateur.prenom}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Statistiques de la semaine */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-lg">
              <BookOpen className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total de cours</p>
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
              <p className="text-sm text-gray-600">Heures de cours</p>
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
              <MapPin className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Salles différentes</p>
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
