"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminEvenementsPage() {
  const router = useRouter();
  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [type, setType] = useState('fermeture');
  const [concerneTous, setConcerneTous] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // For now use current user id from localStorage or fallback to 1
  const organiserId = typeof window !== 'undefined' ? (localStorage.getItem('userId') ? Number(localStorage.getItem('userId')) : 1) : 1;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        titre,
        description,
        date_debut: dateDebut,
        date_fin: dateFin,
        type,
        id_organisateur: organiserId,
        concerne_tous: concerneTous,
      } as any;

      const res = await fetch('/api/evenements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage('Événement créé avec succès.');
        setTitre('');
        setDescription('');
        setDateDebut('');
        setDateFin('');
        setType('fermeture');
        // Optionally refresh or navigate
        setTimeout(() => router.push('/'), 800);
      } else {
        const data = await res.json();
        setMessage(data?.error || 'Erreur lors de la création');
      }
    } catch (err) {
      setMessage('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Créer un événement institutionnel</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Titre</label>
          <input value={titre} onChange={(e) => setTitre(e.target.value)} className="w-full border rounded p-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border rounded p-2" rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Date début</label>
            <input type="datetime-local" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date fin</label>
            <input type="datetime-local" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className="w-full border rounded p-2" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full border rounded p-2">
              <option value="fermeture">Fermeture</option>
              <option value="conference">Conférence</option>
              <option value="autre">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Concerne tous</label>
            <select value={concerneTous ? '1' : '0'} onChange={(e) => setConcerneTous(e.target.value === '1')} className="w-full border rounded p-2">
              <option value="1">Oui</option>
              <option value="0">Non</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
            {loading ? 'En cours...' : 'Créer'}
          </button>
        </div>

        {message && <div className="mt-2 text-sm text-gray-700">{message}</div>}
      </form>
    </div>
  );
}
