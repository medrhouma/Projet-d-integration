// app/admin/dashboard/referentiels/page.tsx
'use client';

import { useState, useEffect } from 'react';

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
  id_departement?: number;
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
  id_departement?: number;
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

type EntityType = 'departements' | 'matieres' | 'salles' | 'enseignants' | 'etudiants';

// ==================== DONNÉES MOCKÉES ====================
const mockDepartements: Departement[] = [
  { 
    id_departement: 1, 
    nom: 'Technologies de l\'Informatique', 
    code: 'INFO', 
    description: 'Département de Technologies de l\'Informatique',
    presentation: 'Le département Technologies de l\'Informatique a été créé en Septembre 2007. Il offre une formation en licence appliquée en technologies de l\'informatique répartie sur trois (03) parcours.',
    parcours: [
      'Réseaux & services informatiques (RSI)',
      'Multimédia & développement web (MDW)',
      'Développement des systèmes d\'information (DSI)'
    ],
    laboratoires: [
      '07 laboratoires d\'informatique',
      '01 laboratoire CISCO',
      '01 laboratoire C2i',
      '01 salle de projets'
    ],
    debouches: [
      'Développeur d\'Applications de gestion',
      'Développeur de sites Web',
      'Développeur Multimédia',
      'Développeur de bases de données',
      'Technico-commercial dans la mise en place de solutions logicielles',
      'Webmaster développeur',
      'Webmaster designer',
      'Administrateur de portail web',
      'Intégrateur de technologies web',
      'Administrateur réseaux',
      'Administrateur systèmes',
      'Architecte réseaux et systèmes de communication'
    ],
    equipe: {
      total: 21,
      composition: [
        '02 maîtres technologues en informatique',
        '01 maître technologue en gestion',
        '09 technologues en informatique',
        '03 assistants technologues en informatique',
        '04 professeurs de l\'enseignement supérieur en informatique',
        '03 professeurs de l\'enseignement supérieur en mathématiques, français et anglais'
      ]
    },
    plan_etude: 'Plan d\'étude disponible sur demande',
    organisation: [
      '02 semestres de tronc commun',
      '03 semestres de spécialisation (RSI, MDW et DSI)',
      '01 semestre de stage de fin de parcours',
      'Les étudiants réaliseront 2 stages d\'initiation et de perfectionnement durant respectivement la 1ère et la 2ème année'
    ],
    manifestations: 'Plusieurs manifestations sont organisées chaque année universitaire au profit des enseignants et des étudiants. Des visites industrielles, des sorties et des participations aux manifestations régionales et nationales sont aussi programmées chaque année.'
  },
  { 
    id_departement: 2, 
    nom: 'Génie Civil', 
    code: 'GC', 
    description: 'Département de génie civil',
    presentation: 'Le département de Génie Civil forme des techniciens supérieurs dans les domaines du bâtiment, des travaux publics et de la topographie.',
    parcours: [
      'Bâtiment',
      'Travaux Publics',
      'Topographie'
    ],
    laboratoires: [
      '05 laboratoires de génie civil',
      '01 laboratoire de topographie',
      '01 salle de dessin technique'
    ],
    debouches: [
      'Conducteur de travaux',
      'Technicien en bureau d\'études',
      'Géomètre-topographe',
      'Chef de chantier',
      'Métreur-vérificateur',
      'Dessinateur en bâtiment'
    ],
    equipe: {
      total: 18,
      composition: [
        '02 maîtres technologues en génie civil',
        '08 technologues en génie civil',
        '03 assistants technologues',
        '03 professeurs de l\'enseignement supérieur',
        '02 professeurs en mathématiques et physique'
      ]
    },
    organisation: [
      '02 semestres de tronc commun',
      '03 semestres de spécialisation (Bâtiment, Travaux Publics, Topographie)',
      '01 semestre de stage de fin d\'études',
      'Stages pratiques sur chantiers'
    ]
  },
  { 
    id_departement: 3, 
    nom: 'Génie Électrique', 
    code: 'GE', 
    description: 'Département de génie électrique',
    presentation: 'Le département de Génie Électrique forme des techniciens supérieurs spécialisés en automatisme industriel, électronique et systèmes électriques.',
    parcours: [
      'Automatisme Industriel',
      'Électronique & Instrumentation',
      'Systèmes Électriques'
    ],
    laboratoires: [
      '06 laboratoires d\'électronique',
      '02 laboratoires d\'automatisme',
      '01 laboratoire de systèmes électriques',
      '01 atelier d\'instrumentation'
    ],
    debouches: [
      'Technicien en automatisme',
      'Technicien en électronique industrielle',
      'Technicien en maintenance électrique',
      'Technicien en instrumentation',
      'Superviseur de systèmes automatisés',
      'Technicien en énergies renouvelables'
    ],
    equipe: {
      total: 19,
      composition: [
        '02 maîtres technologues en génie électrique',
        '09 technologues en génie électrique',
        '03 assistants technologues',
        '03 professeurs de l\'enseignement supérieur',
        '02 professeurs en mathématiques et physique'
      ]
    },
    organisation: [
      '02 semestres de tronc commun',
      '03 semestres de spécialisation',
      '01 semestre de stage de fin d\'études',
      'Projets industriels en partenariat avec des entreprises'
    ]
  },
  { 
    id_departement: 4, 
    nom: 'Génie Mécanique', 
    code: 'GM', 
    description: 'Département de Génie Mécanique',
    presentation: 'Le département de Génie Mécanique assure la formation de techniciens supérieurs en conception mécanique, maintenance industrielle et production mécanique.',
    parcours: [
      'Conception Mécanique',
      'Maintenance Industrielle',
      'Production Mécanique'
    ],
    laboratoires: [
      '05 laboratoires de mécanique',
      '02 ateliers d\'usinage',
      '01 laboratoire de CAO/DAO',
      '01 laboratoire de métrologie'
    ],
    debouches: [
      'Technicien en conception mécanique',
      'Technicien en maintenance industrielle',
      'Technicien méthodes',
      'Dessinateur industriel',
      'Responsable production',
      'Technicien qualité'
    ],
    equipe: {
      total: 17,
      composition: [
        '02 maîtres technologues en génie mécanique',
        '08 technologues en génie mécanique',
        '02 assistants technologues',
        '03 professeurs de l\'enseignement supérieur',
        '02 professeurs en mathématiques et physique'
      ]
    },
    organisation: [
      '02 semestres de tronc commun',
      '03 semestres de spécialisation',
      '01 semestre de stage de fin d\'études',
      'Projets de fin d\'études en collaboration avec l\'industrie'
    ]
  }
];

const mockMatieres: Matiere[] = [
  { id_matiere: 1, nom: 'Programmation Web', code: 'INF201', coefficient: 3, id_departement: 1, departement: mockDepartements[0] },
  { id_matiere: 2, nom: 'Base de Données', code: 'INF202', coefficient: 3, id_departement: 1, departement: mockDepartements[0] },
  { id_matiere: 3, nom: 'Résistance des Matériaux', code: 'GC101', coefficient: 4, id_departement: 2, departement: mockDepartements[1] },
];

const mockSalles: Salle[] = [
  { id_salle: 1, nom: 'LI01', capacite: 30, type: 'Salle de cours', equipements: 'Projecteur, Tableau' },
  { id_salle: 2, nom: 'SI01', capacite: 50, type: 'Amphithéâtre', equipements: 'Projecteur, Sono, Écran' },
  { id_salle: 3, nom: 'SGO1', capacite: 25, type: 'Laboratoire', equipements: '25 PC, Projecteur' },
];

const mockEnseignants: Enseignant[] = [
  { 
    id_enseignant: 1, 
    utilisateur: { nom: 'Benali', prenom: 'Ahmed', email: 'ahmed.benali@university.tn' },
    grade: 'Professeur',
    specialite: 'Développement Web',
    id_departement: 1,
    departement: mockDepartements[0]
  },
  { 
    id_enseignant: 2, 
    utilisateur: { nom: 'Trabelsi', prenom: 'Fatma', email: 'fatma.trabelsi@university.tn' },
    grade: 'Maître Assistant',
    specialite: 'Base de Données',
    id_departement: 1,
    departement: mockDepartements[0]
  },
];

const mockEtudiants: Etudiant[] = [
  { 
    id_etudiant: 1, 
    numero_inscription: '202401',
    utilisateur: { nom: 'Mansour', prenom: 'Mohamed', email: 'mohamed.mansour@student.tn' },
    specialite: 'Informatique',
    groupe: 'G1'
  },
  { 
    id_etudiant: 2, 
    numero_inscription: '202402',
    utilisateur: { nom: 'Gharbi', prenom: 'Salma', email: 'salma.gharbi@student.tn' },
    specialite: 'Informatique',
    groupe: 'G1'
  },
  {
    id_etudiant: 3,
    numero_inscription: '202403',
    utilisateur: { nom: 'Kacem', prenom: 'Youssef', email: 'asssss@sss.tn' }, 
    specialite: 'Génie Civil',
    groupe: 'G2'
  }
];

// ==================== COMPOSANT PRINCIPAL ====================
export default function ReferentielsCRUD() {
  const [activeTab, setActiveTab] = useState<EntityType>('departements');
  const [searchTerm, setSearchTerm] = useState('');
  
  // États pour chaque entité
  const [departements, setDepartements] = useState<Departement[]>(mockDepartements);
  const [matieres, setMatieres] = useState<Matiere[]>(mockMatieres);
  const [salles, setSalles] = useState<Salle[]>(mockSalles);
  const [enseignants, setEnseignants] = useState<Enseignant[]>(mockEnseignants);
  const [etudiants, setEtudiants] = useState<Etudiant[]>(mockEtudiants);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Auto-hide messages
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const tabs = [
    { id: 'departements' as EntityType, label: 'Départements', icon: '🏢' },
    { id: 'matieres' as EntityType, label: 'Matières', icon: '📚' },
    { id: 'salles' as EntityType, label: 'Salles', icon: '🚪' },
    { id: 'enseignants' as EntityType, label: 'Enseignants', icon: '👨‍🏫' },
    { id: 'etudiants' as EntityType, label: 'Étudiants', icon: '🎓' },
  ];

  const handleTabChange = (tab: EntityType) => {
    setActiveTab(tab);
    setShowForm(false);
    setEditingId(null);
    setSearchTerm('');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'departements':
        return <DepartementsManager 
          data={departements} 
          setData={setDepartements}
          searchTerm={searchTerm}
          showForm={showForm}
          setShowForm={setShowForm}
          editingId={editingId}
          setEditingId={setEditingId}
          setSuccess={setSuccess}
          setError={setError}
        />;
      case 'matieres':
        return <MatieresManager 
          data={matieres} 
          setData={setMatieres}
          departements={departements}
          searchTerm={searchTerm}
          showForm={showForm}
          setShowForm={setShowForm}
          editingId={editingId}
          setEditingId={setEditingId}
          setSuccess={setSuccess}
          setError={setError}
        />;
      case 'salles':
        return <SallesManager 
          data={salles} 
          setData={setSalles}
          searchTerm={searchTerm}
          showForm={showForm}
          setShowForm={setShowForm}
          editingId={editingId}
          setEditingId={setEditingId}
          setSuccess={setSuccess}
          setError={setError}
        />;
      case 'enseignants':
        return <EnseignantsManager 
          data={enseignants} 
          setData={setEnseignants}
          departements={departements}
          searchTerm={searchTerm}
          showForm={showForm}
          setShowForm={setShowForm}
          editingId={editingId}
          setEditingId={setEditingId}
          setSuccess={setSuccess}
          setError={setError}
        />;
      case 'etudiants':
        return <EtudiantsManager 
          data={etudiants} 
          setData={setEtudiants}
          searchTerm={searchTerm}
          showForm={showForm}
          setShowForm={setShowForm}
          editingId={editingId}
          setEditingId={setEditingId}
          setSuccess={setSuccess}
          setError={setError}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des Référentiels</h1>
          <p className="text-gray-600">Gérez les départements, matières, salles, enseignants et étudiants</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-red-700 hover:text-red-900">✕</button>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess(null)} className="text-green-700 hover:text-green-900">✕</button>
          </div>
        )}

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-md mb-6 overflow-hidden">
          <div className="flex border-b overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Barre de recherche et actions */}
          <div className="p-4 bg-gray-50 flex gap-4 items-center">
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              + Ajouter
            </button>
          </div>
        </div>

        {/* Contenu dynamique */}
        <div className="bg-white rounded-lg shadow-md">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ==================== DÉPARTEMENTS MANAGER ====================
interface ManagerProps<T> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  searchTerm: string;
  showForm: boolean;
  setShowForm: (show: boolean) => void;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  setSuccess: (msg: string) => void;
  setError: (msg: string) => void;
}

function DepartementsManager({ 
  data, setData, searchTerm, showForm, setShowForm, editingId, setEditingId, setSuccess, setError 
}: ManagerProps<Departement>) {
  const [formData, setFormData] = useState({ 
    nom: '', 
    code: '', 
    description: '',
    presentation: '',
    parcours: '',
    laboratoires: '',
    debouches: '',
    equipe_total: '',
    equipe_composition: '',
    plan_etude: '',
    organisation: '',
    manifestations: '',
    enseignants: '',
    grades_enseignants: ''
  });
  const [viewingId, setViewingId] = useState<number | null>(null);

  const filteredData = data.filter(d => 
    d.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.code) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const departementData: Departement = {
      id_departement: editingId || Math.max(0, ...data.map(d => d.id_departement)) + 1,
      nom: formData.nom,
      code: formData.code,
      description: formData.description || undefined,
      presentation: formData.presentation || undefined,
      parcours: formData.parcours ? formData.parcours.split('\n').filter(p => p.trim()) : undefined,
      laboratoires: formData.laboratoires ? formData.laboratoires.split('\n').filter(l => l.trim()) : undefined,
      debouches: formData.debouches ? formData.debouches.split('\n').filter(d => d.trim()) : undefined,
      equipe: formData.equipe_total && formData.equipe_composition ? {
        total: parseInt(formData.equipe_total),
        composition: formData.equipe_composition.split('\n').filter(c => c.trim())
      } : undefined,
      plan_etude: formData.plan_etude || undefined,
      organisation: formData.organisation ? formData.organisation.split('\n').filter(o => o.trim()) : undefined,
      manifestations: formData.manifestations || undefined
    };

    if (editingId) {
      setData(prev => prev.map(item => 
        item.id_departement === editingId ? departementData : item
      ));
      setSuccess('Département modifié avec succès');
    } else {
      setData(prev => [...prev, departementData]);
      setSuccess('Département ajouté avec succès');
    }
    resetForm();
  };

  const handleEdit = (item: Departement) => {
    setFormData({ 
      nom: item.nom, 
      code: item.code, 
      description: item.description || '',
      presentation: item.presentation || '',
      parcours: item.parcours?.join('\n') || '',
      laboratoires: item.laboratoires?.join('\n') || '',
      debouches: item.debouches?.join('\n') || '',
      equipe_total: item.equipe?.total.toString() || '',
      equipe_composition: item.equipe?.composition.join('\n') || '',
      plan_etude: item.plan_etude || '',
      organisation: item.organisation?.join('\n') || '',
      manifestations: item.manifestations || ''
    });
    setEditingId(item.id_departement);
    setShowForm(true);
    setViewingId(null);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) return;
    setData(prev => prev.filter(item => item.id_departement !== id));
    setSuccess('Département supprimé avec succès');
  };

  const resetForm = () => {
    setFormData({ 
      nom: '', 
      code: '', 
      description: '',
      presentation: '',
      parcours: '',
      laboratoires: '',
      debouches: '',
      equipe_total: '',
      equipe_composition: '',
      plan_etude: '',
      organisation: '',
      manifestations: ''
    });
    setEditingId(null);
    setShowForm(false);
  };

  const viewingDept = viewingId ? data.find(d => d.id_departement === viewingId) : null;

  return (
    <div className="p-6">
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier le département' : 'Ajouter un département'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Présentation</label>
              <textarea
                value={formData.presentation}
                onChange={(e) => setFormData({...formData, presentation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Description de la présentation du département"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Parcours (un par ligne)</label>
              <textarea
                value={formData.parcours}
                onChange={(e) => setFormData({...formData, parcours: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ex: Réseaux & services informatiques (RSI)"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Laboratoires (un par ligne)</label>
              <textarea
                value={formData.laboratoires}
                onChange={(e) => setFormData({...formData, laboratoires: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ex: 07 laboratoires d'informatique"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Débouchés (un par ligne)</label>
              <textarea
                value={formData.debouches}
                onChange={(e) => setFormData({...formData, debouches: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Ex: Développeur d'Applications de gestion"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Équipe - Total enseignants</label>
              <input
                type="number"
                value={formData.equipe_total}
                onChange={(e) => setFormData({...formData, equipe_total: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 21"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Équipe - Composition (un par ligne)</label>
              <textarea
                value={formData.equipe_composition}
                onChange={(e) => setFormData({...formData, equipe_composition: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ex: 02 maîtres technologues en informatique"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Plan d'étude</label>
              <textarea
                value={formData.plan_etude}
                onChange={(e) => setFormData({...formData, plan_etude: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Organisation des études (un par ligne)</label>
              <textarea
                value={formData.organisation}
                onChange={(e) => setFormData({...formData, organisation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Ex: 02 semestres de tronc commun"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Manifestations</label>
              <textarea
                value={formData.manifestations}
                onChange={(e) => setFormData({...formData, manifestations: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              Annuler
            </button>
          </div>
        </form>
      )}

      {viewingDept && (
        <div className="mb-6 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">{viewingDept.nom}</h3>
            <button onClick={() => setViewingId(null)} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>
          
          {viewingDept.presentation && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">📋 Présentation</h4>
              <p className="text-gray-700">{viewingDept.presentation}</p>
            </div>
          )}
          
          {viewingDept.parcours && viewingDept.parcours.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">🎓 Parcours</h4>
              <ul className="list-disc list-inside text-gray-700">
                {viewingDept.parcours.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
          
          {viewingDept.laboratoires && viewingDept.laboratoires.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">🔬 Laboratoires</h4>
              <ul className="list-disc list-inside text-gray-700">
                {viewingDept.laboratoires.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </div>
          )}
          
          {viewingDept.debouches && viewingDept.debouches.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">💼 Débouchés</h4>
              <ul className="list-disc list-inside text-gray-700">
                {viewingDept.debouches.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </div>
          )}
          
          {viewingDept.equipe && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">👥 Équipe pédagogique ({viewingDept.equipe.total} enseignants)</h4>
              <ul className="list-disc list-inside text-gray-700">
                {viewingDept.equipe.composition.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          )}
          
          {viewingDept.organisation && viewingDept.organisation.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">📅 Organisation des études</h4>
              <ul className="list-disc list-inside text-gray-700">
                {viewingDept.organisation.map((o, i) => <li key={i}>{o}</li>)}
              </ul>
            </div>
          )}
          
          {viewingDept.manifestations && (
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">🎉 Manifestations</h4>
              <p className="text-gray-700">{viewingDept.manifestations}</p>
            </div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map(item => (
              <tr key={item.id_departement} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nom}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.code}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.description || '-'}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button onClick={() => setViewingId(item.id_departement)} className="text-green-600 hover:text-green-900">Détails</button>
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Modifier</button>
                  <button onClick={() => handleDelete(item.id_departement)} className="text-red-600 hover:text-red-900">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">Aucun département trouvé</div>
        )}
      </div>
    </div>
  );
}

// ==================== MATIÈRES MANAGER ====================
interface MatieresManagerProps extends ManagerProps<Matiere> {
  departements: Departement[];
}

function MatieresManager({ 
  data, setData, departements, searchTerm, showForm, setShowForm, editingId, setEditingId, setSuccess, setError 
}: MatieresManagerProps) {
  const [formData, setFormData] = useState({ nom: '', code: '', coefficient: 1, id_departement: '' });

  const filteredData = data.filter(m => 
    m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.code) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const departement = formData.id_departement 
      ? departements.find(d => d.id_departement === parseInt(formData.id_departement))
      : undefined;

    if (editingId) {
      setData(prev => prev.map(item => 
        item.id_matiere === editingId 
          ? { ...item, ...formData, coefficient: Number(formData.coefficient), departement, id_departement: formData.id_departement ? parseInt(formData.id_departement) : undefined } 
          : item
      ));
      setSuccess('Matière modifiée avec succès');
    } else {
      const newItem: Matiere = {
        id_matiere: Math.max(0, ...data.map(m => m.id_matiere)) + 1,
        nom: formData.nom,
        code: formData.code,
        coefficient: Number(formData.coefficient),
        departement,
        id_departement: formData.id_departement ? parseInt(formData.id_departement) : undefined
      };
      setData(prev => [...prev, newItem]);
      setSuccess('Matière ajoutée avec succès');
    }
    resetForm();
  };

  const handleEdit = (item: Matiere) => {
    setFormData({ 
      nom: item.nom, 
      code: item.code, 
      coefficient: item.coefficient,
      id_departement: item.id_departement?.toString() || ''
    });
    setEditingId(item.id_matiere);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette matière ?')) return;
    setData(prev => prev.filter(item => item.id_matiere !== id));
    setSuccess('Matière supprimée avec succès');
  };

  const resetForm = () => {
    setFormData({ nom: '', code: '', coefficient: 1, id_departement: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier la matière' : 'Ajouter une matière'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code *</label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coefficient *</label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.coefficient}
                onChange={(e) => setFormData({...formData, coefficient: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <select
                value={formData.id_departement}
                onChange={(e) => setFormData({...formData, id_departement: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un département</option>
                {departements.map(d => (
                  <option key={d.id_departement} value={d.id_departement}>{d.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Coefficient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map(item => (
              <tr key={item.id_matiere} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nom}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.code}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.coefficient}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.departement?.nom || '-'}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Modifier</button>
                  <button onClick={() => handleDelete(item.id_matiere)} className="text-red-600 hover:text-red-900">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">Aucune matière trouvée</div>
        )}
      </div>
    </div>
  );
}

// ==================== SALLES MANAGER ====================
function SallesManager({ 
  data, setData, searchTerm, showForm, setShowForm, editingId, setEditingId, setSuccess, setError 
}: ManagerProps<Salle>) {
  const [formData, setFormData] = useState({ nom: '', capacite: 20, type: 'Salle de cours', equipements: '' });

  const filteredData = data.filter(s => 
    s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingId) {
      setData(prev => prev.map(item => 
        item.id_salle === editingId 
          ? { ...item, ...formData, capacite: Number(formData.capacite) } 
          : item
      ));
      setSuccess('Salle modifiée avec succès');
    } else {
      const newItem: Salle = {
        id_salle: Math.max(0, ...data.map(s => s.id_salle)) + 1,
        ...formData,
        capacite: Number(formData.capacite)
      };
      setData(prev => [...prev, newItem]);
      setSuccess('Salle ajoutée avec succès');
    }
    resetForm();
  };

  const handleEdit = (item: Salle) => {
    setFormData({ 
      nom: item.nom, 
      capacite: item.capacite,
      type: item.type,
      equipements: item.equipements || ''
    });
    setEditingId(item.id_salle);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;
    setData(prev => prev.filter(item => item.id_salle !== id));
    setSuccess('Salle supprimée avec succès');
  };

  const resetForm = () => {
    setFormData({ nom: '', capacite: 20, type: 'Salle de cours', equipements: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier la salle' : 'Ajouter une salle'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacité *</label>
              <input
                type="number"
                min="1"
                value={formData.capacite}
                onChange={(e) => setFormData({...formData, capacite: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Salle de cours">Salle de cours</option>
                <option value="Amphithéâtre">Amphithéâtre</option>
                <option value="Laboratoire">Laboratoire</option>
                <option value="TD">TD</option>
                <option value="TP">TP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Équipements</label>
              <input
                type="text"
                value={formData.equipements}
                onChange={(e) => setFormData({...formData, equipements: e.target.value})}
                placeholder="Ex: Projecteur, Tableau"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Équipements</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map(item => (
              <tr key={item.id_salle} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.nom}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.capacite}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.type}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.equipements || '-'}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Modifier</button>
                  <button onClick={() => handleDelete(item.id_salle)} className="text-red-600 hover:text-red-900">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">Aucune salle trouvée</div>
        )}
      </div>
    </div>
  );
}

// ==================== ENSEIGNANTS MANAGER ====================
interface EnseignantsManagerProps extends ManagerProps<Enseignant> {
  departements: Departement[];
}

function EnseignantsManager({ 
  data, setData, departements, searchTerm, showForm, setShowForm, editingId, setEditingId, setSuccess, setError 
}: EnseignantsManagerProps) {
  const [formData, setFormData] = useState({ 
    nom: '', prenom: '', email: '', grade: 'Maître Assistant', specialite: '', id_departement: '' 
  });

  const filteredData = data.filter(e => 
    e.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.specialite.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.prenom || !formData.email) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const departement = formData.id_departement 
      ? departements.find(d => d.id_departement === parseInt(formData.id_departement))
      : undefined;

    if (editingId) {
      setData(prev => prev.map(item => 
        item.id_enseignant === editingId 
          ? { 
              ...item, 
              utilisateur: { nom: formData.nom, prenom: formData.prenom, email: formData.email },
              grade: formData.grade,
              specialite: formData.specialite,
              departement,
              id_departement: formData.id_departement ? parseInt(formData.id_departement) : undefined
            } 
          : item
      ));
      setSuccess('Enseignant modifié avec succès');
    } else {
      const newItem: Enseignant = {
        id_enseignant: Math.max(0, ...data.map(e => e.id_enseignant)) + 1,
        utilisateur: { nom: formData.nom, prenom: formData.prenom, email: formData.email },
        grade: formData.grade,
        specialite: formData.specialite,
        departement,
        id_departement: formData.id_departement ? parseInt(formData.id_departement) : undefined
      };
      setData(prev => [...prev, newItem]);
      setSuccess('Enseignant ajouté avec succès');
    }
    resetForm();
  };

  const handleEdit = (item: Enseignant) => {
    setFormData({ 
      nom: item.utilisateur.nom,
      prenom: item.utilisateur.prenom,
      email: item.utilisateur.email,
      grade: item.grade,
      specialite: item.specialite,
      id_departement: item.id_departement?.toString() || ''
    });
    setEditingId(item.id_enseignant);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enseignant ?')) return;
    setData(prev => prev.filter(item => item.id_enseignant !== id));
    setSuccess('Enseignant supprimé avec succès');
  };

  const resetForm = () => {
    setFormData({ nom: '', prenom: '', email: '', grade: 'Maître Assistant', specialite: '', id_departement: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier l\'enseignant' : 'Ajouter un enseignant'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
              <select
                value={formData.grade}
                onChange={(e) => setFormData({...formData, grade: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Professeur">Professeur</option>
                <option value="Maître de Conférences">Maître de Conférences</option>
                <option value="Maître Assistant">Maître Assistant</option>
                <option value="Assistant">Assistant</option>
                <option value="Vacataire">Vacataire</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité *</label>
              <input
                type="text"
                value={formData.specialite}
                onChange={(e) => setFormData({...formData, specialite: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <select
                value={formData.id_departement}
                onChange={(e) => setFormData({...formData, id_departement: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un département</option>
                {departements.map(d => (
                  <option key={d.id_departement} value={d.id_departement}>{d.nom}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom & Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spécialité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Département</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map(item => (
              <tr key={item.id_enseignant} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {item.utilisateur.nom} {item.utilisateur.prenom}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.utilisateur.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.grade}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.specialite}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.departement?.nom || '-'}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Modifier</button>
                  <button onClick={() => handleDelete(item.id_enseignant)} className="text-red-600 hover:text-red-900">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">Aucun enseignant trouvé</div>
        )}
      </div>
    </div>
  );
}

// ==================== ÉTUDIANTS MANAGER ====================
function EtudiantsManager({ 
  data, setData, searchTerm, showForm, setShowForm, editingId, setEditingId, setSuccess, setError 
}: ManagerProps<Etudiant>) {
  const [formData, setFormData] = useState({ 
    nom: '', prenom: '', email: '', numero_inscription: '', specialite: '', groupe: '' 
  });

  const filteredData = data.filter(e => 
    e.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.utilisateur.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.utilisateur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.numero_inscription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.prenom || !formData.email || !formData.numero_inscription) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingId) {
      setData(prev => prev.map(item => 
        item.id_etudiant === editingId 
          ? { 
              ...item, 
              utilisateur: { nom: formData.nom, prenom: formData.prenom, email: formData.email },
              numero_inscription: formData.numero_inscription,
              specialite: formData.specialite || undefined,
              groupe: formData.groupe || undefined
            } 
          : item
      ));
      setSuccess('Étudiant modifié avec succès');
    } else {
      const newItem: Etudiant = {
        id_etudiant: Math.max(0, ...data.map(e => e.id_etudiant)) + 1,
        utilisateur: { nom: formData.nom, prenom: formData.prenom, email: formData.email },
        numero_inscription: formData.numero_inscription,
        specialite: formData.specialite || undefined,
        groupe: formData.groupe || undefined
      };
      setData(prev => [...prev, newItem]);
      setSuccess('Étudiant ajouté avec succès');
    }
    resetForm();
  };

  const handleEdit = (item: Etudiant) => {
    setFormData({ 
      nom: item.utilisateur.nom,
      prenom: item.utilisateur.prenom,
      email: item.utilisateur.email,
      numero_inscription: item.numero_inscription,
      specialite: item.specialite || '',
      groupe: item.groupe || ''
    });
    setEditingId(item.id_etudiant);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) return;
    setData(prev => prev.filter(item => item.id_etudiant !== id));
    setSuccess('Étudiant supprimé avec succès');
  };

  const resetForm = () => {
    setFormData({ nom: '', prenom: '', email: '', numero_inscription: '', specialite: '', groupe: '' });
    setEditingId(null);
    setShowForm(false);
  };

  return (
    <div className="p-6">
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prénom *</label>
              <input
                type="text"
                value={formData.prenom}
                onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numéro d'inscription *</label>
              <input
                type="text"
                value={formData.numero_inscription}
                onChange={(e) => setFormData({...formData, numero_inscription: e.target.value})}
                maxLength={6}
                placeholder="Ex: 202401"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spécialité</label>
              <input
                type="text"
                value={formData.specialite}
                onChange={(e) => setFormData({...formData, specialite: e.target.value})}
                placeholder="Ex: Informatique"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Groupe</label>
              <input
                type="text"
                value={formData.groupe}
                onChange={(e) => setFormData({...formData, groupe: e.target.value})}
                placeholder="Ex: G1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              {editingId ? 'Modifier' : 'Ajouter'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Inscription</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom & Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spécialité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groupe</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map(item => (
              <tr key={item.id_etudiant} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.numero_inscription}</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {item.utilisateur.nom} {item.utilisateur.prenom}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{item.utilisateur.email}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.specialite || '-'}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{item.groupe || '-'}</td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-900">Modifier</button>
                  <button onClick={() => handleDelete(item.id_etudiant)} className="text-red-600 hover:text-red-900">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">Aucun étudiant trouvé</div>
        )}
      </div>
    </div>
  );
}