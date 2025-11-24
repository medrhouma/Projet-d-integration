'use client';

import React, { useEffect, useState } from 'react';

export default function AjustementsPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ id_emploi_origine: '', type_ajustement: '', motif: '', id_rattrapage: '', nouvelles_valeurs: '' });

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ajustements');
      if (!res.ok) throw new Error('Erreur chargement');
      const data = await res.json();
      setList(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        id_emploi_origine: Number(form.id_emploi_origine),
        id_rattrapage: form.id_rattrapage ? Number(form.id_rattrapage) : undefined,
        type_ajustement: form.type_ajustement,
        nouvelles_valeurs: form.nouvelles_valeurs ? JSON.parse(form.nouvelles_valeurs) : undefined,
        motif: form.motif,
        id_auteur: Number(localStorage.getItem('userId') || '1'),
      };

      const res = await fetch('/api/ajustements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || 'Erreur création');
      }
      setForm({ id_emploi_origine: '', type_ajustement: '', motif: '', id_rattrapage: '', nouvelles_valeurs: '' });
      await load();
      alert('Ajustement créé');
    } catch (err) {
      alert(String(err));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Gérer les ajustements d'emploi du temps</h1>

      <div className="mb-6">
        <form onSubmit={submit} className="space-y-2 max-w-md">
          <input required placeholder="id_emploi_origine" value={form.id_emploi_origine} onChange={e => setForm({ ...form, id_emploi_origine: e.target.value })} className="p-2 border" />
          <input placeholder="id_rattrapage (optionnel)" value={form.id_rattrapage} onChange={e => setForm({ ...form, id_rattrapage: e.target.value })} className="p-2 border" />
          <input required placeholder="type_ajustement" value={form.type_ajustement} onChange={e => setForm({ ...form, type_ajustement: e.target.value })} className="p-2 border" />
          <input required placeholder="motif" value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} className="p-2 border" />
          <textarea placeholder='nouvelles_valeurs as JSON (e.g. {"id_salle":2})' value={form.nouvelles_valeurs} onChange={e => setForm({ ...form, nouvelles_valeurs: e.target.value })} className="p-2 border" />
          <div><button className="px-3 py-2 bg-blue-600 text-white rounded">Créer</button></div>
        </form>
      </div>

      <div>
        <h2 className="font-semibold mb-2">Liste</h2>
        {loading ? <p>Chargement...</p> : (
          <ul className="space-y-2">
            {list.map(r => (
              <li key={r.id_ajustement} className="border p-3 rounded">
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{r.type_ajustement} - {r.motif}</div>
                    <div className="text-xs text-gray-600">{new Date(r.date_creation).toLocaleString()}</div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
