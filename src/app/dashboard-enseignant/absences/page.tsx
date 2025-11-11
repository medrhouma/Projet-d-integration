'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, BookOpen, MapPin, FileText, ChevronRight, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Seance {
  id_emploi: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  matiere: {
    nom: string;
  };
  salle: {
    code: string;
  };
  groupe: {
    nom: string;
  };
}

export default function AbsencesEnseignantPage() {
  const router = useRouter();
  const [seances, setSeances] = useState<Seance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    chargerSeances();
  }, []);

  const chargerSeances = async () => {
    try {
      setLoading(true);
      
      // Récupérer les données utilisateur
      const userDataStr = localStorage.getItem('userData');
      if (!userDataStr) {
        setError('Utilisateur non connecté');
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userDataStr);
      const enseignantId = userData.id_enseignant || userData.enseignant?.id_enseignant;

      if (!enseignantId) {
        setError('Données enseignant non trouvées');
        setLoading(false);
        return;
      }

      // Récupérer l'emploi du temps de l'enseignant
      const res = await fetch(`/api/emploi-temps/public?enseignantId=${enseignantId}`);
      const data = await res.json();

      if (res.ok) {
        // Filtrer les séances d'aujourd'hui et à venir
        const aujourdhui = new Date();
        aujourdhui.setHours(0, 0, 0, 0);

        const seancesFiltrees = (Array.isArray(data) ? data : []).filter((seance: Seance) => {
          const dateSeance = new Date(seance.date);
          dateSeance.setHours(0, 0, 0, 0);
          return dateSeance >= aujourdhui;
        });

        setSeances(seancesFiltrees);
      } else {
        setError('Erreur lors du chargement des séances');
      }
    } catch (err) {
      console.error(err);
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  const allerPrendreAbsences = (id_emploi: number) => {
    router.push(`/dashboard-enseignant/absences/prendre?id_emploi=${id_emploi}`);
  };

  if (loading) {
    return <LoadingSpinner message="Chargement des séances..." color="green" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => router.push('/dashboard-enseignant')}
          className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-xl text-white font-semibold transition-all flex items-center gap-2 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au Dashboard
        </button>

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-xl shadow-lg animate-pulse">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Gestion des Absences
              </h1>
              <p className="text-gray-300 mt-1">
                Sélectionnez une séance pour prendre les absences
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/30 text-red-100 px-6 py-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Liste des séances */}
        {seances.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-12 text-center">
            <div className="w-24 h-24 bg-green-500/20 backdrop-blur-lg border border-green-400/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Aucune séance disponible
            </h3>
            <p className="text-gray-300">
              Vous n'avez pas de cours programmés pour le moment
            </p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6">
              <h2 className="text-xl font-bold text-white">
                Mes Séances ({seances.length})
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Cliquez sur une séance pour prendre les absences
              </p>
            </div>

            <div className="divide-y divide-white/10">
              {seances.map((seance) => {
                const dateSeance = new Date(seance.date);
                const estAujourdhui = dateSeance.toDateString() === new Date().toDateString();
                const estDemain = new Date(dateSeance).getDate() === new Date(new Date().setDate(new Date().getDate() + 1)).getDate();

                return (
                  <div
                    key={seance.id_emploi}
                    onClick={() => allerPrendreAbsences(seance.id_emploi)}
                    className="p-6 hover:bg-white/10 transition-all cursor-pointer group backdrop-blur-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <BookOpen className="w-6 h-6 text-green-400" />
                          <h3 className="text-xl font-bold text-white group-hover:text-green-400 transition-colors">
                            {seance.matiere.nom}
                          </h3>
                          {estAujourdhui && (
                            <span className="px-3 py-1 bg-green-500/30 backdrop-blur-lg border border-green-400/30 text-green-100 rounded-full text-xs font-semibold">
                              Aujourd'hui
                            </span>
                          )}
                          {estDemain && (
                            <span className="px-3 py-1 bg-blue-500/30 backdrop-blur-lg border border-blue-400/30 text-blue-100 rounded-full text-xs font-semibold">
                              Demain
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ml-9">
                          <div className="flex items-center gap-2 text-gray-300">
                            <Calendar className="w-4 h-4 text-green-400" />
                            <span className="text-sm">
                              {dateSeance.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-300">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-sm">
                              {seance.heure_debut} - {seance.heure_fin}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-300">
                            <MapPin className="w-4 h-4 text-purple-400" />
                            <span className="text-sm">{seance.salle.code}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-300">
                            <Users className="w-4 h-4 text-orange-400" />
                            <span className="text-sm">{seance.groupe.nom}</span>
                          </div>
                        </div>
                      </div>

                      <button className="px-6 py-3 bg-green-500/30 hover:bg-green-500/50 backdrop-blur-lg border border-green-400/30 text-white rounded-xl font-semibold transition-all flex items-center gap-2 group-hover:shadow-lg hover:scale-105">
                        Prendre absences
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-blue-500/20 backdrop-blur-lg border border-blue-400/30 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-blue-100 mb-2">
                💡 Comment prendre les absences ?
              </h3>
              <ul className="text-blue-200 space-y-1 text-sm">
                <li>• Cliquez sur une séance pour accéder à la feuille de présence</li>
                <li>• Marquez les étudiants absents en un clic</li>
                <li>• Les absences sont enregistrées automatiquement</li>
                <li>• Les étudiants peuvent consulter leurs absences dans leur dashboard</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
