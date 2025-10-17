'use client';
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, 
  User, 
  Building, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  LogIn,
  BookOpen,
  School,
  Settings
} from "lucide-react";

interface FormData {
  login: string;
  password: string;
}

type UserRole = "Etudiant" | "Enseignant" | "ChefDepartement" | "Admin";

interface FormErrors {
  [key: string]: string;
}

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>("Etudiant");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  
  const [form, setForm] = useState<FormData>({
    login: "",
    password: "",
  });

  const roles = [
    { 
      key: "Etudiant" as UserRole, 
      label: "Étudiant", 
      icon: <GraduationCap className="w-6 h-6" />, 
      description: "Accès à l'espace étudiant",
      dashboardRoute: "/dashboard-etudiant",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    { 
      key: "Enseignant" as UserRole, 
      label: "Enseignant", 
      icon: <User className="w-6 h-6" />, 
      description: "Espace enseignant",
      dashboardRoute: "/dashboard-enseignant",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    { 
      key: "ChefDepartement" as UserRole, 
      label: "Chef de Département", 
      icon: <Settings className="w-6 h-6" />, 
      description: "Gestion du département",
      dashboardRoute: "/dashboard-chef-departement",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    },
    { 
      key: "Admin" as UserRole, 
      label: "Administration", 
      icon: <Building className="w-6 h-6" />, 
      description: "Panel d'administration",
      dashboardRoute: "/dashboard-admin",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
  ];

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'login':
        if (!value) return "L'identifiant est requis";
        return value.length < 3 ? "Au moins 3 caractères requis" : "";
      case 'password':
        if (!value) return "Le mot de passe est requis";
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
      // URL absolue pour éviter les problèmes de routing
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          login: form.login,
          password: form.password,
          role: role
        })
      });

      // Vérifier d'abord le type de contenu
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        // Si ce n'est pas du JSON, c'est probablement une erreur HTML
        const text = await response.text();
        console.error('Réponse non-JSON:', text.substring(0, 200));
        throw new Error('Erreur serveur - réponse inattendue');
      }
      
      // Maintenant parser le JSON
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `Erreur ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || 'Échec de la connexion');
      }
      
      // Stockage des informations d'authentification
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', data.user.role);
        localStorage.setItem('userLogin', data.user.identifiant);
        localStorage.setItem('userData', JSON.stringify(data.user));
      }
      
      // Redirection vers le dashboard approprié selon le rôle
      let redirectRoute = "";
      
      switch (data.user.role) {
        case "Etudiant":
          redirectRoute = "/dashboard-etudiant";
          break;
        case "Enseignant":
          redirectRoute = "/dashboard-enseignant";
          break;
        case "ChefDepartement":
          redirectRoute = "/dashboard-chef-departement";
          break;
        case "Admin":
          redirectRoute = "/dashboard-admin";
          break;
        default:
          redirectRoute = "/dashboard-etudiant";
      }
      
      console.log(`✅ Connexion ${data.user.role} réussie! Redirection vers ${redirectRoute}`);
      
      // Utiliser window.location.href pour une redirection complète avec rechargement
      // Cela garantit que les cookies sont bien pris en compte
      window.location.href = redirectRoute;
      
    } catch (error) {
      console.error('Erreur de connexion détaillée:', error);
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

  const getRoleConfig = (roleKey: UserRole) => {
    return roles.find(r => r.key === roleKey) || roles[0];
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 px-4 py-8">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-2xl border border-gray-100">
        
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <School className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            EduManager
          </h1>
          <p className="text-gray-600 text-lg">Plateforme de gestion scolaire</p>
        </div>

        {/* Message d'erreur général */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 animate-pulse">
            <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 font-medium">{errors.general}</p>
          </div>
        )}

        {/* Sélection du rôle */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-600" />
            Sélectionnez votre profil
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`cursor-pointer border-2 rounded-2xl p-5 text-center transition-all duration-300 transform hover:scale-105 ${
                  role === r.key
                    ? `border-transparent bg-gradient-to-r ${r.color} text-white shadow-xl scale-105`
                    : `border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-md`
                }`}
              >
                <div className={`flex justify-center mb-3 ${role === r.key ? 'text-white' : 'text-gray-600'}`}>
                  {r.icon}
                </div>
                <h4 className="font-semibold text-base mb-1">{r.label}</h4>
                <p className={`text-xs ${role === r.key ? 'text-blue-100' : 'text-gray-500'}`}>
                  {r.description}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire de connexion */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Champ Identifiant */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" />
              Identifiant *
            </label>
            <div className="relative">
              <input
                type="text"
                name="login"
                value={form.login}
                onChange={handleChange}
                className={`w-full px-4 py-4 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 ${
                  getFieldStatus('login') === 'error' 
                    ? 'border-red-300 bg-red-50 ring-2 ring-red-200' 
                    : getFieldStatus('login') === 'success' 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-gray-50 focus:border-blue-500'
                }`}
                placeholder="Votre identifiant ou email"
                required
                disabled={isLoading}
              />
              {getFieldStatus('login') === 'success' && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
              {getFieldStatus('login') === 'error' && (
                <XCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-red-500" />
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
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full px-4 py-4 pr-12 border-2 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:outline-none transition-all duration-200 ${
                  getFieldStatus('password') === 'error' 
                    ? 'border-red-300 bg-red-50 ring-2 ring-red-200' 
                    : getFieldStatus('password') === 'success' 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-200 bg-gray-50 focus:border-blue-500'
                }`}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors p-1"
                disabled={isLoading}
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
                disabled={isLoading}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              <span className="ml-2 text-sm text-gray-600">Se souvenir de moi</span>
            </label>
            
            <Link 
              href="/forgot-password" 
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r ${getRoleConfig(role).color} text-white py-4 rounded-xl font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Connexion en cours...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <LogIn className="w-5 h-5" />
                Se connecter en tant que {getRoleConfig(role).label}
              </div>
            )}
          </button>
        </form>

        {/* Séparateur */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">Première connexion ?</span>
          </div>
        </div>

        {/* Lien vers l'inscription */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vous n'avez pas encore de compte ?</p>
          <Link 
            href="/register" 
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-200 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
          >
            Créer un compte
            <GraduationCap className="w-4 h-4" />
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            © 2024 EduManager. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  );
}