'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle, ArrowLeft, BookOpen } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Etudiant {
  id_etudiant: number;
  nom: string;
  prenom: string;
  numero_inscription: string;
  absent: boolean;
  absence: {
    id_absence: number;
    statut: string;
    motif: string | null;
  } | null;
}

interface Emploi {
  id_emploi: number;
  date: string;
  heure_debut: string;
  heure_fin: string;
  matiere: {
    nom: string;
  };
  salle: {
    code: string;
  };
  groupe: {
    nom: string;
    id_groupe: number;
  };
}

export default function PrendreAbsencesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id_emploi = searchParams.get('id_emploi');

  const [emploi, setEmploi] = useState<Emploi | null>(null);
  const [etudiants, setEtudiants] = useState<Etudiant[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // Charger les données
  useEffect(() => {
    if (id_emploi) {
      chargerDonnees();
    }
  }, [id_emploi]);

  const chargerDonnees = async () => {
    try {
      setLoading(true);
      
      // Récupérer les informations de la séance
      const emploiRes = await fetch(`/api/emploi-temps/${id_emploi}`);
      const emploiData = await emploiRes.json();

      if (emploiRes.ok && emploiData) {
        setEmploi(emploiData);
        
        // Récupérer tous les étudiants et filtrer ceux du groupe
        if (emploiData.groupe?.id_groupe) {
          const etudiantsRes = await fetch('/api/etudiants');
          const allEtudiants = await etudiantsRes.json();
          
          if (etudiantsRes.ok && Array.isArray(allEtudiants)) {
            // Filtrer les étudiants du groupe concerné
            const etudiantsDuGroupe = allEtudiants.filter(
              (etudiant: any) => etudiant.id_groupe === emploiData.groupe.id_groupe
            );
            
            // Pour chaque étudiant, vérifier s'il a une absence pour cette séance
            const etudiantsAvecAbsences = await Promise.all(
              etudiantsDuGroupe.map(async (etudiant: any) => {
                try {
                  // Récupérer toutes les absences de l'étudiant
                  const absencesRes = await fetch(`/api/etudiants/${etudiant.id_etudiant}/absences`);
                  
                  if (absencesRes.ok) {
                    const absences = await absencesRes.json();
                    
                    // Chercher une absence pour cet emploi
                    const absencePourCetEmploi = Array.isArray(absences) 
                      ? absences.find((abs: any) => abs.id_emploi === parseInt(id_emploi!))
                      : null;
                    
                    return {
                      id_etudiant: etudiant.id_etudiant,
                      nom: etudiant.utilisateur?.nom || etudiant.nom || '',
                      prenom: etudiant.utilisateur?.prenom || etudiant.prenom || '',
                      numero_inscription: etudiant.numero_inscription || '',
                      absent: !!absencePourCetEmploi,
                      absence: absencePourCetEmploi || null
                    };
                  }
                  
                  return {
                    id_etudiant: etudiant.id_etudiant,
                    nom: etudiant.utilisateur?.nom || etudiant.nom || '',
                    prenom: etudiant.utilisateur?.prenom || etudiant.prenom || '',
                    numero_inscription: etudiant.numero_inscription || '',
                    absent: false,
                    absence: null
                  };
                } catch {
                  return {
                    id_etudiant: etudiant.id_etudiant,
                    nom: etudiant.utilisateur?.nom || etudiant.nom || '',
                    prenom: etudiant.utilisateur?.prenom || etudiant.prenom || '',
                    numero_inscription: etudiant.numero_inscription || '',
                    absent: false,
                    absence: null
                  };
                }
              })
            );
            
            setEtudiants(etudiantsAvecAbsences);
          }
        }
      } else {
        setMessage('❌ Séance non trouvée');
      }
    } catch (error) {
      setMessage('❌ Erreur lors du chargement');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Marquer absent
  const marquerAbsent = async (id_etudiant: number) => {
    try {
      const res = await fetch('/api/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_emploi: parseInt(id_emploi!),
          id_etudiant,
          statut: 'NonJustifiee'
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('✅ Absence enregistrée');
        chargerDonnees(); // Recharger
      } else {
        setMessage('❌ Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      setMessage('❌ Erreur');
      console.error(error);
    }
  };

  // Marquer présent (annuler absence)
  const marquerPresent = async (id_absence: number) => {
    try {
      const res = await fetch(`/api/absences/${id_absence}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMessage('✅ Absence annulée');
        chargerDonnees(); // Recharger
      } else {
        setMessage('❌ Erreur lors de l\'annulation');
      }
    } catch (error) {
      setMessage('❌ Erreur');
      console.error(error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement de la feuille de présence..." color="green" />;
  }

  if (!emploi) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-8">
        <div className="max-w-2xl mx-auto bg-red-500/20 backdrop-blur-lg border-2 border-red-400/30 rounded-2xl p-6">
          <p className="text-red-100 text-center font-semibold text-lg">❌ Séance non trouvée</p>
          <button
            onClick={() => router.push('/dashboard-enseignant/absences')}
            className="mt-4 w-full px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-xl text-white font-semibold transition-all"
          >
            Retour aux absences
          </button>
        </div>
      </div>
    );
  }

  const nbPresents = etudiants.filter(e => !e.absent).length;
  const nbAbsents = etudiants.filter(e => e.absent).length;
  const tauxPresence = etudiants.length > 0 
    ? ((nbPresents / etudiants.length) * 100).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-900 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => router.push('/dashboard-enseignant/absences')}
          className="mb-6 px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-lg border border-white/20 rounded-xl text-white font-semibold transition-all flex items-center gap-2 hover:scale-105"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux absences
        </button>

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 rounded-xl shadow-lg animate-pulse">
              <Users className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Feuille de Présence
              </h1>
              <p className="text-gray-300 mt-1">Enregistrement des absences</p>
            </div>
          </div>

          {/* Infos séance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-green-500/20 backdrop-blur-lg border border-green-400/30 rounded-xl p-4">
              <BookOpen className="w-5 h-5 text-green-400" />
              <div>
                <p className="text-sm text-green-300 font-semibold">Matière</p>
                <p className="text-white font-bold">{emploi.matiere.nom}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-blue-500/20 backdrop-blur-lg border border-blue-400/30 rounded-xl p-4">
              <Calendar className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-sm text-blue-300 font-semibold">Date</p>
                <p className="text-white text-sm">
                  {new Date(emploi.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-purple-500/20 backdrop-blur-lg border border-purple-400/30 rounded-xl p-4">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-sm text-purple-300 font-semibold">Horaire</p>
                <p className="text-white text-sm">
                  {emploi.heure_debut} - {emploi.heure_fin}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-orange-500/20 backdrop-blur-lg border border-orange-400/30 rounded-xl p-4">
              <MapPin className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-sm text-orange-300 font-semibold">Salle / Groupe</p>
                <p className="text-white text-sm">{emploi.salle.code} - {emploi.groupe.nom}</p>
              </div>
            </div>
          </div>

          {/* Taux de présence */}
          <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-300 font-semibold">Taux de Présence</span>
              <span className="text-2xl font-bold text-green-400">{tauxPresence}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${tauxPresence}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{nbPresents}/{etudiants.length} étudiants présents</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl backdrop-blur-lg ${
            message.startsWith('✅') 
              ? 'bg-green-500/20 border border-green-400/30 text-green-100'
              : 'bg-red-500/20 border border-red-400/30 text-red-100'
          }`}>
            {message}
          </div>
        )}

        {/* Liste des étudiants */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6">
            <h2 className="text-xl font-bold text-white">
              Liste des Étudiants ({etudiants.length})
            </h2>
            <p className="text-green-100 text-sm mt-1">
              {nbPresents} présents • {nbAbsents} absents
            </p>
          </div>

          {etudiants.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-300 text-lg">Aucun étudiant dans ce groupe</p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {etudiants.map((etudiant, index) => (
                <div
                  key={etudiant.id_etudiant}
                  className={`p-6 hover:bg-white/5 transition-colors ${
                    etudiant.absent ? 'bg-red-500/10' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white backdrop-blur-lg ${
                        etudiant.absent 
                          ? 'bg-gradient-to-br from-red-500 to-pink-600'
                          : 'bg-gradient-to-br from-green-500 to-teal-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-white text-lg">
                          {etudiant.nom} {etudiant.prenom}
                        </p>
                        <p className="text-sm text-gray-400">
                          📝 {etudiant.numero_inscription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {etudiant.absent ? (
                        <>
                          <span className="px-4 py-2 bg-red-500/30 backdrop-blur-lg border border-red-400/30 text-red-100 rounded-xl font-semibold flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Absent
                          </span>
                          <button
                            onClick={() => marquerPresent(etudiant.absence!.id_absence)}
                            className="px-6 py-2 bg-green-500/30 hover:bg-green-500/50 backdrop-blur-lg border border-green-400/30 text-white rounded-xl font-semibold transition-all hover:scale-105"
                          >
                            Marquer Présent
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="px-4 py-2 bg-green-500/30 backdrop-blur-lg border border-green-400/30 text-green-100 rounded-xl font-semibold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Présent
                          </span>
                          <button
                            onClick={() => marquerAbsent(etudiant.id_etudiant)}
                            className="px-6 py-2 bg-red-500/30 hover:bg-red-500/50 backdrop-blur-lg border border-red-400/30 text-white rounded-xl font-semibold transition-all hover:scale-105"
                          >
                            Marquer Absent
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-semibold">Présents</p>
                <p className="text-4xl font-bold text-green-400">{nbPresents}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-400 opacity-20" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-semibold">Absents</p>
                <p className="text-4xl font-bold text-red-400">{nbAbsents}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-400 opacity-20" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-semibold">Taux de Présence</p>
                <p className="text-4xl font-bold text-blue-400">{tauxPresence}%</p>
              </div>
              <Users className="w-12 h-12 text-blue-400 opacity-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
