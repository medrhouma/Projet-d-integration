'use client';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, User, BookOpen, Building, Zap, Cpu, Wrench, Search, Menu, X, Calendar, Clock, MapPin, ArrowRight, Star, GraduationCap, Users, Award, BookMarked, Mail, Phone, Send, Quote, ChevronLeft, ChevronRight, TrendingUp, Target, Lightbulb } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";

export default function Homepage() {
  const [showDepartments, setShowDepartments] = useState(false);
  const [showExtranet, setShowExtranet] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeNews, setActiveNews] = useState(0);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [email, setEmail] = useState('');
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  // Effet pour le scroll de la navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      
      // Animation des stats au scroll
      if (statsRef.current) {
        const rect = statsRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        if (isVisible && !statsVisible) {
          setStatsVisible(true);
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [statsVisible]);

  // Carousel automatique pour les actualités
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveNews((prev) => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Carousel automatique pour les témoignages
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const departments = [
   {   
    name: 'Informatique', 
    icon: <Cpu className="w-5 h-5" />, 
    color: 'bg-gradient-to-br from-purple-500 to-blue-500',
    students: '450+ étudiants',
    programs: ['IA & Data Science', 'Développement Web', 'Cybersécurité', 'Cloud Computing'],
    stats: { success: '95%', internships: '120+', labs: '8' },
    link: '/Depinfo',
    image: 'informatique.jpg'
  },

   
    { 
      name: 'Génie Civil', 
      icon: <Building className="w-5 h-5" />, 
      color: 'bg-gradient-to-br from-orange-500 to-red-500',
      students: '320+ étudiants',
      programs: ['Construction Durable', 'Géotechnique', 'Infrastructures', 'BTP'],
      stats: { success: '92%', internships: '80+', labs: '6' },
      link: '/Depcivil',
      image: 'genie-civil.jpg'
    
    },
    { 
      name: 'Génie Mécanique', 
      icon: <Wrench className="w-5 h-5" />, 
      color: 'bg-gradient-to-br from-red-500 to-pink-500',
      students: '280+ étudiants', 
      programs: ['Robotique', 'Thermodynamique', 'Mécatronique', 'Production'],
      stats: { success: '94%', internships: '90+', labs: '7' },
      link: '/Depmecanique',
      image: 'genie-mecanique.jpg'
    },
    { 
      name: 'Génie Électrique', 
      icon: <Zap className="w-5 h-5" />, 
      color: 'bg-gradient-to-br from-yellow-500 to-amber-500',
      students: '350+ étudiants',
      programs: ['Énergies Renouvelables', 'Automatisme', 'Électronique', 'Réseaux'],
      stats: { success: '93%', internships: '100+', labs: '5' },
      link: '/Depelectrique',
      image: 'genie-electrique.jpg'
    }
  ];

const news = [
  {
    title: "Journée Portes Ouvertes 2025",
    description:
      "L’ISET Tozeur organise une journée portes ouvertes pour accueillir les nouveaux étudiants et présenter les clubs, formations et projets innovants.",
    date: "12 octobre 2025",
    readTime: "3 min de lecture",
    category: "Événement",
    image: "/images/iset-event1.jpg",
    tags: ["ISET Tozeur", "portes ouvertes", "étudiants"]
  },
  {
    title: "Séminaire sur la Transformation Digitale",
    description:
      "Les enseignants et étudiants du département Informatique ont assisté à un séminaire animé par des experts sur la transformation numérique dans les institutions éducatives.",
    date: "20 septembre 2025",
    readTime: "4 min de lecture",
    category: "Actualité",
    image: "/images/iset-digital.jpg",
    tags: ["informatique", "séminaire", "transformation digitale"]
  },
  {
    title: "Compétition Nationale de Robotique",
    description:
      "L’équipe de l’ISET Tozeur a remporté la 2e place à la compétition nationale de robotique, démontrant le savoir-faire et la créativité de nos étudiants.",
    date: "5 septembre 2025",
    readTime: "2 min de lecture",
    category: "Événement",
    image: "/images/iset-robotique.jpg",
    tags: ["robotique", "compétition", "innovation"]
  },

  {
  title: "Journées de sensibilisation en cybersécurité",
  description:
    "L’ISET Tozeur, en partenariat avec le Centre 4C, a organisé deux journées de sensibilisation à la cybersécurité afin d’initier les étudiants aux bonnes pratiques numériques et à la sécurité des données.",
  date: "13-14 octobre 2024",
  readTime: "3 min de lecture",
  category: "Événement",
  image: "/images/cybersecurite-iset-tozeur.jpg",
  tags: ["cybersécurité", "formation", "numérique", "4C"]
},

{
  title: "Séminaire sur les énergies renouvelables et développement durable",
  description:
    "L’ISET Tozeur, en collaboration avec le Centre d’Affaires de Tozeur, a organisé un séminaire pour sensibiliser étudiants et professionnels aux enjeux de l’économie circulaire et des énergies propres. :contentReference[oaicite:1]{index=1}",
  date: "9 mai 2023",
  readTime: "3 min de lecture",
  category: "Événement",
  image: "/images/energies-renouvelables.jpg",
  tags: ["énergie", "durabilité", "environnement"]
},
{
  title: "Projet « Tozeur Oasis des sciences et technologies » (TOST)",
  description:
    "Lancé par l’association Youth Vision avec le soutien de l’Union européenne et de l’ANPR, ce projet vise à vulgariser la science et la technologie dans les écoles et les clubs de jeunesse de Tozeur, notamment par la création de clubs de robotique. :contentReference[oaicite:1]{index=1}",
  date: "2 juin 2025",
  readTime: "3 min de lecture",
  category: "Actualité",
  image: "/images/tostoasis-sciences-technologies.jpg",
  tags: ["science", "jeunesse", "robotique", "éducation"]
}


];

  // Témoignages d'étudiants
  const testimonials = [
    {
      name: "Ahmed Ben Salem",
      role: "Étudiant en Informatique - Promotion 2024",
      image: "/images/student1.jpg",
      text: "L'ISET Tozeur m'a offert une formation de qualité avec des enseignants compétents. Aujourd'hui, je travaille comme développeur full-stack dans une entreprise internationale.",
      rating: 5
    },
    {
      name: "Fatma Jebali",
      role: "Étudiante en Génie Civil - Promotion 2023",
      image: "/images/student2.jpg",
      text: "Les projets pratiques et les stages m'ont permis d'acquérir une expérience précieuse. Je recommande vivement l'ISET Tozeur pour sa qualité d'enseignement.",
      rating: 5
    },
    {
      name: "Mohamed Trabelsi",
      role: "Étudiant en Génie Électrique - Promotion 2025",
      image: "/images/student3.jpg",
      text: "L'environnement d'apprentissage est exceptionnel. Les laboratoires sont bien équipés et les enseignants sont toujours disponibles pour nous aider.",
      rating: 5
    }
  ];

  // Galerie de photos
  const galleryImages = [
    { src: "/images/campus1.jpg", title: "Campus moderne" },
    { src: "/images/lab1.jpg", title: "Laboratoires équipés" },
    { src: "/images/library1.jpg", title: "Bibliothèque numérique" },
    { src: "/images/event1.jpg", title: "Événements étudiants" },
    { src: "/images/sport1.jpg", title: "Installations sportives" },
    { src: "/images/cafeteria1.jpg", title: "Espaces de détente" }
  ];



  const stats = [
    { icon: <Users className="w-8 h-8" />, value: 5000, label: "Étudiants", suffix: "+" },
    { icon: <GraduationCap className="w-8 h-8" />, value: 200, label: "Enseignants", suffix: "+" },
    { icon: <Award className="w-8 h-8" />, value: 95, label: "Réussite", suffix: "%" },
    { icon: <BookMarked className="w-8 h-8" />, value: 50, label: "Programmes", suffix: "+" }
  ];

  // Animation des chiffres
  const AnimatedNumber = ({ value, suffix }: { value: number; suffix: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (statsVisible) {
        let start = 0;
        const end = value;
        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
          start += increment;
          if (start >= end) {
            setCount(end);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);

        return () => clearInterval(timer);
      }
    }, [statsVisible, value]);

    return <>{count}{suffix}</>;
  };

  // Fonction pour gérer la soumission de la newsletter
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logique d'inscription à la newsletter
    alert(`Merci de vous être inscrit avec l'email: ${email}`);
    setEmail('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Barre d'annonce en haut */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 px-4 text-center text-sm font-medium">
        <span className="inline-flex items-center space-x-2">
          <Star className="w-4 h-4 animate-pulse" />
          <span>🎓 Inscriptions ouvertes pour l'année académique 2025-2026 - Candidatez maintenant !</span>
          <Star className="w-4 h-4 animate-pulse" />
        </span>
      </div>

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
              
              <button
  onClick={() => {
    const section = document.getElementById('news-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  }}
  className="flex items-center space-x-2 px-6 py-3 text-gray-700 hover:text-purple-600 hover:bg-white rounded-xl transition-all duration-300 font-medium group"
>
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
    <Link key={index} href={dept.link}>
      <div className="group cursor-pointer overflow-hidden rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300 relative">
        <Image
          src={`/images/${dept.image}`}
          alt={dept.name}
          width={400}
          height={192}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-25 transition-opacity duration-300 rounded-2xl"></div>
        <div className="absolute bottom-4 left-4 text-white font-bold text-lg shadow-lg">
          {dept.name}
        </div>
      </div>
    </Link>
  ))}
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
        {/* Fond animé avec particules */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6 animate-fade-in-down">
            <Star className="w-4 h-4" />
            <span className="text-sm font-medium">Classée parmi les meilleures institutions</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight animate-fade-in-up">
            Institut Supérieur des<br />
            <span className="bg-gradient-to-r from-yellow-300 to-amber-300 bg-clip-text text-transparent">
              Études Technologiques
            </span>
          </h1>
          
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto opacity-90 leading-relaxed animate-fade-in">
            Formez-vous aux métiers de demain dans un environnement d'excellence. 
            Rejoignez une communauté de 5000+ étudiants et 200+ enseignants-chercheurs.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-500">
            <button className="group bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2">
              <GraduationCap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Découvrir nos programmes</span>
            </button>
            <button className="group border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-purple-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
              <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Candidater maintenant</span>
            </button>
          </div>

          {/* Statistiques animées */}
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="text-center transform hover:scale-110 transition-transform duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 inline-flex items-center justify-center mb-2 hover:bg-white/30 transition-colors">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vague de séparation */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Section Départements améliorée avec effets parallax */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4">
              <Target className="w-4 h-4" />
              <span className="text-sm font-semibold">Nos Spécialités</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Nos Départements d'Excellence</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Quatre départements spécialisés pour former les ingénieurs et techniciens de demain
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {departments.map((dept, index) => (
              <Link key={index} href={dept.link}>
                <div className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-200 hover:border-purple-300 relative overflow-hidden transform hover:-translate-y-2">
                  {/* Effet de brillance au survol */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
                  
                  <div className={`absolute top-0 left-0 w-full h-1 ${dept.color.replace('bg-gradient-to-br', 'bg-gradient-to-r')}`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 ${dept.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                      <div className="text-white">{dept.icon}</div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-purple-600 transition-colors">{dept.name}</h3>
                    
                    <div className="space-y-3 mb-6">
                      {dept.programs.slice(0, 3).map((program, i) => (
                        <div key={i} className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-2 h-2 bg-purple-500 rounded-full group-hover:animate-pulse"></div>
                          <span>{program}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center text-sm pt-4 border-t border-gray-200">
                      <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                        {dept.students}
                      </span>
                      
                      <button className="text-purple-600 hover:text-purple-700 font-semibold flex items-center space-x-1 group-hover:translate-x-1 transition-transform">
                        <span>Explorer</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Section Pourquoi nous choisir */}
          <div className="mt-20 bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-12">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">Pourquoi choisir l'ISET Tozeur ?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <TrendingUp className="w-8 h-8" />,
                  title: "Taux de réussite élevé",
                  description: "95% de nos étudiants réussissent leurs examens grâce à un encadrement de qualité"
                },
                {
                  icon: <Target className="w-8 h-8" />,
                  title: "Insertion professionnelle",
                  description: "85% de nos diplômés trouvent un emploi dans les 6 mois suivant l'obtention de leur diplôme"
                },
                {
                  icon: <Lightbulb className="w-8 h-8" />,
                  title: "Innovation & Recherche",
                  description: "Des projets innovants et des partenariats avec l'industrie pour une formation pratique"
                }
              ].map((item, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    {item.icon}
                  </div>
                  <h4 className="text-xl font-bold text-gray-800 mb-2">{item.title}</h4>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Actualités avec carousel amélioré */}
      <section id="news-section" className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-4">
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-semibold">Actualités</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Actualités & Événements</h2>
            <p className="text-lg text-gray-600">Restez informé des dernières nouveautés de l'institut</p>
          </div>

          {/* Carousel avec contrôles améliorés */}
          <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative h-auto md:h-96">
              {news.map((item, index) => (
                <div key={index} className={`transition-opacity duration-700 ${
                  index === activeNews ? 'opacity-100' : 'opacity-0 absolute inset-0'
                }`}>
                  <div className="grid md:grid-cols-2 h-full">
                    <div className="relative h-64 md:h-full">
                      <Image 
                        src={item.image} 
                        alt={item.title}
                        width={800}
                        height={600}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
                    </div>
                    
                    <div className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {item.category}
                        </span>
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <Calendar className="w-4 h-4" />
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-500 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>{item.readTime}</span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">{item.title}</h3>
                      <p className="text-gray-600 mb-6 leading-relaxed">{item.description}</p>
                      
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex flex-wrap gap-2">
                          {item.tags.map((tag, i) => (
                            <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        <Link href="/lirearticle">
                          <button className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
                            <span>Lire l'article</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Boutons de navigation */}
            <button 
              onClick={() => setActiveNews((prev) => (prev - 1 + news.length) % news.length)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 z-10"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button 
              onClick={() => setActiveNews((prev) => (prev + 1) % news.length)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white p-3 rounded-full shadow-lg transition-all duration-300 z-10"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
            
            {/* Indicateurs */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {news.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveNews(index)}
                  className={`transition-all duration-300 ${
                    index === activeNews 
                      ? 'bg-purple-600 w-8 h-3 rounded-full' 
                      : 'bg-gray-300 w-3 h-3 rounded-full hover:bg-gray-400'
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
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 rounded-full px-4 py-2 mb-4">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold">Événements</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Événements à Venir</h2>
            <p className="text-gray-600">Ne manquez pas nos prochains événements</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { date: '21', month: 'Oct', title: 'Journée Portes Ouvertes', desc: 'Découvrez nos formations et rencontrez nos enseignants', location: 'Campus Principal' },
              { date: '28', month: 'Oct', title: 'Séminaire Innovation', desc: 'Les nouvelles technologies dans l\'éducation', location: 'Amphithéâtre A' },
              { date: '05', month: 'Nov', title: 'Forum Entreprises', desc: 'Rencontrez les recruteurs et découvrez les opportunités', location: 'Salle des Conférences' }
            ].map((event, index) => (
              <div key={index} className="group bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-purple-300 transform hover:-translate-y-1">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl p-4 text-center mb-4 group-hover:scale-105 transition-transform">
                  <div className="text-3xl font-bold">{event.date}</div>
                  <div className="text-sm uppercase">{event.month} 2025</div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">{event.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{event.desc}</p>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section Témoignages */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
              <Quote className="w-4 h-4" />
              <span className="text-sm font-semibold">Témoignages</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Ce que disent nos étudiants</h2>
            <p className="text-lg opacity-90">Découvrez l'expérience de nos diplômés</p>
          </div>

          <div className="relative">
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 shadow-2xl">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className={`transition-opacity duration-500 ${
                    index === activeTestimonial ? 'opacity-100' : 'opacity-0 absolute inset-0 p-8 md:p-12'
                  }`}
                >
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex-shrink-0">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-3xl font-bold shadow-xl">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </div>
                    
                    <div className="flex-1 text-center md:text-left">
                      <Quote className="w-12 h-12 mb-4 opacity-50 mx-auto md:mx-0" />
                      <p className="text-xl md:text-2xl mb-6 leading-relaxed">{testimonial.text}</p>
                      
                      <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      
                      <div>
                        <p className="font-bold text-lg">{testimonial.name}</p>
                        <p className="opacity-80">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contrôles navigation */}
            <div className="flex justify-center mt-8 gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`transition-all duration-300 ${
                    index === activeTestimonial 
                      ? 'bg-white w-8 h-3 rounded-full' 
                      : 'bg-white/50 w-3 h-3 rounded-full hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section Newsletter */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
            <Mail className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Restez Informé</h2>
            <p className="text-lg mb-8 opacity-90">
              Inscrivez-vous à notre newsletter pour recevoir les dernières actualités, événements et opportunités
            </p>
            
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse email"
                required
                className="flex-1 px-6 py-4 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button 
                type="submit"
                className="bg-white text-purple-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <span>S'inscrire</span>
                <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
            
            <p className="text-sm mt-4 opacity-75">
              En vous inscrivant, vous acceptez de recevoir nos communications. Désinscription possible à tout moment.
            </p>
          </div>
        </div>
      </section>
            {/* Section Localisation ISET Tozeur */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">Où nous trouver ?</h2>
          <p className="text-lg text-gray-600 mb-10">
            Institut Supérieur des Études Technologiques de Tozeur
          </p>

          <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3254.1181182574674!2d8.130611015248023!3d33.91827008064369!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x13ad14a3f45e4c1f%3A0x2cfe47a4e69d6a77!2sISET%20Tozeur!5e0!3m2!1sfr!2stn!4v1695567890123!5m2!1sfr!2stn"
              width="100%"
              height="500"
              
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
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
    links: [
      "Campus Principal",
      "+216 76 123 456",
      "contact@iset-tozeur.tn",
      <a
        href="https://www.google.com/maps/dir/?api=1&destination=ISET+Tozeur+33.918270,8.130611"
        target="_blank"
        rel="noopener noreferrer"
        className="text-gray-400 hover:text-white transition-colors text-sm"
      >
        Plan d'accès
      </a>
    ]
  }
].map((column, index) => (
  <div key={index}>
    <h4 className="font-semibold text-lg mb-6">{column.title}</h4>
    <ul className="space-y-3">
      {column.links.map((link, i) => (
        <li key={i}>
          {typeof link === "string" ? (
            <span className="text-gray-400 hover:text-white transition-colors text-sm">{link}</span>
          ) : (
            link
          )}
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
