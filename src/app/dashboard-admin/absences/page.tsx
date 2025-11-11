'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, BookOpen, AlertTriangle, CheckCircle, XCircle, Filter, Search, Download } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 p-8">
      {/* En-tête */}
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 p-3 rounded-2xl shadow-2xl animate-pulse">
            <AlertTriangle size={40} className="text-white" />
          </div>
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent mb-3">
          Gestion des Absences
        </h1>
        <p className="text-gray-300 text-lg">Suivi et gestion des absences étudiantes</p>
        <div className="mt-4 h-1 w-32 mx-auto bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 rounded-full"></div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="text-white" size={32} />
            <span className="text-4xl font-bold text-white">{stats.total}</span>
          </div>
          <p className="text-gray-300 font-semibold">Total Absences</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="text-green-400" size={32} />
            <span className="text-4xl font-bold text-white">{stats.justifiees}</span>
          </div>
          <p className="text-gray-300 font-semibold">Justifiées</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <XCircle className="text-red-400" size={32} />
            <span className="text-4xl font-bold text-white">{stats.nonJustifiees}</span>
          </div>
          <p className="text-gray-300 font-semibold">Non Justifiées</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-3">
            <Calendar className="text-blue-400" size={32} />
            <span className="text-4xl font-bold text-white">{stats.aujourdhui}</span>
          </div>
          <p className="text-gray-300 font-semibold">Aujourd'hui</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Filter className="text-orange-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Filtres</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Recherche */}
          <div>
            <label className="block text-white font-semibold mb-2 text-sm">
              <Search size={16} className="inline mr-2" />
              Rechercher un étudiant
            </label>
            <input
              type="text"
              placeholder="Nom ou prénom..."
              className="w-full bg-white/90 border-2 border-orange-300 rounded-xl px-4 py-2 focus:ring-4 focus:ring-orange-500 focus:border-orange-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Groupe */}
          <div>
            <label className="block text-white font-semibold mb-2 text-sm">
              <Users size={16} className="inline mr-2" />
              Groupe
            </label>
            <select
              className="w-full bg-white/90 border-2 border-orange-300 rounded-xl px-4 py-2 focus:ring-4 focus:ring-orange-500"
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
            <label className="block text-white font-semibold mb-2 text-sm">
              <BookOpen size={16} className="inline mr-2" />
              Matière
            </label>
            <select
              className="w-full bg-white/90 border-2 border-orange-300 rounded-xl px-4 py-2 focus:ring-4 focus:ring-orange-500"
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
            <label className="block text-white font-semibold mb-2 text-sm">Statut</label>
            <select
              className="w-full bg-white/90 border-2 border-orange-300 rounded-xl px-4 py-2 focus:ring-4 focus:ring-orange-500"
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
            <label className="block text-white font-semibold mb-2 text-sm">Date début</label>
            <input
              type="date"
              className="w-full bg-white/90 border-2 border-orange-300 rounded-xl px-4 py-2 focus:ring-4 focus:ring-orange-500"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
          </div>

          {/* Date fin */}
          <div>
            <label className="block text-white font-semibold mb-2 text-sm">Date fin</label>
            <input
              type="date"
              className="w-full bg-white/90 border-2 border-orange-300 rounded-xl px-4 py-2 focus:ring-4 focus:ring-orange-500"
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
            className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-colors"
          >
            Réinitialiser
          </button>
          <button
            onClick={exporterAbsences}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl transition-all flex items-center gap-2"
          >
            <Download size={20} />
            Exporter CSV ({filteredAbsences.length})
          </button>
        </div>
      </div>

      {/* Liste des absences */}
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-white/20">
        <div className="bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white p-6">
          <h2 className="text-2xl font-bold">
            {filteredAbsences.length} absence(s) trouvée(s)
          </h2>
        </div>

        <div className="overflow-x-auto">
          {filteredAbsences.length === 0 ? (
            <div className="p-12 text-center">
              <AlertTriangle size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-300 text-lg">Aucune absence trouvée</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-4 text-left">Date & Heure</th>
                  <th className="p-4 text-left">Étudiant</th>
                  <th className="p-4 text-left">Groupe</th>
                  <th className="p-4 text-left">Matière</th>
                  <th className="p-4 text-left">Enseignant</th>
                  <th className="p-4 text-left">Salle</th>
                  <th className="p-4 text-left">Statut</th>
                  <th className="p-4 text-left">Motif</th>
                </tr>
              </thead>
              <tbody className="text-white">
                {filteredAbsences.map((absence) => (
                  <tr key={absence.id_absence} className="border-b border-gray-700 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-blue-400" />
                        <div>
                          <div className="font-semibold">
                            {new Date(absence.emploi_temps.date).toLocaleDateString('fr-FR')}
                          </div>
                          <div className="text-sm text-gray-400">
                            <Clock size={12} className="inline mr-1" />
                            {new Date(absence.emploi_temps.heure_debut).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            {' - '}
                            {new Date(absence.emploi_temps.heure_fin).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">
                        {absence.etudiant.utilisateur.prenom} {absence.etudiant.utilisateur.nom}
                      </div>
                      <div className="text-sm text-gray-400">{absence.etudiant.numero_inscription}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold">{absence.etudiant.groupe.nom}</div>
                      <div className="text-sm text-gray-400">{absence.etudiant.groupe.niveau.nom}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <BookOpen size={16} className="text-purple-400" />
                        <span className="font-semibold">{absence.emploi_temps.matiere.nom}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {absence.emploi_temps.enseignant.utilisateur.prenom} {absence.emploi_temps.enseignant.utilisateur.nom}
                    </td>
                    <td className="p-4 font-mono text-sm">{absence.emploi_temps.salle.code}</td>
                    <td className="p-4">
                      {absence.statut === 'Justifiee' ? (
                        <span className="inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                          <CheckCircle size={16} />
                          Justifiée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm font-semibold">
                          <XCircle size={16} />
                          Non justifiée
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {absence.motif ? (
                        <span className="text-sm text-gray-300">{absence.motif}</span>
                      ) : (
                        <span className="text-sm text-gray-500 italic">-</span>
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
