'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building, LogOut } from 'lucide-react';

export default function DashboardAdmin() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userLogin');
    localStorage.removeItem('userData');
    router.push('/login');
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="relative min-h-screen flex flex-col text-white">
      {/* 🎥 Vidéo de fond */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover -z-10"
      >
        {/* Remplace le lien ci-dessous par ta vidéo (ex: /videos/iset-tozeur.mp4) */}
        <source src="/videos/iset-tozeur.mp4" type="video/mp4" />
        Votre navigateur ne supporte pas la lecture vidéo.
      </video>

      {/* Overlay sombre pour lisibilité */}
      <div className="absolute inset-0 bg-black/50 -z-10"></div>

      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-600/80 rounded-lg flex items-center justify-center">
                <Building className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Dashboard Admin</h1>
                <p className="text-sm text-gray-200">{user?.prenom} {user?.nom}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 text-sm text-red-200 hover:text-red-100 border border-red-400/40 rounded-lg hover:bg-red-500/20 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="flex-1 flex items-center justify-center text-center px-6">
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 p-8 max-w-xl">
          <h2 className="text-2xl font-bold mb-4">Administration</h2>
          <p>Panel d'administration - Fonctionnalités à implémenter</p>
        </div>
      </main>
    </div>
  );
}
