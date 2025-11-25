'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, Users, BookOpen, AlertTriangle, CheckCircle, XCircle, Filter, Search, Download } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { ArrowLeftCircle } from "lucide-react";

interface Absence {
  id_absence: number;
  motif: string | null;
  statut: 'Justifiee' | 'NonJustifiee';
  etudiant: {
    id_etudiant: number;
    numero_inscription: string;
    utilisateur: {
      nom: string;
      prenom: string;
    };
    groupe: {
      id_groupe: number;
      nom: string;
      niveau: {
        nom: string;
      };
    };
  };
  emploi_temps: {
    id_emploi: number;
    date: string;
    heure_debut: string;
    heure_fin: string;
    matiere: {
      id_matiere: number;
      nom: string;
    };
    enseignant: {
      utilisateur: {
        nom: string;
        prenom: string;
      };
    };
    salle: {
      code: string;
    };
  };
}

interface Groupe {
  id_groupe: number;
  nom: string;
}

interface Matiere {
  id_matiere: number;
  nom: string;
}

export default function AbsencesAdminPage() {
  const router = useRouter();
  const [absences, setAbsences] = useState<Absence[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filtres
  const [selectedGroupe, setSelectedGroupe] = useState<number | null>(null);
  const [selectedMatiere, setSelectedMatiere] = useState<number | null>(null);
  const [selectedStatut, setSelectedStatut] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [absencesRes, groupesRes, matieresRes] = await Promise.all([
        fetch('/api/absences/admin'),
        fetch('/api/groupes'),
        fetch('/api/matieres')
      ]);

      const [absencesData, groupesData, matieresData] = await Promise.all([
        absencesRes.json(),
        groupesRes.json(),
        matieresRes.json()
      ]);

      setAbsences(absencesData);
      setGroupes(groupesData);
      setMatieres(matieresData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredAbsences = absences.filter(absence => {
    // Filtre par groupe
    if (selectedGroupe && absence.etudiant.groupe.id_groupe !== selectedGroupe) {
      return false;
    }

    // Filtre par matière
    if (selectedMatiere && absence.emploi_temps.matiere.id_matiere !== selectedMatiere) {
      return false;
    }

    // Filtre par statut
    if (selectedStatut && absence.statut !== selectedStatut) {
      return false;
    }

    // Recherche par nom
    if (searchTerm) {
      const fullName = `${absence.etudiant.utilisateur.prenom} ${absence.etudiant.utilisateur.nom}`.toLowerCase();
      if (!fullName.includes(searchTerm.toLowerCase())) {
        return false;
      }
    }

    // Filtre par date
    const absenceDate = new Date(absence.emploi_temps.date);
    if (dateDebut && absenceDate < new Date(dateDebut)) {
      return false;
    }
    if (dateFin && absenceDate > new Date(dateFin)) {
      return false;
    }

    return true;
  });

  const stats = {
    total: absences.length,
    justifiees: absences.filter(a => a.statut === 'Justifiee').length,
    nonJustifiees: absences.filter(a => a.statut === 'NonJustifiee').length,
    aujourdhui: absences.filter(a => {
      const today = new Date().toDateString();
      const absDate = new Date(a.emploi_temps.date).toDateString();
      return today === absDate;
    }).length
  };

  const exporterAbsences = () => {
    const csv = [
      ['Date', 'Heure', 'Étudiant', 'Groupe', 'Matière', 'Enseignant', 'Salle', 'Statut', 'Motif'].join(','),
      ...filteredAbsences.map(a => [
        new Date(a.emploi_temps.date).toLocaleDateString('fr-FR'),
        `${new Date(a.emploi_temps.heure_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(a.emploi_temps.heure_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        `${a.etudiant.utilisateur.prenom} ${a.etudiant.utilisateur.nom}`,
        a.etudiant.groupe.nom,
        a.emploi_temps.matiere.nom,
        `${a.emploi_temps.enseignant.utilisateur.prenom} ${a.emploi_temps.enseignant.utilisateur.nom}`,
        a.emploi_temps.salle.code,
        a.statut === 'Justifiee' ? 'Justifiée' : 'Non justifiée',
        a.motif || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `absences_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return <LoadingSpinner color="red" message="Chargement des absences..." />;
  }

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
          <AlertTriangle size={32} className="text-red-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Gestion des Absences
        </h1>
        <p className="text-gray-600">Suivi et gestion des absences étudiantes</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="text-gray-600" size={24} />
            <span className="text-2xl font-bold text-gray-800">{stats.total}</span>
          </div>
          <p className="text-gray-600 text-sm">Total Absences</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-green-600" size={24} />
            <span className="text-2xl font-bold text-gray-800">{stats.justifiees}</span>
          </div>
          <p className="text-gray-600 text-sm">Justifiées</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <XCircle className="text-red-600" size={24} />
            <span className="text-2xl font-bold text-gray-800">{stats.nonJustifiees}</span>
          </div>
          <p className="text-gray-600 text-sm">Non Justifiées</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="text-blue-600" size={24} />
            <span className="text-2xl font-bold text-gray-800">{stats.aujourdhui}</span>
          </div>
          <p className="text-gray-600 text-sm">Aujourd'hui</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="text-gray-600" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Recherche */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Rechercher un étudiant
            </label>
            <input
              type="text"
              placeholder="Nom ou prénom..."
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Groupe */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Groupe
            </label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={selectedGroupe || ''}
              onChange={(e) => setSelectedGroupe(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Tous les groupes</option>
              {groupes.map(g => (
                <option key={g.id_groupe} value={g.id_groupe}>{g.nom}</option>
              ))}
            </select>
          </div>

          {/* Matière */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">
              Matière
            </label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={selectedMatiere || ''}
              onChange={(e) => setSelectedMatiere(e.target.value ? parseInt(e.target.value) : null)}
            >
              <option value="">Toutes les matières</option>
              {matieres.map(m => (
                <option key={m.id_matiere} value={m.id_matiere}>{m.nom}</option>
              ))}
            </select>
          </div>

          {/* Statut */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">Statut</label>
            <select
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              <option value="Justifiee">Justifiée</option>
              <option value="NonJustifiee">Non justifiée</option>
            </select>
          </div>

          {/* Date début */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">Date début</label>
            <input
              type="date"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>

          {/* Date fin */}
          <div>
            <label className="block text-gray-700 font-medium mb-2 text-sm">Date fin</label>
            <input
              type="date"
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setSelectedGroupe(null);
              setSelectedMatiere(null);
              setSelectedStatut('');
              setSearchTerm('');
              setDateDebut('');
              setDateFin('');
            }}
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm"
          >
            Réinitialiser
          </button>
          <button
            onClick={exporterAbsences}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
          >
            <Download size={16} />
            Exporter CSV ({filteredAbsences.length})
          </button>
        </div>
      </div>

      {/* Liste des absences */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-blue-600 text-white p-4">
          <h2 className="text-lg font-semibold">
            {filteredAbsences.length} absence(s) trouvée(s)
          </h2>
        </div>

        <div className="overflow-x-auto">
          {filteredAbsences.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-gray-600">Aucune absence trouvée</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold">Date & Heure</th>
                  <th className="p-3 text-left text-sm font-semibold">Étudiant</th>
                  <th className="p-3 text-left text-sm font-semibold">Groupe</th>
                  <th className="p-3 text-left text-sm font-semibold">Matière</th>
                  <th className="p-3 text-left text-sm font-semibold">Enseignant</th>
                  <th className="p-3 text-left text-sm font-semibold">Salle</th>
                  <th className="p-3 text-left text-sm font-semibold">Statut</th>
                  <th className="p-3 text-left text-sm font-semibold">Motif</th>
                </tr>
              </thead>
              <tbody className="text-gray-800">
                {filteredAbsences.map((absence) => (
                  <tr key={absence.id_absence} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-blue-600" />
                        <div>
                          <div className="font-medium text-sm">
                            {new Date(absence.emploi_temps.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(absence.emploi_temps.heure_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(absence.emploi_temps.heure_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-sm">
                        {absence.etudiant.utilisateur.prenom} {absence.etudiant.utilisateur.nom}
                      </div>
                      <div className="text-xs text-gray-500">{absence.etudiant.numero_inscription}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-sm">{absence.etudiant.groupe.nom}</div>
                      <div className="text-xs text-gray-500">{absence.etudiant.groupe.niveau.nom}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <BookOpen size={14} className="text-purple-600" />
                        <span className="font-medium text-sm">{absence.emploi_temps.matiere.nom}</span>
                      </div>
                    </td>
                    <td className="p-3 text-sm">
                      {absence.emploi_temps.enseignant.utilisateur.prenom} {absence.emploi_temps.enseignant.utilisateur.nom}
                    </td>
                    <td className="p-3 font-mono text-sm">{absence.emploi_temps.salle.code}</td>
                    <td className="p-3">
                      {absence.statut === 'Justifiee' ? (
                        <span className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                          <CheckCircle size={12} />
                          Justifiée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                          <XCircle size={12} />
                          Non justifiée
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {absence.motif ? (
                        <span className="text-sm text-gray-600">{absence.motif}</span>
                      ) : (
                        <span className="text-sm text-gray-400 italic">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}