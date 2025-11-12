'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BookOpen, Calendar, Users, Clock, MapPin, 
  ArrowLeft, Filter, Search, ChevronDown, FileText,
  TrendingUp, Award, CheckCircle
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Cours {
  id: number;
  matiere: string;
  groupe: string;
  niveau: string;
  nbEtudiants: number;
  nbHeures: number;
  salle: string;
  horaire: string;
  jour: string;
  progression: number;
}

export default function MesCours() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMatiere, setFilterMatiere] = useState('all');
  const [filterGroupe, setFilterGroupe] = useState('all');
  const [cours, setCours] = useState<Cours[]>([]);

  useEffect(() => {
    loadCours();
  }, []);

  const loadCours = async () => {
    try {
      setLoading(true);
      
      // Données simulées - À remplacer par un appel API
      const mockCours: Cours[] = [
        {
          id: 1,
          matiere: 'Programmation Web',
          groupe: 'DSI21',
          niveau: '2ème Année',
          nbEtudiants: 32,
          nbHeures: 45,
          salle: 'A101',
          horaire: '10:00 - 11:30',
          jour: 'Lundi',
          progression: 65
        },
        {
          id: 2,
          matiere: 'Programmation Web',
          groupe: 'DSI22',
          niveau: '2ème Année',
          nbEtudiants: 28,
          nbHeures: 45,
          salle: 'A102',
          horaire: '14:00 - 15:30',
          jour: 'Mardi',
          progression: 58
        },
        {
          id: 3,
          matiere: 'Base de Données',
          groupe: 'DSI21',
          niveau: '2ème Année',
          nbEtudiants: 32,
          nbHeures: 42,
          salle: 'B201',
          horaire: '08:30 - 10:00',
          jour: 'Mercredi',
          progression: 72
        },
        {
          id: 4,
          matiere: 'Réseaux Informatiques',
          groupe: 'RSI21',
          niveau: '2ème Année',
          nbEtudiants: 25,
          nbHeures: 36,
          salle: 'Labo 1',
          horaire: '10:00 - 11:30',
          jour: 'Jeudi',
          progression: 45
        },
        {
          id: 5,
          matiere: 'Base de Données',
          groupe: 'DSI22',
          niveau: '2ème Année',
          nbEtudiants: 28,
          nbHeures: 42,
          salle: 'B202',
          horaire: '14:00 - 15:30',
          jour: 'Vendredi',
          progression: 68
        },
      ];

      setCours(mockCours);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtres
  const matieres = Array.from(new Set(cours.map(c => c.matiere)));
  const groupes = Array.from(new Set(cours.map(c => c.groupe)));

  const filteredCours = cours.filter(c => {
    const matchSearch = c.matiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       c.groupe.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMatiere = filterMatiere === 'all' || c.matiere === filterMatiere;
    const matchGroupe = filterGroupe === 'all' || c.groupe === filterGroupe;
    return matchSearch && matchMatiere && matchGroupe;
  });

  // Statistiques
  const stats = {
    totalCours: cours.length,
    totalEtudiants: cours.reduce((sum, c) => sum + c.nbEtudiants, 0),
    totalHeures: cours.reduce((sum, c) => sum + c.nbHeures, 0),
    progressionMoyenne: Math.round(cours.reduce((sum, c) => sum + c.progression, 0) / cours.length)
  };

  if (loading) {
    return <LoadingSpinner color="green" message="Chargement de vos cours..." />;
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
            <BookOpen size={32} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mes Cours
            </h1>
            <p className="text-gray-600">Gérez tous vos cours et suivez la progression</p>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="text-green-600" size={32} />
            <span className="text-4xl font-bold text-gray-900">{stats.totalCours}</span>
          </div>
          <p className="text-gray-600 font-semibold">Total Cours</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Users className="text-green-600" size={32} />
            <span className="text-4xl font-bold text-gray-900">{stats.totalEtudiants}</span>
          </div>
          <p className="text-gray-600 font-semibold">Étudiants</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Clock className="text-green-600" size={32} />
            <span className="text-4xl font-bold text-gray-900">{stats.totalHeures}h</span>
          </div>
          <p className="text-gray-600 font-semibold">Heures Total</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="text-green-600" size={32} />
            <span className="text-4xl font-bold text-gray-900">{stats.progressionMoyenne}%</span>
          </div>
          <p className="text-gray-600 font-semibold">Progression Moy.</p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barre de recherche */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Rechercher un cours ou un groupe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors"
            />
          </div>

          {/* Filtre par matière */}
          <div className="relative">
            <select
              value={filterMatiere}
              onChange={(e) => setFilterMatiere(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors cursor-pointer"
            >
              <option value="all">Toutes les matières</option>
              {matieres.map((matiere, index) => (
                <option key={index} value={matiere}>{matiere}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>

          {/* Filtre par groupe */}
          <div className="relative">
            <select
              value={filterGroupe}
              onChange={(e) => setFilterGroupe(e.target.value)}
              className="appearance-none px-4 py-3 pr-10 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-colors cursor-pointer"
            >
              <option value="all">Tous les groupes</option>
              {groupes.map((groupe, index) => (
                <option key={index} value={groupe}>{groupe}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          </div>

          {/* Bouton réinitialiser */}
          {(searchTerm || filterMatiere !== 'all' || filterGroupe !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterMatiere('all');
                setFilterGroupe('all');
              }}
              className="px-4 py-3 bg-red-100 hover:bg-red-200 border border-red-300 rounded-lg text-red-700 transition-colors"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* Liste des cours */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-green-600 text-white p-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Filter size={24} />
            Cours ({filteredCours.length})
          </h2>
        </div>

        {filteredCours.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="mx-auto mb-4 text-gray-400" size={64} />
            <p className="text-gray-900 text-lg font-semibold">Aucun cours trouvé</p>
            <p className="text-gray-500 text-sm mt-2">Essayez de modifier vos filtres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {filteredCours.map((cours) => (
              <div
                key={cours.id}
                className="bg-white rounded-lg p-6 border border-gray-200 hover:border-green-500 transition-all hover:shadow-md group"
              >
                {/* En-tête du cours */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">
                      {cours.matiere}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium border border-green-200">
                        {cours.groupe}
                      </span>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium border border-gray-200">
                        {cours.niveau}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-900">{cours.progression}%</div>
                    <p className="text-xs text-gray-500">Progression</p>
                  </div>
                </div>

                {/* Barre de progression */}
                <div className="mb-4">
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600 transition-all duration-500"
                      style={{ width: `${cours.progression}%` }}
                    ></div>
                  </div>
                </div>

                {/* Informations du cours */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users size={16} className="text-green-600" />
                    <span className="text-sm">{cours.nbEtudiants} étudiants</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock size={16} className="text-green-600" />
                    <span className="text-sm">{cours.nbHeures}h total</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin size={16} className="text-green-600" />
                    <span className="text-sm">Salle {cours.salle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar size={16} className="text-green-600" />
                    <span className="text-sm">{cours.jour}</span>
                  </div>
                </div>

                {/* Horaire */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">Horaire</span>
                    <span className="text-gray-900 font-semibold">{cours.horaire}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2">
                  <button className="px-3 py-2 bg-green-100 hover:bg-green-200 border border-green-200 rounded-lg text-green-700 text-xs font-medium transition-colors flex items-center justify-center gap-1">
                    <Users size={14} />
                    Étudiants
                  </button>
                  <button className="px-3 py-2 bg-green-100 hover:bg-green-200 border border-green-200 rounded-lg text-green-700 text-xs font-medium transition-colors flex items-center justify-center gap-1">
                    <FileText size={14} />
                    Absences
                  </button>
                  <button className="px-3 py-2 bg-green-100 hover:bg-green-200 border border-green-200 rounded-lg text-green-700 text-xs font-medium transition-colors flex items-center justify-center gap-1">
                    <Award size={14} />
                    Notes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Résumé par matière */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Award size={28} className="text-green-600" />
          Résumé par Matière
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {matieres.map((matiere, index) => {
            const coursByMatiere = cours.filter(c => c.matiere === matiere);
            const nbGroupes = coursByMatiere.length;
            const nbEtudiants = coursByMatiere.reduce((sum, c) => sum + c.nbEtudiants, 0);
            const progressionMoy = Math.round(coursByMatiere.reduce((sum, c) => sum + c.progression, 0) / nbGroupes);

            return (
              <div
                key={index}
                className="bg-green-50 border border-green-200 rounded-lg p-4"
              >
                <h3 className="font-bold text-gray-900 text-lg mb-3">{matiere}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Groupes:</span>
                    <span className="text-gray-900 font-semibold">{nbGroupes}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Étudiants:</span>
                    <span className="text-gray-900 font-semibold">{nbEtudiants}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Progression moy:</span>
                    <span className="text-green-600 font-semibold">{progressionMoy}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
