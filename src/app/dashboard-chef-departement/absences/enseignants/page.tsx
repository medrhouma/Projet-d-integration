'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Calendar, AlertTriangle, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';

interface AbsenceEnseignant {
  id_absence: number;
  motif: string | null;
  statut: 'Justifiee' | 'NonJustifiee';
  date_creation: string;
  enseignant: {
    id_enseignant: number;
    nom: string;
    prenom: string;
  };
  emploi_temps: {
    id_emploi: number;
    date: string;
    heure_debut: string;
    heure_fin: string;
    matiere: {
      nom_matiere: string;
    };
    salle: {
      nom_salle: string;
    };
  };
}

interface StatistiqueEnseignant {
  id_enseignant: number;
  nom: string;
  prenom: string;
  totalAbsences: number;
  absencesNonJustifiees: number;
}

interface CoursAujourdhui {
  id_emploi: number;
  heure_debut: string;
  heure_fin: string;
  matiere: {
    nom: string;
  };
  enseignant: {
    id_enseignant: number;
    nom: string;
    prenom: string;
  };
  salle: {
    nom: string;
  };
  groupe: {
    nom: string;
  };
  absence_enseignant?: {
    id_absence: number;
  }[];
}

interface StudentAbsence {
  id_absence: number;
  date_absence: string;
  justifiee: boolean;
  motif: string | null;
  etudiant: {
    nom: string;
    prenom: string;
    matricule: string;
    groupe: {
      nom: string;
    };
  };
  matiere: {
    nom: string;
    code: string;
  };
}

export default function AbsencesEnseignantsPage() {
  const router = useRouter();

  // États pour les absences enseignants
  const [absences, setAbsences] = useState<AbsenceEnseignant[]>([]);
  const [statistiques, setStatistiques] = useState<StatistiqueEnseignant[]>([]);
  const [coursAujourdhui, setCoursAujourdhui] = useState<CoursAujourdhui[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCours, setLoadingCours] = useState(false);
  const [error, setError] = useState('');
  const [selectedEnseignant, setSelectedEnseignant] = useState<number | null>(null);
  
  // États pour la modale de justification enseignants
  const [showJustificationModal, setShowJustificationModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<number | null>(null);
  const [motifJustification, setMotifJustification] = useState('');
  
  // États pour la modale d'ajout d'absence
  const [showAjouterModal, setShowAjouterModal] = useState(false);
  const [nouvelleAbsence, setNouvelleAbsence] = useState({
    id_enseignant: '',
    date: '',
    heure_debut: '',
    heure_fin: '',
    motif: '',
    statut: 'NonJustifiee' as 'Justifiee' | 'NonJustifiee'
  });

  // États pour les absences étudiants
  const [studentAbsences, setStudentAbsences] = useState<StudentAbsence[]>([]);
  const [studentAbsencesLoading, setStudentAbsencesLoading] = useState(true);
  const [studentAbsencesError, setStudentAbsencesError] = useState('');
  
  // États pour la modale de justification étudiants
  const [showStudentJustifyModal, setShowStudentJustifyModal] = useState(false);
  const [studentJustifyMotif, setStudentJustifyMotif] = useState('');
  const [studentJustifyAbsenceId, setStudentJustifyAbsenceId] = useState<number | null>(null);
  const [studentJustifyLoading, setStudentJustifyLoading] = useState(false);
  const [studentJustifyError, setStudentJustifyError] = useState('');

  // Charger les données initiales
  useEffect(() => {
    chargerDonnees();
    chargerCoursAujourdhui();
    fetchStudentAbsences();
  }, [selectedEnseignant]);

  // Fonctions pour les absences enseignants
  const chargerDonnees = async () => {
    try {
      setLoading(true);
      setError('');
      const url = selectedEnseignant 
        ? `/api/absences/enseignants?id_enseignant=${selectedEnseignant}`
        : '/api/absences/enseignants';
      
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setAbsences(data.absences || []);
        setStatistiques(data.statistiques || []);
      } else {
        setError(data.error || 'Erreur lors du chargement des données');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chargerCoursAujourdhui = async () => {
    try {
      setLoadingCours(true);
      const today = new Date().toISOString().split('T')[0];
      
      const userResponse = await fetch('/api/auth/me');
      const userData = await userResponse.json();
      
      if (!userData.success || !userData.user.id_departement) {
        return;
      }

      const url = `/api/emploi-temps?departementId=${userData.user.id_departement}&dateDebut=${today}&dateFin=${today}`;
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success && data.data) {
        const coursTransformes = data.data.map((emploi: any) => ({
          id_emploi: emploi.id_emploi,
          heure_debut: new Date(emploi.heure_debut).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          heure_fin: new Date(emploi.heure_fin).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          matiere: {
            nom: emploi.matiere.nom
          },
          enseignant: {
            id_enseignant: emploi.enseignant.id_enseignant,
            nom: emploi.enseignant.utilisateur.nom,
            prenom: emploi.enseignant.utilisateur.prenom
          },
          salle: {
            nom: emploi.salle.code || emploi.salle.nom
          },
          groupe: {
            nom: emploi.groupe.nom
          },
          absence_enseignant: emploi.absence_enseignant
        }));
        setCoursAujourdhui(coursTransformes);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des cours:', err);
    } finally {
      setLoadingCours(false);
    }
  };

  const handleMarquerAbsent = async (cours: CoursAujourdhui) => {
    try {
      const response = await fetch('/api/absences/enseignants/manuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_enseignant: cours.enseignant.id_enseignant,
          date: new Date().toISOString().split('T')[0],
          heure_debut: cours.heure_debut,
          heure_fin: cours.heure_fin,
          statut: 'NonJustifiee'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Absence enregistrée avec succès');
        chargerCoursAujourdhui();
        chargerDonnees();
      } else {
        alert(data.error || 'Erreur lors de l\'enregistrement');
      }
    } catch (err) {
      console.error('Erreur:', err);
      alert('Erreur de connexion au serveur');
    }
  };

  const justifierAbsence = async () => {
    if (!selectedAbsence || !motifJustification.trim()) {
      alert('Veuillez saisir un motif de justification');
      return;
    }

    try {
      const response = await fetch('/api/absences/enseignants', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_absence: selectedAbsence,
          statut: 'Justifiee',
          motif: motifJustification
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowJustificationModal(false);
        setSelectedAbsence(null);
        setMotifJustification('');
        await chargerDonnees();
        alert('Absence justifiée avec succès');
      } else {
        alert(data.error || 'Erreur lors de la justification');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
      console.error(err);
    }
  };

  const supprimerAbsence = async (idAbsence: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette absence ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/absences/enseignants?id_absence=${idAbsence}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        await chargerDonnees();
        alert('Absence supprimée avec succès');
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
      console.error(err);
    }
  };

  const ouvrirModalJustification = (idAbsence: number, motifActuel: string | null) => {
    setSelectedAbsence(idAbsence);
    setMotifJustification(motifActuel || '');
    setShowJustificationModal(true);
  };

  const ajouterAbsence = async () => {
    if (!nouvelleAbsence.id_enseignant || !nouvelleAbsence.date || 
        !nouvelleAbsence.heure_debut || !nouvelleAbsence.heure_fin) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    try {
      const response = await fetch('/api/absences/enseignants/manuel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_enseignant: parseInt(nouvelleAbsence.id_enseignant),
          date: nouvelleAbsence.date,
          heure_debut: nouvelleAbsence.heure_debut,
          heure_fin: nouvelleAbsence.heure_fin,
          motif: nouvelleAbsence.motif,
          statut: nouvelleAbsence.statut
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowAjouterModal(false);
        setNouvelleAbsence({
          id_enseignant: '',
          date: '',
          heure_debut: '',
          heure_fin: '',
          motif: '',
          statut: 'NonJustifiee'
        });
        await chargerDonnees();
        alert('Absence ajoutée avec succès');
      } else {
        alert(data.error || 'Erreur lors de l\'ajout de l\'absence');
      }
    } catch (err) {
      alert('Erreur de connexion au serveur');
      console.error(err);
    }
  };

  // Fonctions pour les absences étudiants
  const fetchStudentAbsences = async () => {
    setStudentAbsencesLoading(true);
    setStudentAbsencesError('');
    try {
      const response = await fetch('/api/absences/etudiants?all=1');
      if (!response.ok) {
        setStudentAbsencesError("Erreur lors de la récupération des absences étudiants");
        setStudentAbsences([]);
        return;
      }
      const data = await response.json();
      if (!data.success) {
        setStudentAbsencesError(data.error || "Erreur lors de la récupération des absences étudiants");
        setStudentAbsences([]);
        return;
      }
      setStudentAbsences(data.absences || []);
    } catch (err) {
      setStudentAbsencesError('Erreur de connexion au serveur');
      setStudentAbsences([]);
    } finally {
      setStudentAbsencesLoading(false);
    }
  };

  const justifyStudentAbsence = async (id_absence: number, motif: string) => {
    const res = await fetch('/api/absences/etudiants', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_absence, statut: 'Justifiee', motif })
    });
    return res.json();
  };

  const openStudentJustifyModal = (absence: StudentAbsence) => {
    setStudentJustifyAbsenceId(absence.id_absence);
    setStudentJustifyMotif(absence.motif || '');
    setShowStudentJustifyModal(true);
    setStudentJustifyError('');
  };

  const handleStudentJustifySubmit = async () => {
    if (!studentJustifyAbsenceId || !studentJustifyMotif.trim()) {
      setStudentJustifyError('Veuillez saisir un motif de justification.');
      return;
    }
    setStudentJustifyLoading(true);
    setStudentJustifyError('');
    try {
      const result = await justifyStudentAbsence(studentJustifyAbsenceId, studentJustifyMotif);
      if (result.success) {
        setShowStudentJustifyModal(false);
        setStudentJustifyAbsenceId(null);
        setStudentJustifyMotif('');
        fetchStudentAbsences();
      } else {
        setStudentJustifyError(result.error || 'Erreur lors de la justification');
      }
    } catch (e) {
      setStudentJustifyError('Erreur de connexion au serveur');
    } finally {
      setStudentJustifyLoading(false);
    }
  };

  // Calcul des statistiques
  const totalAbsences = absences.length;
  const absencesJustifiees = absences.filter(a => a.statut === 'Justifiee').length;
  const absencesNonJustifiees = absences.filter(a => a.statut === 'NonJustifiee').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* Bouton retour dashboard */}
      <div className="max-w-7xl mx-auto mb-6">
        <button
          onClick={() => router.push('/dashboard-chef-departement')}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow mb-6"
        >
          &#8592; Retour au Dashboard
        </button>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Section Absences Étudiants */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-800">Absences des Étudiants</h1>
          </div>
          <p className="text-gray-600 mb-4">Suivi et justification des absences des étudiants du département</p>
          
          {studentAbsencesError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {studentAbsencesError}
            </div>
          )}
          
          {studentAbsencesLoading ? (
            <div className="text-center py-8 text-gray-500">Chargement des absences étudiants...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Étudiant</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Groupe</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matière</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motif</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {studentAbsences.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        Aucune absence d'étudiant trouvée.
                      </td>
                    </tr>
                  ) : (
                    studentAbsences.map((absence) => (
                      <tr key={absence.id_absence} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {absence.date_absence ? new Date(absence.date_absence).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {absence.etudiant?.nom || '-'} {absence.etudiant?.prenom || ''}
                          </div>
                          <div className="text-xs text-gray-500">{absence.etudiant?.matricule || '-'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                          {absence.etudiant?.groupe?.nom || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{absence.matiere?.nom || '-'}</div>
                          <div className="text-xs text-gray-500">{absence.matiere?.code || '-'}</div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {absence.justifiee ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Justifiée
                            </span>
                          ) : (
                            <>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                                Non justifiée
                              </span>
                              <button
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200 transition"
                                onClick={() => openStudentJustifyModal(absence)}
                              >
                                Justifier
                              </button>
                            </>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600">
                          {absence.motif || '-'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section Absences Enseignants */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Absences des Enseignants</h1>
                <p className="text-gray-600">Suivi et gestion des absences du corps enseignant</p>
              </div>
            </div>
            <button
              onClick={() => setShowAjouterModal(true)}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-semibold shadow"
            >
              + Ajouter une absence
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Cours d'aujourd'hui */}
          <div className="bg-white rounded-lg shadow-md mb-6">
            <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Cours d&apos;aujourd&apos;hui
                </h2>
                <span className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('fr-FR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>
            </div>
            <div className="p-6">
              {loadingCours ? (
                <p className="text-center text-gray-500 py-4">Chargement des cours...</p>
              ) : coursAujourdhui.length === 0 ? (
                <p className="text-center text-gray-500 py-8">Aucun cours prévu aujourd&apos;hui</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Horaire
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Matière
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Enseignant
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Salle
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Groupe
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {coursAujourdhui.map((cours) => {
                        const absenceExiste = cours.absence_enseignant && cours.absence_enseignant.length > 0;
                        return (
                          <tr key={cours.id_emploi} className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {cours.heure_debut} - {cours.heure_fin}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">
                                {cours.matiere.nom}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {cours.enseignant.prenom} {cours.enseignant.nom}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {cours.salle.nom}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-600">
                                {cours.groupe.nom}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {absenceExiste ? (
                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 border border-red-200">
                                  Absent
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleMarquerAbsent(cours)}
                                  className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-all"
                                >
                                  Marquer absent
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Statistiques Globales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Absences</p>
                  <p className="text-3xl font-bold text-gray-800">{totalAbsences}</p>
                </div>
                <Calendar className="w-12 h-12 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Justifiées</p>
                  <p className="text-3xl font-bold text-green-600">{absencesJustifiees}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Non Justifiées</p>
                  <p className="text-3xl font-bold text-red-600">{absencesNonJustifiees}</p>
                </div>
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
            </div>
          </div>

          {/* Statistiques par Enseignant */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <Users className="w-6 h-6 mr-2 text-blue-600" />
              Statistiques par Enseignant
            </h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enseignant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Absences</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Non Justifiées</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statistiques.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                        Aucune absence enregistrée
                      </td>
                    </tr>
                  ) : (
                    statistiques.map((stat) => (
                      <tr key={stat.id_enseignant} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {stat.prenom} {stat.nom}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {stat.totalAbsences}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            stat.absencesNonJustifiees > 0 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {stat.absencesNonJustifiees}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedEnseignant(
                              selectedEnseignant === stat.id_enseignant ? null : stat.id_enseignant
                            )}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {selectedEnseignant === stat.id_enseignant ? 'Tout afficher' : 'Voir détails'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Liste des Absences */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-blue-600" />
              {selectedEnseignant ? 'Absences de l\'enseignant sélectionné' : 'Toutes les Absences'}
            </h2>

            <div className="space-y-4">
              {absences.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600 text-lg">Aucune absence enregistrée</p>
                  <p className="text-gray-500">Tous les enseignants sont présents !</p>
                </div>
              ) : (
                absences.map((absence) => (
                  <div
                    key={absence.id_absence}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Users className="w-5 h-5 text-gray-600" />
                          <h3 className="font-semibold text-gray-800">
                            {absence.enseignant.prenom} {absence.enseignant.nom}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            absence.statut === 'Justifiee'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {absence.statut === 'Justifiee' ? '✅ Justifiée' : '❌ Non Justifiée'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 ml-8">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(absence.emploi_temps.date).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            {absence.emploi_temps.heure_debut} - {absence.emploi_temps.heure_fin}
                          </div>
                          <div>
                            📚 Matière: <span className="font-medium">{absence.emploi_temps.matiere.nom_matiere}</span>
                          </div>
                          <div>
                            🏢 Salle: <span className="font-medium">{absence.emploi_temps.salle.nom_salle}</span>
                          </div>
                        </div>

                        {absence.motif && (
                          <div className="ml-8 mt-2 p-3 bg-gray-50 rounded">
                            <p className="text-sm text-gray-700">
                              <strong>Motif:</strong> {absence.motif}
                            </p>
                          </div>
                        )}

                        <div className="ml-8 mt-2 text-xs text-gray-500">
                          Enregistré le {new Date(absence.date_creation).toLocaleString('fr-FR')}
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        {absence.statut === 'NonJustifiee' && (
                          <button
                            onClick={() => ouvrirModalJustification(absence.id_absence, absence.motif)}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                          >
                            Justifier
                          </button>
                        )}
                        <button
                          onClick={() => supprimerAbsence(absence.id_absence)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Justification Enseignants */}
      {showJustificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Justifier l'absence</h3>
            
            <textarea
              value={motifJustification}
              onChange={(e) => setMotifJustification(e.target.value)}
              placeholder="Entrez le motif de justification..."
              className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowJustificationModal(false);
                  setSelectedAbsence(null);
                  setMotifJustification('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={justifierAbsence}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'Ajout d'Absence */}
      {showAjouterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Enregistrer une absence</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enseignant *
                </label>
                <select
                  value={nouvelleAbsence.id_enseignant}
                  onChange={(e) => setNouvelleAbsence({...nouvelleAbsence, id_enseignant: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un enseignant</option>
                  {statistiques.map(stat => (
                    <option key={stat.id_enseignant} value={stat.id_enseignant}>
                      {stat.prenom} {stat.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={nouvelleAbsence.date}
                  onChange={(e) => setNouvelleAbsence({...nouvelleAbsence, date: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure début *
                  </label>
                  <input
                    type="time"
                    value={nouvelleAbsence.heure_debut}
                    onChange={(e) => setNouvelleAbsence({...nouvelleAbsence, heure_debut: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heure fin *
                  </label>
                  <input
                    type="time"
                    value={nouvelleAbsence.heure_fin}
                    onChange={(e) => setNouvelleAbsence({...nouvelleAbsence, heure_fin: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={nouvelleAbsence.statut}
                  onChange={(e) => setNouvelleAbsence({...nouvelleAbsence, statut: e.target.value as 'Justifiee' | 'NonJustifiee'})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="NonJustifiee">Non Justifiée</option>
                  <option value="Justifiee">Justifiée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motif
                </label>
                <textarea
                  value={nouvelleAbsence.motif}
                  onChange={(e) => setNouvelleAbsence({...nouvelleAbsence, motif: e.target.value})}
                  placeholder="Motif de l'absence (optionnel)..."
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAjouterModal(false);
                  setNouvelleAbsence({
                    id_enseignant: '',
                    date: '',
                    heure_debut: '',
                    heure_fin: '',
                    motif: '',
                    statut: 'NonJustifiee'
                  });
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Annuler
              </button>
              <button
                onClick={ajouterAbsence}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Justification Étudiants */}
      {showStudentJustifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Justifier l'absence de l'étudiant</h3>
            <textarea
              value={studentJustifyMotif}
              onChange={e => setStudentJustifyMotif(e.target.value)}
              placeholder="Entrez le motif de justification..."
              className="w-full border rounded-lg p-3 mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            {studentJustifyError && <div className="text-red-600 text-sm mb-2">{studentJustifyError}</div>}
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => { 
                  setShowStudentJustifyModal(false); 
                  setStudentJustifyAbsenceId(null); 
                  setStudentJustifyMotif(''); 
                  setStudentJustifyError(''); 
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                disabled={studentJustifyLoading}
              >
                Annuler
              </button>
              <button
                onClick={handleStudentJustifySubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={studentJustifyLoading}
              >
                {studentJustifyLoading ? 'Enregistrement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}