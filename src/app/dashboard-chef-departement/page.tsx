'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Building, Users, Calendar, FileText, AlertTriangle, Settings, LogOut, 
  Home, BarChart3, GraduationCap, BookOpen, UserCheck, Clock,
  TrendingUp, Activity
} from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface DepartementStats {
  departement: {
    id: number;
    nom: string;
  };
  nombre_specialites: number;
  nombre_enseignants: number;
  nombre_niveaux: number;
  nombre_groupes: number;
  nombre_matieres: number;
  nombre_etudiants: number;
  specialites: Array<{
    id: number;
    nom: string;
    nombre_niveaux: number;
    nombre_groupes: number;
    nombre_etudiants: number;
  }>;
  enseignants: Array<{
    id: number;
    nom: string;
    prenom: string;
    email: string;
    matricule: string;
    est_chef: boolean;
    nombre_matieres: number;
  }>;
}

export default function DashboardChefDepartement() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DepartementStats | null>(null);
  const [error, setError] = useState('');
  const [user, setUser] = useState<any>(null);

  const menuItems = [
    { label: 'Tableau de bord', icon: <Home className="w-5 h-5" />, href: '/dashboard-chef-departement' },
    { label: 'Mon Département', icon: <Building className="w-5 h-5" />, href: '/dashboard-chef-departement/departement' },
    { label: 'Étudiants', icon: <GraduationCap className="w-5 h-5" />, href: '/dashboard-chef-departement/etudiants' },
    { label: 'Enseignants', icon: <UserCheck className="w-5 h-5" />, href: '/dashboard-chef-departement/enseignants' },
    { label: 'Emplois du temps', icon: <Calendar className="w-5 h-5" />, href: '/dashboard-chef-departement/emploi-temps/gestion' },
    { label: 'Absences', icon: <AlertTriangle className="w-5 h-5" />, href: '/dashboard-chef-departement/absences/enseignants' },
    { label: 'Rapports', icon: <FileText className="w-5 h-5" />, href: '/dashboard-chef-departement/rapports' },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.success) {
        router.push('/login');
        return;
      }

      if (data.user.role !== 'ChefDepartement') {
        router.push('/dashboard-enseignant');
        return;
      }

      setUser(data.user);
      loadStatistiques(data.user.id_departement);
    } catch (err) {
      console.error('Erreur d\'authentification:', err);
      router.push('/login');
    }
  };

  const loadStatistiques = async (departementId?: number) => {
    try {
      setLoading(true);
      const url = departementId 
        ? `/api/chefs-departement/statistiques?departementId=${departementId}`
        : '/api/chefs-departement/statistiques';
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Erreur lors du chargement des statistiques');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner color="orange" message="Chargement de votre département..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white border border-red-200 rounded-xl p-8 max-w-md">
          <h2 className="text-red-600 text-xl font-bold mb-2">Erreur</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 px-6 py-3 rounded-lg transition-all"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Chef Département
          </h2>
          <p className="text-sm text-gray-600 mt-1">{stats?.departement.nom}</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-medium border-l-4 border-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="mb-3 p-3 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-900">
              {user?.nom} {user?.prenom}
            </p>
            <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {stats && (
          <>
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Tableau de Bord
              </h1>
              <p className="text-gray-600">
                Vue d'ensemble de votre département
              </p>
            </div>

            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-50 rounded-full p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 font-medium">Enseignants</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.nombre_enseignants}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-50 rounded-full p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 font-medium">Étudiants</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.nombre_etudiants}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-50 rounded-full p-3">
                    <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600 font-medium">Matières</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.nombre_matieres}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Spécialités</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.nombre_specialites}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Niveaux</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.nombre_niveaux}</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all">
                <h3 className="text-sm font-semibold text-gray-600 mb-2">Groupes</h3>
                <p className="text-3xl font-bold text-gray-900">{stats.nombre_groupes}</p>
              </div>
            </div>

            {/* Spécialités */}
            <div className="bg-white border border-gray-200 rounded-xl mb-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Spécialités</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.specialites.map((specialite) => (
                    <div key={specialite.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all">
                      <h3 className="font-semibold text-lg text-gray-900 mb-3">{specialite.nom}</h3>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-gray-600">Niveaux</p>
                          <p className="font-semibold text-gray-900 text-xl">{specialite.nombre_niveaux}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Groupes</p>
                          <p className="font-semibold text-gray-900 text-xl">{specialite.nombre_groupes}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Étudiants</p>
                          <p className="font-semibold text-gray-900 text-xl">{specialite.nombre_etudiants}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Liste des enseignants */}
            <div className="bg-white border border-gray-200 rounded-xl">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Enseignants du département</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Enseignant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Matières
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.enseignants.map((enseignant) => (
                      <tr key={enseignant.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {enseignant.prenom} {enseignant.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{enseignant.matricule}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-600">{enseignant.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                            {enseignant.nombre_matieres} matière(s)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {enseignant.est_chef ? (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                              Chef de Département
                            </span>
                          ) : (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
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
          </>
        )}
      </main>
    </div>
  );
}
