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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 px-4 py-8 relative overflow-hidden">
      {/* Fond animé avec particules */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Grille de fond */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]"></div>

      <div className="relative bg-white/95 backdrop-blur-xl p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-2xl border border-white/20 animate-fade-in-up">
        
        {/* En-tête avec logo amélioré */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl shadow-xl transform hover:scale-110 transition-transform duration-300">
              <School className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent mb-2 animate-fade-in">
            ISET Tozeur
          </h1>
          <p className="text-gray-600 text-base md:text-lg font-medium">Connexion à votre espace personnel</p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Système sécurisé</span>
          </div>
        </div>

        {/* Message d'erreur général */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center gap-3 shadow-md animate-shake">
            <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-red-800 font-semibold text-sm">Erreur de connexion</p>
              <p className="text-red-700 text-xs mt-0.5">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Sélection du rôle avec design moderne */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              Choisissez votre profil
            </h3>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {roles.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`group relative cursor-pointer border-2 rounded-2xl p-4 text-center transition-all duration-300 transform hover:-translate-y-1 ${
                  role === r.key
                    ? `border-transparent bg-gradient-to-br ${r.color} text-white shadow-2xl scale-105`
                    : `border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:shadow-lg`
                }`}
              >
                {/* Effet de brillance */}
                {role === r.key && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
                
                <div className={`flex justify-center mb-2 transform transition-transform duration-300 ${role === r.key ? 'scale-110 text-white' : 'text-gray-600 group-hover:scale-110'}`}>
                  {r.icon}
                </div>
                <h4 className="font-bold text-sm mb-1 line-clamp-1">{r.label}</h4>
                <p className={`text-xs line-clamp-2 ${role === r.key ? 'text-white/90' : 'text-gray-500'}`}>
                  {r.description}
                </p>
                
                {/* Indicateur de sélection */}
                {role === r.key && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire de connexion avec design amélioré */}
        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Champ Identifiant avec icône et validation */}
          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              Identifiant
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className={`w-5 h-5 transition-colors ${
                  getFieldStatus('login') === 'error' ? 'text-red-400' :
                  getFieldStatus('login') === 'success' ? 'text-green-400' :
                  'text-gray-400 group-hover:text-purple-500'
                }`} />
              </div>
              <input
                type="text"
                name="login"
                value={form.login}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl font-medium focus:ring-4 focus:outline-none transition-all duration-300 ${
                  getFieldStatus('login') === 'error' 
                    ? 'border-red-400 bg-red-50 ring-4 ring-red-100 text-red-900 placeholder-red-400' 
                    : getFieldStatus('login') === 'success' 
                    ? 'border-green-400 bg-green-50 ring-4 ring-green-100 text-green-900' 
                    : 'border-gray-300 bg-gray-50 focus:border-purple-500 focus:ring-purple-100 hover:border-gray-400'
                }`}
                placeholder="Email ou nom d'utilisateur"
                required
                disabled={isLoading}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                {getFieldStatus('login') === 'success' && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                {getFieldStatus('login') === 'error' && (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-shake">
                    <XCircle className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            </div>
            {errors.login && (
              <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-400 rounded-r-lg animate-slide-in-left">
                <p className="text-red-700 text-xs font-semibold flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.login}
                </p>
              </div>
            )}
          </div>

          {/* Champ Mot de passe avec toggle et validation */}
          <div className="group">
            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
              <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md flex items-center justify-center">
                <BookOpen className="w-3 h-3 text-white" />
              </div>
              Mot de passe
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <BookOpen className={`w-5 h-5 transition-colors ${
                  getFieldStatus('password') === 'error' ? 'text-red-400' :
                  getFieldStatus('password') === 'success' ? 'text-green-400' :
                  'text-gray-400 group-hover:text-purple-500'
                }`} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-4 border-2 rounded-xl font-medium focus:ring-4 focus:outline-none transition-all duration-300 ${
                  getFieldStatus('password') === 'error' 
                    ? 'border-red-400 bg-red-50 ring-4 ring-red-100 text-red-900 placeholder-red-400' 
                    : getFieldStatus('password') === 'success' 
                    ? 'border-green-400 bg-green-50 ring-4 ring-green-100 text-green-900' 
                    : 'border-gray-300 bg-gray-50 focus:border-purple-500 focus:ring-purple-100 hover:border-gray-400'
                }`}
                placeholder="••••••••••"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-purple-600 transition-colors group"
                disabled={isLoading}
              >
                <div className="p-1 rounded-lg hover:bg-purple-100 transition-colors">
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </div>
              </button>
            </div>
            {errors.password && (
              <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-400 rounded-r-lg animate-slide-in-left">
                <p className="text-red-700 text-xs font-semibold flex items-center gap-1">
                  <XCircle className="w-3 h-3" />
                  {errors.password}
                </p>
              </div>
            )}
          </div>

          {/* Options supplémentaires avec design moderne */}
          <div className="flex items-center justify-between py-2">
            <label className="flex items-center cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
              </div>
              <span className="ml-3 text-sm text-gray-700 font-medium group-hover:text-purple-600 transition-colors">
                Se souvenir de moi
              </span>
            </label>
            
            <Link 
              href="/forgot-password" 
              className="text-sm bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>

          {/* Bouton de connexion avec effet de dégradé animé */}
          <button
            type="submit"
            disabled={isLoading}
            className={`relative w-full bg-gradient-to-r ${getRoleConfig(role).color} text-white py-4 rounded-xl font-bold text-base hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] shadow-lg overflow-hidden group`}
          >
            {/* Effet de brillance au survol */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            
            {isLoading ? (
              <div className="flex items-center justify-center gap-3 relative z-10">
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="font-semibold">Connexion en cours...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 relative z-10">
                <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                <span>Se connecter en tant que {getRoleConfig(role).label}</span>
              </div>
            )}
          </button>
        </form>

        {/* Informations de sécurité */}
        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm text-gray-800 mb-1">Connexion sécurisée</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Vos données sont protégées par un chiffrement SSL/TLS. Ne partagez jamais vos identifiants.
              </p>
            </div>
          </div>
        </div>

        {/* Footer amélioré */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-purple-600 transition-colors font-medium">
                Politique de confidentialité
              </Link>
              <span className="text-gray-300">•</span>
              <Link href="/terms" className="hover:text-purple-600 transition-colors font-medium">
                Conditions d'utilisation
              </Link>
            </div>
            <p className="text-xs text-gray-500 text-center">
              © 2025 ISET Tozeur. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-gray-500">Version 2.0.1</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}