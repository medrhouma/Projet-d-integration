'use client';
import { Users, GraduationCap, Award, BookOpen, Calendar, ArrowRight, Building, Phone, Mail, MapPin } from "lucide-react";
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

      {/* Programs */}
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
            retour a l'acceuil
          </button>
        </Link>
      </div>
    </div>
  );
}