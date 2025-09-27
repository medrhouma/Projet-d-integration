'use client';
import { useState } from "react";
import Link from "next/link";
import { GraduationCap, User, Building, Eye, EyeOff, CheckCircle, XCircle, LogIn } from "lucide-react";

interface FormData {
  login: string;
  password: string;
}

type UserRole = "etudiant" | "enseignant" | "admin";

interface FormErrors {
  [key: string]: string;
}

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>("etudiant");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState(false);
  
  const [form, setForm] = useState<FormData>({
    login: "",
    password: "",
  });

  const roles = [
    { 
      key: "etudiant" as UserRole, 
      label: "Étudiant", 
      icon: <GraduationCap className="w-5 h-5" />, 
      description: "Accès étudiant",
      dashboardRoute: "/dashboard-etudiant"
    },
    { 
      key: "enseignant" as UserRole, 
      label: "Enseignant", 
      icon: <User className="w-5 h-5" />, 
      description: "Espace enseignant",
      dashboardRoute: "/dashboard-enseignant"
    },
    { 
      key: "admin" as UserRole, 
      label: "Administration", 
      icon: <Building className="w-5 h-5" />, 
      description: "Panel admin",
      dashboardRoute: "/dashboard-admin"
    },
  ];

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'login':
        return value.length < 3 ? "Au moins 3 caractères requis" : "";
      case 'password':
        return value.length < 6 ? "Au moins 6 caractères requis" : "";
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
      const error = validateField(key, form[key as keyof FormData]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...form, 
          role,
          rememberMe
        })
      });
      
      if (!response.ok) {
        throw new Error('Identifiants incorrects');
      }
      
      const data = await response.json();
      
      // Redirection selon le rôle
      const selectedRole = roles.find(r => r.key === role);
      console.log(`Connexion réussie ! Redirection vers ${selectedRole?.dashboardRoute}`);
      
      // Ici vous feriez la redirection réelle
      // router.push(selectedRole?.dashboardRoute || '/dashboard');
      
    } catch (error) {
      setErrors({ 
        general: error instanceof Error ? error.message : "Erreur de connexion. Veuillez vérifier vos identifiants." 
      });
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 px-4 py-8">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-xl border border-gray-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl mb-4">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Connexion
          </h1>
          <p className="text-gray-600">Accédez à votre espace personnel</p>
        </div>

        {/* Message d'erreur général */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700">{errors.general}</p>
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
                className={`cursor-pointer border-2 rounded-2xl p-5 text-center transition-all duration-300 ${
                  role === r.key
                    ? "border-purple-500 bg-gradient-to-br from-purple-500 to-indigo-500 text-white shadow-lg transform scale-105"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:border-purple-300 hover:bg-purple-50"
                }`}
              >
                <div className="flex justify-center mb-3">{r.icon}</div>
                <h4 className="font-semibold text-base mb-1">{r.label}</h4>
                <p className={`text-xs ${role === r.key ? 'text-purple-100' : 'text-gray-500'}`}>
                  {r.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Champ Login */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Identifiant *
            </label>
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
                placeholder="Votre identifiant"
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

          {/* Champ Mot de passe */}
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Options supplémentaires */}
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
            </label>
            
            <Link 
              href="/forgot-password" 
              className="text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={isLoading}
            onClick={handleLogin}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connexion en cours...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                Se connecter
              </div>
            )}
          </button>
        </div>

        {/* Séparateur */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">ou</span>
          </div>
        </div>

        {/* Lien vers l'inscription */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vous n'avez pas encore de compte ?</p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
          >
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}