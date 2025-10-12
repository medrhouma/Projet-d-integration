'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Departement {
  id_departement: number;
  nom: string;
}

interface Specialite {
  id_specialite: number;
  nom: string;
  id_departement: number;
}

interface Niveau {
  id_niveau: number;
  nom: string;
  id_specialite: number;
}

interface Groupe {
  id_groupe: number;
  nom: string;
  id_niveau: number;
}

export default function NouvelEtudiant() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // États pour les données
  const [departements, setDepartements] = useState<Departement[]>([]);
  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [groupes, setGroupes] = useState<Groupe[]>([]);

  // États pour les sélections
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedSpec, setSelectedSpec] = useState('');
  const [selectedNiveau, setSelectedNiveau] = useState('');

  // États pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    identifiant: '',
    mot_de_passe: '',
    numero_inscription: '',
    id_specialite: '',
    id_niveau: '',
    id_groupe: ''
  });

  // Charger les départements au montage
  useEffect(() => {
    loadDepartements();
  }, []);

  // Charger les spécialités quand le département change
  useEffect(() => {
    if (selectedDept) {
      loadSpecialites(parseInt(selectedDept));
    } else {
      setSpecialites([]);
      setNiveaux([]);
      setGroupes([]);
    }
  }, [selectedDept]);

  // Charger les niveaux quand la spécialité change
  useEffect(() => {
    if (selectedSpec) {
      loadNiveaux(parseInt(selectedSpec));
      setFormData(prev => ({ ...prev, id_specialite: selectedSpec }));
    } else {
      setNiveaux([]);
      setGroupes([]);
    }
  }, [selectedSpec]);

  // Charger les groupes quand le niveau change
  useEffect(() => {
    if (selectedNiveau) {
      loadGroupes(parseInt(selectedNiveau));
      setFormData(prev => ({ ...prev, id_niveau: selectedNiveau }));
    } else {
      setGroupes([]);
    }
  }, [selectedNiveau]);

  const loadDepartements = async () => {
    try {
      const res = await fetch('/api/departements');
      if (res.ok) {
        const data = await res.json();
        setDepartements(data);
      }
    } catch (err) {
      console.error('Erreur chargement départements:', err);
    }
  };

  const loadSpecialites = async (deptId: number) => {
    try {
      const res = await fetch(`/api/specialites?departement=${deptId}`);
      if (res.ok) {
        const data = await res.json();
        setSpecialites(data);
      }
    } catch (err) {
      console.error('Erreur chargement spécialités:', err);
    }
  };

  const loadNiveaux = async (specId: number) => {
    try {
      const res = await fetch(`/api/niveaux?specialite=${specId}`);
      if (res.ok) {
        const data = await res.json();
        setNiveaux(data);
      }
    } catch (err) {
      console.error('Erreur chargement niveaux:', err);
    }
  };

  const loadGroupes = async (niveauId: number) => {
    try {
      const res = await fetch(`/api/groupes?niveau=${niveauId}`);
      if (res.ok) {
        const data = await res.json();
        setGroupes(data);
      }
    } catch (err) {
      console.error('Erreur chargement groupes:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/etudiants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Étudiant ajouté avec succès !');
        setTimeout(() => {
          router.push('/dashboard-admin/etudiants');
        }, 2000);
      } else {
        setError(data.error || 'Erreur lors de l\'ajout de l\'étudiant');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Générer un identifiant automatique
  const generateIdentifiant = () => {
    if (formData.numero_inscription) {
      setFormData(prev => ({
        ...prev,
        identifiant: `ETU${formData.numero_inscription}`
      }));
    }
  };

  // Générer un email automatique
  const generateEmail = () => {
    if (formData.nom && formData.prenom) {
      const email = `${formData.prenom.toLowerCase()}.${formData.nom.toLowerCase()}@student.tn`;
      setFormData(prev => ({
        ...prev,
        email: email
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard-admin/etudiants"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-4"
          >
            ← Retour à la liste
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Ajouter un étudiant</h1>
          <p className="text-gray-600 mt-2">Remplissez tous les champs pour créer un nouveau compte étudiant</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {/* Informations personnelles */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              👤 Informations personnelles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  onBlur={generateEmail}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom de famille"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  onBlur={generateEmail}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Prénom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@student.tn"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° Inscription <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numero_inscription"
                  value={formData.numero_inscription}
                  onChange={handleChange}
                  onBlur={generateIdentifiant}
                  required
                  maxLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="202430"
                />
              </div>
            </div>
          </div>

          {/* Informations de connexion */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              🔐 Informations de connexion
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identifiant <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="identifiant"
                  value={formData.identifiant}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ETU030"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="mot_de_passe"
                  value={formData.mot_de_passe}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimum 6 caractères"
                />
              </div>
            </div>
          </div>

          {/* Informations académiques */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              🎓 Informations académiques
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Département
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => {
                    setSelectedDept(e.target.value);
                    setSelectedSpec('');
                    setSelectedNiveau('');
                    setFormData(prev => ({ ...prev, id_specialite: '', id_niveau: '', id_groupe: '' }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un département</option>
                  {departements.map(dept => (
                    <option key={dept.id_departement} value={dept.id_departement}>
                      {dept.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Spécialité
                </label>
                <select
                  value={selectedSpec}
                  onChange={(e) => {
                    setSelectedSpec(e.target.value);
                    setSelectedNiveau('');
                    setFormData(prev => ({ ...prev, id_niveau: '', id_groupe: '' }));
                  }}
                  disabled={!selectedDept}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Sélectionner une spécialité</option>
                  {specialites.map(spec => (
                    <option key={spec.id_specialite} value={spec.id_specialite}>
                      {spec.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau
                </label>
                <select
                  value={selectedNiveau}
                  onChange={(e) => {
                    setSelectedNiveau(e.target.value);
                    setFormData(prev => ({ ...prev, id_groupe: '' }));
                  }}
                  disabled={!selectedSpec}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Sélectionner un niveau</option>
                  {niveaux.map(niv => (
                    <option key={niv.id_niveau} value={niv.id_niveau}>
                      {niv.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Groupe
                </label>
                <select
                  name="id_groupe"
                  value={formData.id_groupe}
                  onChange={handleChange}
                  disabled={!selectedNiveau}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Sélectionner un groupe</option>
                  {groupes.map(grp => (
                    <option key={grp.id_groupe} value={grp.id_groupe}>
                      {grp.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 justify-end pt-6 border-t border-gray-200">
            <Link
              href="/dashboard-admin/etudiants"
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Ajout en cours...' : 'Ajouter l\'étudiant'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}