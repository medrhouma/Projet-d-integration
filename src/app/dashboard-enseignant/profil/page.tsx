'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, MapPin, Calendar, BookOpen, 
  Award, Clock, ArrowLeft, Edit, Save, X, GraduationCap,
  Building2, Hash, IdCard
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Enseignant {
  id_enseignant: number;
  matricule: string;
  specialite?: string;
  grade?: string;
  date_embauche?: string;
  departement?: {
    nom: string;
    code: string;
  };
  utilisateur?: {
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    date_naissance?: string;
  };
  // Données du localStorage
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
}

export default function ProfilEnseignant() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enseignant, setEnseignant] = useState<Enseignant | null>(null);
  const [formData, setFormData] = useState({
    telephone: '',
    specialite: '',
    grade: '',
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userData = localStorage.getItem('userData');
      
      if (!userData) {
        router.push('/login');
        return;
      }

      const parsedData = JSON.parse(userData);
      
      // Charger les données complètes depuis l'API
      if (parsedData.id_enseignant) {
        const res = await fetch(`/api/enseignants/${parsedData.id_enseignant}`);
        
        if (res.ok) {
          const data = await res.json();
          setEnseignant(data);
          setFormData({
            telephone: data.utilisateur?.telephone || data.telephone || '',
            specialite: data.specialite || '',
            grade: data.grade || '',
          });
        } else {
          setEnseignant(parsedData);
          setFormData({
            telephone: parsedData.telephone || '',
            specialite: parsedData.specialite || '',
            grade: parsedData.grade || '',
          });
        }
      } else {
        setEnseignant(parsedData);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      // Ici, vous pouvez ajouter l'appel API pour sauvegarder les modifications
      // await fetch(`/api/enseignants/${enseignant?.id_enseignant}`, { method: 'PUT', ... })
      
      // Simuler une sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEditing(false);
      alert('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setSaving(false);
    }
  };

  const getNom = () => enseignant?.utilisateur?.nom || enseignant?.nom || '';
  const getPrenom = () => enseignant?.utilisateur?.prenom || enseignant?.prenom || '';
  const getEmail = () => enseignant?.utilisateur?.email || enseignant?.email || '';
  const getTelephone = () => enseignant?.utilisateur?.telephone || enseignant?.telephone || 'Non renseigné';
  const getInitiales = () => {
    const prenom = getPrenom();
    const nom = getNom();
    return `${prenom?.[0] || ''}${nom?.[0] || ''}`;
  };

  if (loading) {
    return <LoadingSpinner color="green" message="Chargement de votre profil..." />;
  }

  if (!enseignant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <p className="text-gray-600 mb-4">Erreur de chargement des données</p>
          <button 
            onClick={() => router.push('/dashboard-enseignant')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Bouton retour */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard-enseignant')}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 text-gray-700 font-medium transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>Retour au Dashboard</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-green-100 p-2 rounded-lg">
            <User size={32} className="text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            Mon Profil
          </h1>
        </div>
        <p className="text-gray-600">Informations personnelles et professionnelles</p>
      </div>

      {/* Carte principale du profil */}
      <div className="max-w-5xl mx-auto">
        {/* Carte d'en-tête avec avatar */}
        <div className="bg-green-600 rounded-lg shadow-sm p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
              <span className="text-green-600 text-5xl font-bold">
                {getInitiales()}
              </span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">
                {getPrenom()} {getNom()}
              </h2>
              <p className="text-white/90 text-lg mb-3">
                {enseignant.grade || 'Enseignant'} - {enseignant.departement?.nom || 'Département'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="bg-white/20 px-4 py-2 rounded-lg text-sm text-white">
                  📚 {enseignant.specialite || 'Spécialité non renseignée'}
                </span>
                <span className="bg-white/20 px-4 py-2 rounded-lg text-sm text-white">
                  🎓 Matricule: {enseignant.matricule}
                </span>
              </div>
            </div>
            <div>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition-colors"
                >
                  <Edit size={20} />
                  Modifier
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    <Save size={20} />
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        telephone: getTelephone(),
                        specialite: enseignant.specialite || '',
                        grade: enseignant.grade || '',
                      });
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-white font-semibold transition-colors"
                  >
                    <X size={20} />
                    Annuler
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations personnelles */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Informations de contact */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Mail size={24} className="text-green-600" />
              Coordonnées
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="text-green-600 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="text-gray-900 font-medium">{getEmail()}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="text-green-600 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Téléphone</p>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      placeholder="Numéro de téléphone"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{getTelephone()}</p>
                  )}
                </div>
              </div>

              {enseignant.utilisateur?.date_naissance && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Calendar className="text-green-600 mt-1" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Date de naissance</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(enseignant.utilisateur.date_naissance).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <GraduationCap size={24} className="text-green-600" />
              Informations Professionnelles
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <IdCard className="text-green-600 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Matricule</p>
                  <p className="text-gray-900 font-medium">{enseignant.matricule}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <Award className="text-green-600 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Grade</p>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      placeholder="Grade"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{enseignant.grade || 'Non renseigné'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <BookOpen className="text-green-600 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-600">Spécialité</p>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.specialite}
                      onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                      className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      placeholder="Spécialité"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{enseignant.specialite || 'Non renseignée'}</p>
                  )}
                </div>
              </div>

              {enseignant.departement && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="text-green-600 mt-1" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Département</p>
                    <p className="text-gray-900 font-medium">{enseignant.departement.nom}</p>
                    <p className="text-xs text-gray-500">Code: {enseignant.departement.code}</p>
                  </div>
                </div>
              )}

              {enseignant.date_embauche && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Clock className="text-green-600 mt-1" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">Date d'embauche</p>
                    <p className="text-gray-900 font-medium">
                      {new Date(enseignant.date_embauche).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Award size={24} className="text-green-600" />
            Statistiques d'enseignement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">8</p>
                <p className="text-sm text-gray-700">Cours cette semaine</p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">145</p>
                <p className="text-sm text-gray-700">Étudiants</p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">3</p>
                <p className="text-sm text-gray-700">Matières</p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-600 mb-2">12</p>
                <p className="text-sm text-gray-700">Heures/semaine</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
