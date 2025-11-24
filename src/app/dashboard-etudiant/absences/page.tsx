'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, BookOpen, User, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface Absence {
  id_absence: number;
  motif: string | null;
  statut: string;
  emploi_temps: {
    date: string;
    heure_debut: string;
    heure_fin: string;
    matiere: {
      nom: string;
    };
    salle: {
      code: string;
    };
    enseignant: {
      utilisateur: {
        nom: string;
        prenom: string;
      };
    };
  };
}

export default function MesAbsencesPage() {
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    chargerAbsences();
  }, []);

  const chargerAbsences = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/absences/etudiants');
      const data = await res.json();

      if (data.success) {
        setAbsences(data.absences);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const nbTotal = absences.length;
  const nbJustifiees = absences.filter(a => a.statut === 'Justifiee').length;
  const nbNonJustifiees = absences.filter(a => a.statut === 'NonJustifiee').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 border border-purple-100">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Mes Absences</h1>
              <p className="text-gray-600 mt-1">
                Historique complet de vos absences
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Total Absences</p>
                <p className="text-3xl font-bold text-purple-600">{nbTotal}</p>
              </div>
              <AlertTriangle className="w-12 h-12 text-purple-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Justifiées</p>
                <p className="text-3xl font-bold text-green-600">{nbJustifiees}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Non Justifiées</p>
                <p className="text-3xl font-bold text-red-600">{nbNonJustifiees}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-500 opacity-20" />
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800">
            {message}
          </div>
        )}

        {/* Liste des absences */}
        {absences.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center border border-purple-100">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              🎉 Félicitations !
            </h3>
            <p className="text-gray-600 text-lg">
              Vous n'avez aucune absence enregistrée
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">
            <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6">
              <h2 className="text-xl font-bold text-white">
                Historique des Absences ({absences.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {absences.map((absence) => (
                <div
                  key={absence.id_absence}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    absence.statut === 'NonJustifiee' ? 'bg-red-50' : 'bg-green-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Date et heure */}
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-5 h-5 text-purple-600" />
                          <span className="font-semibold text-gray-800">
                            {new Date(absence.emploi_temps.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-indigo-600" />
                          <span className="text-gray-700">
                            {absence.emploi_temps.heure_debut} - {absence.emploi_temps.heure_fin}
                          </span>
                        </div>
                      </div>

                      {/* Infos cours */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="text-xs text-gray-600">Matière</p>
                            <p className="font-semibold text-gray-800">
                              {absence.emploi_temps.matiere.nom}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="text-xs text-gray-600">Salle</p>
                            <p className="font-semibold text-gray-800">
                              {absence.emploi_temps.salle.code}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <User className="w-5 h-5 text-orange-600" />
                          <div>
                            <p className="text-xs text-gray-600">Enseignant</p>
                            <p className="font-semibold text-gray-800">
                              {absence.emploi_temps.enseignant.utilisateur.nom}{' '}
                              {absence.emploi_temps.enseignant.utilisateur.prenom}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Motif */}
                      {absence.motif && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <strong>Motif :</strong> {absence.motif}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Statut */}
                    <div>
                      <span className={`px-4 py-2 rounded-lg font-semibold inline-flex items-center gap-2 ${
                        absence.statut === 'Justifiee'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {absence.statut === 'Justifiee' ? (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            Justifiée
                          </>
                        ) : (
                          <>
                            <XCircle className="w-5 h-5" />
                            Non Justifiée
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Avertissement */}
        {nbNonJustifiees > 0 && (
          <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-bold text-orange-800 mb-2">
                  ⚠️ Attention !
                </h3>
                <p className="text-orange-700">
                  Vous avez <strong>{nbNonJustifiees}</strong> absence{nbNonJustifiees > 1 ? 's' : ''} non justifiée{nbNonJustifiees > 1 ? 's' : ''}.
                  Veuillez fournir un justificatif à votre chef de département dans les plus brefs délais.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
