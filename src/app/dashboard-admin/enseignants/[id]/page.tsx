'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  UserCheck, Save, ArrowLeft, Mail, Phone, Building, 
  Book, Users, Eye, EyeOff 
} from 'lucide-react';

interface Departement {
  id_departement: number;
  nom: string;
}

interface Enseignant {
  id_enseignant: number;
  matricule: string;
  grade?: string;
  specialite?: string;
  telephone?: string;
  adresse?: string;
  date_naissance?: string;
  id_departement?: number;
  utilisateur: {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    email: string;
    identifiant: string;
  };
}

export default function ModifierEnseignantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [departements, setDepartements] = useState<Departement[]>([]);
  const [enseignant, setEnseignant] = useState<Enseignant | null>(null);

  // Formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    identifiant: '',
    matricule: '',
    grade: '',
    specialite: '',
    telephone: '',
    adresse: '',
    date_naissance: '',
    id_departement: '',
    motdepasse: '', // Optionnel pour modification
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkAuth();
    loadDepartements();
    loadEnseignant();
  }, []);

  const checkAuth = () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Admin') {
      router.push('/login');
    }
  };

  const loadDepartements = async () => {
    try {
      const res = await fetch('/api/departements');
      if (res.ok) {
        const data = await res.json();
        setDepartements(data);
      }
    } catch (err) {
      console.error('Erreur chargement départements:', err);
    }
  };

  const loadEnseignant = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/enseignants/${id}`);
      if (res.ok) {
        const data = await res.json();
        setEnseignant(data);
        
        // Remplir le formulaire
        setFormData({
          nom: data.utilisateur.nom || '',
          prenom: data.utilisateur.prenom || '',
          email: data.utilisateur.email || '',
          identifiant: data.utilisateur.identifiant || '',
          matricule: data.matricule || '',
          grade: data.grade || '',
          specialite: data.specialite || '',
          telephone: data.telephone || '',
          adresse: data.adresse || '',
          date_naissance: data.date_naissance ? data.date_naissance.split('T')[0] : '',
          id_departement: data.id_departement?.toString() || '',
          motdepasse: '',
        });
      } else {
        setError('Enseignant introuvable');
      }
    } catch (err) {
      setError('Erreur de chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.nom || !formData.prenom || !formData.email || !formData.matricule) {
      setError('Les champs obligatoires doivent être remplis');
      return;
    }

    try {
      setSubmitting(true);

      // Préparer les données selon l'API existante
      const updateData: any = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        identifiant: formData.identifiant,
        matricule: formData.matricule,
        id_departement: formData.id_departement ? parseInt(formData.id_departement) : null,
      };

      // Ajouter le mot de passe seulement s'il est fourni
      if (formData.motdepasse.trim()) {
        updateData.mot_de_passe = formData.motdepasse;
      }

      const res = await fetch(`/api/enseignants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('✓ Enseignant modifié avec succès !');
        setTimeout(() => {
          router.push('/dashboard-admin/enseignants');
        }, 2000);
      } else {
        setError(data.error || 'Erreur lors de la modification');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link 
              href="/dashboard-admin/enseignants"
              className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la liste
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <UserCheck className="w-8 h-8 text-blue-600" />
              Modifier l'enseignant
            </h1>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Informations personnelles */}
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Informations Personnelles
              </h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom de famille"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prénom <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Prénom"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="email@exemple.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+216 XX XXX XXX"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date de naissance
              </label>
              <input
                type="date"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                name="adresse"
                value={formData.adresse}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Adresse complète"
              />
            </div>

            {/* Informations professionnelles */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Book className="w-5 h-5 text-blue-600" />
                Informations Professionnelles
              </h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Matricule <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="XXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Grade
              </label>
              <select
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Sélectionner un grade</option>
                <option value="Professeur">Professeur</option>
                <option value="Maître Assistant">Maître Assistant</option>
                <option value="Assistant">Assistant</option>
                <option value="Technologue">Technologue</option>
                <option value="Vacataire">Vacataire</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Spécialité
              </label>
              <input
                type="text"
                name="specialite"
                value={formData.specialite}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Spécialité enseignée"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Département
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <select
                  name="id_departement"
                  value={formData.id_departement}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un département</option>
                  {departements.map(dept => (
                    <option key={dept.id_departement} value={dept.id_departement}>
                      {dept.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Informations de connexion */}
            <div className="md:col-span-2 mt-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                Informations de Connexion
              </h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Identifiant <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="identifiant"
                value={formData.identifiant}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Identifiant de connexion"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nouveau mot de passe (laisser vide pour ne pas modifier)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="motdepasse"
                  value={formData.motdepasse}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Nouveau mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Laissez ce champ vide si vous ne souhaitez pas changer le mot de passe
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="mt-8 flex gap-4 justify-end">
            <Link
              href="/dashboard-admin/enseignants"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Modification en cours...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Enregistrer les modifications
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
