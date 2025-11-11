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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
        <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/30 text-red-200 p-6 rounded-2xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="w-8 h-8 text-orange-400" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent">
                Enseignants du Département
              </h1>
            </div>
            <p className="text-gray-300">Liste complète du corps enseignant de votre département</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-500/30 hover:bg-green-500/40 backdrop-blur-lg border border-green-400/30 text-white rounded-xl transition-all hover:scale-105"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-105 shadow-xl">
          <p className="text-sm text-orange-300 mb-1">Total Enseignants</p>
          <p className="text-3xl font-bold text-white">{enseignants.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-105 shadow-xl">
          <p className="text-sm text-red-300 mb-1">Grades Différents</p>
          <p className="text-3xl font-bold text-white">{grades.length}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-105 shadow-xl">
          <p className="text-sm text-amber-300 mb-1">Résultats filtrés</p>
          <p className="text-3xl font-bold text-white">{filteredEnseignants.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <Filter className="w-5 h-5 text-orange-400" />
          <h2 className="text-lg font-semibold text-white">Filtres</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom, matricule, email ou spécialité..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all" className="bg-gray-900">Tous les grades</option>
            {grades.map((grade) => (
              <option key={grade} value={grade} className="bg-gray-900">
                {grade}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Enseignants List */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900/30 border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider">
                  Matricule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider">
                  Nom & Prénom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider">
                  Grade & Spécialité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider">
                  Rôle
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredEnseignants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-300">
                    Aucun enseignant trouvé
                  </td>
                </tr>
              ) : (
                filteredEnseignants.map((enseignant) => (
                  <tr key={enseignant.id_enseignant} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserCheck className="w-5 h-5 text-amber-400 mr-2" />
                        <span className="text-sm font-medium text-white">{enseignant.matricule}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {enseignant.nom} {enseignant.prenom}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center text-sm text-gray-300">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {enseignant.email}
                        </div>
                        {enseignant.telephone && (
                          <div className="flex items-center text-sm text-gray-300">
                            <Phone className="w-4 h-4 mr-2 text-gray-400" />
                            {enseignant.telephone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        {enseignant.grade && (
                          <div className="flex items-center text-sm text-white">
                            <Award className="w-4 h-4 mr-2 text-orange-400" />
                            <span className="font-medium">{enseignant.grade}</span>
                          </div>
                        )}
                        {enseignant.specialite && (
                          <div className="flex items-center text-sm text-gray-300">
                            <BookOpen className="w-4 h-4 mr-2 text-red-400" />
                            {enseignant.specialite}
                          </div>
                        )}
                        {enseignant._count && enseignant._count.matieres > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {enseignant._count.matieres} matière(s) enseignée(s)
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enseignant.est_chef_departement ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-400/30">
                          Chef de département
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-400/30">
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
