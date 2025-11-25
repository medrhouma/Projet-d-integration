'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Departement {
  id_departement: number;
  nom: string;
}

export default function NouvelleSpecialite() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [formData, setFormData] = useState({
    nom: '',
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

    try {
      const res = await fetch('/api/specialites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: formData.nom,
          id_departement: parseInt(formData.id_departement)
        }),
      });

      if (res.ok) {
        setSuccess(true);
        // Redirection automatique après 1.5 seconde
        setTimeout(() => {
          router.push('/dashboard-admin/referentiels?tab=specialites');
        }, 1500);
      } else {
        const data = await res.json();
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <Link 
            href="/dashboard-admin/referentiels?tab=specialites"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← Retour aux spécialités
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle Spécialité</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Spécialité créée avec succès ! Redirection en cours...
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la spécialité <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              required
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Ex: DSI, MDW, RSI..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Département <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.id_departement}
              onChange={(e) => setFormData(prev => ({ ...prev, id_departement: e.target.value }))}
              required
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Sélectionner un département</option>
              {departements.map(dept => (
                <option key={dept.id_departement} value={dept.id_departement}>
                  {dept.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 justify-end">
            <Link
              href="/dashboard-admin/referentiels?tab=specialites"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? 'Création...' : success ? 'Créée !' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}