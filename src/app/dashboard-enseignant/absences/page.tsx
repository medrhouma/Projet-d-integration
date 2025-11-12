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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => router.push('/dashboard-enseignant')}
          className="mb-6 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour au Dashboard
        </button>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-green-100 rounded-lg">
              <FileText className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Gestion des Absences
              </h1>
              <p className="text-gray-600 mt-1">
                Sélectionnez une séance pour prendre les absences
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Liste des séances */}
        {seances.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-green-100 border border-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Aucune séance disponible
            </h3>
            <p className="text-gray-600">
              Vous n'avez pas de cours programmés pour le moment
            </p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            <div className="bg-green-600 p-6">
              <h2 className="text-xl font-bold text-white">
                Mes Séances ({seances.length})
              </h2>
              <p className="text-green-50 text-sm mt-1">
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
                    className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <BookOpen className="w-6 h-6 text-green-600" />
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                            {seance.matiere.nom}
                          </h3>
                          {estAujourdhui && (
                            <span className="px-3 py-1 bg-green-100 border border-green-200 text-green-700 rounded-full text-xs font-semibold">
                              Aujourd'hui
                            </span>
                          )}
                          {estDemain && (
                            <span className="px-3 py-1 bg-blue-100 border border-blue-200 text-blue-700 rounded-full text-xs font-semibold">
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
                            <Clock className="w-4 h-4 text-green-600" />
                            <span className="text-sm">
                              {seance.heure_debut} - {seance.heure_fin}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{seance.salle.code}</span>
                          </div>

                          <div className="flex items-center gap-2 text-gray-600">
                            <Users className="w-4 h-4 text-green-600" />
                            <span className="text-sm">{seance.groupe.nom}</span>
                          </div>
                        </div>
                      </div>

                      <button className="px-6 py-3 bg-green-600 hover:bg-green-700 border border-green-700 text-white rounded-lg font-semibold transition-colors flex items-center gap-2 shadow-sm">
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
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
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
