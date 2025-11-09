'use client';

import { useEffect, useState } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { NotificationService } from '@/lib/services/notificationService';

interface Notification {
  id_notification: number;
  titre: string;
  message: string;
  type: string;
  date_creation: string;
  in_app_lu: boolean;
}

export default function NotificationBell({ id_etudiant }: { id_etudiant: number }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [nonLues, setNonLues] = useState(0);

  useEffect(() => {
    loadNotifications();
    // Recharger toutes les 30 secondes
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [id_etudiant]);

  const loadNotifications = async () => {
    try {
      const res = await fetch(
        `/api/notifications?id_etudiant=${id_etudiant}`
      );
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setNonLues(data.filter((n: Notification) => !n.in_app_lu).length);
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  };

  const marquerCommeLue = async (id_notification: number) => {
    try {
      await fetch(`/api/notifications/${id_notification}`, {
        method: 'PUT',
      });
      loadNotifications();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getIconByType = (type: string) => {
    const icons: Record<string, string> = {
      CHANGEMENT_EMPLOI_TEMPS: '📅',
      ANNULATION_COURS: '❌',
      ABSENCE_ENREGISTREE: '⚠️',
      NOTE_PUBLIEE: '📊',
      MESSAGE_ENSEIGNANT: '💬',
      RAPPEL_DEVOIR: '📝',
      ALERTE_PRESENCE: '🔔',
      INFORMATION_GENERALE: 'ℹ️',
    };
    return icons[type] || '📢';
  };

  return (
    <div className="relative">
      {/* Bouton cloche */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6" />
        {nonLues > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {nonLues > 9 ? '9+' : nonLues}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id_notification}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    !notif.in_app_lu ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {getIconByType(notif.type)}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {notif.titre}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(notif.date_creation).toLocaleString('fr-FR')}
                      </p>
                    </div>
                    {!notif.in_app_lu && (
                      <button
                        onClick={() => marquerCommeLue(notif.id_notification)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 text-center">
            <a
              href="/dashboard-etudiant/preferences-notification"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Gérer les préférences
            </a>
          </div>
        </div>
      )}
    </div>
  );
}