'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, ArrowLeft, BookOpen } from 'lucide-react';
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
      setMessage('');
      
      console.log('Chargement des données pour emploi:', id_emploi);
      
      // Récupérer les informations de la séance
      const emploiRes = await fetch(`/api/emploi-temps/${id_emploi}`);
      console.log('Réponse emploi:', emploiRes.status);
      
      if (!emploiRes.ok) {
        setMessage('❌ Séance non trouvée');
        setLoading(false);
        return;
      }

      const emploiData = await emploiRes.json();
      console.log('Données emploi:', emploiData);
      
      if (!emploiData) {
        setMessage('❌ Séance non trouvée');
        setLoading(false);
        return;
      }

      setEmploi(emploiData);
      
      // Récupérer les étudiants du groupe
      if (emploiData.groupe?.id_groupe) {
        console.log('Chargement étudiants pour groupe:', emploiData.groupe.id_groupe);
        
        // Essayer plusieurs endpoints possibles
        let etudiantsDuGroupe = [];
        
        // Essayer l'endpoint spécifique aux groupes
        try {
          const etudiantsRes = await fetch(`/api/groupes/${emploiData.groupe.id_groupe}/etudiants`);
          console.log('Réponse étudiants groupe:', etudiantsRes.status);
          
          if (etudiantsRes.ok) {
            etudiantsDuGroupe = await etudiantsRes.json();
            console.log('Étudiants du groupe:', etudiantsDuGroupe);
          } else {
            // Fallback: récupérer tous les étudiants et filtrer
            console.log('Fallback: chargement de tous les étudiants');
            const tousEtudiantsRes = await fetch('/api/etudiants');
            if (tousEtudiantsRes.ok) {
              const tousEtudiants = await tousEtudiantsRes.json();
              etudiantsDuGroupe = tousEtudiants.filter((etudiant: any) => 
                etudiant.id_groupe === emploiData.groupe.id_groupe
              );
              console.log('Étudiants filtrés:', etudiantsDuGroupe);
            }
          }
        } catch (error) {
          console.error('Erreur chargement étudiants:', error);
        }

        // Pour chaque étudiant, vérifier s'il a une absence pour cette séance
        const etudiantsAvecAbsences = await Promise.all(
          etudiantsDuGroupe.map(async (etudiant: any) => {
            try {
              console.log('Vérification absence pour étudiant:', etudiant.id_etudiant);
              
              // Vérifier les absences de cet étudiant
              const absencesRes = await fetch(`/api/etudiants/${etudiant.id_etudiant}/absences`);
              
              if (absencesRes.ok) {
                const absences = await absencesRes.json();
                console.log('Absences étudiant:', absences);
                
                // Chercher une absence pour cet emploi
                const absencePourCetEmploi = Array.isArray(absences) 
                  ? absences.find((abs: any) => abs.id_emploi === parseInt(id_emploi!))
                  : null;
                
                console.log('Absence trouvée:', absencePourCetEmploi);
                
                return {
                  id_etudiant: etudiant.id_etudiant,
                  nom: etudiant.utilisateur?.nom || etudiant.nom || etudiant.utilisateur_nom || 'N/A',
                  prenom: etudiant.utilisateur?.prenom || etudiant.prenom || etudiant.utilisateur_prenom || 'N/A',
                  numero_inscription: etudiant.numero_inscription || 'N/A',
                  absent: !!absencePourCetEmploi,
                  absence: absencePourCetEmploi || null
                };
              }
              
              return {
                id_etudiant: etudiant.id_etudiant,
                nom: etudiant.utilisateur?.nom || etudiant.nom || etudiant.utilisateur_nom || 'N/A',
                prenom: etudiant.utilisateur?.prenom || etudiant.prenom || etudiant.utilisateur_prenom || 'N/A',
                numero_inscription: etudiant.numero_inscription || 'N/A',
                absent: false,
                absence: null
              };
            } catch (error) {
              console.error('Erreur vérification absence:', error);
              return {
                id_etudiant: etudiant.id_etudiant,
                nom: etudiant.utilisateur?.nom || etudiant.nom || etudiant.utilisateur_nom || 'N/A',
                prenom: etudiant.utilisateur?.prenom || etudiant.prenom || etudiant.utilisateur_prenom || 'N/A',
                numero_inscription: etudiant.numero_inscription || 'N/A',
                absent: false,
                absence: null
              };
            }
          })
        );
        
        console.log('Étudiants avec absences:', etudiantsAvecAbsences);
        setEtudiants(etudiantsAvecAbsences);
      } else {
        console.log('Aucun groupe trouvé dans les données emploi');
        setEtudiants([]);
      }
    } catch (error) {
      console.error('Erreur générale:', error);
      setMessage('❌ Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Marquer absent
  const marquerAbsent = async (id_etudiant: number) => {
    try {
      setMessage('');
      const res = await fetch('/api/absences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_emploi: parseInt(id_emploi!),
          id_etudiant,
          statut: 'NonJustifiee'
        })
      });

      if (res.ok) {
        setMessage('✅ Absence enregistrée');
        chargerDonnees(); // Recharger les données
      } else {
        const data = await res.json();
        setMessage(data.error || '❌ Erreur lors de l\'enregistrement');
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion');
      console.error('Erreur:', error);
    }
  };

  // Marquer présent (annuler absence)
  const marquerPresent = async (id_absence: number) => {
    try {
      setMessage('');
      const res = await fetch(`/api/absences/${id_absence}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setMessage('✅ Absence annulée');
        chargerDonnees(); // Recharger les données
      } else {
        setMessage('❌ Erreur lors de l\'annulation');
      }
    } catch (error) {
      setMessage('❌ Erreur de connexion');
      console.error('Erreur:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Chargement de la feuille de présence..." color="green" />;
  }

  if (!emploi) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-red-50 border-2 border-red-200 rounded-lg p-6">
          <p className="text-red-700 text-center font-semibold text-lg">❌ Séance non trouvée</p>
          <button
            onClick={() => router.push('/dashboard-enseignant/absences')}
            className="mt-4 w-full px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-semibold transition-colors"
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
    : '0.0';

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Bouton retour */}
        <button
          onClick={() => router.push('/dashboard-enseignant/absences')}
          className="mb-6 px-6 py-3 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-semibold transition-colors flex items-center gap-2 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Retour aux absences
        </button>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-green-100 rounded-lg">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Feuille de Présence
              </h1>
              <p className="text-gray-600 mt-1">Enregistrement des absences</p>
            </div>
          </div>

          {/* Infos séance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <BookOpen className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-700 font-semibold">Matière</p>
                <p className="text-gray-900 font-bold">{emploi.matiere.nom}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-700 font-semibold">Date</p>
                <p className="text-gray-900 text-sm">
                  {new Date(emploi.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-700 font-semibold">Horaire</p>
                <p className="text-gray-900 text-sm">
                  {emploi.heure_debut} - {emploi.heure_fin}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-4">
              <MapPin className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-700 font-semibold">Salle / Groupe</p>
                <p className="text-gray-900 text-sm">{emploi.salle.code} - {emploi.groupe.nom}</p>
              </div>
            </div>
          </div>

          {/* Taux de présence */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-700 font-semibold">Taux de Présence</span>
              <span className="text-2xl font-bold text-green-600">{tauxPresence}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-green-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${tauxPresence}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-600 mt-2">{nbPresents}/{etudiants.length} étudiants présents</p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.startsWith('✅') 
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Liste des étudiants */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-green-600 p-6">
            <h2 className="text-xl font-bold text-white">
              Liste des Étudiants ({etudiants.length})
            </h2>
            <p className="text-green-100 text-sm mt-1">
              {nbPresents} présents • {nbAbsents} absents
            </p>
          </div>

          {etudiants.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg">Aucun étudiant trouvé dans ce groupe</p>
              <button
                onClick={chargerDonnees}
                className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {etudiants.map((etudiant, index) => (
                <div
                  key={etudiant.id_etudiant}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    etudiant.absent ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                        etudiant.absent 
                          ? 'bg-gradient-to-br from-red-500 to-pink-600'
                          : 'bg-gradient-to-br from-green-500 to-teal-600'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-lg">
                          {etudiant.prenom} {etudiant.nom}
                        </p>
                        <p className="text-sm text-gray-500">
                          {etudiant.numero_inscription}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {etudiant.absent ? (
                        <>
                          <span className="px-4 py-2 bg-red-100 border border-red-200 text-red-700 rounded-lg font-semibold flex items-center gap-2">
                            <XCircle className="w-5 h-5" />
                            Absent
                          </span>
                          <button
                            onClick={() => marquerPresent(etudiant.absence!.id_absence)}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                          >
                            Marquer Présent
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="px-4 py-2 bg-green-100 border border-green-200 text-green-700 rounded-lg font-semibold flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Présent
                          </span>
                          <button
                            onClick={() => marquerAbsent(etudiant.id_etudiant)}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
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
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 border-l-4 border-l-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Présents</p>
                <p className="text-4xl font-bold text-green-600">{nbPresents}</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 border-l-4 border-l-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Absents</p>
                <p className="text-4xl font-bold text-red-600">{nbAbsents}</p>
              </div>
              <XCircle className="w-12 h-12 text-red-600 opacity-20" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 border-l-4 border-l-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-semibold">Taux de Présence</p>
                <p className="text-4xl font-bold text-blue-600">{tauxPresence}%</p>
              </div>
              <Users className="w-12 h-12 text-blue-600 opacity-20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}