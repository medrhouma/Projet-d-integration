'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Building, Users, Calendar, FileText, AlertTriangle, Settings, LogOut, Home, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('userData');
    localStorage.removeItem('userRole');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
    </div>
  );

  const menuItems = [
    { label: 'Tableau de bord', icon: <Home className="w-5 h-5" />, href: '/dashboard-admin' },
    { label: 'Référentiels', icon: <Users className="w-5 h-5" />, href: '/dashboard-admin/referentiels' },
    { label: 'Emplois du temps', icon: <Calendar className="w-5 h-5" />, href: '/dashboard-admin/emplois-du-temps' },
    { label: 'Conflits', icon: <AlertTriangle className="w-5 h-5" />, href: '/dashboard-admin/conflits' },
    { label: 'Rapports', icon: <FileText className="w-5 h-5" />, href: '/dashboard-admin/rapports' },
    { label: 'Événements', icon: <Settings className="w-5 h-5" />, href: '/dashboard-admin/evenements' },
    { label: 'Analytique', icon: <BarChart3 className="w-5 h-5" />, href: '/dashboard-admin/analytique' },
  ];

  // Statistiques du dashboard
  const stats = [
    { label: 'Étudiants inscrits', value: '1,245', change: '+5%', color: 'blue' },
    { label: 'Enseignants', value: '89', change: '+2%', color: 'green' },
    { label: 'Départements', value: '12', change: '0%', color: 'purple' },
    { label: 'Cours cette semaine', value: '156', change: '+8%', color: 'orange' },
  ];

  const quickActions = [
    { label: 'Ajouter un utilisateur', href: '/dashboard-admin/referentiels?tab=users', color: 'purple' },
    { label: 'Générer un rapport', href: '/dashboard-admin/rapports', color: 'blue' },
    { label: 'Vérifier les conflits', href: '/dashboard-admin/conflits', color: 'red' },
    { label: 'Planifier événement', href: '/dashboard-admin/evenements', color: 'green' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col">
        <div className="p-4 flex items-center space-x-3 border-b">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-800">Admin Panel</h1>
            <p className="text-xs text-gray-500">Université</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
                pathname === item.href
                  ? 'bg-purple-100 text-purple-700 font-medium border border-purple-200'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-xs text-gray-500 truncate">Administrateur</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 border border-red-100 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de Bord Administratif
          </h1>
          <p className="text-gray-600">
            Bienvenue, {user?.prenom} {user?.nom}. Gérez l'ensemble de la plateforme universitaire.
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white border rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                  stat.change.startsWith('+') ? 'bg-green-100 text-green-800' : 
                  stat.change.startsWith('-') ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.href}
              className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow group"
            >
              <div className={`w-8 h-8 bg-${action.color}-100 rounded-lg flex items-center justify-center mb-2 group-hover:bg-${action.color}-200 transition-colors`}>
                <div className={`w-4 h-4 bg-${action.color}-500 rounded`}></div>
              </div>
              <p className="text-sm font-medium text-gray-900">{action.label}</p>
            </Link>
          ))}
        </div>

        {/* Section activité récente */}
        <div className="bg-white border rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Activité Récente</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Nouveau département ajouté</p>
                <p className="text-sm text-gray-500">Informatique - Il y a 2 heures</p>
              </div>
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Complété</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Rapport mensuel généré</p>
                <p className="text-sm text-gray-500">Absentéisme - Il y a 5 heures</p>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">PDF</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}