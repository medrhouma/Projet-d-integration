'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Niveau {
  id_niveau: number;
  nom: string;
  specialite?: {
    nom: string;
  };
}

interface Enseignant {
  id_enseignant: number;
  utilisateur: {
    nom: string;
    prenom: string;
  };
}

export default function NouvelleMatiere() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [formData, setFormData] = useState({
    nom: '',
    id_niveau: '',
    id_enseignant: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [nivRes, ensRes] = await Promise.all([
        fetch('/api/niveaux'),
        fetch('/api/enseignants')
      ]);
      
      if (nivRes.ok) setNiveaux(await nivRes.json());
      if (ensRes.ok) setEnseignants(await ensRes.json());
    } catch (err) {
      console.error('Erreur:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/matieres', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: formData.nom,
          id_niveau: parseInt(formData.id_niveau),
          id_enseignant: parseInt(formData.id_enseignant)
        }),
      });

      if (res.ok) {
        setSuccess(true);
        // Redirection automatique après 1.5 seconde
        setTimeout(() => {
          router.push('/dashboard-admin/referentiels?tab=matieres');
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
            href="/dashboard-admin/referentiels?tab=matieres"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← Retour aux matières
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Nouvelle Matière</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            Matière créée avec succès ! Redirection en cours...
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom de la matière <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
              required
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              placeholder="Ex: Programmation Web, Base de Données..."
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.id_niveau}
              onChange={(e) => setFormData(prev => ({ ...prev, id_niveau: e.target.value }))}
              required
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Sélectionner un niveau</option>
              {niveaux.map(niv => (
                <option key={niv.id_niveau} value={niv.id_niveau}>
                  {niv.specialite?.nom} - {niv.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enseignant <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.id_enseignant}
              onChange={(e) => setFormData(prev => ({ ...prev, id_enseignant: e.target.value }))}
              required
              disabled={loading || success}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Sélectionner un enseignant</option>
              {enseignants.map(ens => (
                <option key={ens.id_enseignant} value={ens.id_enseignant}>
                  {ens.utilisateur.nom} {ens.utilisateur.prenom}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 justify-end">
            <Link
              href="/dashboard-admin/referentiels?tab=matieres"
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