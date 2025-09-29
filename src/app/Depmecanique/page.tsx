'use client';
import { Users, GraduationCap, Award, BookOpen, Wrench, Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export default function DepMecaniqueDashboard() {
  const stats = [
    { value: "290+", label: "Étudiants" },
    { value: "25+", label: "Enseignants" },
    { value: "88%", label: "Taux de réussite" },
    { value: "6", label: "Ateliers" }
  ];

  const programs = [
    "Mécanique Industrielle",
    "Conception et Fabrication Assistée",
    "Énergétique et Thermique",
    "Maintenance Industrielle"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-700 to-cyan-500 text-white py-20 px-6 text-center shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-white/20 p-6 rounded-2xl">
              <Wrench className="w-12 h-12" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Département Génie Mécanique</h1>
          <p className="text-lg opacity-90">
            Développez vos compétences en conception, fabrication et maintenance industrielle.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 shadow text-center hover:scale-105 transform transition">
            <h3 className="text-3xl font-bold text-blue-600">{s.value}</h3>
            <p className="text-gray-600">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Programs */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">Nos Programmes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((prog, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
                <h3 className="font-bold text-blue-700">{prog}</h3>
                <p className="text-gray-600 text-sm mt-2">
                  Formation complète et adaptée aux besoins du secteur industriel.
                </p>
              </div>
            ))}
          </div>
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
    </div>
  );
}
