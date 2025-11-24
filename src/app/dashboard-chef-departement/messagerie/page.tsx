'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Message {
  id_message: number;
  contenu: string;
  date: string;
  lu: boolean;
  id_expediteur: number;
  id_destinataire: number;
  expediteur: {
    nom: string;
    prenom: string;
    role: string;
  };
  destinataire: {
    nom: string;
    prenom: string;
    role: string;
  };
}

interface Conversation {
  user_id: number;
  nom: string;
  prenom: string;
  role: string;
  dernier_message: string;
  derniere_date: string;
  messages_non_lus: number;
}

interface Contact {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  role: string;
}

export default function MessagerieChefDepartement() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchContact, setSearchContact] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setCurrentUser(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'utilisateur:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/messages');
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string) => {
    try {
      const response = await fetch(`/api/messages/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        fetchConversations();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des messages:', error);
    }
  };

  const fetchContacts = async () => {
    try {
      const response = await fetch(`/api/messages/contacts?search=${searchContact}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
    }
  };

  useEffect(() => {
    if (showNewConversation) {
      fetchContacts();
    }
  }, [showNewConversation, searchContact]);

  const handleSelectConversation = (userId: string) => {
    setSelectedConversation(userId);
    setShowNewConversation(false);
    fetchMessages(userId);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_destinataire: selectedConversation,
          contenu: newMessage,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation);
        fetchConversations();
      } else {
        alert('Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const handleStartNewConversation = (contact: Contact) => {
    setSelectedConversation(contact.id_utilisateur.toString());
    setShowNewConversation(false);
    fetchMessages(contact.id_utilisateur.toString());
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Etudiant':
        return 'bg-blue-100 text-blue-800';
      case 'Enseignant':
        return 'bg-green-100 text-green-800';
      case 'ChefDepartement':
        return 'bg-purple-100 text-purple-800';
      case 'Admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'Etudiant':
        return 'Étudiant';
      case 'Enseignant':
        return 'Enseignant';
      case 'ChefDepartement':
        return 'Chef de Département';
      case 'Admin':
        return 'Administrateur';
      default:
        return role;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return date.toLocaleDateString('fr-FR', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    }
  };

  const selectedConversationData = conversations.find(c => c.userId === selectedConversation);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard-chef-departement')}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Messagerie</h1>
            </div>
            <button
              onClick={() => setShowNewConversation(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Nouveau message</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 180px)' }}>
          <div className="flex h-full">
            {/* Liste des conversations */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p>Aucune conversation</p>
                  <p className="text-sm mt-2">Commencez une nouvelle conversation</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.user_id}
                    onClick={() => handleSelectConversation(conv.user_id.toString())}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedConversation === conv.user_id.toString() ? 'bg-orange-50 border-l-4 border-l-orange-500' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{conv.prenom} {conv.nom}</h3>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(conv.role)}`}>
                          {getRoleLabel(conv.role)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDate(conv.derniere_date)}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mt-1">{conv.dernier_message}</p>
                    {conv.messages_non_lus > 0 && (
                      <span className="inline-block mt-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {conv.messages_non_lus}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Zone de messages */}
            <div className="flex-1 flex flex-col">
              {showNewConversation ? (
                <div className="flex-1 flex flex-col">
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Nouvelle conversation</h2>
                    <button
                      onClick={() => setShowNewConversation(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <input
                      type="text"
                      placeholder="Rechercher un contact..."
                      value={searchContact}
                      onChange={(e) => setSearchContact(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto px-4">
                    {contacts.map((contact) => (
                      <div
                        key={contact.id_utilisateur}
                        onClick={() => handleStartNewConversation(contact)}
                        className="p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-orange-50 hover:border-orange-500 transition-colors"
                      >
                        <div className="font-semibold text-gray-900">
                          {contact.prenom} {contact.nom}
                        </div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(contact.role)}`}>
                          {getRoleLabel(contact.role)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedConversation ? (
                <>
                  {/* En-tête de la conversation */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-900">{selectedConversationData?.userName}</h2>
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${getRoleBadgeColor(selectedConversationData?.userRole || '')}`}>
                      {getRoleLabel(selectedConversationData?.userRole || '')}
                    </span>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwn = message.id_expediteur === currentUser?.id;
                      return (
                        <div key={message.id_message} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${isOwn ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-900'} rounded-lg px-4 py-2`}>
                            {!isOwn && (
                              <div className="text-xs font-semibold mb-1 opacity-75">
                                {message.expediteur.prenom} {message.expediteur.nom}
                              </div>
                            )}
                            <p className="break-words">{message.contenu}</p>
                            <div className={`text-xs mt-1 ${isOwn ? 'text-orange-100' : 'text-gray-500'}`}>
                              {new Date(message.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Formulaire d'envoi */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Écrivez votre message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                        disabled={sending}
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
                      >
                        {sending ? 'Envoi...' : 'Envoyer'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-lg">Sélectionnez une conversation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
