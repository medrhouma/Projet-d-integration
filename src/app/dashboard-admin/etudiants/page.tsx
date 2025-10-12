'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, Search, Plus, Edit, Trash2, Filter, 
  Download, Mail, Phone, User, BookOpen, Users, X
} from 'lucide-react';

interface Etudiant {
  id_etudiant: number;
  numero_inscription: string;
  departement?: string;
  specialite_nom?: string;
  niveau_nom?: string;
  groupe_nom?: string;
  utilisateur: {
    nom: string;
    prenom: string;
    email: string;
    identifiant: string;
  };
}

export default function EtudiantsPage() {
  const router = useRouter();
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState<Etudiant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialite, setSelectedSpecialite] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');
  const [selectedGroupe, setSelectedGroupe] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    checkAuth();
    loadEtudiants();
  }, []);

  useEffect(() => {
    filterEtudiants();
  }, [searchTerm, selectedSpecialite, selectedNiveau, selectedGroupe, etudiants]);

  const checkAuth = () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Admin') {
      router.push('/login');
    }
  };

  const loadEtudiants = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/etudiants');
      if (res.ok) {
        const data = await res.json();
        setEtudiants(data);
        setFilteredEtudiants(data);
      } else {
        setError('Erreur lors du chargement des étudiants');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterEtudiants = () => {
    let filtered = [...etudiants];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.numero_inscription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par spécialité
    if (selectedSpecialite) {
      filtered = filtered.filter(e => e.specialite_nom === selectedSpecialite);
    }

    // Filtre par niveau
    if (selectedNiveau) {
      filtered = filtered.filter(e => e.niveau_nom === selectedNiveau);
    }

    // Filtre par groupe
    if (selectedGroupe) {
      filtered = filtered.filter(e => e.groupe_nom === selectedGroupe);
    }

    setFilteredEtudiants(filtered);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet étudiant ?')) return;

    try {
      const res = await fetch(`/api/etudiants/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setSuccess('Étudiant supprimé avec succès');
        loadEtudiants();
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
    const headers = ['N° Inscription', 'Nom', 'Prénom', 'Email', 'Spécialité', 'Niveau', 'Groupe'];
    const rows = filteredEtudiants.map(e => [
      e.numero_inscription,
      e.utilisateur.nom,
      e.utilisateur.prenom,
      e.utilisateur.email,
      e.specialite_nom || '-',
      e.niveau_nom || '-',
      e.groupe_nom || '-'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `etudiants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSpecialite('');
    setSelectedNiveau('');
    setSelectedGroupe('');
  };

  // Obtenir les valeurs uniques pour les filtres
  const specialites = [...new Set(etudiants.map(e => e.specialite_nom).filter(Boolean))];
  const niveaux = [...new Set(etudiants.map(e => e.niveau_nom).filter(Boolean))];
  const groupes = [...new Set(etudiants.map(e => e.groupe_nom).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Chargement des étudiants...</p>
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
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Étudiants</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {filteredEtudiants.length} étudiant{filteredEtudiants.length > 1 ? 's' : ''} trouvé{filteredEtudiants.length > 1 ? 's' : ''}
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
                href="/dashboard-admin/etudiants/nouveau"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter un étudiant</span>
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
            {/* Recherche */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, n° inscription ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Bouton filtres */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-3 rounded-lg transition-colors flex items-center gap-2 ${
                showFilters 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-5 h-5" />
              <span>Filtres</span>
              {(selectedSpecialite || selectedNiveau || selectedGroupe) && (
                <span className="bg-white text-blue-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  {[selectedSpecialite, selectedNiveau, selectedGroupe].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {/* Panneau de filtres */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialité
                </label>
                <select
                  value={selectedSpecialite}
                  onChange={(e) => setSelectedSpecialite(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Toutes les spécialités</option>
                  {specialites.map(spec => (
                    <option key={spec} value={spec}>{spec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau
                </label>
                <select
                  value={selectedNiveau}
                  onChange={(e) => setSelectedNiveau(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les niveaux</option>
                  {niveaux.map(niv => (
                    <option key={niv} value={niv}>{niv}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Groupe
                </label>
                <select
                  value={selectedGroupe}
                  onChange={(e) => setSelectedGroupe(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Tous les groupes</option>
                  {groupes.map(grp => (
                    <option key={grp} value={grp}>{grp}</option>
                  ))}
                </select>
              </div>

              {(selectedSpecialite || selectedNiveau || selectedGroupe) && (
                <div className="md:col-span-3 flex justify-end">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Effacer les filtres
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Liste des étudiants */}
        {filteredEtudiants.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun étudiant trouvé</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedSpecialite || selectedNiveau || selectedGroupe
                ? 'Essayez de modifier vos filtres de recherche'
                : 'Commencez par ajouter votre premier étudiant'}
            </p>
            {!searchTerm && !selectedSpecialite && !selectedNiveau && !selectedGroupe && (
              <Link
                href="/dashboard-admin/etudiants/nouveau"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Ajouter un étudiant
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
                      N° Inscription
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Étudiant
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Formation
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEtudiants.map((etudiant) => (
                    <tr key={etudiant.id_etudiant} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-700 font-semibold text-sm">
                              {etudiant.numero_inscription.slice(-3)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {etudiant.numero_inscription}
                            </p>
                            <p className="text-xs text-gray-500">
                              {etudiant.utilisateur.identifiant}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {etudiant.utilisateur.prenom[0]}{etudiant.utilisateur.nom[0]}
                            </span>
                          </div>
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                              {etudiant.utilisateur.nom} {etudiant.utilisateur.prenom}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {etudiant.utilisateur.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="w-4 h-4 text-blue-500" />
                            <span className="font-medium text-gray-900">
                              {etudiant.specialite_nom || '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <span>{etudiant.niveau_nom || '-'}</span>
                            <span className="text-gray-400">•</span>
                            <span>{etudiant.groupe_nom || '-'}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard-admin/etudiants/${etudiant.id_etudiant}`}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir les détails"
                          >
                            <User className="w-5 h-5" />
                          </Link>
                          <Link
                            href={`/dashboard-admin/etudiants/${etudiant.id_etudiant}/edit`}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="w-5 h-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(etudiant.id_etudiant)}
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

        {/* Statistiques bas de page */}
        {filteredEtudiants.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Total étudiants</p>
              <p className="text-2xl font-bold text-gray-900">{etudiants.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Résultats filtrés</p>
              <p className="text-2xl font-bold text-gray-900">{filteredEtudiants.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">Spécialités</p>
              <p className="text-2xl font-bold text-gray-900">{specialites.length}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}