'use client';
import { Users, GraduationCap, Award, BookOpen, Phone, Mail, MapPin, Zap, Menu } from "lucide-react";
import Link from "next/link";

export default function DepElectriqueDashboard() {
  const stats = [
    { value: "320+", label: "Étudiants" },
    { value: "28+", label: "Enseignants" },
    { value: "90%", label: "Taux de réussite" },
    { value: "4", label: "Laboratoires" }
  ];

  const programs = [
    "Électrotechnique",
    "Électronique",
    "Énergies Renouvelables",
    "Automatique et Contrôle"
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-yellow-600 to-orange-600 text-white p-6 flex flex-col justify-between shadow-lg">
        <div>
          <div className="flex items-center space-x-3 mb-8">
            <Zap className="w-8 h-8" />
            <h1 className="text-xl font-bold">Département Électrique</h1>
          </div>
        
        </div>
        <Link href="/Depelectrique">
          <button className="w-full mt-6 px-4 py-2 bg-white text-yellow-700 font-semibold rounded-lg shadow hover:bg-gray-100 transition">
            Accéder au site
          </button>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-gray-800">Bienvenue au département Génie Électrique ⚡</h2>
          <p className="text-gray-600 mt-2">
            Spécialisez-vous dans l’électrotechnique, l’électronique et les énergies renouvelables.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow hover:shadow-lg text-center transition">
              <h3 className="text-3xl font-bold text-yellow-600">{s.value}</h3>
              <p className="text-gray-600">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Programs */}
        <section>
          <h3 className="text-2xl font-semibold mb-6">Nos Programmes</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {programs.map((prog, idx) => (
              <div key={idx} className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg hover:shadow-md transition">
                <h4 className="font-bold text-yellow-700">{prog}</h4>
                <p className="text-gray-600 text-sm mt-2">
                  Formation spécialisée pour préparer aux métiers modernes.
                </p>
              </div>
            ))}
          </div>
        </section>
      {/* CTA */}
      <div className="text-center py-12">
        <Link href="/">
          <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition">
            retour a l'acceuil
          </button>
        </Link>
      </div>
   
     </main>
    </div>
  );
}
