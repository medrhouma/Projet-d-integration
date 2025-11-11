'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Mail, Phone, MapPin, Calendar, BookOpen, 
  Building, Users, Award, Edit, ArrowLeft, IdCard
} from 'lucide-react';

interface Etudiant {
  id_etudiant: number;
  numero_inscription: string;
  departement?: string;
  specialite_nom?: string;
  niveau_nom?: string;
  groupe_nom?: string;
  utilisateur: {
    nom: string;
    prenom: string;
    email: string;
    identifiant: string;
    date_creation: string;
  };
}

export default function ProfilEtudiant() {
  const router = useRouter();
  const [etudiant, setEtudiant] = useState<Etudiant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'formation' | 'activite'>('info');

  useEffect(() => {
    loadProfilData();
  }, []);

  const loadProfilData = async () => {
    try {
      const userData = localStorage.getItem('userData');
      if (!userData) {
        router.push('/login');
        return;
      }

      const parsedData = JSON.parse(userData);
      
      const res = await fetch(`/api/etudiants/${parsedData.id_etudiant}`);
      if (res.ok) {
        const data = await res.json();
        setEtudiant(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-400 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-300">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!etudiant) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        <div className="text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8">
          <p className="text-gray-300 mb-4">Erreur de chargement du profil</p>
          <Link href="/dashboard-etudiant" className="text-blue-400 hover:text-blue-300 font-medium inline-block">
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard-etudiant"
                className="p-2 hover:bg-white/10 rounded-xl transition-all backdrop-blur-lg border border-white/10"
              >
                <ArrowLeft className="w-6 h-6 text-gray-300" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">Mon Profil</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Consultez et gérez vos informations personnelles
                </p>
              </div>
            </div>
            <Link
              href="/dashboard-etudiant/profil/edit"
              className="px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 backdrop-blur-lg border border-blue-400/30 text-white rounded-xl transition-all flex items-center gap-2 shadow-lg hover:scale-105"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Carte principale de profil */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600/40 via-blue-500/40 to-purple-600/40 backdrop-blur-lg"></div>
          
          {/* Info profil */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-full border-4 border-white/30 shadow-2xl flex items-center justify-center">
                <span className="text-blue-300 text-5xl font-bold">
                  {etudiant.utilisateur.prenom[0]}{etudiant.utilisateur.nom[0]}
                </span>
              </div>
              
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {etudiant.utilisateur.prenom} {etudiant.utilisateur.nom}
                </h2>
                <p className="text-gray-300 mb-4">
                  {etudiant.specialite_nom} - {etudiant.niveau_nom}
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-blue-500/30 backdrop-blur-lg border border-blue-400/30 text-blue-100 rounded-xl text-sm font-medium">
                    N° {etudiant.numero_inscription}
                  </span>
                  <span className="px-4 py-2 bg-green-500/30 backdrop-blur-lg border border-green-400/30 text-green-100 rounded-xl text-sm font-medium">
                    Groupe {etudiant.groupe_nom}
                  </span>
                  <span className="px-4 py-2 bg-purple-500/30 backdrop-blur-lg border border-purple-400/30 text-purple-100 rounded-xl text-sm font-medium">
                    {etudiant.departement}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl mb-8">
          <div className="flex border-b border-white/10">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-4 font-medium transition-all ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-400 text-blue-300 bg-blue-500/20 backdrop-blur-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              Informations Personnelles
            </button>
            <button
              onClick={() => setActiveTab('formation')}
              className={`flex-1 px-6 py-4 font-medium transition-all ${
                activeTab === 'formation'
                  ? 'border-b-2 border-blue-400 text-blue-300 bg-blue-500/20 backdrop-blur-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              Formation
            </button>
            <button
              onClick={() => setActiveTab('activite')}
              className={`flex-1 px-6 py-4 font-medium transition-all ${
                activeTab === 'activite'
                  ? 'border-b-2 border-blue-400 text-blue-300 bg-blue-500/20 backdrop-blur-lg'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              Activité Académique
            </button>
          </div>

          <div className="p-8">
            {/* Informations Personnelles */}
            {activeTab === 'info' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-lg border border-blue-400/30 rounded-xl flex items-center justify-center">
                      <IdCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">N° Inscription</p>
                      <p className="text-lg font-semibold text-white">{etudiant.numero_inscription}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 bg-green-500/20 backdrop-blur-lg border border-green-400/30 rounded-xl flex items-center justify-center">
                      <User className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Identifiant</p>
                      <p className="text-lg font-semibold text-white">{etudiant.utilisateur.identifiant}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 bg-purple-500/20 backdrop-blur-lg border border-purple-400/30 rounded-xl flex items-center justify-center">
                      <Mail className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Email</p>
                      <p className="text-lg font-semibold text-white">{etudiant.utilisateur.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 bg-orange-500/20 backdrop-blur-lg border border-orange-400/30 rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Date d'inscription</p>
                      <p className="text-lg font-semibold text-white">
                        {new Date(etudiant.utilisateur.date_creation).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-white/10 transition-all">
                    <div className="w-12 h-12 bg-pink-500/20 backdrop-blur-lg border border-pink-400/30 rounded-xl flex items-center justify-center">
                      <Building className="w-6 h-6 text-pink-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Département</p>
                      <p className="text-lg font-semibold text-white">{etudiant.departement}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formation */}
            {activeTab === 'formation' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-500/20 backdrop-blur-lg border border-blue-400/30 p-6 rounded-2xl shadow-lg hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="w-8 h-8 text-blue-400" />
                      <h3 className="text-lg font-semibold text-white">Spécialité</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-300">{etudiant.specialite_nom}</p>
                  </div>

                  <div className="bg-green-500/20 backdrop-blur-lg border border-green-400/30 p-6 rounded-2xl shadow-lg hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="w-8 h-8 text-green-400" />
                      <h3 className="text-lg font-semibold text-white">Niveau</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-300">{etudiant.niveau_nom}</p>
                  </div>

                  <div className="bg-purple-500/20 backdrop-blur-lg border border-purple-400/30 p-6 rounded-2xl shadow-lg hover:scale-105 transition-all">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-8 h-8 text-purple-400" />
                      <h3 className="text-lg font-semibold text-white">Groupe</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-300">{etudiant.groupe_nom}</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Parcours Académique</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <p className="text-gray-300">{etudiant.departement} - {etudiant.specialite_nom}</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <p className="text-gray-300">Actuellement en {etudiant.niveau_nom}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activité Académique */}
            {activeTab === 'activite' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white/5 backdrop-blur-lg border-2 border-blue-400/30 p-6 rounded-2xl hover:scale-105 transition-all">
                    <p className="text-sm text-gray-400 mb-1">Taux de présence</p>
                    <p className="text-3xl font-bold text-blue-400">92%</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg border-2 border-green-400/30 p-6 rounded-2xl hover:scale-105 transition-all">
                    <p className="text-sm text-gray-400 mb-1">Moyenne générale</p>
                    <p className="text-3xl font-bold text-green-400">14.5/20</p>
                  </div>
                  <div className="bg-white/5 backdrop-blur-lg border-2 border-purple-400/30 p-6 rounded-2xl hover:scale-105 transition-all">
                    <p className="text-sm text-gray-400 mb-1">Crédits validés</p>
                    <p className="text-3xl font-bold text-purple-400">45/60</p>
                  </div>
                </div>

                <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl">
                  <h3 className="text-lg font-semibold text-white mb-4">Statistiques du semestre</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Cours assistés</span>
                        <span className="text-sm font-semibold text-white">48/52</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">Devoirs rendus</span>
                        <span className="text-sm font-semibold text-white">15/16</span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}