'use client';

import { useState } from 'react';
import { 
  Cpu, Users, GraduationCap, Award, BookOpen, Calendar, Network, Server, Laptop, 
  Briefcase, Mail, Phone, MapPin, Code, Database, Shield, Globe, Rocket, 
  Target, TrendingUp, Star, ChevronRight, ArrowLeft, CheckCircle, Sparkles,
  Brain, Cloud, Wifi, Terminal, Zap, Layout, Layers, User
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';


export default function DepInfoDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const infos = [
    { icon: <Users className="w-8 h-8" />, label: 'Étudiants', value: '450+', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50' },
    { icon: <GraduationCap className="w-8 h-8" />, label: 'Enseignants', value: '21', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50' },
    { icon: <Award className="w-8 h-8" />, label: 'Taux de Réussite', value: '95%', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50' },
    { icon: <BookOpen className="w-8 h-8" />, label: 'Laboratoires', value: '10+', color: 'from-orange-500 to-orange-600', bgColor: 'bg-orange-50' },
  ];

  const specialites = [
    { 
      icon: <Server className="w-10 h-10" />, 
      title: 'DSI', 
      fullName: "Développement des Systèmes d'Information",
      desc: "Formation complète en développement logiciel, bases de données et architecture des SI.",
      color: 'from-blue-500 to-cyan-500',
      skills: ['Java/JEE', 'Python', 'SQL/NoSQL', 'DevOps', 'Cloud Computing']
    },
    { 
      icon: <Network className="w-10 h-10" />, 
      title: 'RSI', 
      fullName: 'Réseaux & Services Informatiques',
      desc: "Expertise en administration réseaux, sécurité et infrastructure informatique.",
      color: 'from-green-500 to-emerald-500',
      skills: ['Cisco', 'Linux', 'Sécurité', 'VoIP', 'Cloud Networks']
    },
    { 
      icon: <Laptop className="w-10 h-10" />, 
      title: 'MDW', 
      fullName: 'Multimédia & Développement Web',
      desc: "Maîtrise du développement web moderne, design UI/UX et technologies multimédia.",
      color: 'from-pink-500 to-rose-500',
      skills: ['React/Angular', 'Node.js', 'UI/UX Design', 'Mobile', '3D Graphics']
    },
  ];


  const projets = [
    {
      title: 'Système de gestion RH',
      desc: 'Application web et mobile complète',
      icon: <Users className="w-6 h-6" />,
      tech: ['React', 'Node.js', 'MongoDB']
    },
    {
      title: 'Cybersécurité IoT',
      desc: 'Solutions de sécurité pour objets connectés',
      icon: <Shield className="w-6 h-6" />,
      tech: ['Python', 'Blockchain', 'ML']
    },
    {
      title: 'Plateforme e-learning IA',
      desc: 'Formation intelligente et adaptive',
      icon: <Brain className="w-6 h-6" />,
      tech: ['AI/ML', 'Vue.js', 'TensorFlow']
    },
  ];

  const technologies = [
    { name: 'Intelligence Artificielle', icon: <Brain className="w-5 h-5" />, level: 90 },
    { name: 'Cloud Computing', icon: <Cloud className="w-5 h-5" />, level: 85 },
    { name: 'Cybersécurité', icon: <Shield className="w-5 h-5" />, level: 88 },
    { name: 'Développement Web', icon: <Globe className="w-5 h-5" />, level: 95 },
    { name: 'Big Data', icon: <Database className="w-5 h-5" />, level: 82 },
    { name: 'IoT & Réseaux', icon: <Wifi className="w-5 h-5" />, level: 87 },
  ];

  const clubs = [
    { name: 'Club Programmation', icon: <Code className="w-5 h-5" />, members: '80+', color: 'bg-blue-500' },
    { name: 'Club Réseaux & Sécurité', icon: <Shield className="w-5 h-5" />, members: '65+', color: 'bg-green-500' },
    { name: 'Club Innovation & Startups', icon: <Rocket className="w-5 h-5" />, members: '45+', color: 'bg-purple-500' },
  ];

  const debouches = [
    "Développeur d’Applications de gestion",
    "Développeur de sites Web",
    "Développeur Multimédia",
    "Développeur de bases de données",
    "Technico-commercial dans la mise en place de solutions logicielles",
    "Webmaster développeur",
    "Webmaster designer",
    "Administrateur de portail web",
    "Intégrateur de technologies web",
    "Administrateur réseaux",
    "Administrateur systèmes",
    "Architecte réseaux et systèmes de communication",
  ];

  const enseignants = [
    "02 maîtres technologues en informatique",
    "01 maître technologue en gestion",
    "09 technologues en informatique",
    "03 assistants technologues en informatique",
    "04 professeurs de l’enseignement supérieur en informatique",
    "03 professeurs de l’enseignement supérieur en mathématiques, français et anglais",
  ];

  const laboratoires = [
    "07 laboratoires d’informatique",
    "01 laboratoire CISCO",
    "01 laboratoire C2i",
    "01 salle de projets",
  ];

  const planEtude = [
    "Licence appliquée en technologies de l’informatique",
    "3 parcours de spécialisation : RSI, MDW et DSI",
  ];

  const organisation = [
    "02 semestres de tronc commun",
    "03 semestres de spécialisation (RSI, MDW et DSI)",
    "01 semestre de stage de fin de parcours",
    "2 stages d’initiation et de perfectionnement durant la 1ère et 2ème année",
  ];

  const manifestations = [
    "Manifestations scientifiques et techniques annuelles",
    "Visites industrielles",
    "Sorties pédagogiques",
    "Participation à des compétitions et événements régionaux et nationaux",

  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      
      {/* Hero Header avec animation */}
      <header className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 text-white py-20 overflow-hidden">
        {/* Fond animé */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-10 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-6">
          {/* Bouton retour */}
          <Link href="/">
            <button className="group mb-6 flex items-center gap-2 bg-white/10 backdrop-blur-md hover:bg-white/20 px-4 py-2 rounded-xl transition-all duration-300 border border-white/20">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Retour à l&apos;accueil</span>
            </button>
          </Link>

          <div className="text-center">
            {/* Logo animé */}
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-white rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
              <div className="relative bg-white/20 backdrop-blur-xl p-6 rounded-3xl border border-white/30 shadow-2xl">
                <Cpu className="w-20 h-20 mx-auto animate-pulse" />
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-4 animate-fade-in-up">
              Département Informatique
            </h1>
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <p className="text-xl md:text-2xl opacity-90 font-medium">
                ISET Tozeur - Excellence Technologique
              </p>
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <p className="text-lg opacity-80 max-w-3xl mx-auto leading-relaxed">
              Formez-vous aux technologies de pointe et devenez les ingénieurs innovants de demain. 
              Notre département vous prépare aux défis du monde numérique.
            </p>

            {/* Badges */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-300 text-yellow-300" />
                <span className="text-sm font-semibold">Top Département</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-semibold">Accrédité</span>
              </div>
              <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-semibold">95% Réussite</span>
              </div>
            </div>
          </div>
        </div>

        {/* Vague de séparation */}
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </header>

      {/* Statistiques améliorées */}
      <section className="relative -mt-16 py-12 max-w-7xl mx-auto px-6 z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {infos.map((info, i) => (
            <div 
              key={i} 
              className="group bg-white rounded-2xl shadow-xl p-6 text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 relative overflow-hidden"
            >
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000"></div>
              
              <div className={`relative inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${info.color} rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                <div className="text-white">{info.icon}</div>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-1">
                {info.value}
              </h3>
              <p className="text-gray-600 font-medium">{info.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Technologies & Compétences */}
      <section className="py-20 bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-4">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-bold">Technologies</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Maîtrise Technologique
            </h2>
            <p className="text-lg text-gray-600">
              Les technologies enseignées dans notre département
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {technologies.map((tech, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white">
                    {tech.icon}
                  </div>
                  <h3 className="font-bold text-gray-800">{tech.name}</h3>
                </div>
                <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                    style={{ width: `${tech.level}%` }}
                  ></div>
                </div>
                <p className="text-right text-sm text-gray-600 mt-2 font-semibold">{tech.level}%</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projets Étudiants */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 rounded-full px-4 py-2 mb-4">
              <Rocket className="w-4 h-4" />
              <span className="text-sm font-bold">Innovation</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Projets Innovants
            </h2>
            <p className="text-lg text-gray-600">
              Découvrez les projets réalisés par nos étudiants
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {projets.map((projet, idx) => (
              <div key={idx} className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {projet.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{projet.title}</h3>
                <p className="text-gray-600 mb-4">{projet.desc}</p>
                <div className="flex flex-wrap gap-2">
                  {projet.tech.map((t, i) => (
                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Clubs & Activités */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 rounded-full px-4 py-2 mb-4">
              <Users className="w-4 h-4" />
              <span className="text-sm font-bold">Vie Étudiante</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Clubs & Activités
            </h2>
            <p className="text-lg text-gray-600">
              Rejoignez nos clubs pour développer vos compétences
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {clubs.map((club, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`w-16 h-16 ${club.color} rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg`}>
                  {club.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">{club.name}</h3>
                <div className="flex items-center gap-2 text-gray-600">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{club.members} membres</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Directeur & Contacts avec design moderne */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-bold">Contact</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Équipe Administrative
            </h2>
            <p className="text-lg text-gray-600">
              Notre équipe est à votre disposition
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Directeur */}
            <div className="group relative bg-gradient-to-br from-purple-500 to-blue-600 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Directeur du Département</h3>
                <p className="text-white/90 text-lg font-semibold mb-6">Soufiene Ben Mahmoud</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <Phone className="w-5 h-5 flex-shrink-0" />
                    <span>76 473 777 - Poste 135</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <Mail className="w-5 h-5 flex-shrink-0" />
                    <span className="break-all">soufiene.mahmoud@laposte.net</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span>Bureau EI01 – Département TI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Secrétaire */}
            <div className="group relative bg-gradient-to-br from-pink-500 to-purple-600 text-white p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 overflow-hidden">
              {/* Effet de brillance */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4">
                  <User className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Secrétaire</h3>
                <p className="text-white/90 text-lg font-semibold mb-6">Samira Bououni</p>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <Phone className="w-5 h-5 flex-shrink-0" />
                    <span>76 473 777 - Poste 132</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                    <MapPin className="w-5 h-5 flex-shrink-0" />
                    <span>Bureau EI06 – Département TI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spécialités avec design premium */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 rounded-full px-4 py-2 mb-4">
              <Target className="w-4 h-4" />
              <span className="text-sm font-bold">Nos Parcours</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Nos Spécialités d&apos;Excellence
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Trois parcours spécialisés pour répondre aux besoins du marché technologique
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {specialites.map((sp, i) => (
              <div 
                key={i} 
                className="group relative bg-gradient-to-br from-white to-gray-50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-transparent overflow-hidden"
              >
                {/* Effet de fond dégradé au survol */}
                <div className={`absolute inset-0 bg-gradient-to-br ${sp.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  {/* Icône */}
                  <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${sp.color} rounded-2xl mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <div className="text-white">{sp.icon}</div>
                  </div>

                  {/* Titre */}
                  <div className="mb-4">
                    <h3 className={`text-3xl font-bold bg-gradient-to-r ${sp.color} bg-clip-text text-transparent mb-2`}>
                      {sp.title}
                    </h3>
                    <p className="text-sm font-semibold text-gray-600">{sp.fullName}</p>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 mb-6 leading-relaxed">{sp.desc}</p>

                  {/* Compétences */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Compétences clés</p>
                    <div className="flex flex-wrap gap-2">
                      {sp.skills.map((skill, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white transition-all duration-300 cursor-default"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bouton En savoir plus */}
                  <button className={`mt-6 w-full bg-gradient-to-r ${sp.color} text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 group`}>
                    <span>En savoir plus</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Débouchés */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 rounded-full px-4 py-2 mb-4">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-bold">Carrières</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Débouchés Professionnels
            </h2>
            <p className="text-lg text-gray-600">
              De nombreuses opportunités de carrière vous attendent
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {debouches.map((d, i) => (
              <div key={i} className="group bg-white rounded-xl p-4 shadow hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-700 font-medium group-hover:text-purple-600 transition-colors">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Équipe enseignante */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Équipe Enseignante</h2>
          <ul className="list-disc list-inside text-gray-700 inline-block text-left space-y-2">
            {enseignants.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      </section>

      {/* Laboratoires */}
      <section className="py-12 bg-purple-50 border-t">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">Laboratoires & Salles</h2>
          <ul className="list-disc list-inside text-gray-700 inline-block text-left space-y-2">
            {laboratoires.map((lab, i) => <li key={i}>{lab}</li>)}
          </ul>
        </div>
      </section>

      {/* Plan d'étude */}
      <section className="py-12 bg-purple-50 border-t">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">Plan d’étude</h2>
          <ul className="list-disc list-inside text-gray-700 inline-block text-left space-y-2">
            {planEtude.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      </section>

      {/* Organisation des études */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Organisation des Études</h2>
          <ul className="list-disc list-inside text-gray-700 inline-block text-left space-y-2">
            {organisation.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      </section>

      {/* Manifestations */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-pink-50 border-t">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-purple-600 mb-6">Manifestations Organisées</h2>
          <ul className="list-disc list-inside text-gray-700 inline-block text-left space-y-2">
            {manifestations.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      </section>


      {/* CTA */}
      <div className="text-center py-12">
        <Link href="/">
          <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
            Retour à l'accueil
          </button>
        </Link>
      </div>
    </div>
  );
}
