'use client';

import { useState, useEffect } from 'react';
import { Calendar, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface Conflit {
  type: 'salle' | 'enseignant' | 'groupe';
  message: string;
  details: any;
}

export default function TestConflitsPage() {
  const [seances, setSeances] = useState<any[]>([]);
  const [conflits, setConflits] = useState<Conflit[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Charger les séances existantes
  useEffect(() => {
    fetch('/api/emploi-temps/public')
      .then(res => res.json())
      .then(data => setSeances(data))
      .catch(err => console.error('Erreur:', err));
  }, []);

  // Tester un conflit de salle
  const testerConflitSalle = async () => {
    if (seances.length === 0) {
      setMessage('❌ Aucune séance existante');
      return;
    }

    setLoading(true);
    setConflits([]);
    setMessage('');

    const premiere = seances[0];
    const testData = {
      date: premiere.date,
      heure_debut: premiere.heure_debut,
      heure_fin: premiere.heure_fin,
      id_matiere: premiere.id_matiere,
      id_salle: premiere.id_salle, // MÊME SALLE = conflit
      id_groupe: premiere.id_groupe === 1 ? 2 : 1, // Autre groupe
      id_enseignant: premiere.id_enseignant
    };

    try {
      const res = await fetch('/api/emploi-temps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const data = await res.json();

      if (res.status === 409) {
        setConflits(data.conflits);
        setMessage('✅ Conflit de salle détecté avec succès !');
      } else if (res.status === 201) {
        setMessage('❌ Erreur : Le conflit n\'a PAS été détecté (séance créée)');
      } else {
        setMessage(`⚠️ Erreur ${res.status}: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erreur lors du test');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Tester un conflit d'enseignant
  const testerConflitEnseignant = async () => {
    if (seances.length === 0) {
      setMessage('❌ Aucune séance existante');
      return;
    }

    setLoading(true);
    setConflits([]);
    setMessage('');

    const premiere = seances[0];
    const testData = {
      date: premiere.date,
      heure_debut: premiere.heure_debut,
      heure_fin: premiere.heure_fin,
      id_matiere: premiere.id_matiere,
      id_salle: premiere.id_salle === 1 ? 2 : 1, // Autre salle
      id_groupe: premiere.id_groupe === 1 ? 2 : 1, // Autre groupe
      id_enseignant: premiere.id_enseignant // MÊME ENSEIGNANT = conflit
    };

    try {
      const res = await fetch('/api/emploi-temps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const data = await res.json();

      if (res.status === 409) {
        setConflits(data.conflits);
        setMessage('✅ Conflit d\'enseignant détecté avec succès !');
      } else if (res.status === 201) {
        setMessage('❌ Erreur : Le conflit n\'a PAS été détecté (séance créée)');
      } else {
        setMessage(`⚠️ Erreur ${res.status}: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erreur lors du test');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Tester un conflit de groupe
  const testerConflitGroupe = async () => {
    if (seances.length === 0) {
      setMessage('❌ Aucune séance existante');
      return;
    }

    setLoading(true);
    setConflits([]);
    setMessage('');

    const premiere = seances[0];
    const testData = {
      date: premiere.date,
      heure_debut: premiere.heure_debut,
      heure_fin: premiere.heure_fin,
      id_matiere: premiere.id_matiere,
      id_salle: premiere.id_salle === 1 ? 2 : 1, // Autre salle
      id_groupe: premiere.id_groupe, // MÊME GROUPE = conflit
      id_enseignant: premiere.id_enseignant === 1 ? 2 : 1 // Autre enseignant
    };

    try {
      const res = await fetch('/api/emploi-temps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });

      const data = await res.json();

      if (res.status === 409) {
        setConflits(data.conflits);
        setMessage('✅ Conflit de groupe détecté avec succès !');
      } else if (res.status === 201) {
        setMessage('❌ Erreur : Le conflit n\'a PAS été détecté (séance créée)');
      } else {
        setMessage(`⚠️ Erreur ${res.status}: ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Erreur lors du test');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-indigo-100">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl shadow-lg">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Test de Détection de Conflits
              </h1>
              <p className="text-gray-600 mt-1">
                Vérifiez que le système empêche les chevauchements
              </p>
            </div>
          </div>

          {/* Informations */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Séances disponibles : {seances.length}</p>
                {seances.length > 0 && (
                  <p className="text-blue-700">
                    Référence : {new Date(seances[0].date).toLocaleDateString()} à{' '}
                    {new Date(seances[0].heure_debut).toLocaleTimeString('fr-FR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Boutons de test */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={testerConflitSalle}
              disabled={loading || seances.length === 0}
              className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🏢 Test Conflit Salle
            </button>

            <button
              onClick={testerConflitEnseignant}
              disabled={loading || seances.length === 0}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              👨‍🏫 Test Conflit Prof
            </button>

            <button
              onClick={testerConflitGroupe}
              disabled={loading || seances.length === 0}
              className="bg-gradient-to-r from-green-500 to-teal-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              👥 Test Conflit Groupe
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg mb-6 ${
              message.startsWith('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : message.startsWith('❌')
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            }`}>
              <p className="font-semibold">{message}</p>
            </div>
          )}

          {/* Affichage des conflits */}
          {conflits.length > 0 && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold text-red-800">
                  {conflits.length} Conflit{conflits.length > 1 ? 's' : ''} Détecté{conflits.length > 1 ? 's' : ''}
                </h2>
              </div>

              <div className="space-y-3">
                {conflits.map((conflit, index) => (
                  <div
                    key={index}
                    className="bg-white border border-red-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        conflit.type === 'salle'
                          ? 'bg-red-100 text-red-600'
                          : conflit.type === 'enseignant'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-green-100 text-green-600'
                      }`}>
                        {conflit.type === 'salle' ? '🏢' : conflit.type === 'enseignant' ? '👨‍🏫' : '👥'}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800 capitalize">
                          Conflit de {conflit.type}
                        </p>
                        <p className="text-gray-700 mt-1">{conflit.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* État de chargement */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-gray-600 mt-4">Test en cours...</p>
            </div>
          )}

          {/* Séances de référence */}
          {seances.length > 0 && !loading && (
            <div className="mt-8 border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                📋 Séance de référence utilisée pour les tests
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">Date :</span>
                    <span className="ml-2 font-semibold">
                      {new Date(seances[0].date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Horaire :</span>
                    <span className="ml-2 font-semibold">
                      {new Date(seances[0].heure_debut).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {new Date(seances[0].heure_fin).toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Salle :</span>
                    <span className="ml-2 font-semibold">{seances[0].salle.code}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Groupe :</span>
                    <span className="ml-2 font-semibold">{seances[0].groupe.nom}</span>
                  </div>
                  {seances[0].enseignant && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Enseignant :</span>
                      <span className="ml-2 font-semibold">
                        {seances[0].enseignant.utilisateur.nom} {seances[0].enseignant.utilisateur.prenom}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
