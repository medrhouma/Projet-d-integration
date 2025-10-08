// app/lirearticle/page.js ou pages/lirearticle.js selon ta structure Next.js
'use client';

import React from 'react';
import Link from 'next/link';

const events = [
  {
    title: "Journée Portes Ouvertes 2025",
    description: "L’ISET Tozeur organise une journée portes ouvertes pour accueillir les nouveaux étudiants et présenter les clubs, formations et projets innovants.",
    date: "12 octobre 2025",
    readTime: "3 min de lecture",
    category: "Événement",
    image: "/images/iset-event1.jpg",
    tags: ["ISET Tozeur", "portes ouvertes", "étudiants"]
  },
  {
    title: "Séminaire sur la Transformation Digitale",
    description: "Les enseignants et étudiants du département Informatique ont assisté à un séminaire animé par des experts sur la transformation numérique dans les institutions éducatives.",
    date: "20 septembre 2025",
    readTime: "4 min de lecture",
    category: "Actualité",
    image: "/images/iset-digital.jpg.jpg",
    tags: ["informatique", "séminaire", "transformation digitale"]
  },
  {
    title: "Compétition Nationale de Robotique",
    description: "L’équipe de l’ISET Tozeur a remporté la 2e place à la compétition nationale de robotique, démontrant le savoir-faire et la créativité de nos étudiants.",
    date: "5 septembre 2025",
    readTime: "2 min de lecture",
    category: "Événement",
    image: "/images/iset-robotique.jpg",
    tags: ["robotique", "compétition", "innovation"]
  },
  {
    title: "Journées de sensibilisation en cybersécurité",
    description: "L’ISET Tozeur, en partenariat avec le Centre 4C, a organisé deux journées de sensibilisation à la cybersécurité afin d’initier les étudiants aux bonnes pratiques numériques et à la sécurité des données.",
    date: "13-14 octobre 2024",
    readTime: "3 min de lecture",
    category: "Événement",
    image: "/images/cybersecurite-iset-tozeur.jpg",
    tags: ["cybersécurité", "formation", "numérique", "4C"]
  },
  {
    title: "Séminaire sur les énergies renouvelables et développement durable",
    description: "L’ISET Tozeur, en collaboration avec le Centre d’Affaires de Tozeur, a organisé un séminaire pour sensibiliser étudiants et professionnels aux enjeux de l’économie circulaire et des énergies propres.",
    date: "9 mai 2023",
    readTime: "3 min de lecture",
    category: "Événement",
    image: "/images/energies-renouvelables.jpg",
    tags: ["énergie", "durabilité", "environnement"]
  },
  {
    title: "Projet « Tozeur Oasis des sciences et technologies » (TOST)",
    description: "Lancé par l’association Youth Vision avec le soutien de l’Union européenne et de l’ANPR, ce projet vise à vulgariser la science et la technologie dans les écoles et les clubs de jeunesse de Tozeur, notamment par la création de clubs de robotique.",
    date: "2 juin 2025",
    readTime: "3 min de lecture",
    category: "Actualité",
    image: "/images/tostoasis-sciences-technologies.jpg",
    tags: ["science", "jeunesse", "robotique", "éducation"]
  }
];

export default function LireArticle() {
  return (
    <div className="min-h-screen bg-gray-100 py-10 px-5">
      {/* Bouton Retour Accueil */}
      <div className="mb-6">
        <Link href="/" className="inline-block bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          ← Retour à l’accueil
        </Link>
      </div>

      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">Tous les Événements & Actualités</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map((event, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <img src={event.image} alt={event.title} className="w-full h-48 object-cover"/>
            <div className="p-5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white bg-purple-600 px-3 py-1 rounded-full">{event.category}</span>
                <span className="text-sm text-gray-500">{event.readTime}</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{event.title}</h2>
              <p className="text-gray-600 mb-4">{event.description}</p>
              <div className="flex flex-wrap gap-2 mb-2">
                {event.tags.map((tag, i) => (
                  <span key={i} className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
              <p className="text-sm text-gray-400">{event.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}