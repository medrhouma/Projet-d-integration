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
    { heure: '08:30', type: 'cours' },  // Séance 1: 08:30 - 10:00
    { heure: '10:15', type: 'cours' },  // Séance 2: 10:15 - 11:45
    { heure: '11:50', type: 'cours' },  // Séance 3: 11:50 - 13:20
    { heure: '13:20', type: 'pause' },  // Pause déjeuner
    { heure: '14:30', type: 'cours' },  // Séance 4: 14:30 - 16:00
    { heure: '16:15', type: 'cours' }   // Séance 5: 16:15 - 17:45
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
            console.log('📅 Emplois récupérés:', data);
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
      
      // Extraire l'heure de début (format peut être "HH:MM:SS" ou "YYYY-MM-DDTHH:MM:SS")
      let emploiHeure = '';
      if (emploi.heure_debut.includes('T')) {
        // Format ISO complet
        emploiHeure = emploi.heure_debut.substring(11, 16); // HH:MM
      } else if (emploi.heure_debut.includes(':')) {
        // Format TIME simple (HH:MM:SS)
        emploiHeure = emploi.heure_debut.substring(0, 5); // HH:MM
      }
      
      // Correspondance exacte HH:MM
      return emploiHeure === heure;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement de votre emploi du temps...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard-etudiant"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="w-7 h-7 text-blue-600" />
                Mon Emploi du Temps
              </h1>
              <p className="text-gray-600 text-sm mt-1">Emploi du temps hebdomadaire</p>
            </div>
          </div>
        </div>

        {/* Grille emploi du temps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-blue-600">
                  <th className="border border-gray-200 p-4 text-white font-semibold sticky left-0 bg-blue-600 z-10 w-24">
                    <Clock className="w-5 h-5 mx-auto" />
                  </th>
                  {jours.map((jour, index) => {
                    const isToday = new Date().getDay() === (index + 1) || (index === 6 && new Date().getDay() === 0);
                    return (
                      <th 
                        key={index}
                        className={`border border-gray-200 p-4 min-w-[160px] ${
                          isToday ? 'bg-blue-700' : ''
                        }`}
                      >
                        <div className="text-white font-semibold text-sm">{jour}</div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {heuresJournee.map((creneau, heureIndex) => {
                  // Si c'est la pause déjeuner, afficher une ligne spéciale
                  if (creneau.type === 'pause') {
                    return (
                      <tr key={heureIndex} className="bg-amber-50">
                        <td className="border border-gray-200 p-3 text-center sticky left-0 bg-amber-100 z-10">
                          <div className="text-amber-800 font-semibold text-sm flex items-center justify-center gap-2">
                            <span>🍽️</span>
                            <span>{creneau.heure}</span>
                          </div>
                        </td>
                        <td colSpan={6} className="border border-gray-200 p-4">
                          <div className="text-center text-amber-700 font-medium">
                            <div className="text-lg mb-1">Pause Déjeuner</div>
                            <div className="text-sm text-amber-600">13:20 - 14:30</div>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                  
                  // Ligne normale de cours
                  return (
                    <tr key={heureIndex} className="hover:bg-gray-50 transition-colors">
                      <td className="border border-gray-200 p-3 text-center sticky left-0 bg-gray-50 z-10">
                        <div className="text-gray-900 font-semibold text-sm">{creneau.heure}</div>
                      </td>
                      {jours.map((_, jourIndex) => {
                        const seances = getEmploisForDayAndTime(jourIndex, creneau.heure);
                        return (
                          <td 
                            key={jourIndex}
                            className={`border border-gray-200 p-2 align-top ${
                              seances.length > 0 ? 'bg-blue-50/50' : 'bg-white'
                            }`}
                          >
                          {seances.map((seance) => (
                            <div
                              key={seance.id_emploi}
                              className="bg-white border-l-4 border-blue-500 rounded-lg p-3 shadow-sm hover:shadow-md transition-all"
                            >
                              {/* Matière */}
                              <div className="flex items-start gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div className="text-gray-900 font-semibold text-sm leading-tight">
                                  {seance.matiere.nom}
                                </div>
                              </div>

                              {/* Horaire */}
                              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {seance.heure_debut.includes('T') 
                                    ? seance.heure_debut.substring(11, 16) 
                                    : seance.heure_debut.substring(0, 5)} - {seance.heure_fin.includes('T')
                                    ? seance.heure_fin.substring(11, 16)
                                    : seance.heure_fin.substring(0, 5)}
                                </span>
                              </div>

                              {/* Salle */}
                              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                                <MapPin className="w-3 h-3" />
                                <span>{seance.salle.code} ({seance.salle.type})</span>
                              </div>

                              {/* Enseignant */}
                              <div className="flex items-center gap-1 text-xs text-gray-600">
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Cours cette semaine</p>
                <p className="text-2xl font-bold text-gray-900">{emplois.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Heures de cours</p>
                <p className="text-2xl font-bold text-gray-900">
                  {emplois.reduce((acc, e) => {
                    const debut = new Date(e.heure_debut);
                    const fin = new Date(e.heure_fin);
                    return acc + (fin.getTime() - debut.getTime()) / (1000 * 60 * 60);
                  }, 0).toFixed(1)}h
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Salles différentes</p>
                <p className="text-2xl font-bold text-gray-900">
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
