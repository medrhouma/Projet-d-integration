'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, BookOpen, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface EmploiTemps {
  id_emploi: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  matiere: {
    nom: string;
  };
  salle: {
    code: string;
    type: string;
  };
  enseignant: {
    utilisateur: {
      nom: string;
      prenom: string;
    };
  };
}

export default function EmploiTempsEtudiant() {
  const [emplois, setEmplois] = useState<EmploiTemps[]>([]);
  const [loading, setLoading] = useState(true);

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const heuresJournee = [
    '08:30', '10:00', '11:30', '13:00', '14:00', '15:30'
  ];

  useEffect(() => {
    loadEmploi();
  }, []);

  const loadEmploi = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('userData');
      if (!userData) return;

      const user = JSON.parse(userData);
      
      // Récupérer les infos de l'étudiant
      const resEtudiant = await fetch(`/api/etudiants/${user.id_etudiant}`);
      if (resEtudiant.ok) {
        const etudiant = await resEtudiant.json();
        if (etudiant.groupe?.id_groupe) {
          // Récupérer l'emploi du temps du groupe
          const resEmploi = await fetch(`/api/emploi-temps/public?groupeId=${etudiant.groupe.id_groupe}`);
          if (resEmploi.ok) {
            const data = await resEmploi.json();
            setEmplois(data);
          }
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Obtenir le jour de la semaine d'une date (0 = Dimanche, 1 = Lundi, etc.)
  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDay();
    // Convertir pour que Lundi = 0, Mardi = 1, ..., Samedi = 5, Dimanche = 6
    return day === 0 ? 6 : day - 1;
  };

  const getEmploisForDayAndTime = (jourIndex: number, heure: string) => {
    return emplois.filter(emploi => {
      const dayOfWeek = getDayOfWeek(emploi.date);
      if (dayOfWeek !== jourIndex) return false;
      
      const emploiHeure = emploi.heure_debut.substring(11, 16);
      return emploiHeure === heure;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Chargement de votre emploi du temps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard-etudiant"
                className="p-2 hover:bg-white/10 rounded-xl transition-all backdrop-blur-lg border border-white/10"
              >
                <ArrowLeft className="w-6 h-6 text-gray-300" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-blue-400" />
                  Mon Emploi du Temps
                </h1>
                <p className="text-gray-400 mt-1">Emploi du temps hebdomadaire</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grille emploi du temps */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600/40 to-purple-600/40 backdrop-blur-lg">
                  <th className="border border-white/20 p-4 text-white font-semibold sticky left-0 bg-blue-600/50 backdrop-blur-xl z-10 w-24">
                    <Clock className="w-6 h-6 mx-auto" />
                  </th>
                  {jours.map((jour, index) => {
                    const isToday = new Date().getDay() === (index + 1) || (index === 6 && new Date().getDay() === 0);
                    return (
                      <th 
                        key={index}
                        className={`border border-white/20 p-4 min-w-[160px] ${
                          isToday ? 'bg-yellow-500/40' : ''
                        }`}
                      >
                        <div className="text-white font-bold text-base">{jour}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {heuresJournee.map((heure, heureIndex) => (
                  <tr key={heureIndex} className="hover:bg-white/5 transition-colors">
                    <td className="border border-white/10 p-3 text-center sticky left-0 bg-gray-900/50 backdrop-blur-xl z-10">
                      <div className="text-blue-300 font-bold text-sm">{heure}</div>
                    </td>
                    {jours.map((_, jourIndex) => {
                      const seances = getEmploisForDayAndTime(jourIndex, heure);
                      return (
                        <td 
                          key={jourIndex}
                          className={`border border-white/10 p-2 align-top ${
                            seances.length > 0 ? 'bg-blue-500/10' : ''
                          }`}
                        >
                          {seances.map((seance) => (
                            <div
                              key={seance.id_emploi}
                              className="bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-lg border border-blue-400/30 rounded-xl p-3 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                              {/* Matière */}
                              <div className="flex items-start gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-blue-300 flex-shrink-0 mt-0.5" />
                                <div className="text-white font-bold text-sm leading-tight">
                                  {seance.matiere.nom}
                                </div>
                              </div>

                              {/* Horaire */}
                              <div className="flex items-center gap-1 text-xs text-blue-200 mb-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {seance.heure_debut.substring(11, 16)} - {seance.heure_fin.substring(11, 16)}
                                </span>
                              </div>

                              {/* Salle */}
                              <div className="flex items-center gap-1 text-xs text-cyan-200 mb-1">
                                <MapPin className="w-3 h-3" />
                                <span>{seance.salle.code} ({seance.salle.type})</span>
                              </div>

                              {/* Enseignant */}
                              <div className="flex items-center gap-1 text-xs text-purple-200">
                                <User className="w-3 h-3" />
                                <span className="truncate">
                                  {seance.enseignant.utilisateur.nom} {seance.enseignant.utilisateur.prenom}
                                </span>
                              </div>
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
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 hover:scale-105 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/30 backdrop-blur-lg border border-blue-400/30 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Cours cette semaine</p>
                <p className="text-2xl font-bold text-white">{emplois.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 hover:scale-105 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-cyan-500/30 backdrop-blur-lg border border-cyan-400/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-cyan-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Heures de cours</p>
                <p className="text-2xl font-bold text-white">
                  {emplois.reduce((acc, e) => {
                    const debut = new Date(e.heure_debut);
                    const fin = new Date(e.heure_fin);
                    return acc + (fin.getTime() - debut.getTime()) / (1000 * 60 * 60);
                  }, 0).toFixed(1)}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-5 hover:scale-105 transition-all">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500/30 backdrop-blur-lg border border-purple-400/30 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-gray-400">Salles différentes</p>
                <p className="text-2xl font-bold text-white">
                  {new Set(emplois.map(e => e.salle.code)).size}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
