'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NouvelleSalle() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    type: 'Salle de cours',
    capacite: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/salles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          type: formData.type,
          capacite: parseInt(formData.capacite)
        }),
      });

      if (res.ok) {
        setSuccess(true);
        // Redirection automatique après 1.5 seconde
        setTimeout(() => {
          router.push('/dashboard-admin/referentiels?tab=salles');
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
            href="/dashboard-admin/referentiels?tab=salles"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← Retour aux salles
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle Salle</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Salle créée avec succès ! Redirection en cours...
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Code de la salle <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              required
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Ex: A101, B202..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de salle <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              required
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="Salle de cours">Salle de cours</option>
              <option value="Laboratoire Informatique">Laboratoire Informatique</option>
              <option value="Laboratoire Réseau">Laboratoire Réseau</option>
              <option value="Amphithéâtre">Amphithéâtre</option>
              <option value="Salle TP">Salle TP</option>
              <option value="Salle Multimédia">Salle Multimédia</option>
              <option value="Atelier">Atelier</option>
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacité <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={formData.capacite}
              onChange={(e) => setFormData(prev => ({ ...prev, capacite: e.target.value }))}
              required
              min="1"
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Nombre de places"
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Link
              href="/dashboard-admin/referentiels?tab=salles"
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