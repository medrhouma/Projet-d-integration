'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, BookOpen, MapPin, FileText, ChevronRight } from 'lucide-react';

interface Seance {
  id_emploi: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  matiere: {
    nom_matiere: string;
  };
  salle: {
    nom_salle: string;
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
      
      // Récupérer l'emploi du temps de l'enseignant
      const res = await fetch('/api/emploi-temps');
      const data = await res.json();

      if (res.ok && data.emplois) {
        // Filtrer les séances d'aujourd'hui et à venir
        const aujourdhui = new Date();
        aujourdhui.setHours(0, 0, 0, 0);

        const seancesFiltrees = data.emplois.filter((seance: Seance) => {
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des séances...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-green-100">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl shadow-lg">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Gestion des Absences</h1>
              <p className="text-gray-600 mt-1">
                Sélectionnez une séance pour prendre les absences
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Liste des séances */}
        {seances.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-green-100">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Aucune séance disponible
            </h3>
            <p className="text-gray-600">
              Vous n'avez pas de cours programmés pour le moment
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-green-100">
            <div className="bg-gradient-to-r from-green-500 to-teal-600 p-6">
              <h2 className="text-xl font-bold text-white">
                Mes Séances ({seances.length})
              </h2>
              <p className="text-green-100 text-sm mt-1">
                Cliquez sur une séance pour prendre les absences
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {seances.map((seance) => {
                const dateSeance = new Date(seance.date);
                const estAujourdhui = dateSeance.toDateString() === new Date().toDateString();
                const estDemain = new Date(dateSeance).getDate() === new Date(new Date().setDate(new Date().getDate() + 1)).getDate();

                return (
                  <div
                    key={seance.id_emploi}
                    onClick={() => allerPrendreAbsences(seance.id_emploi)}
                    className="p-6 hover:bg-green-50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <BookOpen className="w-6 h-6 text-green-600" />
                          <h3 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                            {seance.matiere.nom_matiere}
                          </h3>
                          {estAujourdhui && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              Aujourd'hui
                            </span>
                          )}
                          {estDemain && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              Demain
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 ml-9">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="text-sm">
                              {dateSeance.toLocaleDateString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long'
                              })}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-blue-600" />
                            <span className="text-sm">
                              {seance.heure_debut} - {seance.heure_fin}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-purple-600" />
                            <span className="text-sm">{seance.salle.nom_salle}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4 text-orange-600" />
                            <span className="text-sm">{seance.groupe.nom}</span>
                          </div>
                        </div>
                      </div>

                      <button className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-all flex items-center gap-2 group-hover:shadow-lg">
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
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">
                💡 Comment prendre les absences ?
              </h3>
              <ul className="text-blue-800 space-y-1 text-sm">
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
