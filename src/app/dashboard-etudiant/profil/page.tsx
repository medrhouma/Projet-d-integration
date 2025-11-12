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
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (!etudiant) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <p className="text-gray-600 mb-4">Erreur de chargement du profil</p>
          <Link href="/dashboard-etudiant" className="text-blue-600 hover:text-blue-700 font-medium inline-block">
            Retour au dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard-etudiant"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Consultez et gérez vos informations personnelles
                </p>
              </div>
            </div>
            <Link
              href="/dashboard-etudiant/profil/edit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Modifier
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Carte principale de profil */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
          {/* Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-500"></div>
          
          {/* Info profil */}
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-blue-600 text-5xl font-bold">
                  {etudiant.utilisateur.prenom[0]}{etudiant.utilisateur.nom[0]}
                </span>
              </div>
              
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {etudiant.utilisateur.prenom} {etudiant.utilisateur.nom}
                </h2>
                <p className="text-gray-600 mb-4">
                  {etudiant.specialite_nom} - {etudiant.niveau_nom}
                </p>
                <div className="flex flex-wrap gap-3">
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                    N° {etudiant.numero_inscription}
                  </span>
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                    Groupe {etudiant.groupe_nom}
                  </span>
                  <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium">
                    {etudiant.departement}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Onglets */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'info'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Informations Personnelles
            </button>
            <button
              onClick={() => setActiveTab('formation')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'formation'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Formation
            </button>
            <button
              onClick={() => setActiveTab('activite')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'activite'
                  ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IdCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">N° Inscription</p>
                      <p className="text-lg font-semibold text-gray-900">{etudiant.numero_inscription}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Identifiant</p>
                      <p className="text-lg font-semibold text-gray-900">{etudiant.utilisateur.identifiant}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-lg font-semibold text-gray-900">{etudiant.utilisateur.email}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date d'inscription</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(etudiant.utilisateur.date_creation).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Département</p>
                      <p className="text-lg font-semibold text-gray-900">{etudiant.departement}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formation */}
            {activeTab === 'formation' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <BookOpen className="w-8 h-8 text-blue-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Spécialité</h3>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{etudiant.specialite_nom}</p>
                  </div>

                  <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Award className="w-8 h-8 text-green-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Niveau</h3>
                    </div>
                    <p className="text-2xl font-bold text-green-600">{etudiant.niveau_nom}</p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-8 h-8 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Groupe</h3>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{etudiant.groupe_nom}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Parcours Académique</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <p className="text-gray-700">{etudiant.departement} - {etudiant.specialite_nom}</p>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <p className="text-gray-700">Actuellement en {etudiant.niveau_nom}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Activité Académique */}
            {activeTab === 'activite' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border-2 border-blue-200 p-6 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Taux de présence</p>
                    <p className="text-3xl font-bold text-blue-600">92%</p>
                  </div>
                  <div className="bg-white border-2 border-green-200 p-6 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Moyenne générale</p>
                    <p className="text-3xl font-bold text-green-600">14.5/20</p>
                  </div>
                  <div className="bg-white border-2 border-purple-200 p-6 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Crédits validés</p>
                    <p className="text-3xl font-bold text-purple-600">45/60</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques du semestre</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Cours assistés</span>
                        <span className="text-sm font-semibold text-gray-900">48/52</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Devoirs rendus</span>
                        <span className="text-sm font-semibold text-gray-900">15/16</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '94%' }}></div>
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