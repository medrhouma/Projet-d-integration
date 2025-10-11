'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ==================== TYPES ====================
interface Departement {
  id_departement: number;
  nom: string;
  code: string;
  description?: string;
  presentation?: string;
  parcours?: string[];
  laboratoires?: string[];
  debouches?: string[];
  equipe?: {
    total: number;
    composition: string[];
  };
  plan_etude?: string;
  organisation?: string[];
  manifestations?: string;
  enseignants?: string[];
  grades_enseignants?: string[];
}

interface Matiere {
  id_matiere: number;
  nom: string;
  code: string;
  coefficient: number;
  departement?: Departement;
}

interface Salle {
  id_salle: number;
  nom: string;
  capacite: number;
  type: string;
  equipements?: string;
}

interface Enseignant {
  id_enseignant: number;
  utilisateur: {
    nom: string;
    prenom: string;
    email: string;
  };
  grade: string;
  specialite: string;
  departement?: Departement;
}

interface Etudiant {
  id_etudiant: number;
  numero_inscription: string;
  utilisateur: {
    nom: string;
    prenom: string;
    email: string;
  };
  specialite?: string;
  groupe?: string;
}

type TabType = 'departements' | 'matieres' | 'salles' | 'enseignants' | 'etudiants';

export default function ReferentielPublic() {
  const [activeTab, setActiveTab] = useState<TabType>('departements');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les données
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [selectedDept, setSelectedDept] = useState<Departement | null>(null);

  // Charger les données au montage du composant
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Charger les départements
      const deptRes = await fetch('/api/departements');
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        setDepartements(deptData);
      }

      // Charger les matières
      const matRes = await fetch('/api/matieres');
      if (matRes.ok) {
        const matData = await matRes.json();
        setMatieres(matData);
      }

      // Charger les salles
      const salleRes = await fetch('/api/salles');
      if (salleRes.ok) {
        const salleData = await salleRes.json();
        setSalles(salleData);
      }

      // Charger les enseignants
      const ensRes = await fetch('/api/enseignants');
      if (ensRes.ok) {
        const ensData = await ensRes.json();
        setEnseignants(ensData);
      }

      // Charger les étudiants
      const etudRes = await fetch('/api/etudiants');
      if (etudRes.ok) {
        const etudData = await etudRes.json();
        setEtudiants(etudData);
      }
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'departements' as TabType, label: 'Départements', icon: '🏢', count: departements.length },
    { id: 'matieres' as TabType, label: 'Matières', icon: '📚', count: matieres.length },
    { id: 'salles' as TabType, label: 'Salles', icon: '🚪', count: salles.length },
    { id: 'enseignants' as TabType, label: 'Enseignants', icon: '👨‍🏫', count: enseignants.length },
    { id: 'etudiants' as TabType, label: 'Étudiants', icon: '🎓', count: etudiants.length },
  ];

  const filteredDepartements = departements.filter(d => 
    d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMatieres = matieres.filter(m => 
    m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSalles = salles.filter(s => 
    s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnseignants = enseignants.filter(e => 
    e.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.specialite.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEtudiants = etudiants.filter(e => 
    e.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.numero_inscription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📋 Référentiels</h1>
              <p className="mt-1 text-sm text-gray-600">Consultez les informations sur les départements, matières, salles, enseignants et étudiants</p>
            </div>
            <Link 
              href="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Messages d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
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
                  setSelectedDept(null);
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

          {/* Barre de recherche */}
          <div className="p-4 bg-gray-50">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              <>
                {selectedDept ? (
                  <div className="space-y-6">
                    <button
                      onClick={() => setSelectedDept(null)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2 font-medium"
                    >
                      ← Retour à la liste
                    </button>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 rounded-lg border border-blue-200">
                      <div className="flex items-start justify-between mb-6">
                        <h2 className="text-3xl font-bold text-gray-900">{selectedDept.nom}</h2>
                        <span className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg">
                          {selectedDept.code}
                        </span>
                      </div>
                      
                      {selectedDept.parcours && selectedDept.parcours.length > 0 && (
                        <div>
                          <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                            🎓 Spécialités disponibles
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {selectedDept.parcours.map((p, i) => (
                              <div key={i} className="bg-white p-5 rounded-lg shadow-sm border border-blue-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3">
                                  <span className="text-3xl">📚</span>
                                  <span className="font-medium text-gray-800">{p}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {(!selectedDept.parcours || selectedDept.parcours.length === 0) && (
                        <p className="text-gray-500 text-center py-8">Aucune spécialité disponible</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDepartements.map(dept => (
                      <div
                        key={dept.id_departement}
                        className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-lg transition-all cursor-pointer"
                        onClick={() => setSelectedDept(dept)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900">{dept.nom}</h3>
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">
                            {dept.code}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4">
                          {dept.description || 'Cliquez pour voir les spécialités'}
                        </p>
                        
                        <div className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium">
                          <span>Voir les spécialités</span>
                          <span className="ml-2">→</span>
                        </div>
                      </div>
                    ))}
                    {filteredDepartements.length === 0 && (
                      <div className="col-span-full text-center py-12 text-gray-500">
                        Aucun département trouvé
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Matières */}
            {activeTab === 'matieres' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Coefficient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Département
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMatieres.map(matiere => (
                      <tr key={matiere.id_matiere} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {matiere.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {matiere.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {matiere.coefficient}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {matiere.departement?.nom || '-'}
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
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{salle.nom}</h3>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                        {salle.type}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      👥 Capacité: <span className="font-medium">{salle.capacite} places</span>
                    </p>
                    {salle.equipements && (
                      <p className="text-sm text-gray-600">
                        🔧 Équipements: {salle.equipements}
                      </p>
                    )}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom & Prénom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Spécialité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Département
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEnseignants.map(enseignant => (
                      <tr key={enseignant.id_enseignant} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {enseignant.utilisateur.nom} {enseignant.utilisateur.prenom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enseignant.utilisateur.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enseignant.grade}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enseignant.specialite}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {enseignant.departement?.nom || '-'}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        N° Inscription
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom & Prénom
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Spécialité
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Groupe
                      </th>
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
                          {etudiant.specialite || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {etudiant.groupe || '-'}
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
