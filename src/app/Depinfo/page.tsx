'use client';
<<<<<<< HEAD

import { Cpu, Users, GraduationCap, Award, BookOpen, Calendar, Network, Server, Laptop, Briefcase, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';
=======
import { Cpu, Users, GraduationCap, Award, BookOpen, Calendar, Network, Server, Laptop, Briefcase, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
>>>>>>> baa7d8521455c9ddabf7e1703b7f53488ff217fa

export default function DepInfoDashboard() {
  const infos = [
    { icon: <Users className="w-6 h-6 text-purple-600" />, label: 'Étudiants', value: '450+' },
    { icon: <GraduationCap className="w-6 h-6 text-purple-600" />, label: 'Enseignants', value: '21' },
    { icon: <Award className="w-6 h-6 text-purple-600" />, label: 'Réussite', value: '95%' },
    { icon: <BookOpen className="w-6 h-6 text-purple-600" />, label: 'Laboratoires', value: '10+' },
  ];

  const specialites = [
    { icon: <Server className="w-6 h-6 text-blue-600" />, title: 'DSI', desc: 'Développement des Systèmes d’Information.' },
    { icon: <Network className="w-6 h-6 text-green-600" />, title: 'RSI', desc: 'Réseaux & Services Informatiques.' },
    { icon: <Laptop className="w-6 h-6 text-pink-600" />, title: 'MDW', desc: 'Multimédia & Développement Web.' },
  ];

<<<<<<< HEAD
  const projets = [
    'Système de gestion RH (Web & Mobile)',
    'Application de cybersécurité pour IoT',
    'Plateforme e-learning avec IA',
  ];

  const clubs = [
    'Club Programmation',
    'Club Réseaux & Sécurité',
    'Club Innovation & Startups',
  ];

  const debouches = [
    'Développeur d’Applications de gestion',
    'Développeur de sites Web',
    'Administrateur réseaux',
    'Webmaster designer',
    'Architecte réseaux et systèmes',
=======
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
>>>>>>> baa7d8521455c9ddabf7e1703b7f53488ff217fa
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Cpu className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Département Informatique - ISET Tozeur</h1>
          <p className="opacity-90 mt-2">Un pôle d’excellence en technologies modernes.</p>
        </div>
      </header>

      {/* Infos */}
      <section className="py-12 max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-6">
        {infos.map((info, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-5 text-center hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="flex justify-center mb-2">{info.icon}</div>
            <h3 className="text-xl font-bold">{info.value}</h3>
            <p className="text-gray-600">{info.label}</p>
          </div>
        ))}
      </section>

      {/* Directeur & Contacts */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Directeur & Contacts</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-purple-50 p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-lg text-purple-600">Directeur de département</h3>
              <p className="mt-2">Soufiene Ben Mahmoud</p>
              <p className="flex items-center gap-2 mt-2"><Phone className="w-4 h-4" /> 76 473 777 - Poste 135</p>
              <p className="flex items-center gap-2 mt-1"><Mail className="w-4 h-4" /> soufiene.mahmoud@laposte.net</p>
              <p className="flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" /> Bureau EI01 – Département TI</p>
            </div>
            <div className="bg-purple-50 p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-lg text-purple-600">Secrétaire</h3>
              <p className="mt-2">Samira Bououni</p>
              <p className="flex items-center gap-2 mt-2"><Phone className="w-4 h-4" /> 76 473 777 - Poste 132</p>
              <p className="flex items-center gap-2 mt-1"><MapPin className="w-4 h-4" /> Bureau EI06 – Département TI</p>
            </div>
          </div>
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

      {/* Spécialités */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">Spécialités</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {specialites.map((sp, i) => (
              <div key={i} className="p-6 bg-gray-50 rounded-xl shadow hover:shadow-lg transition text-center">
                <div className="mb-3 flex justify-center">{sp.icon}</div>
                <h3 className="font-semibold text-lg text-purple-600">{sp.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{sp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Débouchés */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">Débouchés</h2>
          <ul className="list-disc list-inside text-gray-700 grid md:grid-cols-2 gap-2">
            {debouches.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
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

<<<<<<< HEAD
=======
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

>>>>>>> baa7d8521455c9ddabf7e1703b7f53488ff217fa
      {/* CTA */}
      <div className="text-center py-12">
        <Link href="/">
          <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
<<<<<<< HEAD
            Retour à l'accueil
=======
            Retour à l’accueil
>>>>>>> baa7d8521455c9ddabf7e1703b7f53488ff217fa
          </button>
        </Link>
      </div>
    </div>
  );
}
