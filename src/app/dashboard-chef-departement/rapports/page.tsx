'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, TrendingUp, Users, BookOpen, Download, Calendar, BarChart3 } from 'lucide-react';

interface RapportStats {
  enseignants: {
    total: number;
    par_grade: { grade: string; count: number }[];
  };
  etudiants: {
    total: number;
    par_specialite: { specialite: string; count: number }[];
  };
  matieres: {
    total: number;
    par_niveau: { niveau: string; count: number }[];
  };
  performance: {
    taux_reussite_moyen: number;
    taux_presence_moyen: number;
  };
}

export default function RapportsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<RapportStats | null>(null);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'mois' | 'trimestre' | 'annee'>('mois');

  useEffect(() => {
    fetchRapportsData();
  }, [selectedPeriod]);

  const fetchRapportsData = async () => {
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

      // Mock data - Replace with actual API call
      const mockStats: RapportStats = {
        enseignants: {
          total: 42,
          par_grade: [
            { grade: 'Professeur', count: 12 },
            { grade: 'Maître de Conférences', count: 18 },
            { grade: 'Maître Assistant', count: 12 },
          ],
        },
        etudiants: {
          total: 485,
          par_specialite: [
            { specialite: 'Génie Informatique', count: 180 },
            { specialite: 'Réseaux et Télécommunications', count: 155 },
            { specialite: 'Systèmes Embarqués', count: 150 },
          ],
        },
        matieres: {
          total: 68,
          par_niveau: [
            { niveau: 'L1', count: 18 },
            { niveau: 'L2', count: 22 },
            { niveau: 'L3', count: 28 },
          ],
        },
        performance: {
          taux_reussite_moyen: 78.5,
          taux_presence_moyen: 91.2,
        },
      };

      setStats(mockStats);
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    alert('Exportation PDF en cours de développement...');
  };

  const handleExportExcel = () => {
    alert('Exportation Excel en cours de développement...');
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
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Rapports & Statistiques</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          </div>
        </div>
        <p className="text-gray-600">Analyse détaillée des données du département</p>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Période d'analyse</h2>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedPeriod('mois')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              selectedPeriod === 'mois'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ce mois
          </button>
          <button
            onClick={() => setSelectedPeriod('trimestre')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              selectedPeriod === 'trimestre'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Ce trimestre
          </button>
          <button
            onClick={() => setSelectedPeriod('annee')}
            className={`px-6 py-2 rounded-lg transition-colors ${
              selectedPeriod === 'annee'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Cette année
          </button>
        </div>
      </div>

      {stats && (
        <>
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Taux de Réussite Moyen</p>
                  <p className="text-4xl font-bold">{stats.performance.taux_reussite_moyen}%</p>
                </div>
                <TrendingUp className="w-16 h-16 text-blue-300 opacity-50" />
              </div>
              <div className="w-full bg-blue-400 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2"
                  style={{ width: `${stats.performance.taux_reussite_moyen}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-green-100 text-sm mb-1">Taux de Présence Moyen</p>
                  <p className="text-4xl font-bold">{stats.performance.taux_presence_moyen}%</p>
                </div>
                <BarChart3 className="w-16 h-16 text-green-300 opacity-50" />
              </div>
              <div className="w-full bg-green-400 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2"
                  style={{ width: `${stats.performance.taux_presence_moyen}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Enseignants Report */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Enseignants</h2>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats.enseignants.total}</p>
              <p className="text-sm text-gray-600">Enseignants au total</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">Répartition par grade:</p>
              {stats.enseignants.par_grade.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-900">{item.grade}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 rounded-full h-2"
                        style={{ width: `${(item.count / stats.enseignants.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Étudiants Report */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Étudiants</h2>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats.etudiants.total}</p>
              <p className="text-sm text-gray-600">Étudiants inscrits</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">Répartition par spécialité:</p>
              {stats.etudiants.par_specialite.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-900">{item.specialite}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 rounded-full h-2"
                        style={{ width: `${(item.count / stats.etudiants.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Matières Report */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="w-6 h-6 text-purple-600" />
              <h2 className="text-xl font-bold text-gray-900">Matières</h2>
            </div>
            <div className="mb-4">
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats.matieres.total}</p>
              <p className="text-sm text-gray-600">Matières enseignées</p>
            </div>
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-700 mb-2">Répartition par niveau:</p>
              {stats.matieres.par_niveau.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-900">{item.niveau}</span>
                  <div className="flex items-center gap-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-purple-600 rounded-full h-2"
                        style={{ width: `${(item.count / stats.matieres.total) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
