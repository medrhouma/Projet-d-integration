'use client';
import { Users, GraduationCap, Award, BookOpen, Calendar, ArrowRight, Building, Phone, Mail, MapPin, FileText, Briefcase } from "lucide-react";
import Link from "next/link";

export default function DepCivilDashboard() {
  const stats = [
    { icon: <Users className="w-8 h-8 text-green-600" />, value: "380+", label: "Étudiants" },
    { icon: <GraduationCap className="w-8 h-8 text-green-600" />, value: "35+", label: "Enseignants" },
    { icon: <Award className="w-8 h-8 text-green-600" />, value: "92%", label: "Taux de réussite" },
    { icon: <BookOpen className="w-8 h-8 text-green-600" />, value: "5", label: "Laboratoires" }
  ];

  const programs = [
    "Construction et Matériaux",
    "Génie Structurel",
    "Hydraulique et Environnement",
    "Gestion de Chantiers"
  ];

  const contact = {
    directeur: "Dr. Mohamed Ali Ben Youssef",
    secretaire: "Mme. Amina Chaker",
    bureau: "Bloc C – Bureau C12",
    tel: "76 473 777 - Poste 120",
    email: "civil@iset-tozeur.tn"
  };

  const presentation = `Le département Génie Civil a été créé en 2012. 
  Il offre une formation de licence appliquée en génie civil. 
  La mission principale du département Génie Civil est de former en trois ans le Technicien Supérieur 
  spécialistes du bâtiment, travaux publics et de la topographie, 
  pouvant exercer leurs fonctions dans des secteurs d'activités très diversifiés. 
  La capacité d’accueil est fixée chaque année par le ministère.`;

  const debouches = [
    "Le licencié en Génie Civil peut intervenir dans des secteurs variés",
    "Bâtiment : Construction, audit énergétique…",
    "Travaux publics : Routes et ouvrages d’art.",
    "Topographie : lever topographique, SIG…"
  ];

  const planEtude = [
    "Bâtiment",
    "Travaux",
    "Topographie"
  ];

  const organisation = [
    "Bâtiment : orienté vers le domaine du bâtiment (immeubles, bâtiments administratifs ou industriels, travaux d’entretien).",
    "Travaux publics et communaux : orienté vers les infrastructures routières (routes, autoroutes) et ouvrages d’art (ponts, tunnels...).",
    "Topographie : orienté vers la photogrammétrie, les SIG, la télédétection et la cartographie numérique."
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 to-lime-600 text-white py-12 shadow-xl">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Building className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Département Génie Civil</h1>
          <p className="text-lg opacity-90">
            Formez-vous aux métiers du génie civil : construction, structures et gestion de chantiers.
          </p>
        </div>
      </header>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition">
            <div className="mb-4">{item.icon}</div>
            <h3 className="text-2xl font-bold text-gray-800">{item.value}</h3>
            <p className="text-gray-600">{item.label}</p>
          </div>
        ))}
      </section>

      {/* Nouvelle section : Directeur & Secrétaire */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Direction & Secrétariat</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-lg text-green-700 mb-2">Directeur de département</h3>
              <p className="font-medium">Mohamed Youssef Hassine</p>
              <p className="mt-3 text-gray-700">
                <strong>Responsable & Coordonnées :</strong> Mohamed Youssef Hassine
              </p>
              <p className="flex items-center gap-2 mt-2 text-gray-700">
                <Mail className="w-4 h-4 text-green-600" /> med_youssef_hassine@yahoo.fr
              </p>
            </div>

            <div className="bg-green-50 p-6 rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-semibold text-lg text-green-700 mb-2">Secrétaire</h3>
              <p className="font-medium">Samira Bououni</p>
            </div>
          </div>
        </div>
      </section>

      {/* Présentation */}
      <section className="py-12 bg-green-50 border-t">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-6">Présentation</h2>
          <p className="text-gray-700 leading-relaxed max-w-3xl mx-auto">{presentation}</p>
        </div>
      </section>

      {/* Débouchés */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Débouchés</h2>
          <ul className="list-disc list-inside text-left inline-block text-gray-700 space-y-2">
            {debouches.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      </section>

      {/* Plan d'étude */}
      <section className="py-12 bg-green-50 border-t">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-green-700 mb-6">Plan d’étude</h2>
          <ul className="list-disc list-inside text-left inline-block text-gray-700 space-y-2">
            {planEtude.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      </section>

      {/* Organisation des études */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Organisation des Études</h2>
          <ul className="list-disc list-inside text-left inline-block text-gray-700 space-y-2">
            {organisation.map((o, i) => <li key={i}>{o}</li>)}
          </ul>
        </div>
      </section>

      {/* Programmes */}
      <section className="bg-white py-12 shadow-inner">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Programmes de formation</h2>
          <ul className="grid md:grid-cols-2 gap-4">
            {programs.map((prog, idx) => (
              <li key={idx} className="p-4 border rounded-xl hover:bg-green-50 transition flex items-center">
                <ArrowRight className="w-5 h-5 text-green-600 mr-3" />
                {prog}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Informations pratiques */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Informations pratiques</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-semibold text-lg text-green-700 mb-3">Équipe administrative</h3>
            <p><strong>Directeur :</strong> {contact.directeur}</p>
            <p><strong>Secrétaire :</strong> {contact.secretaire}</p>
            <p><strong>Bureau :</strong> {contact.bureau}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <h3 className="font-semibold text-lg text-green-700 mb-3">Contact</h3>
            <p className="flex items-center mb-2"><Phone className="w-5 h-5 mr-2 text-green-600" /> {contact.tel}</p>
            <p className="flex items-center mb-2"><Mail className="w-5 h-5 mr-2 text-green-600" /> {contact.email}</p>
            <p className="flex items-center"><MapPin className="w-5 h-5 mr-2 text-green-600" /> ISET Tozeur, Tunisie</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="text-center py-12">
        <Link href="/">
          <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
            Retour à l’accueil
          </button>
        </Link>
      </div>
    </div>
  );
}
