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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
        <div className="bg-red-500/20 backdrop-blur-lg border border-red-400/30 rounded-2xl p-8 max-w-md">
          <h2 className="text-red-300 text-xl font-bold mb-2">Erreur</h2>
          <p className="text-red-200 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-red-500/30 hover:bg-red-500/40 backdrop-blur-lg border border-red-400/30 text-white px-6 py-3 rounded-xl transition-all hover:scale-105"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl">
        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-orange-600/20 via-orange-500/20 to-yellow-600/20">
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Chef Département
          </h2>
          <p className="text-sm text-orange-200 mt-1">{stats?.departement.nom}</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive
                        ? 'bg-orange-500/30 text-white font-medium shadow-lg border-l-4 border-orange-400 backdrop-blur-lg'
                        : 'text-gray-300 hover:bg-white/10 hover:text-white hover:backdrop-blur-lg'
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

        <div className="p-4 border-t border-white/10 bg-gray-900/30">
          <div className="mb-3 p-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl">
            <p className="text-sm font-medium text-white">
              {user?.nom} {user?.prenom}
            </p>
            <p className="text-xs text-gray-400 mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 backdrop-blur-lg border border-red-400/30 text-white rounded-xl transition-all hover:shadow-lg"
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-amber-400 bg-clip-text text-transparent mb-2">
                Tableau de Bord
              </h1>
              <p className="text-gray-300">
                Vue d'ensemble de votre département
              </p>
            </div>

            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-105 shadow-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-orange-500/30 to-orange-600/30 backdrop-blur-lg rounded-full p-3 border border-orange-400/30">
                    <svg className="h-6 w-6 text-orange-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-orange-300 font-medium">Enseignants</p>
                    <p className="text-2xl font-bold text-white">{stats.nombre_enseignants}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-105 shadow-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-red-500/30 to-red-600/30 backdrop-blur-lg rounded-full p-3 border border-red-400/30">
                    <svg className="h-6 w-6 text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-red-300 font-medium">Étudiants</p>
                    <p className="text-2xl font-bold text-white">{stats.nombre_etudiants}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-105 shadow-xl">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-gradient-to-br from-amber-500/30 to-yellow-600/30 backdrop-blur-lg rounded-full p-3 border border-amber-400/30">
                    <svg className="h-6 w-6 text-amber-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-amber-300 font-medium">Matières</p>
                    <p className="text-2xl font-bold text-white">{stats.nombre_matieres}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques supplémentaires */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-105 shadow-xl">
                <h3 className="text-sm font-semibold text-orange-300 mb-2">Spécialités</h3>
                <p className="text-3xl font-bold text-white">{stats.nombre_specialites}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-105 shadow-xl">
                <h3 className="text-sm font-semibold text-red-300 mb-2">Niveaux</h3>
                <p className="text-3xl font-bold text-white">{stats.nombre_niveaux}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all hover:scale-105 shadow-xl">
                <h3 className="text-sm font-semibold text-amber-300 mb-2">Groupes</h3>
                <p className="text-3xl font-bold text-white">{stats.nombre_groupes}</p>
              </div>
            </div>

            {/* Spécialités */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl mb-8 shadow-xl">
              <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-orange-500/10 to-red-500/10">
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Spécialités</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {stats.specialites.map((specialite) => (
                    <div key={specialite.id} className="bg-white/5 backdrop-blur-lg border border-white/20 rounded-xl p-4 hover:bg-white/10 transition-all hover:scale-105">
                      <h3 className="font-semibold text-lg text-white mb-3">{specialite.nom}</h3>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-orange-300">Niveaux</p>
                          <p className="font-semibold text-white text-xl">{specialite.nombre_niveaux}</p>
                        </div>
                        <div>
                          <p className="text-red-300">Groupes</p>
                          <p className="font-semibold text-white text-xl">{specialite.nombre_groupes}</p>
                        </div>
                        <div>
                          <p className="text-amber-300">Étudiants</p>
                          <p className="font-semibold text-white text-xl">{specialite.nombre_etudiants}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Liste des enseignants */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl">
              <div className="px-6 py-4 border-b border-white/20 bg-gradient-to-r from-orange-500/10 to-red-500/10">
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Enseignants du département</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10">
                  <thead className="bg-gray-900/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider">
                        Enseignant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider">
                        Matricule
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider">
                        Matières
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {stats.enseignants.map((enseignant) => (
                      <tr key={enseignant.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-white">
                            {enseignant.prenom} {enseignant.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{enseignant.matricule}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-300">{enseignant.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                            {enseignant.nombre_matieres} matière(s)
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {enseignant.est_chef ? (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-500/20 text-orange-300 border border-orange-400/30">
                              Chef de Département
                            </span>
                          ) : (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-500/20 text-gray-300 border border-gray-400/30">
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
