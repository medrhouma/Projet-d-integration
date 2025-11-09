'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Etudiant {
  id_etudiant: number;
  nom: string;
  prenom: string;
  numero_inscription: string;
  absent: boolean;
  absence: {
    id_absence: number;
    statut: string;
    motif: string | null;
  } | null;
}

interface Emploi {
  id_emploi: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
}

export default function PrendreAbsencesPage() {
  const searchParams = useSearchParams();
  const id_emploi = searchParams.get('id_emploi');

  const [emploi, setEmploi] = useState<Emploi | null>(null);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Charger les données
  useEffect(() => {
    if (id_emploi) {
      chargerDonnees();
    }
  }, [id_emploi]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/absences/etudiants?id_emploi=${id_emploi}`);
      const data = await res.json();

      if (data.success) {
        setEmploi(data.emploi);
        setEtudiants(data.etudiants);
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Erreur lors du chargement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Marquer absent
  const marquerAbsent = async (id_etudiant: number) => {
    try {
      const res = await fetch('/api/absences/etudiants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_emploi: parseInt(id_emploi!),
          id_etudiant,
          statut: 'NonJustifiee'
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage('✅ Absence enregistrée');
        chargerDonnees(); // Recharger
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Erreur');
      console.error(error);
    }
  };

  // Marquer présent (annuler absence)
  const marquerPresent = async (id_absence: number) => {
    try {
      const res = await fetch(`/api/absences/etudiants?id_absence=${id_absence}`, {
        method: 'DELETE'
      });

      const data = await res.json();

      if (data.success) {
        setMessage('✅ Absence annulée');
        chargerDonnees(); // Recharger
      } else {
        setMessage('❌ ' + data.error);
      }
    } catch (error) {
      setMessage('❌ Erreur');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!emploi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
        <div className="max-w-2xl mx-auto bg-red-50 border-2 border-red-200 rounded-xl p-6">
          <p className="text-red-800 text-center font-semibold">❌ Séance non trouvée</p>
        </div>
      </div>
    );
  }

  const nbPresents = etudiants.filter(e => !e.absent).length;
  const nbAbsents = etudiants.filter(e => e.absent).length;
  const tauxPresence = etudiants.length > 0 
    ? ((nbPresents / etudiants.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-blue-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Feuille de Présence</h1>
              <p className="text-gray-600 mt-1">Enregistrement des absences</p>
            </div>
          </div>

          {/* Infos séance */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 bg-blue-50 rounded-lg p-4">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-semibold">Date</p>
                <p className="text-gray-800">
                  {new Date(emploi.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-indigo-50 rounded-lg p-4">
              <Clock className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm text-indigo-600 font-semibold">Horaire</p>
                <p className="text-gray-800">
                  {emploi.heure_debut} - {emploi.heure_fin}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-green-50 rounded-lg p-4">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-semibold">Présence</p>
                <p className="text-gray-800 font-bold">{tauxPresence}%</p>
                <p className="text-xs text-gray-600">{nbPresents}/{etudiants.length} présents</p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.startsWith('✅') 
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message}
          </div>
        )}

        {/* Liste des étudiants */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6">
            <h2 className="text-xl font-bold text-white">
              Liste des Étudiants ({etudiants.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {etudiants.map((etudiant, index) => (
              <div
                key={etudiant.id_etudiant}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  etudiant.absent ? 'bg-red-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                      etudiant.absent 
                        ? 'bg-gradient-to-br from-red-500 to-pink-600'
                        : 'bg-gradient-to-br from-green-500 to-teal-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-lg">
                        {etudiant.nom} {etudiant.prenom}
                      </p>
                      <p className="text-sm text-gray-600">
                        📝 {etudiant.numero_inscription}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {etudiant.absent ? (
                      <>
                        <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold flex items-center gap-2">
                          <XCircle className="w-5 h-5" />
                          Absent
                        </span>
                        <button
                          onClick={() => marquerPresent(etudiant.absence!.id_absence)}
                          className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          Marquer Présent
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Présent
                        </span>
                        <button
                          onClick={() => marquerAbsent(etudiant.id_etudiant)}
                          className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                        >
                          Marquer Absent
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Présents</p>
                <p className="text-3xl font-bold text-green-600">{nbPresents}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Absents</p>
                <p className="text-3xl font-bold text-red-600">{nbAbsents}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Taux de Présence</p>
                <p className="text-3xl font-bold text-blue-600">{tauxPresence}%</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
