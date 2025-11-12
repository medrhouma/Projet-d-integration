'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Search, Filter, Mail, Phone, UserCircle, Download } from 'lucide-react';

interface Etudiant {
  id_etudiant: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  date_naissance: string | null;
  groupe: {
    nom: string;
    niveau: {
      nom: string;
      specialite: {
        nom: string;
        code: string;
      };
    };
  } | null;
}

export default function EtudiantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState<Etudiant[]>([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialite, setSelectedSpecialite] = useState('all');
  const [specialites, setSpecialites] = useState<string[]>([]);

  useEffect(() => {
    fetchEtudiants();
  }, []);

  useEffect(() => {
    filterEtudiants();
  }, [searchTerm, selectedSpecialite, etudiants]);

  const fetchEtudiants = async () => {
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

      const etudiantsResponse = await fetch(`/api/etudiants?id_departement=${deptId}`);
      if (!etudiantsResponse.ok) {
        throw new Error('Erreur lors du chargement des étudiants');
      }

      const etudiantsData = await etudiantsResponse.json();
      setEtudiants(etudiantsData);
      setFilteredEtudiants(etudiantsData);

      // Extract unique specialités
      const uniqueSpecialites = [...new Set(etudiantsData.map((e: Etudiant) => e.groupe?.niveau?.specialite?.nom).filter(Boolean))] as string[];
      setSpecialites(uniqueSpecialites);
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterEtudiants = () => {
    let filtered = etudiants;

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialite !== 'all') {
      filtered = filtered.filter((e) => e.groupe?.niveau?.specialite?.nom === selectedSpecialite);
    }

    setFilteredEtudiants(filtered);
  };

  const exportToCSV = () => {
    // CSV Header
    const headers = ['Matricule', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Date de naissance', 'Spécialité', 'Niveau', 'Groupe'];
    
    // CSV Rows
    const rows = filteredEtudiants.map(etudiant => [
      etudiant.matricule,
      etudiant.nom,
      etudiant.prenom,
      etudiant.email,
      etudiant.telephone || 'N/A',
      etudiant.date_naissance ? new Date(etudiant.date_naissance).toLocaleDateString('fr-FR') : 'N/A',
      etudiant.groupe?.niveau?.specialite?.nom || 'Non assigné',
      etudiant.groupe?.niveau?.nom || 'Non assigné',
      etudiant.groupe?.nom || 'Non assigné'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `etudiants_departement_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-gray-200 text-gray-700 p-6 rounded-lg shadow-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Étudiants du Département
              </h1>
            </div>
            <p className="text-gray-600">Liste complète des étudiants inscrits dans votre département</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-500 transition-all">
          <p className="text-sm text-gray-600 mb-1 font-medium">Total Étudiants</p>
          <p className="text-4xl font-bold text-orange-600">{etudiants.length}</p>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-500 transition-all">
          <p className="text-sm text-gray-600 mb-1 font-medium">Spécialités</p>
          <p className="text-4xl font-bold text-orange-600">{specialites.length}</p>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-500 transition-all">
          <p className="text-sm text-gray-600 mb-1 font-medium">Résultats filtrés</p>
          <p className="text-4xl font-bold text-orange-600">{filteredEtudiants.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-orange-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, matricule ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <select
            value={selectedSpecialite}
            onChange={(e) => setSelectedSpecialite(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Toutes les spécialités</option>
            {specialites.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Étudiants List */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Matricule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Nom & Prénom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Spécialité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Niveau & Groupe
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEtudiants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucun étudiant trouvé
                  </td>
                </tr>
              ) : (
                filteredEtudiants.map((etudiant) => (
                  <tr key={etudiant.id_etudiant} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCircle className="w-5 h-5 text-orange-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{etudiant.matricule}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {etudiant.nom} {etudiant.prenom}
                      </div>
                      {etudiant.date_naissance && (
                        <div className="text-xs text-gray-500">
                          Né(e) le {new Date(etudiant.date_naissance).toLocaleDateString('fr-FR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {etudiant.email}
                        </div>
                        {etudiant.telephone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {etudiant.telephone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {etudiant.groupe?.niveau?.specialite ? (
                        <div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                            {etudiant.groupe.niveau.specialite.code}
                          </span>
                          <div className="text-xs text-gray-500 mt-1">{etudiant.groupe.niveau.specialite.nom}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Non assigné</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {etudiant.groupe ? (
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">{etudiant.groupe.niveau.nom}</div>
                          <div className="text-gray-500">{etudiant.groupe.nom}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Non assigné</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
