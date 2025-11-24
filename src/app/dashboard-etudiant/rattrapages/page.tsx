'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import Link from 'next/link';

interface Rattrapage {
  id_rattrapage: number;
  titre: string;
  description?: string;
  date?: string;
  groupes?: Array<{ id: number; nom: string }>;
  creer_par?: string;
  module?: { id?: number; nom?: string };
  salle?: { id?: number; nom?: string };
  professeur?: { id?: number; nom?: string; prenom?: string };
}

export default function RattrapagesEtudiantPage() {
  const router = useRouter();
  const [rattrapages, setRattrapages] = useState<Rattrapage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const userRole = localStorage.getItem('userRole');
    if (userRole !== 'Etudiant') {
      router.push('/login');
      return;
    }

    loadRattrapages();
  }, []);

  const loadRattrapages = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/rattrapages');
      if (!res.ok) {
        throw new Error('Erreur serveur');
      }
      const data = await res.json();
      // Assume API returns { success: true, data: [...] }
      const list = data?.data || data || [];
      setRattrapages(list);
    } catch (err: any) {
      console.error('Erreur chargement rattrapages:', err);
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner color="blue" message="Chargement des rattrapages..." />;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rattrapages</h1>
          <p className="text-gray-600">Liste des rattrapages disponibles pour vous</p>
        </div>
        <div>
          <Link href="/dashboard-etudiant" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            ← Retour
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">{error}</div>
      )}

      {rattrapages.length === 0 ? (
        <div className="p-6 bg-white border border-gray-200 rounded-lg">Aucun rattrapage pour le moment.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rattrapages.map((r) => (
            <div key={r.id_rattrapage} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{r.titre}</h2>
                  {r.date && <p className="text-sm text-gray-500">{new Date(r.date).toLocaleString('fr-FR')}</p>}
                </div>
              </div>

              {r.description && <p className="mt-3 text-sm text-gray-700">{r.description}</p>}

              {/* Display chef form fields: matiere/module, salle, enseignant, groupes, motif, heures, liste_etudiants */}
              <div className="mt-3 text-sm text-gray-700 border-t pt-3">
                {/* Module / Matière */}
                {r.matiere?.nom && (
                  <div className="mb-1"><strong>Module:</strong> {r.matiere.nom}</div>
                )}

                {/* Salle: chef uses r.salle.code or r.salle.nom */}
                {(r.salle?.code || r.salle?.nom) && (
                  <div className="mb-1"><strong>Salle:</strong> {r.salle.code || r.salle.nom}</div>
                )}

                {/* Professeur / Enseignant: chef stores as r.enseignant with utilisateur */}
                {(r.enseignant?.utilisateur || r.professeur) && (
                  <div className="mb-1"><strong>Professeur:</strong> {r.enseignant?.utilisateur ? `${r.enseignant.utilisateur.prenom || ''} ${r.enseignant.utilisateur.nom || ''}` : `${r.professeur?.prenom || ''} ${r.professeur?.nom || ''}`.trim()}</div>
                )}

                {/* Groupes: chef page sometimes stores groups as objects with .groupe or simple entries */}
                {(r.groupes && r.groupes.length > 0) && (
                  <div className="mb-1"><strong>Groupes concernés:</strong> {r.groupes.map((g: any) => (g.groupe ? g.groupe.nom : (g.nom || g.id_groupe || g.id))).join(', ')}</div>
                )}

                {/* Liste d'étudiants brute (fallback) */}
                {r.liste_etudiants && (
                  <div className="mb-1"><strong>Liste étudiants (IDs):</strong> {String(r.liste_etudiants)}</div>
                )}

                {/* Motif / Notes */}
                {r.motif && (
                  <div className="mb-1"><strong>Motif:</strong> {r.motif}</div>
                )}

                {/* Heures si présentes */}
                {(r.heure_debut || r.heure_fin) && (
                  <div className="mb-1"><strong>Heure:</strong> {r.heure_debut ? new Date(r.heure_debut).toLocaleTimeString() : ''}{r.heure_debut && r.heure_fin ? ' - ' : ''}{r.heure_fin ? new Date(r.heure_fin).toLocaleTimeString() : ''}</div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-end">
                <button className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Voir</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
