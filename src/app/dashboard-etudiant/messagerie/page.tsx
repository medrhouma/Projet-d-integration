'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Send, Search, User, Clock, Circle } from 'lucide-react';

interface Contact {
  id_utilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  enseignant?: {
    departement_nom: string;
    est_chef_departement: boolean;
  };
}

interface Message {
  id_message: number;
  id_expediteur: number;
  id_destinataire: number;
  contenu: string;
  date: string;
  lu: boolean;
  expediteur: {
    id_utilisateur: number;
    nom: string;
    prenom: string;
    role: string;
  };
  destinataire: {
    id_utilisateur: number;
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

export default function MessagerieEtudiant() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState<any>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedUser && !isNaN(selectedUser)) {
      fetchMessages(selectedUser);
      const interval = setInterval(() => {
        if (selectedUser && !isNaN(selectedUser)) {
          fetchMessages(selectedUser);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        console.log('Current user data:', data);
        // L'API retourne {success: true, user: {...}}
        const userId = data.user?.id || data.user?.id_utilisateur || data.id_utilisateur || data.id;
        console.log('User ID extrait:', userId);
        setCurrentUserId(userId);
      }
    } catch (error) {
      console.error('Erreur:', error);
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

  const fetchContacts = async () => {
    try {
      const response = await fetch(`/api/messages/contacts?search=${searchTerm}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
    }
  };

  const fetchMessages = async (userId: number) => {
    try {
      // Validation du userId
      if (!userId || isNaN(userId)) {
        console.error('ID utilisateur invalide:', userId);
        return;
      }
      
      const response = await fetch(`/api/messages/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Erreur lors de la récupération des messages:', await response.text());
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation stricte
    if (!newMessage.trim()) {
      alert('Le message ne peut pas être vide');
      return;
    }
    
    if (!selectedUser || selectedUser === null || typeof selectedUser !== 'number') {
      alert('Aucun destinataire sélectionné. Veuillez sélectionner un contact.');
      console.error('selectedUser invalide:', selectedUser, typeof selectedUser);
      return;
    }

    console.log('Envoi du message:', {
      id_destinataire: selectedUser,
      contenu: newMessage.trim(),
      type_selectedUser: typeof selectedUser,
      selectedUser_value: selectedUser
    });

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id_destinataire: selectedUser,
          contenu: newMessage.trim(),
        }),
      });

      console.log('Response status:', response.status);
      console.log('Response statusText:', response.statusText);

      if (response.ok) {
        setNewMessage('');
        fetchMessages(selectedUser);
        fetchConversations();
      } else {
        const errorText = await response.text();
        console.error('Erreur brute du serveur:', errorText);
        try {
          const error = JSON.parse(errorText);
          console.error('Erreur parsée:', error);
          alert(`Erreur lors de l'envoi du message: ${error.error || error.message || 'Erreur inconnue'}`);
        } catch {
          alert(`Erreur lors de l'envoi du message: ${errorText}`);
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      alert('Erreur lors de l\'envoi du message');
    }
  };

  const handleSelectConversation = (conv: Conversation) => {
    setSelectedUser(conv.user_id);
    setSelectedUserInfo({
      nom: conv.nom,
      prenom: conv.prenom,
      role: conv.role,
    });
    setShowNewChat(false);
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedUser(contact.id_utilisateur);
    setSelectedUserInfo(contact);
    setShowNewChat(false);
    fetchMessages(contact.id_utilisateur);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Enseignant':
        return 'bg-green-100 text-green-800';
      case 'ChefDepartement':
        return 'bg-orange-100 text-orange-800';
      case 'Admin':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 24) {
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-8 w-8" />
              <h1 className="text-2xl font-bold">Messagerie</h1>
            </div>
            <button
              onClick={() => router.push('/dashboard-etudiant')}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
            >
              Retour au tableau de bord
            </button>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="flex h-full">
            {/* Sidebar - Liste des conversations */}
            <div className="w-1/3 border-r border-gray-200 flex flex-col">
              {/* Search and New Chat */}
              <div className="p-4 border-b border-gray-200 space-y-3">
                <button
                  onClick={() => {
                    setShowNewChat(true);
                    fetchContacts();
                  }}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Nouvelle conversation
                </button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {showNewChat ? (
                  // Liste des contacts
                  <div className="divide-y divide-gray-100">
                    {contacts
                      .filter(
                        (c) =>
                          c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.prenom.toLowerCase().includes(searchTerm.toLowerCase())
                      )
                      .map((contact) => (
                        <button
                          key={contact.id_utilisateur}
                          onClick={() => handleSelectContact(contact)}
                          className="w-full p-4 hover:bg-blue-50 transition text-left"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate">
                                {contact.prenom} {contact.nom}
                              </p>
                              <span
                                className={`inline-block px-2 py-1 text-xs rounded-full ${getRoleBadgeColor(
                                  contact.role
                                )}`}
                              >
                                {contact.role}
                              </span>
                              {contact.enseignant && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {contact.enseignant.departement_nom}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                  </div>
                ) : (
                  // Liste des conversations
                  <div className="divide-y divide-gray-100">
                    {conversations.map((conv) => (
                      <button
                        key={conv.user_id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`w-full p-4 hover:bg-blue-50 transition text-left ${
                          selectedUser === conv.user_id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-gray-900 truncate">
                                {conv.prenom} {conv.nom}
                              </p>
                              {conv.messages_non_lus > 0 && (
                                <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 ml-2">
                                  {conv.messages_non_lus}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">{conv.dernier_message}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span
                                className={`inline-block px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(
                                  conv.role
                                )}`}
                              >
                                {conv.role}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatTime(conv.derniere_date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {selectedUser && selectedUserInfo ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {selectedUserInfo.prenom} {selectedUserInfo.nom}
                        </h3>
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded-full ${getRoleBadgeColor(
                            selectedUserInfo.role
                          )}`}
                        >
                          {selectedUserInfo.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => {
                      const isOwnMessage = message.id_expediteur === currentUserId;
                      return (
                        <div
                          key={message.id_message}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwnMessage
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-900'
                            }`}
                          >
                            <p className="break-words">{message.contenu}</p>
                            <div className="flex items-center justify-end mt-1 space-x-1">
                              <Clock className="h-3 w-3 opacity-70" />
                              <span className="text-xs opacity-70">
                                {formatTime(message.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Tapez votre message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition flex items-center space-x-2"
                      >
                        <Send className="h-5 w-5" />
                        <span>Envoyer</span>
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4" />
                    <p className="text-lg">Sélectionnez une conversation pour commencer</p>
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
