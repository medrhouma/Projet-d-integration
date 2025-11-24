"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';

export default function RattrapagesPage() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [matieres, setMatieres] = useState<any[]>([]);
  const [salles, setSalles] = useState<any[]>([]);
  const [enseignants, setEnseignants] = useState<any[]>([]);
  const [groupesList, setGroupesList] = useState<any[]>([]);

  const [form, setForm] = useState({
    id_matiere: "",
    date: "",
    id_salle: "",
    id_enseignant: "",
    heure_debut: "",
    heure_fin: "",
    selected_groupes: [] as string[],
    motif: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [rRes, mRes, sRes, eRes, gRes] = await Promise.all([
        fetch("/api/rattrapages"),
        fetch("/api/matieres"),
        fetch("/api/salles"),
        fetch("/api/enseignants"),
        fetch("/api/groupes"),
      ]);

      if (!rRes.ok) throw new Error("Erreur chargement rattrapages");
      const [rData, mData, sData, eData, gData] = await Promise.all([rRes.json(), mRes.json(), sRes.json(), eRes.json(), gRes.json()]);
      setList(rData || []);
      setMatieres(mData || []);
      setSalles(sData || []);
      setEnseignants(eData || []);
      setGroupesList(gData || []);
    } catch (e) {
      console.error(e);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const router = useRouter();

  const openAdd = () => {
    setEditingId(null);
    setForm({ id_matiere: "", date: "", id_salle: "", id_enseignant: "", selected_groupes: [], motif: "" });
    setShowForm(true);
  };

  const openEdit = (r: any) => {
    setEditingId(r.id_rattrapage);
    setForm({
      id_matiere: String(r.id_matiere || ""),
      date: r.date ? new Date(r.date).toISOString().slice(0, 10) : "",
      heure_debut: r.heure_debut ? new Date(r.heure_debut).toLocaleTimeString('fr-FR', { hour12: false, hour: '2-digit', minute: '2-digit' }) : "",
      heure_fin: r.heure_fin ? new Date(r.heure_fin).toLocaleTimeString('fr-FR', { hour12: false, hour: '2-digit', minute: '2-digit' }) : "",
      id_salle: String(r.id_salle || ""),
      id_enseignant: String(r.id_enseignant || ""),
      selected_groupes: (r.groupes || []).map((g: any) => String(g.groupe?.id_groupe)).filter(Boolean),
      motif: r.motif || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Confirmer la suppression ?")) return;
    try {
      const res = await fetch(`/api/rattrapages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Suppression échouée");
      await load();
      alert("Supprimé");
    } catch (e) {
      console.error(e);
      alert(String(e));
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const payload: any = {
        id_matiere: Number(form.id_matiere) || undefined,
        id_enseignant: Number(form.id_enseignant) || undefined,
        id_salle: Number(form.id_salle) || undefined,
        date: form.date ? new Date(form.date).toISOString() : undefined,
        heure_debut: (form.date && form.heure_debut) ? new Date(`${form.date}T${form.heure_debut}`).toISOString() : (form.heure_debut ? new Date(form.heure_debut).toISOString() : undefined),
        heure_fin: (form.date && form.heure_fin) ? new Date(`${form.date}T${form.heure_fin}`).toISOString() : (form.heure_fin ? new Date(form.heure_fin).toISOString() : undefined),
        motif: form.motif,
        groupes: Array.isArray(form.selected_groupes) ? form.selected_groupes.map(s => Number(s)) : [],
        id_planificateur: Number(localStorage.getItem("userId") || "1"),
      };

      const url = editingId ? `/api/rattrapages/${editingId}` : "/api/rattrapages";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || "Erreur sauvegarde");
      }
      setShowForm(false);
      setEditingId(null);
      await load();
      alert(editingId ? "Modifié" : "Créé");
    } catch (err) {
      console.error(err);
      alert(String(err));
    }
  };

  const downloadCSV = () => {
    if (!list || list.length === 0) { alert("Rien à télécharger"); return; }
    const headers = ["id_rattrapage", "matiere", "date", "heure_debut", "heure_fin", "salle", "enseignant", "motif"].join(",");
    const rows = list.map(r => [r.id_rattrapage, r.matiere?.nom || "", r.date ? new Date(r.date).toLocaleString() : "", r.heure_debut ? new Date(r.heure_debut).toLocaleTimeString() : "", r.heure_fin ? new Date(r.heure_fin).toLocaleTimeString() : "", r.salle?.code || "", r.enseignant?.utilisateur ? `${r.enseignant.utilisateur.prenom} ${r.enseignant.utilisateur.nom}` : "", (r.motif || "")].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rattrapages_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendNotificationFor = async (r: any) => {
    try {
      // Gather student ids: from groupes -> fetch students per groupe would be needed; if groupes array contains student ids we use them
      let etudiants: number[] = [];
      if (r.groupes && Array.isArray(r.groupes) && r.groupes.length > 0) {
        // if groupe object has etudiants, map; otherwise fallback to empty
        r.groupes.forEach((g: any) => {
          if (g.groupe && g.groupe.etudiants) etudiants.push(...g.groupe.etudiants.map((s: any) => s.id_etudiant));
        });
      }
      // If no students found, ask for manual list
      if (etudiants.length === 0 && r.liste_etudiants) {
        etudiants = r.liste_etudiants.split(",").map((s: string) => Number(s.trim())).filter(Boolean);
      }

      if (etudiants.length === 0) {
        if (!confirm("Aucun étudiant détecté automatiquement. Envoyer notification manuellement en utilisant la liste d'IDs dans le formulaire?")) return;
      }

      // Send one notification per student (simple approach)
      for (const id_etudiant of etudiants) {
        await fetch('/api/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          id_etudiant,
          type: 'ANNULATION_COURS',
          titre: 'Rattrapage planifié',
          message: `Un rattrapage a été planifié : ${r.motif || ''}`,
          donnees: { date: r.date }
        })});
      }

      alert('Notifications envoyées');
    } catch (e) {
      console.error(e);
      alert('Erreur envoi notifications');
    }
  };

  return (
    <div className="p-6 bg-white text-gray-900 min-h-screen">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button onClick={() => router.push('/dashboard-chef-departement')} className="mr-4 px-3 py-2 bg-gray-100 rounded">← Retour</button>
            <h1 className="text-xl font-bold">Gestion des rattrapages</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={openAdd} className="px-3 py-2 bg-green-600 text-white rounded">➕ Ajouter un rattrapage</button>
            <button onClick={downloadCSV} className="px-3 py-2 bg-gray-100 rounded">📄 Télécharger la liste</button>
          </div>
        </div>

      <div className="mb-4">
        {loading ? <p>Chargement...</p> : (
          <div className="overflow-x-auto bg-white">
          <table className="w-full table-auto border-collapse bg-white text-gray-900">
            <thead>
              <tr className="text-left bg-gray-50">
                <th className="p-2 text-sm text-gray-700">Module</th>
                <th className="p-2 text-sm text-gray-700">Date</th>
                <th className="p-2 text-sm text-gray-700">Salle</th>
                <th className="p-2 text-sm text-gray-700">Prof responsable</th>
                <th className="p-2 text-sm text-gray-700">Classe</th>
                <th className="p-2 text-sm text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map(r => (
                <tr key={r.id_rattrapage} className="border-t bg-white">
                  <td className="p-2">{r.matiere?.nom || '-'}</td>
                  <td className="p-2">{r.date ? new Date(r.date).toLocaleString() : '-'}</td>
                  <td className="p-2">{r.salle?.code || '-'}</td>
                  <td className="p-2">{r.enseignant?.utilisateur ? `${r.enseignant.utilisateur.prenom} ${r.enseignant.utilisateur.nom}` : '-'}</td>
                  <td className="p-2">{(r.groupes || []).map((g: any) => g.groupe?.nom || g.id_groupe).join(', ') || (r.liste_etudiants || '-')}</td>
                  <td className="p-2 flex gap-2">
                    <button onClick={() => openEdit(r)} className="px-2 py-1 bg-yellow-50 text-gray-800 border rounded">📝 Modifier</button>
                    <button onClick={() => handleDelete(r.id_rattrapage)} className="px-2 py-1 bg-red-50 text-red-700 border rounded">❌ Supprimer</button>
                    <button onClick={() => sendNotificationFor(r)} className="px-2 py-1 bg-blue-50 text-blue-700 border rounded">🔔 Envoyer notification</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">{editingId ? 'Modifier Rattrapage' : 'Ajouter Rattrapage'}</h2>
              <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-2 py-1">Fermer</button>
            </div>

            <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
              <label className="col-span-2">
                Module:
                <select required value={form.id_matiere} onChange={e => setForm({ ...form, id_matiere: e.target.value })} className="w-full p-2 border mt-1">
                  <option value="">-- Choisir --</option>
                  {matieres.map(m => <option key={m.id_matiere} value={m.id_matiere}>{m.nom}</option>)}
                </select>
              </label>

              <label>
                Date:
                <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="w-full p-2 border mt-1" />
              </label>

              <label>
                Salle:
                <select required value={form.id_salle} onChange={e => setForm({ ...form, id_salle: e.target.value })} className="w-full p-2 border mt-1">
                  <option value="">-- Choisir --</option>
                  {salles.map(s => <option key={s.id_salle} value={s.id_salle}>{s.code}</option>)}
                </select>
              </label>

              <label className="col-span-2">
                Prof responsable:
                <select required value={form.id_enseignant} onChange={e => setForm({ ...form, id_enseignant: e.target.value })} className="w-full p-2 border mt-1">
                  <option value="">-- Choisir --</option>
                  {enseignants.map(en => <option key={en.id_enseignant} value={en.id_enseignant}>{en.utilisateur?.prenom} {en.utilisateur?.nom}</option>)}
                </select>
              </label>

              <label className="col-span-2">
                Classe (Groupes) — choisissez une ou plusieurs classes:
                <select multiple value={form.selected_groupes} onChange={e => {
                  const opts = Array.from(e.target.selectedOptions).map(o => o.value);
                  setForm({ ...form, selected_groupes: opts });
                }} className="w-full p-2 border mt-1 h-32">
                  {groupesList.map(g => (
                    <option key={g.id_groupe} value={g.id_groupe}>{g.nom}</option>
                  ))}
                </select>
              </label>

              <label className="col-span-2">
                Motif / Notes:
                <input value={form.motif} onChange={e => setForm({ ...form, motif: e.target.value })} className="w-full p-2 border mt-1" />
              </label>

              <div className="col-span-2 flex justify-end gap-2 mt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-3 py-2 bg-gray-200 rounded">Annuler</button>
                <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">{editingId ? 'Enregistrer' : 'Créer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
