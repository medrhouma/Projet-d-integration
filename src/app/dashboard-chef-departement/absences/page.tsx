'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Calendar, Users, TrendingUp, Search, FileText } from 'lucide-react';
// ...existing code...

// API call to justify a student absence
async function justifyStudentAbsence(id_absence: number, motif: string) {
  const res = await fetch('/api/absences/etudiants', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_absence, statut: 'Justifiee', motif })
  });
  return res.json();
}

interface AbsenceStats {
  total_absences: number;
  absences_ce_mois: number;
  taux_absenteisme: number;
  absences_par_matiere: {
    id_matiere: number;
    nom_matiere: string;
    nombre_absences: number;
  }[];
}

interface Absence {
  id_absence: number;
  date_absence: string;
  justifiee: boolean;
  motif: string | null;
  etudiant: {
    nom: string;
    prenom: string;
    matricule: string;
    groupe: {
      nom: string;
    };
  };
  matiere: {
    nom: string;
    code: string;
  };
}

export default function AbsencesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AbsenceStats | null>(null);
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [filteredAbsences, setFilteredAbsences] = useState<Absence[]>([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'justifiee' | 'non-justifiee'>('all');
  // For justification modal
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [justifyMotif, setJustifyMotif] = useState('');
  const [justifyAbsenceId, setJustifyAbsenceId] = useState<number | null>(null);
  const [justifyLoading, setJustifyLoading] = useState(false);
  const [justifyError, setJustifyError] = useState('');
  // Open modal for justification
  const openJustifyModal = (absence: Absence) => {
    setJustifyAbsenceId(absence.id_absence);
    setJustifyMotif(absence.motif || '');
    setShowJustifyModal(true);
    setJustifyError('');
  };

  // Handle justification submit
  const handleJustifySubmit = async () => {
    if (!justifyAbsenceId || !justifyMotif.trim()) {
      setJustifyError('Veuillez saisir un motif de justification.');
      return;
    }
    setJustifyLoading(true);
    setJustifyError('');
    try {
      const result = await justifyStudentAbsence(justifyAbsenceId, justifyMotif);
      if (result.success) {
        setShowJustifyModal(false);
        setJustifyAbsenceId(null);
        setJustifyMotif('');
        // Refresh absences
        fetchAbsencesData();
      } else {
        setJustifyError(result.error || 'Erreur lors de la justification');
      }
    } catch (e) {
      setJustifyError('Erreur de connexion au serveur');
    } finally {
      setJustifyLoading(false);
    }
  };

  useEffect(() => {
    fetchAbsencesData();
  }, []);

  useEffect(() => {
    filterAbsences();
  }, [searchTerm, filterType, absences]);

  const fetchAbsencesData = async () => {
    try {
      // Appel à l'API backend pour récupérer les absences des étudiants du département
      const response = await fetch('/api/absences/etudiants?all=1');
      if (!response.ok) {
        setError("Erreur lors de la récupération des absences");
        setAbsences([]);
        setFilteredAbsences([]);
        return;
      }
      const data = await response.json();
      // DEBUG: Afficher les données brutes dans la console
      console.log('DEBUG absences backend:', data);
      if (!data.success) {
        setError(data.error || "Erreur lors de la récupération des absences");
        setAbsences([]);
        setFilteredAbsences([]);
        return;
      }
      // data.absences doit être un tableau d'absences avec les champs nécessaires
      setAbsences(data.absences || []);
      setFilteredAbsences(data.absences || []);
      // Si le backend fournit des stats, les utiliser
      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      setAbsences([]);
      setFilteredAbsences([]);
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterAbsences = () => {
    let filtered = absences;

    if (searchTerm) {
      filtered = filtered.filter(
        (a) =>
          a.etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.etudiant.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
          a.matiere.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType === 'justifiee') {
      filtered = filtered.filter((a) => a.justifiee);
    } else if (filterType === 'non-justifiee') {
      filtered = filtered.filter((a) => !a.justifiee);
    }

    setFilteredAbsences(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Bouton retour dashboard */}
      <div className="mb-4">
        <button
          onClick={() => router.push('/dashboard-chef-departement')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold shadow"
        >
          &#8592; Retour au Dashboard
        </button>
      </div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Absences</h1>
        </div>
        <p className="text-gray-600">Suivi et analyse des absences des étudiants du département</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Total Absences</p>
              <AlertTriangle className="w-8 h-8 text-red-200" />
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.total_absences}</p>
            <p className="text-xs text-gray-500 mt-2">Toutes périodes confondues</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Ce Mois</p>
              <Calendar className="w-8 h-8 text-orange-200" />
            </div>
            <p className="text-3xl font-bold text-orange-600">{stats.absences_ce_mois}</p>
            <p className="text-xs text-gray-500 mt-2">Absences en {new Date().toLocaleDateString('fr-FR', { month: 'long' })}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Taux d'Absentéisme</p>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
            <p className="text-3xl font-bold text-blue-600">{stats.taux_absenteisme}%</p>
            <p className="text-xs text-gray-500 mt-2">Moyenne du département</p>
          </div>
        </div>
      )}

      {/* Top Absences by Matiere */}
      {stats && stats.absences_par_matiere.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Matières avec le plus d'absences</h2>
          <div className="space-y-3">
            {stats.absences_par_matiere.map((matiere) => (
              <div key={matiere.id_matiere} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-900">{matiere.nom_matiere}</span>
                </div>
                <span className="text-lg font-bold text-red-600">{matiere.nombre_absences}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, matricule ou matière..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilterType('justifiee')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                filterType === 'justifiee'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Justifiées
            </button>
            <button
              onClick={() => setFilterType('non-justifiee')}
              className={`flex-1 px-4 py-2 rounded-lg transition-colors ${
                filterType === 'non-justifiee'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Non justifiées
            </button>
          </div>
        </div>
      </div>

      {/* Absences List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Liste des Absences Récentes</h2>
          <p className="text-sm text-gray-600 mt-1">
            {filteredAbsences.length} absence(s) trouvée(s)
          </p>
        </div>
        
        {filteredAbsences.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <AlertTriangle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>Aucune absence d'étudiant trouvée.</p>
            <p className="text-sm text-gray-400 mt-1">Vérifiez que des absences existent bien côté base de données et que le backend retourne la bonne structure.</p>
            <pre className="text-xs text-left bg-gray-100 p-2 mt-4 rounded max-h-40 overflow-auto">
              {JSON.stringify(absences, null, 2)}
            </pre>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Étudiant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Groupe
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matière
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motif
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAbsences.map((absence) => (
                  <tr key={absence.id_absence} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {absence.date_absence ? new Date(absence.date_absence).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {absence.etudiant?.nom || '-'} {absence.etudiant?.prenom || ''}
                      </div>
                      <div className="text-xs text-gray-500">{absence.etudiant?.matricule || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {absence.etudiant?.groupe?.nom || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{absence.matiere?.nom || '-'}</div>
                      <div className="text-xs text-gray-500">{absence.matiere?.code || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {absence.justifiee ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Justifiée
                        </span>
                      ) : (
                        <>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                            Non justifiée
                          </span>
                          <button
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition"
                            onClick={() => openJustifyModal(absence)}
                          >
                            Justifier
                          </button>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {absence.motif || '-'}
                    </td>
                  </tr>
                ))}
                {/* Modal de justification d'absence étudiant */}
                {showJustifyModal && (
                  <tr>
                    <td colSpan={6} className="p-0">
                      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                          <h3 className="text-xl font-bold text-gray-800 mb-4">Justifier l'absence de l'étudiant</h3>
                          <textarea
                            value={justifyMotif}
                            onChange={e => setJustifyMotif(e.target.value)}
                            placeholder="Entrez le motif de justification..."
                            className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                          />
                          {justifyError && <div className="text-red-600 text-sm mb-2">{justifyError}</div>}
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => { setShowJustifyModal(false); setJustifyAbsenceId(null); setJustifyMotif(''); setJustifyError(''); }}
                              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                              disabled={justifyLoading}
                            >
                              Annuler
                            </button>
                            <button
                              onClick={handleJustifySubmit}
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                              disabled={justifyLoading}
                            >
                              {justifyLoading ? 'Enregistrement...' : 'Confirmer'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
