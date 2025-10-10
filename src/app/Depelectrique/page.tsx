'use client';
import { Users, GraduationCap, Award, BookOpen, Phone, Mail, MapPin, Zap } from "lucide-react";
import Link from "next/link";

export default function DepElectriqueDashboard() {
  const stats = [
    { value: "320+", label: "Étudiants" },
    { value: "28+", label: "Enseignants" },
    { value: "90%", label: "Taux de réussite" },
    { value: "4", label: "Laboratoires" }
  ];

  const specialites = [
    "Électricité Industrielle (EI)",
    "Electronique Industrielle (ElnI)",
    "Automatisme & Informatique Industrielle (AII)"
  ];

  const debouches = [
    "Diplôme de Licence appliquée",
    "Technicien électricien industriel",
    "Ingénieur en automatisme",
    "Technicien en électronique",
    "Administrateur systèmes et réseaux industriels",
    "Technico-commercial en solutions électriques"
  ];

  const enseignants = [
    "Technologues",
    "Enseignants chercheurs",
    "Assistants technologues",
    "Compétences du monde industriel"
  ];

  const planEtude = [
    "2 semestres d’enseignement commun (unités fondamentales, optionnelles et transversales)",
    "3 semestres de spécialité",
    "1 semestre de stage de fin d’études",
    "Stages : stage d’initiation (1ère année), stage de perfectionnement (2ème année)"
  ];

  const competencesPro = [
    "Organisation du travail et communication",
    "Présenter un travail personnel ou d'équipe",
    "Communiquer avec un collaborateur, fournisseur ou client",
    "Préparer et animer une réunion de travail",
    "Établir les documents techniques d’un projet industriel"
  ];

  const competencesTech = {
    EI: [
      "Prendre connaissance du matériel et de la documentation",
      "Étudier les schémas d’implantation et dresser la liste des appareils",
      "Assistance technique à l'équipe de montage",
      "Tester le fonctionnement après mise sous tension",
      "Rédiger un rapport technique d'installation",
      "Initier les utilisateurs à la conduite du matériel"
    ],
    AII: [
      "Maîtrise des technologies des systèmes industriels",
      "Mettre en œuvre une chaîne de régulation industrielle",
      "Valider la configuration d’un réseau",
      "Gérer un système en temps réel",
      "Suivre l'évolution technologique"
    ],
    ElnI: [
      "Identifier les structures matérielles",
      "Analyser l’organisation et le comportement d’une structure",
      "Établir les procédures de tests",
      "Installer et configurer l’équipement",
      "Fabriquer une nouvelle maquette à partir d’un cahier des charges"
    ]
  };

  const manifestations = [
    "Activités extrascolaires : CLUB ROBOTIQUE",
    "Développement du savoir-faire en robotique mobile",
    "Conception et réalisation d’un robot mobile",
    "Participation aux concours nationaux et internationaux"
  ];

  const contacts = {
    director: "Mohamed HOUMIA",
    email: "mohamedhoumia@gmail.com",
    phone: "(+216) 76 473 777",
    fax: "(+216) 76 472 777",
    address: "Campus universitaire, route de Nefta, BP 150, Tozeur 2210",
    website: "www.isett.rnu.tn",
    generalEmail: "contact@isett.rnu.tn"    
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-10 shadow-lg">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <Zap className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Département Génie Électrique - ISET Tozeur</h1>
          <p className="opacity-90 mt-2">Formation scientifique et technique axée sur la pratique industrielle.</p>
        </div>
      </header>

      {/* Stats */}
      <section className="py-12 max-w-6xl mx-auto px-6 grid md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow p-5 text-center hover:shadow-lg transition transform hover:-translate-y-1">
            <div className="flex justify-center mb-2">{s.icon}</div>
            <h3 className="text-xl font-bold">{s.value}</h3>
            <p className="text-gray-600">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Présentation & Objectifs */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6 space-y-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Présentation & Objectifs</h2>
          <p>Le département de génie électrique a été créé en 2010. Il forme des licenciés compétents dans les techniques modernes combinées d'électronique, d’électrotechnique, d'informatique industrielle et d’automatismes.</p>
          <p>Objectif : Former des étudiants capables de réaliser des projets techniques et d’assumer des responsabilités dans les secteurs industriels (agroalimentaire, mécanique, électrique, électronique, etc.).</p>
        </div>
      </section>

      {/* Spécialités / Parcours */}
      <section className="py-12 bg-yellow-50 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-yellow-600 mb-6 text-center">Parcours & Spécialités</h2>
          <ul className="list-disc list-inside text-gray-700 grid md:grid-cols-3 gap-2">
            {specialites.map((sp, i) => <li key={i}>{sp}</li>)}
          </ul>
        </div>
      </section>

      {/* Débouchés */}
      <section className="py-12 bg-gradient-to-r from-yellow-50 to-orange-50 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-yellow-600 mb-6 text-center">Débouchés</h2>
          <ul className="list-disc list-inside text-gray-700">
            {debouches.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </div>
      </section>

      {/* Équipe Enseignante */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Équipe Enseignante</h2>
          <ul className="list-disc list-inside text-gray-700">
            {enseignants.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      </section>

      {/* Plan d'étude & Organisation */}
      <section className="py-12 bg-yellow-50 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-yellow-600 mb-6 text-center">Plan d'étude & Organisation</h2>
          <ul className="list-disc list-inside text-gray-700">
            {planEtude.map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
      </section>

      {/* Compétences professionnelles */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Compétences professionnelles</h2>
          <ul className="list-disc list-inside text-gray-700">
            {competencesPro.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        </div>
      </section>

      {/* Compétences techniques */}
      <section className="py-12 bg-yellow-50 border-t">
        <div className="max-w-6xl mx-auto px-6 space-y-6">
          <h2 className="text-2xl font-bold text-yellow-600 mb-6 text-center">Compétences techniques par parcours</h2>
          {Object.entries(competencesTech).map(([parcours, items], i) => (
            <div key={i}>
              <h3 className="font-semibold text-lg text-yellow-700 mb-2">{parcours}</h3>
              <ul className="list-disc list-inside text-gray-700">
                {items.map((it, idx) => <li key={idx}>{it}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Manifestations / Club Robotique */}
      <section className="py-12 bg-white border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Manifestations & Activités Extrascolaires</h2>
          <ul className="list-disc list-inside text-gray-700">
            {manifestations.map((m, i) => <li key={i}>{m}</li>)}
          </ul>
        </div>
      </section>

      {/* Contacts */}
      <section className="py-12 bg-yellow-50 border-t">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-yellow-600 mb-6 text-center">Contacts</h2>
          <p><strong>Directeur de département :</strong> {contacts.director}</p>
          <p><Mail className="inline w-5 h-5 mr-2 text-yellow-600" /> Email: {contacts.email}</p>
          <p><Phone className="inline w-5 h-5 mr-2 text-yellow-600" /> Téléphone: {contacts.phone}</p>
          <p><MapPin className="inline w-5 h-5 mr-2 text-yellow-600" /> Adresse: {contacts.address}</p>
          <p><strong>Fax :</strong> {contacts.fax}</p>
          <p><strong>Site Web :</strong> {contacts.website}</p>
          <p><strong>Email général :</strong> {contacts.generalEmail}</p>
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
