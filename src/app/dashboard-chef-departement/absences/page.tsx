'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Calendar, Users, TrendingUp, Search, FileText } from 'lucide-react';

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

  useEffect(() => {
    fetchAbsencesData();
  }, []);

  useEffect(() => {
    filterAbsences();
  }, [searchTerm, filterType, absences]);

  const fetchAbsencesData = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }

      const userData = await response.json();
      
      if (!userData.success) {
        router.push('/login');
        return;
      }

      const deptId = userData.user.id_departement || userData.user.enseignant?.id_departement;

      if (!deptId) {
        setError('Département non trouvé');
        return;
      }

      // For now, we'll create mock data since the absence API might not be implemented
      // TODO: Replace with actual API call when available
      const mockStats: AbsenceStats = {
        total_absences: 156,
        absences_ce_mois: 42,
        taux_absenteisme: 8.5,
        absences_par_matiere: [
          { id_matiere: 1, nom_matiere: 'Mathématiques', nombre_absences: 28 },
          { id_matiere: 2, nom_matiere: 'Physique', nombre_absences: 24 },
          { id_matiere: 3, nom_matiere: 'Informatique', nombre_absences: 19 },
        ],
      };

      const mockAbsences: Absence[] = [
        {
          id_absence: 1,
          date_absence: new Date().toISOString(),
          justifiee: false,
          motif: null,
          etudiant: {
            nom: 'Benali',
            prenom: 'Ahmed',
            matricule: 'E2023001',
            groupe: { nom: 'G1' },
          },
          matiere: {
            nom: 'Mathématiques',
            code: 'MATH101',
          },
        },
      ];

      setStats(mockStats);
      setAbsences(mockAbsences);
      setFilteredAbsences(mockAbsences);
    } catch (err) {
      setError('Erreur de connexion au serveur');
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
            <p>Aucune absence trouvée</p>
            <p className="text-sm text-gray-400 mt-1">Cette fonctionnalité sera bientôt disponible</p>
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
                      {new Date(absence.date_absence).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {absence.etudiant.nom} {absence.etudiant.prenom}
                      </div>
                      <div className="text-xs text-gray-500">{absence.etudiant.matricule}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {absence.etudiant.groupe.nom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{absence.matiere.nom}</div>
                      <div className="text-xs text-gray-500">{absence.matiere.code}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {absence.justifiee ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Justifiée
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Non justifiée
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {absence.motif || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
