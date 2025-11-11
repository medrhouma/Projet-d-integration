'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, BookOpen } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Groupe {
  id_groupe: number;
  nom: string;
  niveau: {
    nom: string;
  };
}

interface Emploi {
  id_emploi: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  matiere: {
    nom: string;
  };
  enseignant?: {
    utilisateur: {
      nom: string;
      prenom: string;
    };
  };
  salle?: {
    code: string;
  };
}

export default function EmploiTempsAdminPage() {
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [emplois, setEmplois] = useState<Emploi[]>([]);
  const [selectedGroupe, setSelectedGroupe] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const heures = [
    { label: '08:30 - 10:00', start: 8.5, end: 10 },
    { label: '10:00 - 11:30', start: 10, end: 11.5 },
    { label: '11:30 - 13:00', start: 11.5, end: 13 },
    { label: 'PAUSE', start: 13, end: 14, isPause: true },
    { label: '14:00 - 15:30', start: 14, end: 15.5 },
    { label: '15:30 - 17:00', start: 15.5, end: 17 },
  ];

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  // Charger tous les groupes au démarrage
  useEffect(() => {
    fetch('/api/groupes')
      .then(res => res.json())
      .then(data => setGroupes(data))
      .catch(err => console.error('Erreur chargement groupes:', err))
      .finally(() => setLoading(false));
  }, []);

  // Charger les emplois quand un groupe est sélectionné
  useEffect(() => {
    if (selectedGroupe) {
      fetch(`/api/emploi-temps/public?groupeId=${selectedGroupe}`)
        .then(res => res.json())
        .then(data => setEmplois(data))
        .catch(err => console.error('Erreur chargement emplois:', err));
    } else {
      setEmplois([]);
    }
  }, [selectedGroupe]);

  const getEmploiForSlot = (dayIndex: number, slotStart: number, slotEnd: number) => {
    return emplois.find(emploi => {
      const emploiDate = new Date(emploi.date);
      const dayOfWeek = emploiDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      if (adjustedDay !== dayIndex) return false;
      
      const heureDebut = new Date(emploi.heure_debut);
      const emploiHeureDebut = heureDebut.getUTCHours() + heureDebut.getUTCMinutes() / 60;
      
      return emploiHeureDebut >= slotStart && emploiHeureDebut < slotEnd;
    });
  };

  if (loading) {
    return <LoadingSpinner color="purple" message="Chargement de l'emploi du temps..." />;
  }

  const selectedGroupeData = groupes.find(g => g.id_groupe === selectedGroupe);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      {/* En-tête avec animation */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-2xl shadow-2xl animate-pulse">
            <Calendar size={40} className="text-white" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3 animate-gradient">
          Emploi du Temps
        </h1>
        <p className="text-gray-300 text-lg">Consultation des emplois du temps par groupe</p>
        <div className="mt-4 h-1 w-32 mx-auto bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"></div>
      </div>

      {/* Sélecteur de groupe avec effet glassmorphism */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
          <label className="block text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Users size={24} className="text-purple-400" />
            Sélectionner un groupe
          </label>
          <select
            className="w-full bg-white/90 backdrop-blur-sm border-2 border-purple-300 rounded-2xl px-6 py-4 text-lg font-semibold text-gray-800 focus:ring-4 focus:ring-purple-500 focus:border-purple-500 transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
            value={selectedGroupe || ''}
            onChange={(e) => setSelectedGroupe(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">🎯 Choisir un groupe...</option>
            {groupes.map(groupe => (
              <option key={groupe.id_groupe} value={groupe.id_groupe}>
                📚 {groupe.nom} - {groupe.niveau?.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Emploi du temps */}
      {selectedGroupe ? (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* En-tête du tableau */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-8">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                      <BookOpen size={28} />
                    </div>
                    {selectedGroupeData?.nom}
                  </h2>
                  <p className="text-white/80 text-sm">Emploi du temps de la semaine</p>
                </div>
                {emplois.length > 0 && (
                  <div className="flex items-center gap-3 bg-white/20 px-6 py-3 rounded-2xl backdrop-blur-sm">
                    <div className="bg-white/30 p-2 rounded-lg">
                      <BookOpen size={20} />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{emplois.length}</div>
                      <div className="text-xs text-white/80">séance(s)</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tableau de l'emploi du temps */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-800 to-gray-900">
                    <th className="border border-gray-700 p-4 sticky left-0 bg-gray-900 z-10 min-w-[150px]">
                      <div className="flex items-center justify-center gap-2 text-purple-400">
                        <Clock size={24} />
                        <span className="font-bold">Horaires</span>
                      </div>
                    </th>
                    {jours.map((jour, i) => (
                      <th key={i} className="border border-gray-700 p-4 font-bold text-white min-w-[200px]">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                          {jour}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heures.map((heure, i) => (
                    <tr key={i} className={heure.isPause ? 'bg-orange-500/20' : 'hover:bg-white/5 transition-colors'}>
                      <td className={`border border-gray-700 p-4 text-center font-bold sticky left-0 z-10 ${
                        heure.isPause ? 'bg-orange-500/30 text-orange-200' : 'bg-gray-800/50 text-purple-300'
                      }`}>
                        <div className="flex items-center justify-center gap-2">
                          {!heure.isPause && <Clock size={16} />}
                          {heure.label}
                        </div>
                      </td>
                      {heure.isPause ? (
                        <td colSpan={6} className="border border-gray-700 p-6 text-center">
                          <div className="inline-flex items-center gap-3 bg-orange-500/30 px-8 py-4 rounded-2xl backdrop-blur-sm">
                            <span className="text-3xl">🍽️</span>
                            <span className="text-orange-200 font-bold text-lg">PAUSE DÉJEUNER</span>
                          </div>
                        </td>
                      ) : (
                        jours.map((_, dayIndex) => {
                          const emploi = getEmploiForSlot(dayIndex, heure.start, heure.end);
                          return (
                            <td key={dayIndex} className="border border-gray-700 p-2">
                              {emploi ? (
                                <div className="relative group">
                                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
                                  <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                                    <div className="font-bold text-sm mb-2 flex items-center gap-2">
                                      <div className="bg-white/20 p-1 rounded">
                                        <BookOpen size={14} />
                                      </div>
                                      <span className="line-clamp-1">{emploi.matiere.nom}</span>
                                    </div>
                                    {emploi.enseignant && (
                                      <div className="text-xs opacity-90 flex items-center gap-1 mb-1 bg-white/10 px-2 py-1 rounded">
                                        <Users size={12} />
                                        <span className="line-clamp-1">
                                          {emploi.enseignant.utilisateur.nom} {emploi.enseignant.utilisateur.prenom}
                                        </span>
                                      </div>
                                    )}
                                    {emploi.salle && (
                                      <div className="text-xs opacity-90 flex items-center gap-1 bg-white/10 px-2 py-1 rounded">
                                        <MapPin size={12} />
                                        <span>{emploi.salle.code}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-24 flex items-center justify-center text-gray-500 text-xs rounded-lg bg-gray-800/20 border border-dashed border-gray-700">
                                  <div className="text-center">
                                    <div className="text-2xl mb-1">✨</div>
                                    <div>Libre</div>
                                  </div>
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

            {/* Message si aucune séance */}
            {emplois.length === 0 && (
              <div className="p-12 text-center bg-gradient-to-br from-gray-800/50 to-gray-900/50">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-500/20 rounded-full mb-4">
                  <Calendar size={48} className="text-purple-400" />
                </div>
                <p className="text-gray-300 text-lg font-semibold">Aucune séance programmée pour ce groupe</p>
                <p className="text-gray-500 text-sm mt-2">L'emploi du temps est vide pour le moment</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-16 text-center border border-white/20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mb-6 animate-bounce">
              <Calendar size={48} className="text-white" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-3">Sélectionnez un groupe</h3>
            <p className="text-gray-300 text-lg">Choisissez un groupe dans la liste ci-dessus pour afficher son emploi du temps</p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
