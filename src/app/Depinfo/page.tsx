'use client';

import { Cpu, Users, GraduationCap, Award, BookOpen, Calendar, Network, Server, Laptop, Briefcase, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

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

      {/* Directeur & contacts */}
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

      {/* Présentation */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Présentation</h2>
          <p className="text-gray-700 leading-relaxed">
            Le département Technologies de l’Informatique a été créé en Septembre 2007. Il offre une formation en licence appliquée en technologies de l’informatique répartie sur trois parcours : RSI et DSI.
          </p>
          <p className="mt-4 text-gray-700 leading-relaxed">
            Les enseignements pratiques se déroulent dans des laboratoires de haut niveau : 07 laboratoires d’informatique, 01 laboratoire CISCO, 01 laboratoire C2i et 01 salle de projets.
          </p>
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
      <section className="py-12 bg-purple-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-purple-600 mb-6 text-center">Débouchés</h2>
          <ul className="list-disc list-inside text-gray-700 grid md:grid-cols-2 gap-2">
            {debouches.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      </section>

      {/* Projets & Clubs */}
      <section className="py-12 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-bold text-purple-600 mb-4">Projets Étudiants</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {projets.map((p, i) => <li key={i}>{p}</li>)}
            </ul>
          </div>
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h2 className="text-xl font-bold text-purple-600 mb-4">Clubs</h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              {clubs.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
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
