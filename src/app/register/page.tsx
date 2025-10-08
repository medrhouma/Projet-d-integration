'use client';
import { useState } from "react";
import Link from "next/link";
import { GraduationCap, User, Building, Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from "lucide-react";

interface FormData {
  nom: string;
  prenom: string;
  email: string;
  login: string;
  numInsc: string;
  matricule: string;
  password: string;
  confirmPassword: string;
}

type UserRole = "Etudiant" | "Enseignant" | "Admin";

interface FormErrors {
  [key: string]: string;
}

export default function RegisterPage() {
  const [role, setRole] = useState<UserRole>("Etudiant");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState("");
  
  const [form, setForm] = useState<FormData>({
    nom: "",
    prenom: "",
    email: "",
    login: "",
    numInsc: "",
    matricule: "",
    password: "",
    confirmPassword: "",
  });

  const roles = [
    { key: "Etudiant" as UserRole, label: "Etudiant", icon: <GraduationCap className="w-5 h-5" />, description: "Accès aux cours et évaluations" },
    { key: "Enseignant" as UserRole, label: "Enseignant", icon: <User className="w-5 h-5" />, description: "Gestion des cours et notes" },
    { key: "Admin" as UserRole, label: "Administration", icon: <Building className="w-5 h-5" />, description: "Gestion complète du système" },
  ];

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: "Au moins 8 caractères" };
    }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return { isValid: false, message: "Majuscule, minuscule et chiffre requis" };
    }
    return { isValid: true, message: "Mot de passe sécurisé" };
  };

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'nom':
      case 'prenom':
        return value.trim().length < 2 ? "Au moins 2 caractères requis" : "";
      case 'email':
        return !validateEmail(value) ? "Format d'email invalide" : "";
      case 'login':
        return value.length < 3 ? "Au moins 3 caractères requis" : "";
      case 'numInsc':
        return role === "Etudiant" && !/^\d{6}$/.test(value) ? "6 chiffres requis" : "";
      case 'matricule':
        return (role === "Enseignant" || role === "Admin") && !/^\d{4}$/.test(value) ? "4 chiffres requis" : "";
      case 'password':
        return !validatePassword(value).isValid ? validatePassword(value).message : "";
      case 'confirmPassword':
        return value !== form.password ? "Les mots de passe ne correspondent pas" : "";
      default:
        return "";
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // Validation en temps réel
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(form).forEach(key => {
      if (key === 'numInsc' && role !== 'Etudiant') return;
      if (key === 'matricule' && role === 'Etudiant') return;
      
      const error = validateField(key, form[key as keyof FormData]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;
  
  setIsLoading(true);
  setSuccessMessage("");
  setErrors({}); // reset errors
  
  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        ...form, 
        role,
        ...(role === 'Etudiant' ? { matricule: undefined } : { numInsc: undefined })
      })
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      setErrors({ general: data.error || "Erreur serveur" });
      return;
    }

    setSuccessMessage("Compte créé avec succès ! Redirection en cours...");

    setTimeout(() => {
      console.log("Redirection vers /login");
      // router.push('/login');
    }, 2000);

  } catch (err) {
    console.error(err);
    setErrors({ general: "Erreur lors de l'inscription. Veuillez réessayer." });
  } finally {
    setIsLoading(false);
  }
};

  const getFieldStatus = (fieldName: string) => {
    const value = form[fieldName as keyof FormData];
    const error = errors[fieldName];
    
    if (!value) return null;
    if (error) return 'error';
    return 'success';
  };

  const renderPasswordStrength = () => {
    const { isValid, message } = validatePassword(form.password);
    if (!form.password) return null;
    
    return (
      <div className={`text-xs mt-1 flex items-center gap-1 ${isValid ? 'text-green-600' : 'text-orange-600'}`}>
        {isValid ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
        {message}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 px-4 py-8">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Créer un compte
          </h1>
          <p className="text-gray-600">Rejoignez notre plateforme éducative</p>
        </div>

        {/* Messages d'état */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{errors.general}</p>
          </div>
        )}
        
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
            <p className="text-green-700">{successMessage}</p>
          </div>
        )}

        {/* Sélection du rôle */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Sélectionnez votre profil</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((r) => (
              <div
                key={r.key}
                onClick={() => setRole(r.key)}
                className={`cursor-pointer border-2 rounded-2xl p-6 text-center transition-all duration-300 ${
                  role === r.key
                    ? "border-purple-500 bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg transform scale-105"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                <div className="flex justify-center mb-3">{r.icon}</div>
                <h4 className="font-semibold text-lg mb-1">{r.label}</h4>
                <p className={`text-sm ${role === r.key ? 'text-purple-100' : 'text-gray-500'}`}>
                  {r.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div onSubmit={handleRegister} className="space-y-6">
          {/* Nom et Prénom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {['nom', 'prenom'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {field === 'nom' ? 'Nom' : 'Prénom'} *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name={field}
                    value={form[field as keyof FormData]}
                    onChange={handleChange}
                    className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 ${
                      getFieldStatus(field) === 'error' ? 'border-red-300 bg-red-50' :
                      getFieldStatus(field) === 'success' ? 'border-green-300 bg-green-50' :
                      'border-gray-200 bg-gray-50 focus:border-purple-500'
                    }`}
                    placeholder={field === 'nom' ? 'Votre nom' : 'Votre prénom'}
                    required
                  />
                  {getFieldStatus(field) === 'success' && (
                    <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                  )}
                </div>
                {errors[field] && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {errors[field]}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Email et Login */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 ${
                    getFieldStatus('email') === 'error' ? 'border-red-300 bg-red-50' :
                    getFieldStatus('email') === 'success' ? 'border-green-300 bg-green-50' :
                    'border-gray-200 bg-gray-50 focus:border-purple-500'
                  }`}
                  placeholder="exemple@email.com"
                  required
                />
                {getFieldStatus('email') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Identifiant *</label>
              <div className="relative">
                <input
                  type="text"
                  name="login"
                  value={form.login}
                  onChange={handleChange}
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 ${
                    getFieldStatus('login') === 'error' ? 'border-red-300 bg-red-50' :
                    getFieldStatus('login') === 'success' ? 'border-green-300 bg-green-50' :
                    'border-gray-200 bg-gray-50 focus:border-purple-500'
                  }`}
                  placeholder="Identifiant unique"
                  required
                />
                {getFieldStatus('login') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.login && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.login}
                </p>
              )}
            </div>
          </div>

          {/* Champs spécifiques au rôle */}
          {role === "Etudiant" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Numéro d'inscription *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="numInsc"
                  value={form.numInsc}
                  onChange={handleChange}
                  pattern="\d{6}"
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 ${
                    getFieldStatus('numInsc') === 'error' ? 'border-red-300 bg-red-50' :
                    getFieldStatus('numInsc') === 'success' ? 'border-green-300 bg-green-50' :
                    'border-gray-200 bg-gray-50 focus:border-purple-500'
                  }`}
                  placeholder="Exemple: 123456"
                  required
                />
                {getFieldStatus('numInsc') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.numInsc && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.numInsc}
                </p>
              )}
            </div>
          )}

          {(role === "Enseignant" || role === "Admin") && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Matricule *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="matricule"
                  value={form.matricule}
                  onChange={handleChange}
                  pattern="\d{4}"
                  className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 ${
                    getFieldStatus('matricule') === 'error' ? 'border-red-300 bg-red-50' :
                    getFieldStatus('matricule') === 'success' ? 'border-green-300 bg-green-50' :
                    'border-gray-200 bg-gray-50 focus:border-purple-500'
                  }`}
                  placeholder="Exemple: 1234"
                  required
                />
                {getFieldStatus('matricule') === 'success' && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
              {errors.matricule && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.matricule}
                </p>
              )}
            </div>
          )}

          {/* Mots de passe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 ${
                    getFieldStatus('password') === 'error' ? 'border-red-300 bg-red-50' :
                    getFieldStatus('password') === 'success' ? 'border-green-300 bg-green-50' :
                    'border-gray-200 bg-gray-50 focus:border-purple-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {renderPasswordStrength()}
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmer le mot de passe *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-purple-500/20 focus:outline-none transition-all duration-200 ${
                    getFieldStatus('confirmPassword') === 'error' ? 'border-red-300 bg-red-50' :
                    getFieldStatus('confirmPassword') === 'success' ? 'border-green-300 bg-green-50' :
                    'border-gray-200 bg-gray-50 focus:border-purple-500'
                  }`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Bouton de soumission */}
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleRegister}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Création en cours...
              </div>
            ) : (
              "Créer mon compte"
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-600"> 
            Vous avez déjà un compte ?{" "}
            <Link 
              href="/login" 
              className="font-semibold text-purple-600 hover:text-purple-700 transition-colors duration-200"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );}