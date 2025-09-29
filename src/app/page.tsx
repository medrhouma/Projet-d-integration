'use client';
import { useState, useEffect } from 'react';
import { ChevronDown, User, BookOpen, Building, Zap, Cpu, Wrench, Search, Menu, X, Calendar, Clock, MapPin, ArrowRight, Star, GraduationCap, Users, Award, BookMarked } from 'lucide-react';
import Link from "next/link";
export default function Homepage() {
  const [showDepartments, setShowDepartments] = useState(false);
  const [showExtranet, setShowExtranet] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNews, setActiveNews] = useState(0);

  // Effet pour le scroll de la navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Carousel automatique pour les actualités
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNews((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const departments = [
    { 
      name: 'Informatique', 
      icon: <Cpu className="w-5 h-5" />, 
      color: 'bg-gradient-to-br from-purple-500 to-blue-500',
      students: '450+ étudiants',
      programs: ['IA & Data Science', 'Développement Web', 'Cybersécurité', 'Cloud Computing'],
      stats: { success: '95%', internships: '120+', labs: '8' }
    },
    { 
      name: 'Génie Civil', 
      icon: <Building className="w-5 h-5" />, 
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      students: '320+ étudiants',
      programs: ['Construction Durable', 'Géotechnique', 'Infrastructures', 'BTP'],
      stats: { success: '92%', internships: '80+', labs: '6' }
    },
    { 
      name: 'Génie Mécanique', 
      icon: <Wrench className="w-5 h-5" />, 
      color: 'bg-gradient-to-br from-red-500 to-pink-500',
      students: '280+ étudiants', 
      programs: ['Robotique', 'Thermodynamique', 'Mécatronique', 'Production'],
      stats: { success: '94%', internships: '90+', labs: '7' }
    },
    { 
      name: 'Génie Électrique', 
      icon: <Zap className="w-5 h-5" />, 
      color: 'bg-gradient-to-br from-yellow-500 to-amber-500',
      students: '350+ étudiants',
      programs: ['Énergies Renouvelables', 'Automatisme', 'Électronique', 'Réseaux'],
      stats: { success: '93%', internships: '100+', labs: '5' }
    }
  ];

  const news = [
    {
      title: "Nouvelle formation en Intelligence Artificielle",
      date: "25 Sept 2025",
      category: "Informatique",
      description: "Lancement du nouveau programme de master en IA et apprentissage automatique avec partenariats industriels.",
      image: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400",
      readTime: "3 min",
      tags: ["IA", "Master", "Innovation"]
    },
    {
      title: "Projet de construction du nouveau laboratoire",
      date: "20 Sept 2025", 
      category: "Génie Civil",
      description: "Début des travaux pour le laboratoire de matériaux avancés d'une superficie de 2000m².",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400",
      readTime: "2 min",
      tags: ["Laboratoire", "Construction", "Recherche"]
    },
    {
      title: "Partenariat avec l'industrie automobile",
      date: "15 Sept 2025",
      category: "Génie Mécanique", 
      description: "Signature d'un accord de collaboration pour la recherche en mobilité durable et véhicules électriques.",
      image: "https://images.unsplash.com/photo-1486266526122-6c2bd6470534?w=400",
      readTime: "4 min",
      tags: ["Partenariat", "Automobile", "Durable"]
    },
    {
      title: "Installation de panneaux solaires sur le campus",
      date: "10 Sept 2025",
      category: "Génie Électrique",
      description: "Mise en place d'un système photovoltaïque de 500 kW pour une autonomie énergétique partielle.",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400",
      readTime: "3 min",
      tags: ["Énergie", "Écologie", "Campus"]
    }
  ];

  const stats = [
    { icon: <Users className="w-8 h-8" />, value: "5000+", label: "Étudiants" },
    { icon: <GraduationCap className="w-8 h-8" />, value: "200+", label: "Enseignants" },
    { icon: <Award className="w-8 h-8" />, value: "95%", label: "Réussite" },
    { icon: <BookMarked className="w-8 h-8" />, value: "50+", label: "Programmes" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar améliorée */}
      <nav className={`bg-white sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'shadow-xl py-2' : 'shadow-lg py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ISET Tozeur
                </span>
                <p className="text-xs text-gray-500">Excellence depuis 1995</p>
              </div>
            </div>

            {/* Navigation desktop */}
            <div className="hidden lg:flex items-center space-x-1 bg-gray-50 rounded-2xl px-4 py-2">
              
              <button className="flex items-center space-x-2 px-6 py-3 text-gray-700 hover:text-purple-600 hover:bg-white rounded-xl transition-all duration-300 font-medium group">
                <BookOpen className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Nouveautés</span>
              </button>

              <div className="w-px h-8 bg-gray-300"></div>

              {/* Mega Menu Départements */}
              <div 
                className="relative"
                onMouseEnter={() => setShowDepartments(true)}
                onMouseLeave={() => setShowDepartments(false)}
              >
                <button className="flex items-center space-x-2 px-6 py-3 text-gray-700 hover:text-purple-600 hover:bg-white rounded-xl transition-all duration-300 font-medium group">
                  <Building className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Départements</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showDepartments ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 transition-all duration-300 ${
                  showDepartments ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'
                }`}>
                  <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-[800px] backdrop-blur-sm">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">Nos Départements d'Excellence</h3>
                    <div className="grid grid-cols-2 gap-6">
                      {departments.map((dept, index) => (
                        <div key={index} className="group/card bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer border border-gray-200 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-pink-50 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className="relative z-10">
                            <div className={`w-16 h-16 ${dept.color} rounded-2xl flex items-center justify-center mb-4 group-hover/card:scale-110 transition-transform duration-300 shadow-lg`}>
                              {dept.icon}
                            </div>
                            
                            <h3 className="text-xl font-bold text-gray-800 mb-3">{dept.name}</h3>
                            
                            <div className="space-y-2 mb-4">
                              {dept.programs.slice(0, 2).map((program, i) => (
                                <span key={i} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full mr-1">
                                  {program}
                                </span>
                              ))}
                            </div>
                            
                            <div className="flex justify-between items-center text-sm text-gray-600">
                              <span>👨‍🎓 {dept.students}</span>
                              <span>🏆 {dept.stats.success} réussite</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                      <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold hover:scale-105">
                        Voir tous les programmes
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-px h-8 bg-gray-300"></div>

              {/* Extranet            / */}
              <div 
                className="relative"
                onMouseEnter={() => setShowExtranet(true)}
                onMouseLeave={() => setShowExtranet(false)}
              >
                <button className="flex items-center space-x-2 px-6 py-3 text-gray-700 hover:text-purple-600 hover:bg-white rounded-xl transition-all duration-300 font-medium group">
                  <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Espace Extranet</span>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showExtranet ? 'rotate-180' : ''}`} />
                </button>
                
                <div className={`absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 py-6 transition-all duration-300 ${
                  showExtranet ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'
                }`}>
                  <div className="space-y-4 px-6">
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800">Accès Extranet</h3>
                      <p className="text-sm text-gray-600">Connectez-vous à votre espace</p>
                    </div>
                    
                   <button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-3 rounded-xl hover:shadow-lg transition-all duration-300 font-semibold">
  <Link href="/login">Se connecter</Link>
</button>

<div className="text-center text-sm text-gray-500">ou</div>

<button className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition-all duration-300 font-semibold">
  <Link href="/register">Créer un compte</Link>
</button>
                  </div>
                </div>
              </div>

              {/* Barre de recherche */}
              <div className="relative ml-4">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent w-64"
                />
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Menu mobile */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-white border-t border-gray-200 mt-4 py-4 rounded-lg shadow-lg">
              <div className="space-y-2 px-4">
                <button className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors">
                  <BookOpen className="w-5 h-5" />
                  <span>Nouveautés</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors">
                  <Building className="w-5 h-5" />
                  <span>Départements</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-4 py-3 text-gray-700 hover:bg-purple-50 rounded-xl transition-colors">
                  <User className="w-5 h-5" />
                  <span>Espace Extranet</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section améliorée */}
      <section className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 text-white py-24 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">Classée parmi les meilleures institutions</span>
          </div>
          
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Institut Supérieur des<br />
            <span className="bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
              Études Technologiques
            </span>
          </h1>
          
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-90 leading-relaxed">
            Formez-vous aux métiers de demain dans un environnement d'excellence. 
            Rejoignez une communauté de 5000+ étudiants et 200+ enseignants-chercheurs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>Découvrir nos programmes</span>
            </button>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Candidater maintenant</span>
            </button>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 inline-flex items-center justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Départements améliorée */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Nos Départements d'Excellence</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Quatre départements spécialisés pour former les ingénieurs de demain
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {departments.map((dept, index) => (
              <div key={index} className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-200 hover:border-purple-300 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${dept.color.replace('bg-gradient-to-br', 'bg-gradient-to-r')}`}></div>
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 ${dept.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    {dept.icon}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-800 mb-4">{dept.name}</h3>
                  
                  <div className="space-y-3 mb-6">
                    {dept.programs.map((program, i) => (
                      <div key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span>{program}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                      {dept.students}
                    </span>
                    <button className="text-purple-600 hover:text-purple-700 font-semibold flex items-center space-x-1">
                      <span>En savoir plus</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Actualités avec carousel */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Actualités & Événements</h2>
            <p className="text-lg text-gray-600">Restez informé des dernières nouveautés de l'institut</p>
          </div>

          {/* Carousel */}
          <div className="relative bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="relative h-96">
              {news.map((item, index) => (
                <div key={index} className={`absolute inset-0 transition-opacity duration-500 ${
                  index === activeNews ? 'opacity-100' : 'opacity-0'
                }`}>
                  <div className="grid md:grid-cols-2 h-full">
                    <div className="relative">
                      <img 
                        src={item.image} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
                    </div>
                    
                    <div className="p-8 flex flex-col justify-center">
                      <div className="flex items-center space-x-4 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {item.category}
                        </span>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500">
                          <Clock className="w-4 h-4" />
                          <span>{item.readTime}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">{item.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {item.tags.map((tag, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300">
                          Lire l'article
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Contrôles du carousel */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {news.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveNews(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === activeNews ? 'bg-purple-600 scale-125' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Événements à venir */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Événements à Venir</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 text-center mb-4">
                  <div className="text-2xl font-bold">2{item} Oct</div>
                  <div className="text-sm">2025</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Journée Portes Ouvertes</h3>
                <p className="text-gray-600 text-sm mb-4">Découvrez nos formations et rencontrez nos enseignants</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>Campus Principal</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer amélioré */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold">ISET Tozeur</span>
                  <p className="text-xs text-gray-400">Excellence Technologique</p>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Institut Supérieur des Études Technologiques de Tozeur - 
                Formations d'excellence en ingénierie depuis 1995.
              </p>
              <div className="flex space-x-3">
                {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                  <button key={social} className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-purple-600 transition-colors">
                    <span className="text-xs font-semibold">{social[0]}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {[
              {
                title: "Formation",
                links: ["Programmes", "Admissions", "Bourses", "Calendrier"]
              },
              {
                title: "Recherche",
                links: ["Laboratoires", "Publications", "Partenariats", "Projets"]
              },
              {
                title: "Contact",
                links: ["Campus Principal", "+216 76 123 456", "contact@iset-tozeur.tn", "Plan d'accès"]
              }
            ].map((column, index) => (
              <div key={index}>
                <h4 className="font-semibold text-lg mb-6">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link, i) => (
                    <li key={i}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 ISET Tozeur. Tous droits réservés. | 
              <a href="#" className="hover:text-white transition-colors ml-2">Mentions légales</a> | 
              <a href="#" className="hover:text-white transition-colors ml-2">Politique de confidentialité</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}