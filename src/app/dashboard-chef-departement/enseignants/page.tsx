'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserCheck, Search, Filter, Mail, Phone, BookOpen, Award, Download } from 'lucide-react';

interface Enseignant {
  id_enseignant: number;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string | null;
  grade: string | null;
  est_chef_departement: boolean;
  specialite: string | null;
  _count?: {
    matieres: number;
  };
}

export default function EnseignantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [filteredEnseignants, setFilteredEnseignants] = useState<Enseignant[]>([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [grades, setGrades] = useState<string[]>([]);

  useEffect(() => {
    fetchEnseignants();
  }, []);

  useEffect(() => {
    filterEnseignants();
  }, [searchTerm, selectedGrade, enseignants]);

  const fetchEnseignants = async () => {
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

      const enseignantsResponse = await fetch(`/api/enseignants?id_departement=${deptId}`);
      if (!enseignantsResponse.ok) {
        throw new Error('Erreur lors du chargement des enseignants');
      }

      const enseignantsData = await enseignantsResponse.json();
      setEnseignants(enseignantsData);
      setFilteredEnseignants(enseignantsData);

      // Extract unique grades
      const uniqueGrades = [...new Set(enseignantsData.map((e: Enseignant) => e.grade).filter(Boolean))] as string[];
      setGrades(uniqueGrades);
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterEnseignants = () => {
    let filtered = enseignants;

    if (searchTerm) {
      filtered = filtered.filter(
        (e) =>
          e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
          e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (e.specialite && e.specialite.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedGrade !== 'all') {
      filtered = filtered.filter((e) => e.grade === selectedGrade);
    }

    setFilteredEnseignants(filtered);
  };

  const exportToCSV = () => {
    // CSV Header
    const headers = ['Matricule', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Grade', 'Spécialité', 'Rôle', 'Nb Matières'];
    
    // CSV Rows
    const rows = filteredEnseignants.map(enseignant => [
      enseignant.matricule,
      enseignant.nom,
      enseignant.prenom,
      enseignant.email,
      enseignant.telephone || 'N/A',
      enseignant.grade || 'N/A',
      enseignant.specialite || 'N/A',
      enseignant.est_chef_departement ? 'Chef de département' : 'Enseignant',
      enseignant._count?.matieres || 0
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
    link.setAttribute('download', `enseignants_departement_${new Date().toISOString().split('T')[0]}.csv`);
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
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Enseignants du Département
              </h1>
            </div>
            <p className="text-gray-600">Liste complète du corps enseignant de votre département</p>
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
          <p className="text-sm text-gray-600 mb-1 font-medium">Total Enseignants</p>
          <p className="text-4xl font-bold text-orange-600">{enseignants.length}</p>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-500 transition-all">
          <p className="text-sm text-gray-600 mb-1 font-medium">Grades Différents</p>
          <p className="text-4xl font-bold text-orange-600">{grades.length}</p>
        </div>
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-500 transition-all">
          <p className="text-sm text-gray-600 mb-1 font-medium">Résultats filtrés</p>
          <p className="text-4xl font-bold text-orange-600">{filteredEnseignants.length}</p>
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
              placeholder="Rechercher par nom, prénom, matricule, email ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="all">Tous les grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enseignants List */}
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
                  Grade & Spécialité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Rôle
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEnseignants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Aucun enseignant trouvé
                  </td>
                </tr>
              ) : (
                filteredEnseignants.map((enseignant) => (
                  <tr key={enseignant.id_enseignant} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCheck className="w-5 h-5 text-orange-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{enseignant.matricule}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {enseignant.nom} {enseignant.prenom}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {enseignant.email}
                        </div>
                        {enseignant.telephone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {enseignant.telephone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {enseignant.grade && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Award className="w-4 h-4 mr-2 text-orange-600" />
                            <span className="font-medium">{enseignant.grade}</span>
                          </div>
                        )}
                        {enseignant.specialite && (
                          <div className="flex items-center text-sm text-gray-600">
                            <BookOpen className="w-4 h-4 mr-2 text-orange-600" />
                            {enseignant.specialite}
                          </div>
                        )}
                        {enseignant._count && enseignant._count.matieres > 0 && (
                          <div className="text-xs text-gray-500 mt-1">
                            {enseignant._count.matieres} matière(s) enseignée(s)
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enseignant.est_chef_departement ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          Chef de département
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                          Enseignant
                        </span>
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
