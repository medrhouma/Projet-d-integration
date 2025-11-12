'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Search, Filter, ArrowLeft, Mail, Phone, 
  BookOpen, TrendingUp, AlertCircle, CheckCircle,
  UserCheck, Calendar, GraduationCap, Download
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Etudiant {
  id_etudiant: number;
  matricule: string;
  utilisateur: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
  };
  groupe: {
    nom: string;
    niveau: {
      nom: string;
    };
  };
  moyenne?: number;
  absences?: number;
}

export default function MesEtudiantsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [filteredEtudiants, setFilteredEtudiants] = useState<Etudiant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroupe, setSelectedGroupe] = useState('');
  const [groupes, setGroupes] = useState<string[]>([]);

  useEffect(() => {
    loadEtudiants();
  }, []);

  useEffect(() => {
    filterEtudiants();
  }, [searchTerm, selectedGroupe, etudiants]);

  const loadEtudiants = async () => {
    try {
      setLoading(true);
      
      // Simuler le chargement des étudiants
      // TODO: Remplacer par l'appel API réel
      const mockEtudiants: Etudiant[] = [
        {
          id_etudiant: 1,
          matricule: 'ETU001',
          utilisateur: {
            nom: 'Ben Ahmed',
            prenom: 'Mohamed',
            email: 'mohamed.benahmed@email.com',
            telephone: '20123456'
          },
          groupe: {
            nom: 'DSI 21',
            niveau: { nom: '2ème Année' }
          },
          moyenne: 15.5,
          absences: 2
        },
        {
          id_etudiant: 2,
          matricule: 'ETU002',
          utilisateur: {
            nom: 'Trabelsi',
            prenom: 'Fatma',
            email: 'fatma.trabelsi@email.com',
            telephone: '21234567'
          },
          groupe: {
            nom: 'DSI 21',
            niveau: { nom: '2ème Année' }
          },
          moyenne: 16.8,
          absences: 0
        },
        {
          id_etudiant: 3,
          matricule: 'ETU003',
          utilisateur: {
            nom: 'Karoui',
            prenom: 'Ahmed',
            email: 'ahmed.karoui@email.com',
            telephone: '22345678'
          },
          groupe: {
            nom: 'DSI 22',
            niveau: { nom: '2ème Année' }
          },
          moyenne: 14.2,
          absences: 5
        },
        {
          id_etudiant: 4,
          matricule: 'ETU004',
          utilisateur: {
            nom: 'Gharbi',
            prenom: 'Sarra',
            email: 'sarra.gharbi@email.com',
            telephone: '23456789'
          },
          groupe: {
            nom: 'DSI 22',
            niveau: { nom: '2ème Année' }
          },
          moyenne: 17.5,
          absences: 1
        },
        {
          id_etudiant: 5,
          matricule: 'ETU005',
          utilisateur: {
            nom: 'Mansour',
            prenom: 'Youssef',
            email: 'youssef.mansour@email.com',
            telephone: '24567890'
          },
          groupe: {
            nom: 'RSI 21',
            niveau: { nom: '2ème Année' }
          },
          moyenne: 13.8,
          absences: 3
        },
        {
          id_etudiant: 6,
          matricule: 'ETU006',
          utilisateur: {
            nom: 'Bouaziz',
            prenom: 'Leila',
            email: 'leila.bouaziz@email.com',
            telephone: '25678901'
          },
          groupe: {
            nom: 'RSI 21',
            niveau: { nom: '2ème Année' }
          },
          moyenne: 15.9,
          absences: 1
        }
      ];

      setEtudiants(mockEtudiants);
      
      // Extraire les groupes uniques
      const uniqueGroupes = Array.from(new Set(mockEtudiants.map(e => e.groupe.nom)));
      setGroupes(uniqueGroupes);
      
    } catch (error) {
      console.error('Erreur chargement étudiants:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterEtudiants = () => {
    let filtered = [...etudiants];

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(etudiant => {
        const fullName = `${etudiant.utilisateur.prenom} ${etudiant.utilisateur.nom}`.toLowerCase();
        const search = searchTerm.toLowerCase();
        return fullName.includes(search) || 
               etudiant.matricule.toLowerCase().includes(search) ||
               etudiant.utilisateur.email.toLowerCase().includes(search);
      });
    }

    // Filtrer par groupe
    if (selectedGroupe) {
      filtered = filtered.filter(etudiant => etudiant.groupe.nom === selectedGroupe);
    }

    setFilteredEtudiants(filtered);
  };

  const exportToCSV = () => {
    const headers = ['Matricule', 'Nom', 'Prénom', 'Email', 'Téléphone', 'Groupe', 'Niveau', 'Moyenne', 'Absences'];
    const data = filteredEtudiants.map(e => [
      e.matricule,
      e.utilisateur.nom,
      e.utilisateur.prenom,
      e.utilisateur.email,
      e.utilisateur.telephone || 'N/A',
      e.groupe.nom,
      e.groupe.niveau.nom,
      e.moyenne?.toFixed(2) || 'N/A',
      e.absences || 0
    ]);

    const csv = [headers, ...data].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `etudiants_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusColor = (moyenne?: number) => {
    if (!moyenne) return 'gray';
    if (moyenne >= 16) return 'green';
    if (moyenne >= 12) return 'blue';
    if (moyenne >= 10) return 'yellow';
    return 'red';
  };

  const getAbsenceStatus = (absences?: number) => {
    if (!absences || absences === 0) return { color: 'green', text: 'Aucune' };
    if (absences <= 2) return { color: 'yellow', text: `${absences} absences` };
    return { color: 'red', text: `${absences} absences` };
  };

  const stats = {
    total: etudiants.length,
    moyenneGenerale: (etudiants.reduce((acc, e) => acc + (e.moyenne || 0), 0) / etudiants.length).toFixed(2),
    absencesTotal: etudiants.reduce((acc, e) => acc + (e.absences || 0), 0),
    excellents: etudiants.filter(e => (e.moyenne || 0) >= 16).length
  };

  if (loading) {
    return <LoadingSpinner color="green" message="Chargement de vos étudiants..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Bouton retour */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard-enseignant')}
          className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-semibold transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>Retour au Dashboard</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <Users size={32} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mes Étudiants
            </h1>
            <p className="text-gray-600">Gestion et suivi de vos étudiants</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Users className="text-green-600" size={32} />
            <span className="text-4xl font-bold text-gray-900">{stats.total}</span>
          </div>
          <p className="text-gray-600 font-semibold">Total Étudiants</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="text-green-600" size={32} />
            <span className="text-4xl font-bold text-gray-900">{stats.moyenneGenerale}</span>
          </div>
          <p className="text-gray-600 font-semibold">Moyenne Générale</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="text-green-600" size={32} />
            <span className="text-4xl font-bold text-gray-900">{stats.excellents}</span>
          </div>
          <p className="text-gray-600 font-semibold">Excellents (≥16)</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="text-green-600" size={32} />
            <span className="text-4xl font-bold text-gray-900">{stats.absencesTotal}</span>
          </div>
          <p className="text-gray-600 font-semibold">Absences Totales</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all"
              />
            </div>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <select
                  value={selectedGroupe}
                  onChange={(e) => setSelectedGroupe(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all appearance-none cursor-pointer"
                >
                  <option value="">Tous les groupes</option>
                  {groupes.map((groupe) => (
                    <option key={groupe} value={groupe}>
                      {groupe}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold transition-colors shadow-sm"
            >
              <Download size={20} />
              <span className="hidden md:inline">Exporter</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold">{filteredEtudiants.length}</span>
          <span>étudiant(s) affiché(s)</span>
        </div>
      </div>

      {/* Liste des étudiants */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="bg-green-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <Users size={28} />
            Liste des Étudiants
          </h2>
          <p className="text-green-50 text-sm">Cliquez sur un étudiant pour voir plus de détails</p>
        </div>

        {filteredEtudiants.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
              <Users size={48} className="text-gray-400" />
            </div>
            <p className="text-gray-900 text-lg font-semibold">Aucun étudiant trouvé</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || selectedGroupe 
                ? 'Essayez de modifier vos critères de recherche' 
                : 'Aucun étudiant dans votre liste'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Matricule</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Nom Complet</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Groupe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Contact</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Moyenne</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Absences</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEtudiants.map((etudiant) => {
                  const statusColor = getStatusColor(etudiant.moyenne);
                  const absenceStatus = getAbsenceStatus(etudiant.absences);
                  
                  return (
                    <tr key={etudiant.id_etudiant} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-gray-900 font-mono text-sm">{etudiant.matricule}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {etudiant.utilisateur.prenom[0]}{etudiant.utilisateur.nom[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-gray-900 font-semibold">
                              {etudiant.utilisateur.prenom} {etudiant.utilisateur.nom}
                            </p>
                            <p className="text-xs text-gray-500">{etudiant.groupe.niveau.nom}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700 border border-green-200">
                          {etudiant.groupe.nom}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={14} className="text-green-600" />
                            <span className="truncate max-w-[200px]">{etudiant.utilisateur.email}</span>
                          </div>
                          {etudiant.utilisateur.telephone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} className="text-green-600" />
                              <span>{etudiant.utilisateur.telephone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {etudiant.moyenne ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                            statusColor === 'green' ? 'bg-green-100 text-green-700 border border-green-200' :
                            statusColor === 'blue' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            statusColor === 'yellow' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                            'bg-red-100 text-red-700 border border-red-200'
                          }`}>
                            {etudiant.moyenne.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          absenceStatus.color === 'green' ? 'bg-green-100 text-green-700 border border-green-200' :
                          absenceStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                          'bg-red-100 text-red-700 border border-red-200'
                        }`}>
                          {absenceStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => alert(`Détails de ${etudiant.utilisateur.prenom} ${etudiant.utilisateur.nom}`)}
                          className="text-green-600 hover:text-green-700 transition-colors"
                        >
                          <UserCheck size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
