'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  UserCheck, Calendar, BookOpen, Users, LogOut, 
  Home, User, Clock, FileText, Bell, Award, BarChart3
} from 'lucide-react';
import Link from 'next/link';

interface Utilisateur {
  nom: string;
  prenom: string;
  email: string;
  identifiant: string;
}

interface Enseignant {
  id_enseignant: number;
  matricule: string;
  departement_nom?: string;
  utilisateur?: Utilisateur;
  // Pour les données venant du localStorage
  nom?: string;
  prenom?: string;
  email?: string;
  identifiant?: string;
}

interface StatCard {
  label: string;
  value: number;
  icon: React.JSX.Element;
  color: string;
  bgColor: string;
}

export default function DashboardEnseignant() {
  const router = useRouter();
  const pathname = usePathname();
  const [enseignant, setEnseignant] = useState<Enseignant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [stats, setStats] = useState({
    coursThisWeek: 0,
    totalEtudiants: 0,
    matieres: 0,
    absencesAValider: 0
  });

  useEffect(() => {
    checkAuth();
    // Définir la date côté client pour éviter l'erreur d'hydratation
    setCurrentDate(new Date().toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }));
  }, []);

  const checkAuth = async () => {
    const userData = localStorage.getItem('userData');
    const userRole = localStorage.getItem('userRole');

    if (!userData || userRole !== 'Enseignant') {
      router.push('/login');
      return;
    }

    try {
      const parsedData = JSON.parse(userData);
      console.log('🔍 Données enseignant:', parsedData);
      
      // Charger les données complètes depuis l'API
      if (parsedData.id_enseignant || parsedData.id_utilisateur) {
        const userId = parsedData.id_enseignant || parsedData.id_utilisateur;
        const res = await fetch(`/api/enseignants/${userId}`);
        
        if (res.ok) {
          const data = await res.json();
          console.log('✅ Données enseignant API:', data);
          setEnseignant(data);
        } else {
          setEnseignant(parsedData);
        }
      } else {
        setEnseignant(parsedData);
      }

      // Charger les statistiques
      setStats({
        coursThisWeek: 8,
        totalEtudiants: 145,
        matieres: 3,
        absencesAValider: 5
      });
    } catch (error) {
      console.error('❌ Erreur:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Helper functions
  const getNom = () => {
    return enseignant?.utilisateur?.nom || enseignant?.nom || '';
  };

  const getPrenom = () => {
    return enseignant?.utilisateur?.prenom || enseignant?.prenom || '';
  };

  const getEmail = () => {
    return enseignant?.utilisateur?.email || enseignant?.email || '';
  };

  const getInitiales = () => {
    const prenom = getPrenom();
    const nom = getNom();
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!enseignant) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur de chargement des données</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Tableau de bord', icon: <Home className="w-5 h-5" />, href: '/dashboard-enseignant' },
    { label: 'Mon Profil', icon: <User className="w-5 h-5" />, href: '/dashboard-enseignant/profil' },
    { label: 'Mes Cours', icon: <BookOpen className="w-5 h-5" />, href: '/dashboard-enseignant/cours' },
    { label: 'Emploi du temps', icon: <Calendar className="w-5 h-5" />, href: '/dashboard-enseignant/emploi-temps' },
    { label: 'Mes Étudiants', icon: <Users className="w-5 h-5" />, href: '/dashboard-enseignant/etudiants' },
    { label: 'Absences', icon: <FileText className="w-5 h-5" />, href: '/dashboard-enseignant/absences' },
    { label: 'Notes', icon: <Award className="w-5 h-5" />, href: '/dashboard-enseignant/notes' },
  ];

  const statCards: StatCard[] = [
    { 
      label: 'Cours cette semaine', 
      value: stats.coursThisWeek, 
      icon: <Calendar className="w-6 h-6" />, 
      color: 'green',
      bgColor: 'bg-green-500'
    },
    { 
      label: 'Étudiants', 
      value: stats.totalEtudiants, 
      icon: <Users className="w-6 h-6" />, 
      color: 'blue',
      bgColor: 'bg-blue-500'
    },
    { 
      label: 'Matières', 
      value: stats.matieres, 
      icon: <BookOpen className="w-6 h-6" />, 
      color: 'purple',
      bgColor: 'bg-purple-500'
    },
    { 
      label: 'Absences à valider', 
      value: stats.absencesAValider, 
      icon: <Bell className="w-6 h-6" />, 
      color: 'orange',
      bgColor: 'bg-orange-500'
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-lg flex flex-col">
        <div className="p-6 flex items-center space-x-3 border-b bg-gradient-to-r from-green-600 to-green-700">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md">
            <UserCheck className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Espace Enseignant</h1>
            <p className="text-xs text-green-100">Portail Professeur</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                pathname === item.href
                  ? 'bg-green-50 text-green-700 font-medium shadow-sm border-l-4 border-green-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center space-x-3 mb-4 p-3 bg-white rounded-lg shadow-sm">
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {getInitiales()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {getPrenom()} {getNom()}
              </p>
              <p className="text-xs text-gray-500 truncate">Enseignant</p>
            </div>
          </div>
         
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-all hover:shadow-md"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Bonjour, {getPrenom()} ! 👨‍🏫
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {currentDate || 'Chargement...'}
              </p>
            </div>
            <Link
              href="/dashboard-enseignant/profil"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Mon Profil
            </Link>
          </div>
        </div>

        {/* Carte de profil rapide */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl shadow-lg p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 text-3xl font-bold">
                  {getInitiales()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {getNom()} {getPrenom()}
                </h2>
                <p className="text-green-100 mb-2">
                  Matricule: {enseignant?.matricule || 'N/A'}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {enseignant?.departement_nom || 'Département'}
                  </span>
                  <span>•</span>
                  <span>{stats.matieres} matière{stats.matieres > 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{stats.totalEtudiants} étudiant{stats.totalEtudiants > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            <Link
              href="/dashboard-enseignant/profil"
              className="px-4 py-2 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
            >
              Voir mon profil complet →
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white border rounded-xl shadow-sm p-6 hover:shadow-lg transition-all transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <div className={`text-${stat.color}-600`}>{stat.icon}</div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Prochains cours et Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prochains cours */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Prochains Cours
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Programmation Web</p>
                    <p className="text-sm text-gray-500">Aujourd'hui à 10:00 - DSI21 - Salle A101</p>
                  </div>
                </div>
                <span className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                  Dans 2h
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Base de Données</p>
                    <p className="text-sm text-gray-500">Aujourd'hui à 14:00 - DSI22 - Salle B202</p>
                  </div>
                </div>
                <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                  Dans 6h
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Réseaux Informatiques</p>
                    <p className="text-sm text-gray-500">Demain à 08:00 - RSI21 - Labo 1</p>
                  </div>
                </div>
                <span className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded-full font-medium">
                  Demain
                </span>
              </div>

              <Link
                href="/dashboard-enseignant/emploi-du-temps"
                className="block text-center py-3 text-green-600 hover:text-green-800 font-medium text-sm"
              >
                Voir tout l'emploi du temps →
              </Link>
            </div>
          </div>

          {/* Notifications et tâches */}
          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Notifications & Tâches
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">⚠️ Absences à valider</p>
                  <p className="text-sm text-gray-500">5 absences en attente de validation</p>
                  <Link 
                    href="/dashboard-enseignant/absences"
                    className="text-xs text-red-600 hover:text-red-800 mt-1 inline-block"
                  >
                    Valider maintenant →
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">📝 Notes à saisir</p>
                  <p className="text-sm text-gray-500">Examen DSI21 - À rendre avant le 20/12</p>
                  <p className="text-xs text-gray-400 mt-1">Il y a 1 jour</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">👥 Nouvelle classe assignée</p>
                  <p className="text-sm text-gray-500">Groupe MDW31 ajouté à vos cours</p>
                  <p className="text-xs text-gray-400 mt-1">Il y a 2 jours</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">✅ Emploi du temps mis à jour</p>
                  <p className="text-sm text-gray-500">Nouvel horaire pour le cours de lundi</p>
                  <p className="text-xs text-gray-400 mt-1">Il y a 3 jours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mes classes */}
        <div className="mt-6 bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Mes Classes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">DSI 21</h3>
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">32 étudiants</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Programmation Web</p>
              <p className="text-xs text-gray-500">2ème Année - Développement</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">DSI 22</h3>
                <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">28 étudiants</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Base de Données</p>
              <p className="text-xs text-gray-500">2ème Année - Développement</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">RSI 21</h3>
                <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-full">25 étudiants</span>
              </div>
              <p className="text-sm text-gray-600 mb-2">Réseaux Informatiques</p>
              <p className="text-xs text-gray-500">2ème Année - Réseaux</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}