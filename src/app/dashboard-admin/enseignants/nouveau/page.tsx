'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Departement {
  id_departement: number;
  nom: string;
}

export default function NouvelEnseignant() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [departements, setDepartements] = useState<Departement[]>([]);
  
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    identifiant: '',
    mot_de_passe: '',
    matricule: '',
    id_departement: ''
  });

  useEffect(() => {
    loadDepartements();
  }, []);

  const loadDepartements = async () => {
    try {
      const res = await fetch('/api/departements');
      if (res.ok) {
        const data = await res.json();
        setDepartements(data);
      }
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/enseignants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard-admin/enseignants');
        }, 1500);
      } else {
        setError(data.error || 'Erreur lors de l\'ajout');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateIdentifiant = () => {
    if (formData.nom && formData.prenom) {
      const identifiant = `prof.${formData.nom.toLowerCase()}`;
      setFormData(prev => ({ ...prev, identifiant }));
    }
  };

  const generateEmail = () => {
    if (formData.nom && formData.prenom) {
      const email = `${formData.prenom.toLowerCase()}.${formData.nom.toLowerCase()}@school.tn`;
      setFormData(prev => ({ ...prev, email }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            href="/dashboard-admin/enseignants"
            className="text-green-600 hover:text-green-800 flex items-center gap-2 mb-4"
          >
            ← Retour aux enseignants
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Ajouter un enseignant</h1>
          <p className="text-gray-600 mt-2">Remplissez tous les champs pour créer un nouveau compte enseignant</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Enseignant ajouté avec succès ! Redirection en cours...
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Informations personnelles */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              👤 Informations personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  onBlur={() => {
                    generateEmail();
                    generateIdentifiant();
                  }}
                  required
                  disabled={loading || success}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Nom de famille"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  onBlur={() => {
                    generateEmail();
                    generateIdentifiant();
                  }}
                  required
                  disabled={loading || success}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Prénom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading || success}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="email@school.tn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matricule <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="matricule"
                  value={formData.matricule}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  disabled={loading || success}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="ENS001"
                />
              </div>
            </div>
          </div>

          {/* Informations de connexion */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              🔐 Informations de connexion
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identifiant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="identifiant"
                  value={formData.identifiant}
                  onChange={handleChange}
                  required
                  disabled={loading || success}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="prof.nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="mot_de_passe"
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  required
                  minLength={6}
                  disabled={loading || success}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
                  placeholder="Minimum 6 caractères"
                />
              </div>
            </div>
          </div>

          {/* Affectation */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              🏢 Affectation
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Département
              </label>
              <select
                name="id_departement"
                value={formData.id_departement}
                onChange={handleChange}
                disabled={loading || success}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100"
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

          <div className="flex gap-4 justify-end">
            <Link
              href="/dashboard-admin/enseignants"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Ajout en cours...' : success ? 'Ajouté !' : 'Ajouter l\'enseignant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}