'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Departement {
  id_departement: number;
  nom: string;
}

interface Groupe {
  id_groupe: number;
  nom: string;
  niveau: {
    nom: string;
    specialite: {
      nom: string;
      departement: {
        nom: string;
      };
    };
  };
}

interface Enseignant {
  id_enseignant: number;
  matricule: string;
  utilisateur: {
    nom: string;
    prenom: string;
  };
  departement: {
    nom: string;
  };
}

interface Salle {
  id_salle: number;
  code: string;
  type: string;
  capacité: number;
}

interface Matiere {
  id_matiere: number;
  nom: string;
  niveau: {
    nom: string;
  };
}

interface EmploiTemps {
  id_emploi: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  matiere: Matiere;
  salle: Salle;
  groupe: Groupe;
  enseignant: Enseignant;
}

export default function EmploiTempsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [enseignants, setEnseignants] = useState<Enseignant[]>([]);
  const [salles, setSalles] = useState<Salle[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [emplois, setEmplois] = useState<EmploiTemps[]>([]);
  
  // Filtres
  const [selectedDepartement, setSelectedDepartement] = useState<number | null>(null);
  const [selectedGroupe, setSelectedGroupe] = useState<number | null>(null);
  const [selectedEnseignant, setSelectedEnseignant] = useState<number | null>(null);
  const [selectedSalle, setSelectedSalle] = useState<number | null>(null);
  
  // Semaine actuelle
  const [currentWeek, setCurrentWeek] = useState(new Date());
  
  // Modal pour ajouter un cours
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ day: number; hour: number } | null>(null);
  const [formData, setFormData] = useState({
    id_matiere: '',
    id_groupe: '',
    id_enseignant: '',
    id_salle: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Heures de cours (8h à 18h)
  const heures = Array.from({ length: 10 }, (_, i) => i + 8);
  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDepartement || selectedGroupe || selectedEnseignant || selectedSalle) {
      loadEmplois();
    }
  }, [selectedDepartement, selectedGroupe, selectedEnseignant, selectedSalle, currentWeek]);

  const loadData = async () => {
    try {
      const [deptRes, groupesRes, enseignantsRes, sallesRes, matieresRes] = await Promise.all([
        fetch('/api/departements'),
        fetch('/api/groupes'),
        fetch('/api/enseignants'),
        fetch('/api/salles'),
        fetch('/api/matieres'),
      ]);

      const [deptData, groupesData, enseignantsData, sallesData, matieresData] = await Promise.all([
        deptRes.json(),
        groupesRes.json(),
        enseignantsRes.json(),
        sallesRes.json(),
        matieresRes.json(),
      ]);

      setDepartements(deptData);
      setGroupes(groupesData);
      setEnseignants(enseignantsData);
      setSalles(sallesData);
      setMatieres(matieresData);
    } catch (error) {
      console.error('Erreur de chargement:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const loadEmplois = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedDepartement) params.append('departementId', selectedDepartement.toString());
      if (selectedGroupe) params.append('groupeId', selectedGroupe.toString());
      if (selectedEnseignant) params.append('enseignantId', selectedEnseignant.toString());
      if (selectedSalle) params.append('salleId', selectedSalle.toString());
      
      // Dates de la semaine
      const startOfWeek = getStartOfWeek(currentWeek);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      params.append('dateDebut', startOfWeek.toISOString().split('T')[0]);
      params.append('dateFin', endOfWeek.toISOString().split('T')[0]);

      const res = await fetch(`/api/emploi-temps?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setEmplois(data);
      }
    } catch (error) {
      console.error('Erreur de chargement des emplois:', error);
    }
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi
    return new Date(d.setDate(diff));
  };

  const getDateForDayAndHour = (dayIndex: number, hour: number) => {
    const startOfWeek = getStartOfWeek(currentWeek);
    const date = new Date(startOfWeek);
    date.setDate(date.getDate() + dayIndex);
    date.setHours(hour, 0, 0, 0);
    return date;
  };

  const getEmploiForSlot = (dayIndex: number, hour: number) => {
    const slotDate = getDateForDayAndHour(dayIndex, hour);
    const slotDateStr = slotDate.toISOString().split('T')[0];
    
    return emplois.find(emploi => {
      const emploiDate = new Date(emploi.date).toISOString().split('T')[0];
      const emploiHeure = new Date(emploi.heure_debut).getHours();
      return emploiDate === slotDateStr && emploiHeure === hour;
    });
  };

  const handleSlotClick = (dayIndex: number, hour: number) => {
    setSelectedSlot({ day: dayIndex, hour });
    setShowModal(true);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedSlot) return;

    try {
      const date = getDateForDayAndHour(selectedSlot.day, selectedSlot.hour);
      const heure_debut = new Date(date);
      const heure_fin = new Date(date);
      heure_fin.setHours(heure_fin.getHours() + 1);

      const res = await fetch('/api/emploi-temps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: date.toISOString().split('T')[0],
          heure_debut: heure_debut.toISOString(),
          heure_fin: heure_fin.toISOString(),
          id_matiere: parseInt(formData.id_matiere),
          id_groupe: parseInt(formData.id_groupe),
          id_enseignant: formData.id_enseignant ? parseInt(formData.id_enseignant) : undefined,
          id_salle: formData.id_salle ? parseInt(formData.id_salle) : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Cours ajouté avec succès !');
        setShowModal(false);
        setFormData({ id_matiere: '', id_groupe: '', id_enseignant: '', id_salle: '' });
        loadEmplois();
      } else if (res.status === 409) {
        // Conflits détectés
        const conflitsMsg = data.conflits.map((c: any) => c.message).join('\n');
        setError(`Conflits détectés:\n${conflitsMsg}`);
      } else {
        setError(data.error || 'Erreur lors de l\'ajout du cours');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de l\'ajout du cours');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Voulez-vous vraiment supprimer ce cours ?')) return;

    try {
      const res = await fetch(`/api/emploi-temps/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSuccess('Cours supprimé avec succès !');
        loadEmplois();
      } else {
        setError('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      setError('Erreur lors de la suppression');
    }
  };

  const previousWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() - 7);
    setCurrentWeek(newWeek);
  };

  const nextWeek = () => {
    const newWeek = new Date(currentWeek);
    newWeek.setDate(newWeek.getDate() + 7);
    setCurrentWeek(newWeek);
  };

  const formatWeekRange = () => {
    const start = getStartOfWeek(currentWeek);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${start.toLocaleDateString('fr-FR', options)} - ${end.toLocaleDateString('fr-FR', options)}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Emploi du Temps</h1>
        <p className="text-gray-600">Gestion de l'emploi du temps avec détection de conflits</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtres</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Département
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={selectedDepartement || ''}
              onChange={(e) => setSelectedDepartement(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Tous</option>
              {departements.map((dept) => (
                <option key={dept.id_departement} value={dept.id_departement}>
                  {dept.nom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Groupe
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={selectedGroupe || ''}
              onChange={(e) => setSelectedGroupe(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Tous</option>
              {groupes
                .filter(g => !selectedDepartement || g.niveau.specialite.departement.nom === departements.find(d => d.id_departement === selectedDepartement)?.nom)
                .map((groupe) => (
                  <option key={groupe.id_groupe} value={groupe.id_groupe}>
                    {groupe.nom} - {groupe.niveau.nom}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enseignant
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={selectedEnseignant || ''}
              onChange={(e) => setSelectedEnseignant(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Tous</option>
              {enseignants.map((ens) => (
                <option key={ens.id_enseignant} value={ens.id_enseignant}>
                  {ens.utilisateur.nom} {ens.utilisateur.prenom}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Salle
            </label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={selectedSalle || ''}
              onChange={(e) => setSelectedSalle(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Toutes</option>
              {salles.map((salle) => (
                <option key={salle.id_salle} value={salle.id_salle}>
                  {salle.code} ({salle.type})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-line">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {/* Navigation semaine */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6 flex justify-between items-center">
        <button
          onClick={previousWeek}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Semaine précédente
        </button>
        <div className="text-lg font-semibold">{formatWeekRange()}</div>
        <button
          onClick={nextWeek}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Semaine suivante →
        </button>
      </div>

      {/* Calendrier */}
      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-sm font-semibold sticky left-0 bg-gray-100 z-10">Heure</th>
              {jours.map((jour, index) => (
                <th key={index} className="border p-2 text-sm font-semibold min-w-[150px]">
                  {jour}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {heures.map((heure) => (
              <tr key={heure}>
                <td className="border p-2 text-sm font-medium sticky left-0 bg-white z-10">
                  {heure}h - {heure + 1}h
                </td>
                {jours.map((_, dayIndex) => {
                  const emploi = getEmploiForSlot(dayIndex, heure);
                  return (
                    <td
                      key={dayIndex}
                      className={`border p-1 cursor-pointer hover:bg-gray-50 ${
                        emploi ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => !emploi && handleSlotClick(dayIndex, heure)}
                    >
                      {emploi ? (
                        <div className="text-xs">
                          <div className="font-semibold text-blue-800">{emploi.matiere.nom}</div>
                          <div className="text-gray-600">{emploi.groupe.nom}</div>
                          {emploi.enseignant && (
                            <div className="text-gray-500">
                              {emploi.enseignant.utilisateur.nom} {emploi.enseignant.utilisateur.prenom}
                            </div>
                          )}
                          {emploi.salle && (
                            <div className="text-gray-500">{emploi.salle.code}</div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(emploi.id_emploi);
                            }}
                            className="mt-1 text-red-600 hover:text-red-800 text-xs"
                          >
                            Supprimer
                          </button>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 text-center">+</div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Ajouter un cours */}
      {showModal && selectedSlot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">
              Ajouter un cours - {jours[selectedSlot.day]} {selectedSlot.hour}h
            </h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 whitespace-pre-line">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matière *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.id_matiere}
                  onChange={(e) => setFormData({ ...formData, id_matiere: e.target.value })}
                >
                  <option value="">Sélectionner une matière</option>
                  {matieres.map((mat) => (
                    <option key={mat.id_matiere} value={mat.id_matiere}>
                      {mat.nom} - {mat.niveau.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Groupe *
                </label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.id_groupe}
                  onChange={(e) => setFormData({ ...formData, id_groupe: e.target.value })}
                >
                  <option value="">Sélectionner un groupe</option>
                  {groupes.map((groupe) => (
                    <option key={groupe.id_groupe} value={groupe.id_groupe}>
                      {groupe.nom} - {groupe.niveau.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enseignant
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.id_enseignant}
                  onChange={(e) => setFormData({ ...formData, id_enseignant: e.target.value })}
                >
                  <option value="">Sélectionner un enseignant</option>
                  {enseignants.map((ens) => (
                    <option key={ens.id_enseignant} value={ens.id_enseignant}>
                      {ens.utilisateur.nom} {ens.utilisateur.prenom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Salle
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={formData.id_salle}
                  onChange={(e) => setFormData({ ...formData, id_salle: e.target.value })}
                >
                  <option value="">Sélectionner une salle</option>
                  {salles.map((salle) => (
                    <option key={salle.id_salle} value={salle.id_salle}>
                      {salle.code} - {salle.type} (Cap: {salle.capacité})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setError('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
