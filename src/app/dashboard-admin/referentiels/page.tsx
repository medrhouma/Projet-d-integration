'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ==================== TYPES ====================
interface Departement {
  id_departement: number;
  nom: string;
}

interface Specialite {
  id_specialite: number;
  nom: string;
  id_departement: number;
  departement?: Departement;
}

interface Niveau {
  id_niveau: number;
  nom: string;
  id_specialite: number;
  specialite?: Specialite;
}

interface Groupe {
  id_groupe: number;
  nom: string;
  id_niveau: number;
  niveau?: Niveau;
}

interface Matiere {
  id_matiere: number;
  nom: string;
  id_niveau: number;
  id_enseignant: number;
  niveau?: Niveau;
  enseignant?: {
    utilisateur: {
      nom: string;
      prenom: string;
    };
  };
}

interface Salle {
  id_salle: number;
  code: string;
  type: string;
  capacite: number;
}

interface Enseignant {
  id_enseignant: number;
  matricule: string;
  departement_nom?: string;
  utilisateur: {
    nom: string;
    prenom: string;
    email: string;
  };
}

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
  };
}

type TabType = 'departements' | 'specialites' | 'niveaux' | 'groupes' | 'matieres' | 'salles' | 'enseignants' | 'etudiants';

export default function ReferentielPublic() {
  const [activeTab, setActiveTab] = useState<TabType>('departements');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // États pour les données
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);

  // Charger les données au montage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [deptRes, specRes, nivRes, grpRes, matRes, salleRes, ensRes, etudRes] = await Promise.all([
        fetch('/api/departements'),
        fetch('/api/specialites'),
        fetch('/api/niveaux'),
        fetch('/api/groupes'),
        fetch('/api/matieres'),
        fetch('/api/salles'),
        fetch('/api/enseignants'),
        fetch('/api/etudiants')
      ]);

      if (deptRes.ok) setDepartements(await deptRes.json());
      if (specRes.ok) setSpecialites(await specRes.json());
      if (nivRes.ok) setNiveaux(await nivRes.json());
      if (grpRes.ok) setGroupes(await grpRes.json());
      if (matRes.ok) setMatieres(await matRes.json());
      if (salleRes.ok) setSalles(await salleRes.json());
      if (ensRes.ok) setEnseignants(await ensRes.json());
      if (etudRes.ok) setEtudiants(await etudRes.json());
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'departements' as TabType, label: 'Départements', icon: '🏢', count: departements.length },
    { id: 'specialites' as TabType, label: 'Spécialités', icon: '📚', count: specialites.length },
    { id: 'niveaux' as TabType, label: 'Niveaux', icon: '📊', count: niveaux.length },
    { id: 'groupes' as TabType, label: 'Groupes', icon: '👥', count: groupes.length },
    { id: 'matieres' as TabType, label: 'Matières', icon: '📖', count: matieres.length },
    { id: 'salles' as TabType, label: 'Salles', icon: '🚪', count: salles.length },
    { id: 'enseignants' as TabType, label: 'Enseignants', icon: '👨‍🏫', count: enseignants.length },
    { id: 'etudiants' as TabType, label: 'Étudiants', icon: '🎓', count: etudiants.length },
  ];

  // Filtres
  const filteredDepartements = departements.filter(d => 
    d.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSpecialites = specialites.filter(s => 
    s.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNiveaux = niveaux.filter(n => 
    n.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroupes = groupes.filter(g => 
    g.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMatieres = matieres.filter(m => 
    m.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSalles = salles.filter(s => 
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnseignants = enseignants.filter(e => 
    e.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.matricule.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEtudiants = etudiants.filter(e => 
    e.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.numero_inscription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Actions CRUD
  const handleDelete = async (type: TabType, id: number) => {
    if (!confirm('⚠️ Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      const endpoints: Record<TabType, string> = {
        departements: `/api/departements/${id}`,
        specialites: `/api/specialites/${id}`,
        niveaux: `/api/niveaux/${id}`,
        groupes: `/api/groupes/${id}`,
        matieres: `/api/matieres/${id}`,
        salles: `/api/salles/${id}`,
        enseignants: `/api/enseignants/${id}`,
        etudiants: `/api/etudiants/${id}`
      };

      const res = await fetch(endpoints[type], { method: 'DELETE' });
      
      if (res.ok) {
        setSuccess('✅ Supprimé avec succès !');
        loadData();
        setTimeout(() => setSuccess(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || '❌ Erreur lors de la suppression');
      }
    } catch (err) {
      setError('❌ Erreur de connexion');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📋 Référentiels</h1>
              <p className="mt-1 text-sm text-gray-600">
                Gestion complète des départements, spécialités, niveaux, groupes, matières, salles, enseignants et étudiants
              </p>
            </div>
            <Link 
              href="/dashboard-admin"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 font-bold">✕</button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-700 font-bold">✕</button>
          </div>
        )}

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchTerm('');
                }}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
                <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Barre de recherche et bouton ajouter */}
          <div className="p-4 bg-gray-50 flex gap-4">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Link
              href={
                activeTab === 'etudiants' ? '/dashboard-admin/etudiants/nouveau' :
                activeTab === 'enseignants' ? '/dashboard-admin/enseignants/nouveau' :
                `/dashboard-admin/${activeTab}/nouveau`
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <span className="text-xl">+</span>
              <span>Ajouter</span>
            </Link>
          </div>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Départements */}
            {activeTab === 'departements' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDepartements.map(dept => (
                  <div
                    key={dept.id_departement}
                    className="bg-white border-2 border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-bold text-gray-900">{dept.nom}</h3>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard-admin/departements/${dept.id_departement}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete('departements', dept.id_departement)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      📚 {specialites.filter(s => s.id_departement === dept.id_departement).length} spécialité(s)
                    </p>
                  </div>
                ))}
                {filteredDepartements.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    Aucun département trouvé
                  </div>
                )}
              </div>
            )}

            {/* Spécialités */}
            {activeTab === 'specialites' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveaux</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSpecialites.map(spec => (
                      <tr key={spec.id_specialite} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {spec.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {spec.departement?.nom || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {niveaux.filter(n => n.id_specialite === spec.id_specialite).length} niveau(x)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                          <Link
                            href={`/dashboard-admin/specialites/${spec.id_specialite}/edit`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete('specialites', spec.id_specialite)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredSpecialites.length === 0 && (
                  <div className="text-center py-12 text-gray-500">Aucune spécialité trouvée</div>
                )}
              </div>
            )}

            {/* Niveaux */}
            {activeTab === 'niveaux' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spécialité</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groupes</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredNiveaux.map(niveau => (
                      <tr key={niveau.id_niveau} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {niveau.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {niveau.specialite?.nom || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {groupes.filter(g => g.id_niveau === niveau.id_niveau).length} groupe(s)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                          <Link
                            href={`/dashboard-admin/niveaux/${niveau.id_niveau}/edit`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete('niveaux', niveau.id_niveau)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredNiveaux.length === 0 && (
                  <div className="text-center py-12 text-gray-500">Aucun niveau trouvé</div>
                )}
              </div>
            )}

            {/* Groupes */}
            {activeTab === 'groupes' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredGroupes.map(groupe => (
                  <div
                    key={groupe.id_groupe}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{groupe.nom}</h3>
                      <div className="flex gap-2">
                        <Link
                          href={`/dashboard-admin/groupes/${groupe.id_groupe}/edit`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete('groupes', groupe.id_groupe)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      {groupe.niveau?.nom || '-'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {groupe.niveau?.specialite?.nom || '-'}
                    </p>
                  </div>
                ))}
                {filteredGroupes.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    Aucun groupe trouvé
                  </div>
                )}
              </div>
            )}

            {/* Matières */}
            {activeTab === 'matieres' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveau</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enseignant</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMatieres.map(matiere => (
                      <tr key={matiere.id_matiere} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {matiere.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {matiere.niveau?.nom || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {matiere.enseignant ? 
                            `${matiere.enseignant.utilisateur.nom} ${matiere.enseignant.utilisateur.prenom}` 
                            : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                          <Link
                            href={`/dashboard-admin/matieres/${matiere.id_matiere}/edit`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete('matieres', matiere.id_matiere)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredMatieres.length === 0 && (
                  <div className="text-center py-12 text-gray-500">Aucune matière trouvée</div>
                )}
              </div>
            )}

            {/* Salles */}
            {activeTab === 'salles' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSalles.map(salle => (
                  <div
                    key={salle.id_salle}
                    className="bg-white border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{salle.code}</h3>
                      <div className="flex gap-2 items-center">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          {salle.type}
                        </span>
                        <Link
                          href={`/dashboard-admin/salles/${salle.id_salle}/edit`}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete('salles', salle.id_salle)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      👥 Capacité: <span className="font-medium">{salle.capacite} places</span>
                    </p>
                  </div>
                ))}
                {filteredSalles.length === 0 && (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    Aucune salle trouvée
                  </div>
                )}
              </div>
            )}

            {/* Enseignants */}
            {activeTab === 'enseignants' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matricule</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom & Prénom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEnseignants.map(enseignant => (
                      <tr key={enseignant.id_enseignant} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {enseignant.matricule}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {enseignant.utilisateur.nom} {enseignant.utilisateur.prenom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enseignant.utilisateur.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enseignant.departement_nom || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                          <Link
                            href={`/dashboard-admin/enseignants/${enseignant.id_enseignant}/edit`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete('enseignants', enseignant.id_enseignant)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEnseignants.length === 0 && (
                  <div className="text-center py-12 text-gray-500">Aucun enseignant trouvé</div>
                )}
              </div>
            )}

            {/* Étudiants */}
            {activeTab === 'etudiants' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Inscription</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom & Prénom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spécialité</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Niveau</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groupe</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEtudiants.map(etudiant => (
                      <tr key={etudiant.id_etudiant} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {etudiant.numero_inscription}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {etudiant.utilisateur.nom} {etudiant.utilisateur.prenom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {etudiant.utilisateur.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {etudiant.specialite_nom || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {etudiant.niveau_nom || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {etudiant.groupe_nom || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-3">
                          <Link
                            href={`/dashboard-admin/etudiants/${etudiant.id_etudiant}/edit`}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Modifier
                          </Link>
                          <button
                            onClick={() => handleDelete('etudiants', etudiant.id_etudiant)}
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredEtudiants.length === 0 && (
                  <div className="text-center py-12 text-gray-500">Aucun étudiant trouvé</div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}