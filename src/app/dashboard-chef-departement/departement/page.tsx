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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !departement) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-gray-200 text-gray-700 p-6 rounded-lg shadow-sm">
          {error || 'Département non trouvé'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Mon Département
        </h1>
        <p className="text-gray-600">Informations et gestion du département</p>
      </div>

      {/* Informations principales */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Informations du Département</h2>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
              >
                <Save className="w-4 h-4" />
                Enregistrer
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditForm({ nom: departement.nom, code: departement.code });
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du département
              </label>
              <input
                type="text"
                value={editForm.nom}
                onChange={(e) => setEditForm({ ...editForm, nom: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code du département
              </label>
              <input
                type="text"
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Nom du département</p>
              <p className="text-lg font-semibold text-gray-900">{departement.nom}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Code</p>
              <p className="text-lg font-semibold text-gray-900">{departement.code}</p>
            </div>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Enseignants</p>
              <p className="text-4xl font-bold text-orange-600">{departement.nombre_enseignants}</p>
            </div>
            <Users className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Étudiants</p>
              <p className="text-4xl font-bold text-orange-600">{departement.nombre_etudiants}</p>
            </div>
            <GraduationCap className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-orange-500 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1 font-medium">Matières</p>
              <p className="text-4xl font-bold text-orange-600">{departement.nombre_matieres}</p>
            </div>
            <BookOpen className="w-12 h-12 text-orange-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Spécialités */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Spécialités du Département
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departement.specialites.map((specialite) => (
            <div
              key={specialite.id_specialite}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-orange-500 transition-all"
            >
              <h3 className="font-semibold text-lg text-gray-900 mb-2">{specialite.nom}</h3>
              <p className="text-sm text-gray-600 mb-3">Code: {specialite.code}</p>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700">
                  <span className="font-semibold text-orange-600">{specialite.nombre_etudiants}</span> étudiants
                </span>
                <span className="text-gray-700">
                  <span className="font-semibold text-orange-600">{specialite.nombre_groupes}</span> groupes
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Liste des Enseignants */}
      {departement.enseignants && departement.enseignants.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-orange-600" />
              <h2 className="text-xl font-bold text-gray-900">Enseignants du Département</h2>
            </div>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
              Exporter CSV
            </button>
          </div>
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
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                    Rôle
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {departement.enseignants.map((enseignant) => (
                  <tr key={enseignant.id_enseignant} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Award className="w-4 h-4 text-orange-600 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{enseignant.matricule}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {enseignant.utilisateur.nom} {enseignant.utilisateur.prenom}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {enseignant.utilisateur.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {enseignant.est_chef_departement ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                          Chef de département
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
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
