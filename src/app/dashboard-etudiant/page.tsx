'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Calendar, BookOpen, Bell, LogOut, User, Home } from 'lucide-react';

interface UserData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  identifiant: string;
  role: string;
  etudiant?: {
    id_etudiant: number;
    numero_inscription: string;
    specialite?: {
      id_specialite: number;
      nom: string;
      departement: {
        id_departement: number;
        nom: string;
      };
    };
    groupe?: {
      id_groupe: number;
      nom: string;
      niveau?: {
        id_niveau: number;
        nom: string;
        specialite: {
          id_specialite: number;
          nom: string;
        };
      };
    };
  };
}

export default function DashboardEtudiant() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté en tant qu'étudiant
    const userData = localStorage.getItem('userData');
    const userRole = localStorage.getItem('userRole');
    
    if (!userData || userRole !== 'Etudiant') {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Erreur parsing user data:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userLogin');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Dashboard Étudiant</h1>
                <p className="text-sm text-gray-500">
                  {user.prenom} {user.nom}
                  {user.etudiant && ` - ${user.etudiant.numero_inscription}`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => router.push('/')}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Home className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {/* Gérer les notifications */}}
                className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Section informations personnelles */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Informations personnelles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Nom complet</p>
              <p className="font-semibold">{user.prenom} {user.nom}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Numéro d'inscription</p>
              <p className="font-semibold">{user.etudiant?.numero_inscription || 'Non assigné'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-semibold">{user.email}</p>
            </div>
            {user.etudiant?.specialite && (
              <div>
                <p className="text-sm text-gray-500">Spécialité</p>
                <p className="font-semibold">{user.etudiant.specialite.nom}</p>
              </div>
            )}
            {user.etudiant?.groupe && (
              <div>
                <p className="text-sm text-gray-500">Groupe</p>
                <p className="font-semibold">{user.etudiant.groupe.nom}</p>
              </div>
            )}
          </div>
        </div>

        {/* Cartes de fonctionnalités */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Mes Cours</h3>
            </div>
            <p className="text-gray-600 mb-4">Accédez à vos cours et supports pédagogiques</p>
            <button 
              onClick={() => {/* Navigation vers les cours */}}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voir mes cours
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Emploi du temps</h3>
            </div>
            <p className="text-gray-600 mb-4">Consultez votre planning hebdomadaire</p>
            <button 
              onClick={() => {/* Navigation vers l'emploi du temps */}}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Voir l'emploi du temps
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
            </div>
            <p className="text-gray-600 mb-4">Consultez vos résultats et bulletins</p>
            <button 
              onClick={() => {/* Navigation vers les notes */}}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Voir mes notes
            </button>
          </div>
        </div>

        {/* Section informations récentes */}
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Informations récentes</h2>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Bell className="w-5 h-5 text-blue-600" />
              <p className="text-gray-700">Nouveau cours de Mathématiques disponible</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Bell className="w-5 h-5 text-green-600" />
              <p className="text-gray-700">Devoir à rendre pour la semaine prochaine</p>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
              <Bell className="w-5 h-5 text-yellow-600" />
              <p className="text-gray-700">Réunion parents-professeurs le 15 décembre</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}