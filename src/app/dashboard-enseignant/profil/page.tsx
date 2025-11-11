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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 flex items-center justify-center">
        <div className="text-center text-white">
          <p className="mb-4">Erreur de chargement des données</p>
          <button 
            onClick={() => router.push('/dashboard-enseignant')}
            className="px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
          >
            Retour au Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-8">
      {/* Bouton retour */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard-enseignant')}
          className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl border border-white/20 text-white font-semibold transition-all duration-300 hover:scale-105 shadow-xl"
        >
          <ArrowLeft size={20} />
          <span>Retour au Dashboard</span>
        </button>
      </div>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-2xl shadow-2xl animate-pulse">
            <User size={40} className="text-white" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent mb-3">
          Mon Profil
        </h1>
        <p className="text-gray-300 text-lg">Informations personnelles et professionnelles</p>
        <div className="mt-4 h-1 w-32 mx-auto bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-full"></div>
      </div>

      {/* Carte principale du profil */}
      <div className="max-w-5xl mx-auto">
        {/* Carte d'en-tête avec avatar */}
        <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl shadow-2xl p-8 mb-6 border border-white/20 backdrop-blur-lg">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-32 h-32 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border-4 border-white/30 shadow-2xl">
              <span className="text-white text-5xl font-bold">
                {getInitiales()}
              </span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">
                {getPrenom()} {getNom()}
              </h2>
              <p className="text-green-100 text-lg mb-3">
                {enseignant.grade || 'Enseignant'} - {enseignant.departement?.nom || 'Département'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <span className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full text-sm text-white border border-white/30">
                  📚 {enseignant.specialite || 'Spécialité non renseignée'}
                </span>
                <span className="bg-white/20 backdrop-blur-lg px-4 py-2 rounded-full text-sm text-white border border-white/30">
                  🎓 Matricule: {enseignant.matricule}
                </span>
              </div>
            </div>
            <div>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-lg hover:bg-white/30 rounded-xl border border-white/30 text-white font-semibold transition-all shadow-lg"
                >
                  <Edit size={20} />
                  Modifier
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-lg hover:bg-white/30 rounded-xl border border-white/30 text-white font-semibold transition-all shadow-lg disabled:opacity-50"
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
                    className="flex items-center gap-2 px-6 py-3 bg-red-500/20 backdrop-blur-lg hover:bg-red-500/30 rounded-xl border border-red-400/30 text-white font-semibold transition-all shadow-lg"
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
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Mail size={24} className="text-blue-400" />
              Coordonnées
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <Mail className="text-blue-400 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Email</p>
                  <p className="text-white font-medium">{getEmail()}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <Phone className="text-green-400 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Téléphone</p>
                  {editing ? (
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-400"
                      placeholder="Numéro de téléphone"
                    />
                  ) : (
                    <p className="text-white font-medium">{getTelephone()}</p>
                  )}
                </div>
              </div>

              {enseignant.utilisateur?.date_naissance && (
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <Calendar className="text-purple-400 mt-1" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Date de naissance</p>
                    <p className="text-white font-medium">
                      {new Date(enseignant.utilisateur.date_naissance).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Informations professionnelles */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <GraduationCap size={24} className="text-green-400" />
              Informations Professionnelles
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <IdCard className="text-orange-400 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Matricule</p>
                  <p className="text-white font-medium">{enseignant.matricule}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <Award className="text-yellow-400 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Grade</p>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-400"
                      placeholder="Grade"
                    />
                  ) : (
                    <p className="text-white font-medium">{enseignant.grade || 'Non renseigné'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <BookOpen className="text-pink-400 mt-1" size={20} />
                <div className="flex-1">
                  <p className="text-sm text-gray-400">Spécialité</p>
                  {editing ? (
                    <input
                      type="text"
                      value={formData.specialite}
                      onChange={(e) => setFormData({ ...formData, specialite: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-green-400"
                      placeholder="Spécialité"
                    />
                  ) : (
                    <p className="text-white font-medium">{enseignant.specialite || 'Non renseignée'}</p>
                  )}
                </div>
              </div>

              {enseignant.departement && (
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <Building2 className="text-blue-400 mt-1" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Département</p>
                    <p className="text-white font-medium">{enseignant.departement.nom}</p>
                    <p className="text-xs text-gray-500">Code: {enseignant.departement.code}</p>
                  </div>
                </div>
              )}

              {enseignant.date_embauche && (
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                  <Clock className="text-teal-400 mt-1" size={20} />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">Date d'embauche</p>
                    <p className="text-white font-medium">
                      {new Date(enseignant.date_embauche).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Award size={24} className="text-yellow-400" />
            Statistiques d'enseignement
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-4 rounded-xl border border-blue-400/30">
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">8</p>
                <p className="text-sm text-gray-300">Cours cette semaine</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-4 rounded-xl border border-green-400/30">
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">145</p>
                <p className="text-sm text-gray-300">Étudiants</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-4 rounded-xl border border-purple-400/30">
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">3</p>
                <p className="text-sm text-gray-300">Matières</p>
              </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/20 p-4 rounded-xl border border-orange-400/30">
              <div className="text-center">
                <p className="text-4xl font-bold text-white mb-2">12</p>
                <p className="text-sm text-gray-300">Heures/semaine</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
