'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, Users, BookOpen, GraduationCap, Edit, Save, X, Mail, Award, Download } from 'lucide-react';

interface Specialite {
  id_specialite: number;
  nom: string;
  code: string;
  nombre_etudiants: number;
  nombre_groupes: number;
}

interface Enseignant {
  id_enseignant: number;
  matricule: string;
  est_chef_departement: boolean;
  utilisateur: {
    nom: string;
    prenom: string;
    email: string;
  };
}

interface DepartementInfo {
  id_departement: number;
  nom: string;
  code: string;
  nombre_enseignants: number;
  nombre_etudiants: number;
  nombre_matieres: number;
  specialites: Specialite[];
  enseignants?: Enseignant[];
}

export default function MonDepartementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [departement, setDepartement] = useState<DepartementInfo | null>(null);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ nom: '', code: '' });

  useEffect(() => {
    fetchDepartementInfo();
  }, []);

  const fetchDepartementInfo = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        router.push('/login');
        return;
      }

      const data = await response.json();
      
      if (!data.success) {
        router.push('/login');
        return;
      }

      const deptId = data.user.id_departement || data.user.enseignant?.id_departement;

      if (!deptId) {
        setError('Département non trouvé');
        return;
      }

      const deptResponse = await fetch(`/api/departements/${deptId}`);
      if (!deptResponse.ok) {
        throw new Error('Erreur lors du chargement des informations');
      }

      const deptData = await deptResponse.json();
      setDepartement(deptData);
      setEditForm({ nom: deptData.nom, code: deptData.code });
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!departement) return;

    try {
      const response = await fetch(`/api/departements/${departement.id_departement}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      await fetchDepartementInfo();
      setIsEditing(false);
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
      console.error('Erreur:', err);
    }
  };

  const exportToCSV = () => {
    if (!departement || !departement.enseignants) return;

    // CSV Header
    const headers = ['Matricule', 'Nom', 'Prénom', 'Email', 'Rôle'];
    
    // CSV Rows
    const rows = departement.enseignants.map(ens => [
      ens.matricule,
      ens.utilisateur.nom,
      ens.utilisateur.prenom,
      ens.utilisateur.email,
      ens.est_chef_departement ? 'Chef de département' : 'Enseignant'
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `enseignants_${departement.nom.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
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

  if (error || !departement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
        <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/30 text-red-200 p-6 rounded-2xl">
          {error || 'Département non trouvé'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent mb-2">
          Mon Département
        </h1>
        <p className="text-gray-300">Informations et gestion du département</p>
      </div>

      {/* Informations principales */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 mb-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Informations du Département</h2>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500/30 hover:bg-orange-500/40 backdrop-blur-lg border border-orange-400/30 text-white rounded-xl transition-all hover:scale-105"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-500/30 hover:bg-green-500/40 backdrop-blur-lg border border-green-400/30 text-white rounded-xl transition-all hover:scale-105"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({ nom: departement.nom, code: departement.code });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500/30 hover:bg-gray-500/40 backdrop-blur-lg border border-gray-400/30 text-white rounded-xl transition-all hover:scale-105"
              >
                <X className="w-4 h-4" />
                Annuler
              </button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-orange-300 mb-2">
                Nom du département
              </label>
              <input
                type="text"
                value={editForm.nom}
                onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-orange-300 mb-2">
                Code du département
              </label>
              <input
                type="text"
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                className="w-full px-4 py-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-orange-300 mb-1">Nom du département</p>
              <p className="text-lg font-semibold text-white">{departement.nom}</p>
            </div>
            <div>
              <p className="text-sm text-orange-300 mb-1">Code</p>
              <p className="text-lg font-semibold text-white">{departement.code}</p>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-105 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-300 mb-1">Enseignants</p>
              <p className="text-3xl font-bold text-white">{departement.nombre_enseignants}</p>
            </div>
            <Users className="w-12 h-12 text-orange-400/50" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-105 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-300 mb-1">Étudiants</p>
              <p className="text-3xl font-bold text-white">{departement.nombre_etudiants}</p>
            </div>
            <GraduationCap className="w-12 h-12 text-red-400/50" />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-105 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-300 mb-1">Matières</p>
              <p className="text-3xl font-bold text-white">{departement.nombre_matieres}</p>
            </div>
            <BookOpen className="w-12 h-12 text-amber-400/50" />
          </div>
        </div>
      </div>

      {/* Spécialités */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-4">
          Spécialités du Département
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departement.specialites.map((specialite) => (
            <div
              key={specialite.id_specialite}
              className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all hover:scale-105"
            >
              <h3 className="font-semibold text-lg text-white mb-2">{specialite.nom}</h3>
              <p className="text-sm text-gray-300 mb-3">Code: {specialite.code}</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">
                  <span className="font-semibold text-orange-400">{specialite.nombre_etudiants}</span> étudiants
                </span>
                <span className="text-gray-300">
                  <span className="font-semibold text-red-400">{specialite.nombre_groupes}</span> groupes
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des Enseignants */}
      {departement.enseignants && departement.enseignants.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-orange-400" />
              <h2 className="text-xl font-bold text-white">Enseignants du Département</h2>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/30 hover:bg-green-500/40 backdrop-blur-lg border border-green-400/30 text-white rounded-xl transition-all hover:scale-105"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
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
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider">
                    Rôle
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {departement.enseignants.map((enseignant) => (
                  <tr key={enseignant.id_enseignant} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Award className="w-4 h-4 text-amber-400 mr-2" />
                        <span className="text-sm font-medium text-white">{enseignant.matricule}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">
                        {enseignant.utilisateur.nom} {enseignant.utilisateur.prenom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-300">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {enseignant.utilisateur.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enseignant.est_chef_departement ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-orange-300 border border-orange-400/30">
                          Chef de département
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-300 border border-gray-400/30">
                          Enseignant
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
