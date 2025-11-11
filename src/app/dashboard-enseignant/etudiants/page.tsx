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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-8">
      {/* Bouton retour */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard-enseignant')}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
        >
          <ArrowLeft size={20} />
          <span>Retour au Dashboard</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-2xl shadow-2xl animate-pulse">
            <Users size={40} className="text-white" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3">
          Mes Étudiants
        </h1>
        <p className="text-gray-300 text-lg">Gestion et suivi de vos étudiants</p>
        <div className="mt-4 h-1 w-32 mx-auto bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full"></div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <Users className="text-blue-400" size={32} />
            <span className="text-4xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-gray-300 font-semibold">Total Étudiants</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="text-green-400" size={32} />
            <span className="text-4xl font-bold text-white">{stats.moyenneGenerale}</span>
          </div>
          <p className="text-gray-300 font-semibold">Moyenne Générale</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="text-purple-400" size={32} />
            <span className="text-4xl font-bold text-white">{stats.excellents}</span>
          </div>
          <p className="text-gray-300 font-semibold">Excellents (≥16)</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <AlertCircle className="text-orange-400" size={32} />
            <span className="text-4xl font-bold text-white">{stats.absencesTotal}</span>
          </div>
          <p className="text-gray-300 font-semibold">Absences Totales</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full md:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par nom, matricule ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-green-400 transition-all"
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
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-green-400 transition-all appearance-none cursor-pointer"
                >
                  <option value="" className="bg-gray-900">Tous les groupes</option>
                  {groupes.map((groupe) => (
                    <option key={groupe} value={groupe} className="bg-gray-900">
                      {groupe}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-6 py-3 bg-green-600/20 hover:bg-green-600/30 backdrop-blur-lg rounded-xl border border-green-400/30 text-white font-semibold transition-all shadow-lg"
            >
              <Download size={20} />
              <span className="hidden md:inline">Exporter</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-sm text-gray-300">
          <span className="font-semibold">{filteredEtudiants.length}</span>
          <span>étudiant(s) affiché(s)</span>
        </div>
      </div>

      {/* Liste des étudiants */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl overflow-hidden border border-white/20">
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <Users size={28} />
            </div>
            Liste des Étudiants
          </h2>
          <p className="text-white/80 text-sm">Cliquez sur un étudiant pour voir plus de détails</p>
        </div>

        {filteredEtudiants.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-500/20 rounded-full mb-4">
              <Users size={48} className="text-gray-400" />
            </div>
            <p className="text-gray-300 text-lg font-semibold">Aucun étudiant trouvé</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm || selectedGroupe 
                ? 'Essayez de modifier vos critères de recherche' 
                : 'Aucun étudiant dans votre liste'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Matricule</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Nom Complet</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Groupe</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">Contact</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Moyenne</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Absences</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredEtudiants.map((etudiant) => {
                  const statusColor = getStatusColor(etudiant.moyenne);
                  const absenceStatus = getAbsenceStatus(etudiant.absences);
                  
                  return (
                    <tr key={etudiant.id_etudiant} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-white font-mono text-sm">{etudiant.matricule}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">
                              {etudiant.utilisateur.prenom[0]}{etudiant.utilisateur.nom[0]}
                            </span>
                          </div>
                          <div>
                            <p className="text-white font-semibold">
                              {etudiant.utilisateur.prenom} {etudiant.utilisateur.nom}
                            </p>
                            <p className="text-xs text-gray-400">{etudiant.groupe.niveau.nom}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30">
                          {etudiant.groupe.nom}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-300">
                            <Mail size={14} className="text-blue-400" />
                            <span className="truncate max-w-[200px]">{etudiant.utilisateur.email}</span>
                          </div>
                          {etudiant.utilisateur.telephone && (
                            <div className="flex items-center gap-2 text-sm text-gray-300">
                              <Phone size={14} className="text-green-400" />
                              <span>{etudiant.utilisateur.telephone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {etudiant.moyenne ? (
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-${statusColor}-500/20 text-${statusColor}-300 border border-${statusColor}-400/30`}>
                            {etudiant.moyenne.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-${absenceStatus.color}-500/20 text-${absenceStatus.color}-300 border border-${absenceStatus.color}-400/30`}>
                          {absenceStatus.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => alert(`Détails de ${etudiant.utilisateur.prenom} ${etudiant.utilisateur.nom}`)}
                          className="text-green-400 hover:text-green-300 transition-colors"
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
