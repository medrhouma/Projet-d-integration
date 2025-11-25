'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, BookOpen, ArrowLeftCircle } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Groupe {
  id_groupe: number;
  nom: string;
  niveau: {
    nom: string;
  };
}

interface Emploi {
  id_emploi: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  matiere: {
    nom: string;
  };
  enseignant?: {
    utilisateur: {
      nom: string;
      prenom: string;
    };
  };
  salle?: {
    code: string;
  };
}

export default function EmploiTempsAdminPage() {
  const router = useRouter();

  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [emplois, setEmplois] = useState<Emploi[]>([]);
  const [selectedGroupe, setSelectedGroupe] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const heures = [
    { label: '08:30 - 10:00', start: 8.5, end: 10 },
    { label: '10:00 - 11:30', start: 10, end: 11.5 },
    { label: '11:30 - 13:00', start: 11.5, end: 13 },
    { label: 'PAUSE', start: 13, end: 14, isPause: true },
    { label: '14:00 - 15:30', start: 14, end: 15.5 },
    { label: '15:30 - 17:00', start: 15.5, end: 17 },
  ];

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

  // Charger groupes
  useEffect(() => {
    fetch('/api/groupes')
      .then(res => res.json())
      .then(data => setGroupes(data))
      .catch(err => console.error('Erreur chargement groupes:', err))
      .finally(() => setLoading(false));
  }, []);

  // Charger emplois
  useEffect(() => {
    if (selectedGroupe) {
      fetch(`/api/emploi-temps/public?groupeId=${selectedGroupe}`)
        .then(res => res.json())
        .then(data => setEmplois(data))
        .catch(err => console.error('Erreur chargement emplois:', err));
    } else {
      setEmplois([]);
    }
  }, [selectedGroupe]);

  const getEmploiForSlot = (dayIndex: number, slotStart: number, slotEnd: number) => {
    return emplois.find(emploi => {
      const emploiDate = new Date(emploi.date);
      const dayOfWeek = emploiDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      if (adjustedDay !== dayIndex) return false;

      const heureDebut = new Date(emploi.heure_debut);
      const emploiHeureDebut = heureDebut.getUTCHours() + heureDebut.getUTCMinutes() / 60;

      return emploiHeureDebut >= slotStart && emploiHeureDebut < slotEnd;
    });
  };

  if (loading) {
    return <LoadingSpinner color="purple" message="Chargement de l'emploi du temps..." />;
  }

  const selectedGroupeData = groupes.find(g => g.id_groupe === selectedGroupe);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      
      {/* Bouton Retour */}
      <button
        onClick={() => router.push('/dashboard-admin')}
        className="mb-4 bg-white border border-gray-300 hover:bg-gray-50 transition px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm text-gray-700"
      >
        <ArrowLeftCircle size={20} />
        Retour
      </button>

      {/* En-tête */}
      <div className="mb-6 text-center">
        <div className="inline-flex items-center justify-center gap-2 mb-3">
          <Calendar size={32} className="text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Emploi du Temps
        </h1>
        <p className="text-gray-600">Consultation des emplois du temps par groupe</p>
      </div>

      {/* Sélecteur de groupe */}
      <div className="max-w-2xl mx-auto mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <label className="block text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Users size={20} className="text-blue-600" />
            Sélectionner un groupe
          </label>

          <select
            className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            value={selectedGroupe || ''}
            onChange={e => setSelectedGroupe(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">Choisir un groupe...</option>
            {groupes.map(groupe => (
              <option key={groupe.id_groupe} value={groupe.id_groupe}>
                {groupe.nom} - {groupe.niveau?.nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Emploi du temps */}
      {selectedGroupe ? (
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

            {/* Header tableau */}
            <div className="bg-blue-600 text-white p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                    <BookOpen size={24} />
                    {selectedGroupeData?.nom}
                  </h2>
                  <p className="text-blue-100 text-sm">Emploi du temps de la semaine</p>
                </div>

                {emplois.length > 0 && (
                  <div className="flex items-center gap-2 bg-blue-500 px-4 py-2 rounded-lg">
                    <BookOpen size={18} />
                    <div>
                      <div className="font-bold">{emplois.length}</div>
                      <div className="text-xs text-blue-100">séance(s)</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Tableau */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-800">
                    <th className="border border-gray-600 p-3 sticky left-0 bg-gray-800 z-10 min-w-[140px]">
                      <div className="flex items-center justify-center gap-2 text-blue-300">
                        <Clock size={20} />
                        <span className="font-semibold">Horaires</span>
                      </div>
                    </th>

                    {jours.map((jour, i) => (
                      <th key={i} className="border border-gray-600 p-3 font-semibold text-white min-w-[180px]">
                        <div className="flex items-center justify-center gap-2">
                          {jour}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {heures.map((heure, i) => (
                    <tr key={i} className={heure.isPause ? 'bg-orange-50' : 'hover:bg-gray-50'}>
                      <td className={`border border-gray-300 p-3 font-semibold sticky left-0 z-10 ${heure.isPause ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-700'}`}>
                        {heure.label}
                      </td>

                      {heure.isPause ? (
                        <td colSpan={6} className="border border-gray-300 p-4 text-center">
                          <div className="inline-flex items-center gap-2 bg-orange-100 px-4 py-2 rounded-lg">
                            <span className="text-orange-800 font-semibold">PAUSE DÉJEUNER</span>
                          </div>
                        </td>
                      ) : (
                        jours.map((_, dayIndex) => {
                          const emploi = getEmploiForSlot(dayIndex, heure.start, heure.end);

                          return (
                            <td key={dayIndex} className="border border-gray-300 p-2">
                              {emploi ? (
                                <div className="bg-blue-50 border border-blue-200 text-gray-800 rounded-lg p-3 shadow-sm">
                                  <div className="font-semibold text-sm mb-2 flex items-center gap-2">
                                    <BookOpen size={14} />
                                    <span>{emploi.matiere.nom}</span>
                                  </div>

                                  {emploi.enseignant && (
                                    <div className="text-xs flex items-center gap-1 bg-white px-2 py-1 rounded mb-1">
                                      <Users size={12} />
                                      {emploi.enseignant.utilisateur.nom} {emploi.enseignant.utilisateur.prenom}
                                    </div>
                                  )}

                                  {emploi.salle && (
                                    <div className="text-xs flex items-center gap-1 bg-white px-2 py-1 rounded">
                                      <MapPin size={12} />
                                      {emploi.salle.code}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-20 flex items-center justify-center text-gray-400 text-xs rounded border border-dashed border-gray-300">
                                  Libre
                                </div>
                              )}
                            </td>
                          );
                        })
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {emplois.length === 0 && (
              <div className="p-8 text-center bg-gray-50">
                <Calendar size={48} className="text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-semibold">Aucune séance programmée</p>
                <p className="text-gray-500 text-sm mt-1">L'emploi du temps est vide pour ce groupe</p>
              </div>
            )}

          </div>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <Calendar size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Sélectionnez un groupe</h3>
            <p className="text-gray-600">Choisissez un groupe dans la liste ci-dessus</p>
          </div>
        </div>
      )}
    </div>
  );
}