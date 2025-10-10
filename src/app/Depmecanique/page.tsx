'use client';
import { Wrench, User, Mail, Phone, MapPin, BookOpen, Users, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function DepMecaniqueDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-blue-700 to-cyan-500 text-white py-20 px-6 text-center shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-6 rounded-2xl">
              <Wrench className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Département Génie Mécanique</h1>
          <p className="text-lg opacity-90">
            Institut Supérieur des Études Technologiques de Tozeur
          </p>
        </div>
      </section>

      {/* Directeur */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Direction & Coordonnées</h2>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <p><strong>Directeur de département :</strong> Anouar HAMMI</p>
          <p><strong>Secrétaire :</strong> Lamia BOULIFA</p>
          <p><MapPin className="inline w-4 h-4 text-blue-600 mr-2" /> Campus universitaire, route de Nefta, BP 150, Tozeur 2210</p>
          <p><Mail className="inline w-4 h-4 text-blue-600 mr-2" /> <a href="mailto:anouar.hammi@gmail.com" className="text-blue-700 hover:underline">anouar.hammi@gmail.com</a></p>
          <p><Phone className="inline w-4 h-4 text-blue-600 mr-2" /> (+216) 76 473 777</p>
        </div>
      </section>

      {/* Présentation */}
      <section className="bg-gray-100 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Présentation</h2>
          <p className="text-gray-700 leading-relaxed">
            Le département Génie Mécanique, créé en 2008, est l’un des piliers de l’Institut Supérieur des Études Technologiques de Tozeur.
            Il forme les étudiants dans les domaines de la mécanique, de l’énergétique et de la maintenance industrielle sur trois années
            (six semestres). Les deux premiers semestres sont communs, puis les étudiants choisissent une spécialité :
          </p>
          <ul className="list-disc ml-8 mt-3 text-gray-700">
            <li>Maintenance Industrielle</li>
            <li>Énergétique</li>
            <li>Mécatronique</li>
            <li>Énergie et Génie Climatique (Licence co-construite)</li>
          </ul>
        </div>
      </section>

      {/* Débouchés */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Débouchés</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            "Maintenance Industrielle",
            "Mécatronique",
            "Énergétique",
            "Énergie et Génie Climatique"
          ].map((item, idx) => (
            <div key={idx} className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
              <h3 className="font-bold text-blue-700">{item}</h3>
              <p className="text-gray-600 text-sm mt-2">
                Formation polyvalente préparant aux métiers techniques et de conception.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Équipe enseignante */}
      <section className="bg-gray-100 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">L’équipe enseignante</h2>
          <p className="text-gray-700 leading-relaxed">
            L’équipe du département est jeune, dynamique et engagée. Elle se compose d’enseignants technologues,
            maîtres technologues et de vacataires issus de l’environnement socio-économique local.
          </p>
        </div>
      </section>

      {/* Plan d’étude */}
      <section className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Plan d’étude</h2>
        <p className="text-gray-700 leading-relaxed">
          La formation en Génie Mécanique se déroule sur trois années divisées en six semestres :
        </p>
        <ul className="list-disc ml-8 mt-3 text-gray-700 space-y-1">
          <li>Cours : formation théorique et pratique.</li>
          <li>Projets tuteurés : projets pré-professionnels orientant les étudiants vers les spécialisations.</li>
          <li>Projet de fin d’étude : en troisième année (stage de 4 à 5 mois).</li>
        </ul>
      </section>

      {/* Contacts */}
      <section className="bg-gray-100 py-12 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Contacts</h2>
          <div className="bg-white p-6 rounded-xl shadow-md">
            <p><strong>Département :</strong> Génie Mécanique</p>
            <p><strong>Nom & Prénom :</strong> HAMMI Anouar</p>
            <p><strong>Fonction :</strong> Directeur de département</p>
            <p><Mail className="inline w-4 h-4 text-blue-600 mr-2" /> anouar.hammi@gmail.com</p>
            <p><MapPin className="inline w-4 h-4 text-blue-600 mr-2" /> Campus universitaire, route de Nefta, BP 150, Tozeur 2210</p>
            <p><Phone className="inline w-4 h-4 text-blue-600 mr-2" /> (+216) 76 473 777</p>
            <p><Phone className="inline w-4 h-4 text-blue-600 mr-2" /> Fax : (+216) 76 472 777</p>
          </div>
        </div>
      </section>

      {/* Retour */}
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
