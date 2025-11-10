'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, BookOpen, ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';

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
}

interface UserInfo {
  nom: string;
  prenom: string;
  role: string;
  enseignant?: {
    id_enseignant: number;
    matricule: string;
    departement_nom: string;
  };
}

export default function EmploiTempsEnseignantPage() {
  const [loading, setLoading] = useState(true);
  const [emplois, setEmplois] = useState<EmploiTemps[]>([]);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [error, setError] = useState('');

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const heures = [
    { label: '08:30 - 10:00', start: 8.5, end: 10 },
    { label: '10:00 - 11:30', start: 10, end: 11.5 },
    { label: '11:30 - 13:00', start: 11.5, end: 13 },
    { label: 'PAUSE', start: 13, end: 14, isPause: true },
    { label: '14:00 - 15:30', start: 14, end: 15.5 },
    { label: '15:30 - 17:00', start: 15.5, end: 17 },
  ];

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
      const userDataResponse = await userRes.json();
      console.log('📥 Réponse /api/auth/me:', userDataResponse);
      
      // Extraire l'objet user de la réponse
      const userData = userDataResponse.success ? userDataResponse.user : userDataResponse;
      console.log('👤 Données utilisateur:', userData);
      setUserInfo(userData);

      // Récupérer l'emploi du temps de l'enseignant
      if (userData.enseignant?.id_enseignant) {
        console.log('🔍 Recherche emploi pour enseignant ID:', userData.enseignant.id_enseignant);
        
        const params = new URLSearchParams({
          enseignantId: userData.enseignant.id_enseignant.toString(),
        });

        const emploiRes = await fetch(`/api/emploi-temps/public?${params.toString()}`);
        console.log('📡 Requête emploi du temps:', emploiRes.status);
        
        if (emploiRes.ok) {
          const emploiData = await emploiRes.json();
          console.log('✅ Emplois du temps récupérés:', emploiData.length, 'séances');
          setEmplois(emploiData);
        } else {
          const errorText = await emploiRes.text();
          console.error('❌ Erreur API emploi-temps:', errorText);
          setError('Erreur lors du chargement de l\'emploi du temps');
        }
      } else {
        console.warn('⚠️ Aucun id_enseignant trouvé dans:', userData);
        setError('Impossible de charger l\'emploi du temps - ID enseignant manquant');
      }
    } catch (err) {
      console.error('❌ Erreur:', err);
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      {/* En-tête avec informations enseignant */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              Mon Emploi du Temps
            </h1>
            {userInfo && (
              <div className="flex items-center gap-2 text-gray-600">
                <GraduationCap size={20} />
                <span>{userInfo.nom} {userInfo.prenom}</span>
                <span className="text-gray-400">•</span>
                <span>{userInfo.enseignant?.matricule}</span>
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Département</p>
            <p className="font-semibold text-blue-600">{userInfo?.enseignant?.departement_nom}</p>
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
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl"
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
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all shadow-lg hover:shadow-xl"
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
              <tr className="bg-gradient-to-r from-blue-600 to-indigo-600">
                <th className="border border-blue-300 p-3 text-white font-semibold sticky left-0 bg-blue-600 z-10">
                  <Clock size={20} className="mx-auto" />
                </th>
                {jours.map((jour, index) => {
                  const date = getDateForDay(index);
                  const isToday = new Date().toDateString() === date.toDateString();
                  return (
                    <th 
                      key={index} 
                      className={`border border-blue-300 p-3 text-white font-semibold min-w-[150px] ${
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
                  <tr key={index} className="hover:bg-blue-50 transition-colors">
                    <td className="border border-gray-200 p-2 text-sm font-medium text-center sticky left-0 bg-white z-10">
                      <div className="flex flex-col items-center">
                        <span className="text-blue-600 font-bold">{heure.label}</span>
                      </div>
                    </td>
                    {jours.map((_, dayIndex) => {
                      const emploisSlot = getEmploiForSlot(dayIndex, heure.start, heure.end);
                      const hasMultiple = emploisSlot.length > 1;
                    
                    return (
                      <td
                        key={dayIndex}
                        className={`border border-gray-200 p-1 align-top ${
                          emploisSlot.length > 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-white'
                        }`}
                      >
                        {emploisSlot.map((emploi) => (
                          <div
                            key={emploi.id_emploi}
                            className={`bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-lg p-2 mb-1 shadow-md hover:shadow-lg transition-all ${
                              hasMultiple ? 'text-xs' : 'text-sm'
                            }`}
                          >
                            {/* Matière */}
                            <div className="font-bold mb-1 flex items-start gap-1">
                              <BookOpen size={14} className="flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2">{emploi.matiere.nom}</span>
                            </div>
                            
                            {/* Groupe */}
                            <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
                              <Users size={12} />
                              <span>{emploi.groupe.nom}</span>
                              {!hasMultiple && (
                                <span className="ml-1">• {emploi.matiere.niveau.nom}</span>
                              )}
                            </div>
                            
                            {/* Horaire */}
                            <div className="flex items-center gap-1 text-xs opacity-90 mb-1">
                              <Clock size={12} />
                              <span>{formatTime(emploi.heure_debut)} - {formatTime(emploi.heure_fin)}</span>
                            </div>
                            
                            {/* Salle */}
                            {emploi.salle && (
                              <div className="flex items-center gap-1 text-xs opacity-90">
                                <MapPin size={12} />
                                <span>{emploi.salle.code}</span>
                                {!hasMultiple && (
                                  <span className="ml-1">({emploi.salle.type})</span>
                                )}
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

      {/* Statistiques de la semaine */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-lg">
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
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-lg">
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
              <Users className="text-white" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Groupes différents</p>
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
              <p className="text-sm text-gray-600">Salles différentes</p>
              <p className="text-2xl font-bold text-gray-800">
                {new Set(emplois.map(e => e.salle?.code).filter(Boolean)).size}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des matières enseignées cette semaine */}
      {emplois.length > 0 && (
        <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BookOpen size={24} className="text-blue-600" />
            Matières enseignées cette semaine
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from(new Set(emplois.map(e => JSON.stringify({ 
              nom: e.matiere.nom, 
              niveau: e.matiere.niveau.nom 
            }))))
              .map(str => JSON.parse(str))
              .map((matiere, index) => (
                <div 
                  key={index}
                  className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded"
                >
                  <p className="font-semibold text-gray-800">{matiere.nom}</p>
                  <p className="text-sm text-gray-600">{matiere.niveau}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {emplois.filter(e => e.matiere.nom === matiere.nom).length} séance(s)
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
