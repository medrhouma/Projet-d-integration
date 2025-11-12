'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Users, BookOpen, GraduationCap, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';

interface EmploiTemps {
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
  };
}

export default function EmploiTempsEnseignantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [emplois, setEmplois] = useState<EmploiTemps[]>([]);
  const [enseignantInfo, setEnseignantInfo] = useState<any>(null);

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const heures = [
    { label: '08:30 - 10:00', start: 8.5, end: 10 },
    { label: '10:00 - 11:30', start: 10, end: 11.5 },
    { label: '11:30 - 13:00', start: 11.5, end: 13 },
    { label: 'PAUSE', start: 13, end: 14, isPause: true },
    { label: '14:00 - 15:30', start: 14, end: 15.5 },
    { label: '15:30 - 17:00', start: 15.5, end: 17 },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const userRes = await fetch('/api/auth/me');
      const userData = await userRes.json();
      const user = userData.success ? userData.user : userData;
      
      setEnseignantInfo(user);

      if (user.enseignant?.id_enseignant) {
        const emploiRes = await fetch(`/api/emploi-temps/public?enseignantId=${user.enseignant.id_enseignant}`);
        const emploiData = await emploiRes.json();
        setEmplois(emploiData);
      }
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEmploiForSlot = (dayIndex: number, slotStart: number, slotEnd: number) => {
    return emplois.filter(emploi => {
      const emploiDate = new Date(emploi.date);
      const dayOfWeek = emploiDate.getDay();
      const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      
      if (adjustedDay !== dayIndex) return false;
      
      const heureDebut = new Date(emploi.heure_debut);
      const emploiHeureDebut = heureDebut.getUTCHours() + heureDebut.getUTCMinutes() / 60;
      
      return emploiHeureDebut >= slotStart && emploiHeureDebut < slotEnd;
    });
  };

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });
  };

  const stats = {
    totalCours: emplois.length,
    heuresTotal: emplois.reduce((acc, emploi) => {
      const debut = new Date(emploi.heure_debut);
      const fin = new Date(emploi.heure_fin);
      return acc + (fin.getTime() - debut.getTime()) / (1000 * 60 * 60);
    }, 0).toFixed(1),
    groupes: new Set(emplois.map(e => e.groupe.nom)).size,
    salles: new Set(emplois.map(e => e.salle.code)).size,
  };

  if (loading) {
    return <LoadingSpinner color="green" message="Chargement de votre emploi du temps..." />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-6">
        <button
          onClick={() => router.push('/dashboard-enseignant')}
          className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-50 rounded-lg border border-gray-200 text-gray-900 font-semibold transition-colors shadow-sm"
        >
          <ArrowLeft size={20} />
          <span>Retour au Dashboard</span>
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-green-100 p-3 rounded-lg">
            <Calendar size={32} className="text-green-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Mon Emploi du Temps
            </h1>
            {enseignantInfo && (
              <div className="text-gray-600 flex items-center gap-2">
                <GraduationCap size={20} />
                <span>{enseignantInfo.prenom} {enseignantInfo.nom}</span>
                {enseignantInfo.enseignant?.matricule && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-green-600">{enseignantInfo.enseignant.matricule}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <BookOpen className="text-green-600" size={32} />
            <span className="text-4xl font-bold text-gray-900">{stats.totalCours}</span>
          </div>
          <p className="text-gray-600 font-semibold">Total Cours</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Clock className="text-green-600" size={32} />
            <span className="text-4xl font-bold text-gray-900">{stats.heuresTotal}h</span>
          </div>
          <p className="text-gray-600 font-semibold">Heures Total</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <Users className="text-green-600" size={32} />
            <span className="text-4xl font-bold text-gray-900">{stats.groupes}</span>
          </div>
          <p className="text-gray-600 font-semibold">Groupes</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <MapPin className="text-green-600" size={32} />
            <span className="text-4xl font-bold text-gray-900">{stats.salles}</span>
          </div>
          <p className="text-gray-600 font-semibold">Salles</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="bg-green-600 text-white p-6">
          <h2 className="text-2xl font-bold mb-2 flex items-center gap-3">
            <Calendar size={28} />
            Emploi du temps de la semaine
          </h2>
          <p className="text-green-50 text-sm">Vue hebdomadaire de vos cours</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 p-4 sticky left-0 bg-white z-10 min-w-[150px]">
                  <div className="flex items-center justify-center gap-2 text-gray-900">
                    <Clock size={20} />
                    <span className="font-bold">Horaires</span>
                  </div>
                </th>
                {jours.map((jour, i) => (
                  <th key={i} className="border border-gray-200 p-4 font-bold text-gray-900 min-w-[200px]">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      {jour}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {heures.map((heure, i) => (
                <tr key={i} className={heure.isPause ? 'bg-orange-50' : 'hover:bg-gray-50 transition-colors'}>
                  <td className={`border border-gray-200 p-4 text-center font-bold sticky left-0 z-10 ${
                    heure.isPause ? 'bg-orange-100 text-orange-700' : 'bg-gray-50 text-gray-900'
                  }`}>
                    <div className="flex items-center justify-center gap-2">
                      {!heure.isPause && <Clock size={16} />}
                      {heure.label}
                    </div>
                  </td>
                  {heure.isPause ? (
                    <td colSpan={6} className="border border-gray-200 p-6 text-center">
                      <div className="inline-flex items-center gap-3 bg-orange-100 px-8 py-4 rounded-lg border border-orange-200">
                        <span className="text-3xl">🍽️</span>
                        <span className="text-orange-700 font-bold text-lg">PAUSE DÉJEUNER</span>
                      </div>
                    </td>
                  ) : (
                    jours.map((_, dayIndex) => {
                      const emploisSlot = getEmploiForSlot(dayIndex, heure.start, heure.end);
                      return (
                        <td key={dayIndex} className="border border-gray-200 p-2">
                          {emploisSlot.length > 0 ? (
                            <div className="space-y-2">
                              {emploisSlot.map((emploi) => (
                                <div key={emploi.id_emploi} className="bg-green-600 text-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all border-l-4 border-green-800">
                                  <div className="font-bold text-sm mb-2 flex items-center gap-2">
                                    <BookOpen size={14} />
                                    <span className="line-clamp-1">{emploi.matiere.nom}</span>
                                  </div>
                                  <div className="text-xs flex items-center gap-1 mb-1 bg-green-700/50 px-2 py-1 rounded">
                                    <Users size={12} />
                                    <span className="line-clamp-1">{emploi.groupe.nom}</span>
                                  </div>
                                  <div className="text-xs flex items-center gap-1 mb-1 bg-green-700/50 px-2 py-1 rounded">
                                    <Clock size={12} />
                                    <span>{formatTime(emploi.heure_debut)} - {formatTime(emploi.heure_fin)}</span>
                                  </div>
                                  <div className="text-xs flex items-center gap-1 bg-green-700/50 px-2 py-1 rounded">
                                    <MapPin size={12} />
                                    <span>{emploi.salle.code}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="h-24 flex items-center justify-center text-gray-400 text-xs rounded-lg bg-gray-50 border border-dashed border-gray-300">
                              <div className="text-center">
                                <div className="text-2xl mb-1">📭</div>
                                <div>Libre</div>
                              </div>
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
          <div className="p-12 text-center bg-gray-50">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <Calendar size={48} className="text-green-600" />
            </div>
            <p className="text-gray-900 text-lg font-semibold">Aucun cours programmé</p>
            <p className="text-gray-500 text-sm mt-2">Votre emploi du temps est vide pour le moment</p>
          </div>
        )}
      </div>

      {emplois.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BookOpen size={28} className="text-green-600" />
            Matières enseignées
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from(new Set(emplois.map(e => e.matiere.nom))).map((matiere, index) => {
              const count = emplois.filter(e => e.matiere.nom === matiere).length;
              return (
                <div 
                  key={index}
                  className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{matiere}</p>
                      <p className="text-sm text-gray-600 mt-1">{count} séance(s)</p>
                    </div>
                    <div className="bg-green-600 px-3 py-1 rounded-full">
                      <span className="text-white font-bold">{count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
