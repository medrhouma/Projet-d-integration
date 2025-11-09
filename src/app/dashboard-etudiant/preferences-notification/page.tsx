'use client';

import { useEffect, useState } from 'react';
import { Settings, Bell, Mail, Smartphone, Clock } from 'lucide-react';
import Link from 'next/link';

export default function PreferencesNotification() {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [id_etudiant, setIdEtudiant] = useState<number | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const data = JSON.parse(userData);
      setIdEtudiant(data.id_etudiant);
      loadPreferences(data.id_etudiant);
    }
  }, []);

  const loadPreferences = async (id: number) => {
    try {
      const res = await fetch(`/api/preferences-notification?id_etudiant=${id}`);
      if (res.ok) {
        const data = await res.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setPreferences({ ...preferences, [field]: value });
  };

  const handleSave = async () => {
    try {
      const res = await fetch('/api/preferences-notification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_etudiant,
          ...preferences,
        }),
      });

      if (res.ok) {
        setMessage('✅ Préférences mises à jour avec succès');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Erreur lors de la mise à jour');
      console.error(error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/dashboard-etudiant"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← Retour au dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-8 h-8" />
            Préférences de Notification
          </h1>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            {message}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Canaux de notification */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Bell className="w-6 h-6 text-blue-600" />
              Canaux de notification
            </h2>

            <div className="space-y-4">
              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={preferences?.activer_email}
                  onChange={(e) =>
                    handleChange('activer_email', e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <span>
                    <span className="font-medium text-gray-900">Email</span>
                    <span className="text-gray-600">
                      {' '}
                      - Recevoir les notifications par email
                    </span>
                  </span>
                </span>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={preferences?.activer_push}
                  onChange={(e) => handleChange('activer_push', e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  <span>
                    <span className="font-medium text-gray-900">
                      Notification Push
                    </span>
                    <span className="text-gray-600">
                      {' '}
                      - Notifications sur vos appareils
                    </span>
                  </span>
                </span>
              </label>

              <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={preferences?.activer_in_app}
                  onChange={(e) =>
                    handleChange('activer_in_app', e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <span className="ml-3 flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <span>
                    <span className="font-medium text-gray-900">
                      Dans l'application
                    </span>
                    <span className="text-gray-600">
                      {' '}
                      - Notifications dans l'application
                    </span>
                  </span>
                </span>
              </label>
            </div>
          </section>

          {/* Types de notifications */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Types de notifications
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'notif_emploi_temps', label: 'Changements d\'emploi du temps' },
                { key: 'notif_annulation', label: 'Annulations de cours' },
                { key: 'notif_absence', label: 'Absences enregistrées' },
                { key: 'notif_notes', label: 'Notes publiées' },
                { key: 'notif_messages', label: 'Messages des enseignants' },
                { key: 'notif_devoirs', label: 'Rappels de devoirs' },
                { key: 'notif_presence', label: 'Alertes de présence' },
              ].map((type) => (
                <label
                  key={type.key}
                  className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={preferences?.[type.key]}
                    onChange={(e) =>
                      handleChange(type.key, e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-900">{type.label}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Heures tranquilles */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Heures tranquilles
            </h2>

            <p className="text-gray-600 mb-4">
              Pas de notifications entre ces heures (utile pour les heures de sommeil)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  À partir de (heure)
                </label>
                <select
                  value={preferences?.heure_debut_tranquille || ''}
                  onChange={(e) =>
                    handleChange(
                      'heure_debut_tranquille',
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Désactiver</option>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {i}:00
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jusqu'à (heure)
                </label>
                <select
                  value={preferences?.heure_fin_tranquille || ''}
                  onChange={(e) =>
                    handleChange(
                      'heure_fin_tranquille',
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Désactiver</option>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <option key={i} value={i}>
                      {i}:00
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Boutons */}
          <div className="flex gap-4 pt-6 border-t">
            <Link
              href="/dashboard-etudiant"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </Link>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Enregistrer les préférences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}