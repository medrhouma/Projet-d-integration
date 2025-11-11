'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  UserCheck, Search, Plus, Edit, Trash2, Filter, 
  Download, Mail, Building, X, BookOpen
} from 'lucide-react';

interface Enseignant {
  id_enseignant: number;
  matricule: string;
  departement_nom?: string;
  utilisateur: {
    nom: string;
    prenom: string;
    email: string;
    identifiant: string;
  };
}

export default function EnseignantsPage() {
  const router = useRouter();
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [filteredEnseignants, setFilteredEnseignants] = useState<Enseignant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartement, setSelectedDepartement] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    checkAuth();
    loadEnseignants();
  }, []);

  useEffect(() => {
    filterEnseignants();
  }, [searchTerm, selectedDepartement, enseignants]);

  const checkAuth = () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Admin') {
      router.push('/login');
    }
  };

  const loadEnseignants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/enseignants');
      if (res.ok) {
        const data = await res.json();
        setEnseignants(data);
        setFilteredEnseignants(data);
      } else {
        setError('Erreur lors du chargement des enseignants');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterEnseignants = () => {
    let filtered = [...enseignants];

    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartement) {
      filtered = filtered.filter(e => e.departement_nom === selectedDepartement);
    }

    setFilteredEnseignants(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet enseignant ?')) return;

    try {
      const res = await fetch(`/api/enseignants/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccess('Enseignant supprimé avec succès');
        loadEnseignants();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      setError('Erreur de connexion');
    }
  };

  const exportToCSV = () => {
    const headers = ['Matricule', 'Nom', 'Prénom', 'Email', 'Département'];
    const rows = filteredEnseignants.map(e => [
      e.matricule,
      e.utilisateur.nom,
      e.utilisateur.prenom,
      e.utilisateur.email,
      e.departement_nom || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `enseignants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const departements = [...new Set(enseignants.map(e => e.departement_nom).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Chargement des enseignants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                <UserCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Enseignants</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredEnseignants.length} enseignant{filteredEnseignants.length > 1 ? 's' : ''} trouvé{filteredEnseignants.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Exporter CSV</span>
              </button>
              <Link
                href="/dashboard-admin/enseignants/nouveau"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un enseignant</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center shadow-sm">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 font-bold hover:text-red-900">✕</button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center shadow-sm">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-700 font-bold hover:text-green-900">✕</button>
          </div>
        )}

        {/* Barre de recherche et filtres */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, matricule ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                showFilters 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtres</span>
              {selectedDepartement && (
                <span className="bg-white text-green-600 px-2 py-0.5 rounded-full text-xs font-bold">1</span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="mt-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Département
                  </label>
                  <select
                    value={selectedDepartement}
                    onChange={(e) => setSelectedDepartement(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Tous les départements</option>
                    {departements.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>

                {selectedDepartement && (
                  <div className="flex items-end">
                    <button
                      onClick={() => setSelectedDepartement('')}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Effacer les filtres
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Liste des enseignants */}
        {filteredEnseignants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun enseignant trouvé</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedDepartement
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par ajouter votre premier enseignant'}
            </p>
            {!searchTerm && !selectedDepartement && (
              <Link
                href="/dashboard-admin/enseignants/nouveau"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Ajouter un enseignant
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Matricule
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enseignant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Département
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEnseignants.map((enseignant) => (
                    <tr key={enseignant.id_enseignant} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-700 font-semibold text-sm">
                              {enseignant.matricule.slice(-3)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {enseignant.matricule}
                            </p>
                            <p className="text-xs text-gray-500">
                              {enseignant.utilisateur.identifiant}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {enseignant.utilisateur.prenom[0]}{enseignant.utilisateur.nom[0]}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {enseignant.utilisateur.nom} {enseignant.utilisateur.prenom}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {enseignant.utilisateur.email}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2 text-sm">
                          <Building className="w-4 h-4 text-green-500" />
                          <span className="font-medium text-gray-900">
                            {enseignant.departement_nom || '-'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard-admin/enseignants/${enseignant.id_enseignant}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(enseignant.id_enseignant)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Statistiques */}
        {filteredEnseignants.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Total enseignants</p>
              <p className="text-2xl font-bold text-gray-900">{enseignants.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Résultats filtrés</p>
              <p className="text-2xl font-bold text-gray-900">{filteredEnseignants.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">Départements</p>
              <p className="text-2xl font-bold text-gray-900">{departements.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}