'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  GraduationCap, Save, ArrowLeft, Mail, Phone, Building, 
  BookOpen, Users, Eye, EyeOff, Hash
} from 'lucide-react';

interface Specialite {
  id_specialite: number;
  nom: string;
  departement: {
    nom: string;
  };
}

interface Niveau {
  id_niveau: number;
  nom: string;
}

interface Groupe {
  id_groupe: number;
  nom: string;
}

interface Etudiant {
  id_etudiant: number;
  numero_inscription: string;
  departement?: string;
  specialite_nom?: string;
  niveau_nom?: string;
  groupe_nom?: string;
  id_specialite?: number;
  id_niveau?: number;
  id_groupe?: number;
  utilisateur: {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    email: string;
    identifiant: string;
  };
}

export default function ModifierEtudiantPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [etudiant, setEtudiant] = useState<Etudiant | null>(null);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    identifiant: '',
    numero_inscription: '',
    id_specialite: '',
    id_niveau: '',
    id_groupe: '',
    motdepasse: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    checkAuth();
    loadData();
  }, []);

  const checkAuth = () => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Admin') {
      router.push('/login');
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger l'étudiant
      const etudiantRes = await fetch(`/api/etudiants/${id}`);
      if (etudiantRes.ok) {
        const etudiantData = await etudiantRes.json();
        setEtudiant(etudiantData);
        
        setFormData({
          nom: etudiantData.utilisateur.nom || '',
          prenom: etudiantData.utilisateur.prenom || '',
          email: etudiantData.utilisateur.email || '',
          identifiant: etudiantData.utilisateur.identifiant || '',
          numero_inscription: etudiantData.numero_inscription || '',
          id_specialite: etudiantData.id_specialite?.toString() || '',
          id_niveau: etudiantData.id_niveau?.toString() || '',
          id_groupe: etudiantData.id_groupe?.toString() || '',
          motdepasse: '',
        });
      } else {
        setError('Étudiant introuvable');
      }

      // Charger les données de référence
      const [specRes, nivRes, grpRes] = await Promise.all([
        fetch('/api/specialites'),
        fetch('/api/niveaux'),
        fetch('/api/groupes'),
      ]);

      if (specRes.ok) setSpecialites(await specRes.json());
      if (nivRes.ok) setNiveaux(await nivRes.json());
      if (grpRes.ok) setGroupes(await grpRes.json());

    } catch (err) {
      setError('Erreur de chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.nom || !formData.prenom || !formData.email || !formData.numero_inscription) {
      setError('Les champs obligatoires doivent être remplis');
      return;
    }

    try {
      setSubmitting(true);

      const updateData: any = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        identifiant: formData.identifiant,
        numero_inscription: formData.numero_inscription,
        id_specialite: formData.id_specialite ? parseInt(formData.id_specialite) : null,
        id_niveau: formData.id_niveau ? parseInt(formData.id_niveau) : null,
        id_groupe: formData.id_groupe ? parseInt(formData.id_groupe) : null,
      };

      if (formData.motdepasse.trim()) {
        updateData.mot_de_passe = formData.motdepasse;
      }

      const res = await fetch(`/api/etudiants/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('✓ Étudiant modifié avec succès !');
        setTimeout(() => {
          router.push('/dashboard-admin/etudiants');
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link 
              href="/dashboard-admin/etudiants"
              className="inline-flex items-center text-purple-600 hover:text-purple-800 mb-2"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à la liste
            </Link>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-purple-600" />
              Modifier l'étudiant
            </h1>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro d'inscription <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="numero_inscription"
                  value={formData.numero_inscription}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>

            <div className="md:col-span-2 mt-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Informations Académiques
              </h2>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Spécialité
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <select
                  name="id_specialite"
                  value={formData.id_specialite}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="">Sélectionner une spécialité</option>
                  {specialites.map(spec => (
                    <option key={spec.id_specialite} value={spec.id_specialite}>
                      {spec.nom} ({spec.departement.nom})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Niveau
              </label>
              <select
                name="id_niveau"
                value={formData.id_niveau}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Sélectionner un niveau</option>
                {niveaux.map(niv => (
                  <option key={niv.id_niveau} value={niv.id_niveau}>
                    {niv.nom}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Groupe
              </label>
              <select
                name="id_groupe"
                value={formData.id_groupe}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">Sélectionner un groupe</option>
                {groupes.map(grp => (
                  <option key={grp.id_groupe} value={grp.id_groupe}>
                    {grp.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2 mt-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nouveau mot de passe (optionnel)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="motdepasse"
                  value={formData.motdepasse}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                Laissez vide pour conserver le mot de passe actuel
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-4 justify-end">
            <Link
              href="/dashboard-admin/etudiants"
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold flex items-center gap-2 disabled:bg-purple-400 disabled:cursor-not-allowed"
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
