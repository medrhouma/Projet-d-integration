'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Building, Users, Calendar, FileText, AlertTriangle, Settings, LogOut, 
  Home, BarChart3, GraduationCap, BookOpen, DoorOpen, UserCheck, Clock,
  TrendingUp, Activity, Mail
} from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Stats {
  etudiants: number;
  enseignants: number;
  departements: number;
  specialites: number;
  niveaux: number;
  groupes: number;
  matieres: number;
  salles: number;
  coursThisWeek: number;
  absencesToday: number;
}

export default function DashboardAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Stats>({
    etudiants: 0,
    enseignants: 0,
    departements: 0,
    specialites: 0,
    niveaux: 0,
    groupes: 0,
    matieres: 0,
    salles: 0,
    coursThisWeek: 0,
    absencesToday: 0
  });

  useEffect(() => {
    // Récupération des données admin depuis le localStorage
    const userData = localStorage.getItem('userData');
    const userRole = localStorage.getItem('userRole');

    if (!userData || userRole !== 'Admin') {
      router.push('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
      loadStatistics();
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const loadStatistics = async () => {
    try {
      const [
        etudiantsRes,
        enseignantsRes,
        departementsRes,
        specialitesRes,
        niveauxRes,
        groupesRes,
        matieresRes,
        sallesRes
      ] = await Promise.all([
        fetch('/api/etudiants'),
        fetch('/api/enseignants'),
        fetch('/api/departements'),
        fetch('/api/specialites'),
        fetch('/api/niveaux'),
        fetch('/api/groupes'),
        fetch('/api/matieres'),
        fetch('/api/salles')
      ]);

      const [
        etudiants,
        enseignants,
        departements,
        specialites,
        niveaux,
        groupes,
        matieres,
        salles
      ] = await Promise.all([
        etudiantsRes.json(),
        enseignantsRes.json(),
        departementsRes.json(),
        specialitesRes.json(),
        niveauxRes.json(),
        groupesRes.json(),
        matieresRes.json(),
        sallesRes.json()
      ]);

      setStats({
        etudiants: etudiants.length || 0,
        enseignants: enseignants.length || 0,
        departements: departements.length || 0,
        specialites: specialites.length || 0,
        niveaux: niveaux.length || 0,
        groupes: groupes.length || 0,
        matieres: matieres.length || 0,
        salles: salles.length || 0,
        coursThisWeek: 0,
        absencesToday: 0
      });
    } catch (error) {
      console.error('Erreur chargement statistiques:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isLoading) {
    return <LoadingSpinner color="indigo" message="Chargement du tableau de bord..." />;
  }

  const menuItems = [
    { label: 'Tableau de bord', icon: <Home className="w-5 h-5" />, href: '/dashboard-admin' },
    { label: 'Référentiels', icon: <Building className="w-5 h-5" />, href: '/dashboard-admin/referentiels' },
    { label: 'Étudiants', icon: <GraduationCap className="w-5 h-5" />, href: '/dashboard-admin/etudiants' },
    { label: 'Enseignants', icon: <UserCheck className="w-5 h-5" />, href: '/dashboard-admin/enseignants' },
    { label: 'Emplois du temps', icon: <Calendar className="w-5 h-5" />, href: '/dashboard-admin/emplois-du-temps' },
    { label: 'Absences', icon: <AlertTriangle className="w-5 h-5" />, href: '/dashboard-admin/absences' },
    { label: 'Rapports', icon: <FileText className="w-5 h-5" />, href: '/dashboard-admin/rapports' },
    {label : 'Messages', icon: <Mail className="w-5 h-5" />, href: '/dashboard-admin/messagerie' },
    { label: 'Paramètres', icon: <Settings className="w-5 h-5" />, href: '/dashboard-admin/parametres' },
  ];

  const mainStats = [
    { 
      label: 'Étudiants', 
      value: stats.etudiants, 
      icon: <GraduationCap className="w-6 h-6" />, 
      color: 'blue',
      bgColor: 'bg-blue-500',
      lightBg: 'bg-blue-50',
      href: '/dashboard-admin/etudiants'
    },
    { 
      label: 'Enseignants', 
      value: stats.enseignants, 
      icon: <UserCheck className="w-6 h-6" />, 
      color: 'green',
      bgColor: 'bg-green-500',
      lightBg: 'bg-green-50',
      href: '/dashboard-admin/enseignants'
    },
    { 
      label: 'Départements', 
      value: stats.departements, 
      icon: <Building className="w-6 h-6" />, 
      color: 'purple',
      bgColor: 'bg-purple-500',
      lightBg: 'bg-purple-50',
      href: '/dashboard-admin/referentiels'
    },
    { 
      label: 'Matières', 
      value: stats.matieres, 
      icon: <BookOpen className="w-6 h-6" />, 
      color: 'orange',
      bgColor: 'bg-orange-500',
      lightBg: 'bg-orange-50',
      href: '/dashboard-admin/referentiels'
    },
  ];

  const secondaryStats = [
    { 
      label: 'Spécialités', 
      value: stats.specialites, 
      icon: '📚',
      href: '/dashboard-admin/referentiels'
    },
    { 
      label: 'Niveaux', 
      value: stats.niveaux, 
      icon: '📊',
      href: '/dashboard-admin/referentiels'
    },
    { 
      label: 'Groupes', 
      value: stats.groupes, 
      icon: '👥',
      href: '/dashboard-admin/referentiels'
    },
    { 
      label: 'Salles', 
      value: stats.salles, 
      icon: '🚪',
      href: '/dashboard-admin/referentiels'
    },
  ];

  const quickActions = [
    { 
      label: 'Ajouter un étudiant', 
      href: '/dashboard-admin/etudiants/nouveau', 
      color: 'blue',
      icon: <GraduationCap className="w-5 h-5" />
    },
    { 
      label: 'Ajouter un enseignant', 
      href: '/dashboard-admin/enseignants/nouveau', 
      color: 'green',
      icon: <UserCheck className="w-5 h-5" />
    },
    { 
      label: 'Gérer les référentiels', 
      href: '/dashboard-admin/referentiels', 
      color: 'purple',
      icon: <Building className="w-5 h-5" />
    },
    { 
      label: 'Planifier un cours', 
      href: '/dashboard-admin/emplois-du-temps/nouveau', 
      color: 'orange',
      icon: <Calendar className="w-5 h-5" />
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
              <p className="text-xs text-gray-500">Gestion École</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                pathname === item.href
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-gray-500 truncate">Administrateur</p>
            </div>
          </div>
         
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto bg-white">
        {/* Header */}
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Tableau de Bord
              </h1>
              <p className="text-gray-600">
                Bienvenue, {user?.prenom} {user?.nom}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Aujourd'hui</p>
              <p className="text-base font-medium text-gray-900">
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  day: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Statistiques principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {mainStats.map((stat, index) => (
            <Link
              key={index}
              href={stat.href}
              className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <div className="text-blue-600">{stat.icon}</div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Statistiques secondaires */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {secondaryStats.map((stat, index) => (
            <Link
              key={index}
              href={stat.href}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-all"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{stat.icon}</span>
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Actions Rapides
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                href={action.href}
                className="bg-white border-2 border-gray-200 rounded-lg p-6 hover:border-blue-500 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                  <div className="text-blue-600">{action.icon}</div>
                </div>
                <p className="text-sm font-semibold text-gray-900">{action.label}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Section activité récente */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Activité Récente
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Nouveaux étudiants</p>
                    <p className="text-sm text-gray-500">{stats.etudiants} au total</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Matières configurées</p>
                    <p className="text-sm text-gray-500">{stats.matieres} disponibles</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <DoorOpen className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Salles de cours</p>
                    <p className="text-sm text-gray-500">{stats.salles} configurées</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé système */}
          <div className="bg-blue-600 rounded-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-4">
              Résumé du Système
            </h2>
            <div className="space-y-4">
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-blue-100 mb-1">Taux d'occupation</p>
                <p className="text-2xl font-bold">87%</p>
              </div>
              
              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-blue-100 mb-1">Cours cette semaine</p>
                <p className="text-2xl font-bold">{stats.coursThisWeek || 156}</p>
              </div>

              <div className="bg-white/10 rounded-lg p-4">
                <p className="text-sm text-blue-100 mb-1">Performance globale</p>
                <p className="text-2xl font-bold">Excellent</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}