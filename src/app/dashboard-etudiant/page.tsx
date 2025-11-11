'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  GraduationCap, Calendar, BookOpen, AlertTriangle, LogOut, 
  Home, User, Clock, FileText, Mail, Phone, MapPin, Award
} from 'lucide-react';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Utilisateur {
  nom: string;
  prenom: string;
  email: string;
  identifiant: string;
}

interface Etudiant {
  id_etudiant: number;
  numero_inscription: string;
  departement?: string;
  specialite_nom?: string;
  niveau_nom?: string;
  groupe_nom?: string;
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
  icon: React.ReactElement;
  color: string;
  bgColor: string;
}

export default function DashboardEtudiant() {
  const router = useRouter();
  const pathname = usePathname();
  const [etudiant, setEtudiant] = useState<Etudiant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState<string>('');
  const [stats, setStats] = useState({
    coursThisWeek: 0,
    absences: 0,
    matieres: 0,
    notes: 0
  });

  useEffect(() => {
    checkAuth();
  }, []);

 // Modifier la fonction checkAuth :

const checkAuth = async () => {
  const userData = localStorage.getItem('userData');
  const userRole = localStorage.getItem('userRole');

  if (!userData || userRole !== 'Etudiant') {
    router.push('/login');
    return;
  }

  try {
    const parsedData = JSON.parse(userData);
    console.log('🔍 Données complètes du localStorage:', parsedData);
    
    // L'ID devrait maintenant être présent directement
    const userId = parsedData.id_etudiant || parsedData.id_utilisateur;
    
    console.log('🆔 ID étudiant extrait:', userId);

    if (userId) {
      try {
        const res = await fetch(`/api/etudiants/${userId}`);
        
        if (res.ok) {
          const data = await res.json();
          console.log('✅ Données complètes de l\'API:', data);
          setEtudiant(data);
        } else {
          console.warn('⚠️ API erreur, utilisation localStorage');
          setEtudiant(parsedData);
        }
      } catch (apiError) {
        console.error('❌ Erreur API:', apiError);
        setEtudiant(parsedData);
      }
    } else {
      console.warn('⚠️ Pas d\'ID, utilisation directe localStorage');
      setEtudiant(parsedData);
    }

    setStats({
      coursThisWeek: 12,
      absences: 2,
      matieres: 8,
      notes: 15
    });
  } catch (error) {
    console.error('❌ Erreur critique:', error);
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

  // Helper functions pour accéder aux données
  const getNom = () => {
    return etudiant?.utilisateur?.nom || etudiant?.nom || '';
  };

  const getPrenom = () => {
    return etudiant?.utilisateur?.prenom || etudiant?.prenom || '';
  };

  const getEmail = () => {
    return etudiant?.utilisateur?.email || etudiant?.email || '';
  };

  const getInitiales = () => {
    const prenom = getPrenom();
    const nom = getNom();
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`;
  };

  if (isLoading) {
    return <LoadingSpinner color="blue" message="Chargement de votre espace étudiant..." />;
  }

  if (!etudiant) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-600 mb-4">Erreur de chargement des données</p>
          <button 
            onClick={() => router.push('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  const menuItems = [
    { label: 'Tableau de bord', icon: <Home className="w-5 h-5" />, href: '/dashboard-etudiant' },
    { label: 'Mon Profil', icon: <User className="w-5 h-5" />, href: '/dashboard-etudiant/profil' },
    { label: 'Emploi du temps', icon: <Calendar className="w-5 h-5" />, href: '/dashboard-etudiant/emploi-temps' },
    { label: 'Mes Cours', icon: <BookOpen className="w-5 h-5" />, href: '/dashboard-etudiant/cours' },
    { label: 'Absences', icon: <AlertTriangle className="w-5 h-5" />, href: '/dashboard-etudiant/absences' },
    { label: 'Notes', icon: <Award className="w-5 h-5" />, href: '/dashboard-etudiant/notes' },
  ];

  const statCards: StatCard[] = [
    { 
      label: 'Cours cette semaine', 
      value: stats.coursThisWeek, 
      icon: <Calendar className="w-6 h-6" />, 
      color: 'blue',
      bgColor: 'bg-blue-500'
    },
    { 
      label: 'Absences', 
      value: stats.absences, 
      icon: <AlertTriangle className="w-6 h-6" />, 
      color: 'red',
      bgColor: 'bg-red-500'
    },
    { 
      label: 'Matières', 
      value: stats.matieres, 
      icon: <BookOpen className="w-6 h-6" />, 
      color: 'green',
      bgColor: 'bg-green-500'
    },
    { 
      label: 'Évaluations', 
      value: stats.notes, 
      icon: <Award className="w-6 h-6" />, 
      color: 'purple',
      bgColor: 'bg-purple-500'
    },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900/50 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl">
        <div className="p-6 flex items-center space-x-3 border-b border-white/10 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-purple-600/20">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-lg rounded-lg flex items-center justify-center shadow-lg border border-white/30">
            <GraduationCap className="w-6 h-6 text-blue-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Espace Étudiant
            </h1>
            <p className="text-xs text-blue-200">ISET Tozeur</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                pathname === item.href
                  ? 'bg-blue-500/30 text-white font-medium shadow-lg border-l-4 border-blue-400 backdrop-blur-lg'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white hover:backdrop-blur-lg'
              }`}
            >
              {item.icon}
              <span className="text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-gray-900/30">
          <div className="flex items-center space-x-3 mb-4 p-3 bg-white/10 backdrop-blur-lg rounded-xl shadow-lg border border-white/20">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">
                {getInitiales()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {getPrenom()} {getNom()}
              </p>
              <p className="text-xs text-gray-400 truncate">Étudiant</p>
            </div>
          </div>
         
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-white bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-xl transition-all hover:shadow-lg backdrop-blur-lg"
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent mb-2">
                Bonjour, {getPrenom()}  👋
              </h1>
              <p className="text-gray-300 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {new Date().toLocaleDateString('fr-FR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <Link
              href="/dashboard-etudiant/profil"
              className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 text-white rounded-xl transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
            >
              <User className="w-4 h-4" />
              Mon Profil
            </Link>
          </div>
        </div>

        {/* Carte de profil rapide */}
        <div className="bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-purple-600/20 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-6 text-white mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-lg border-4 border-white/30 rounded-full flex items-center justify-center shadow-xl">
                <span className="text-white text-3xl font-bold">
                  {getInitiales()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {getNom()} {getPrenom()}
                </h2>
                <p className="text-blue-200 mb-2">
                  N° Inscription: {etudiant?.numero_inscription || 'N/A'}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                    <BookOpen className="w-4 h-4" />
                    {etudiant?.specialite_nom || 'N/A'}
                  </span>
                  {etudiant?.niveau_nom && (
                    <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                      {etudiant.niveau_nom}
                    </span>
                  )}
                  {etudiant?.groupe_nom && (
                    <span className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                      {etudiant.groupe_nom}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Link
              href="/dashboard-etudiant/profil"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-lg border border-white/30 text-white rounded-xl transition-all font-medium hover:scale-105 shadow-lg"
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
              className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all transform hover:-translate-y-1 hover:bg-white/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-${stat.color}-500/20 backdrop-blur-lg border border-${stat.color}-400/30 rounded-xl flex items-center justify-center`}>
                  <div className={`text-${stat.color}-400`}>{stat.icon}</div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-300 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Prochains cours et Activités récentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Prochains cours */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Prochains Cours
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 rounded-xl hover:bg-blue-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-cyan-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Programmation Web</p>
                    <p className="text-sm text-blue-200">Aujourd'hui à 10:00 - Salle A101</p>
                  </div>
                </div>
                <span className="bg-blue-500/30 backdrop-blur-lg border border-blue-400/30 text-blue-100 text-xs px-3 py-1 rounded-full font-medium">
                  Dans 2h
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl hover:bg-green-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Base de Données</p>
                    <p className="text-sm text-green-200">Aujourd'hui à 14:00 - Salle B202</p>
                  </div>
                </div>
                <span className="bg-green-500/30 backdrop-blur-lg border border-green-400/30 text-green-100 text-xs px-3 py-1 rounded-full font-medium">
                  Dans 6h
                </span>
              </div>

              <Link
                href="/dashboard-etudiant/emploi-temps"
                className="block text-center py-3 text-blue-400 hover:text-blue-300 font-medium text-sm"
              >
                Voir tout l'emploi du temps →
              </Link>
            </div>
          </div>

          {/* Activités récentes */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              Activités Récentes
            </h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl">
                <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-white">Note disponible</p>
                  <p className="text-sm text-gray-300">Examen de Programmation Web - 16/20</p>
                  <p className="text-xs text-gray-400 mt-1">Il y a 2 heures</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-yellow-500/20 backdrop-blur-sm border border-yellow-400/30 rounded-xl">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-white">Nouveau devoir</p>
                  <p className="text-sm text-gray-300">TP Base de Données - À rendre le 20/12</p>
                  <p className="text-xs text-gray-400 mt-1">Il y a 1 jour</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-xl">
                <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-white">Absence enregistrée</p>
                  <p className="text-sm text-gray-300">Cours de Réseaux - 10/12/2024</p>
                  <p className="text-xs text-gray-400 mt-1">Il y a 2 jours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}