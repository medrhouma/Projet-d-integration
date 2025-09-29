import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";

// Normalisation du rôle pour correspondre à l'énum Prisma
function normalizeRole(role: string) {
  switch (role.toLowerCase()) {
    case "etudiant":
    case "étudiant":
      return "Etudiant";
    case "enseignant":
      return "Enseignant";
    case "admin":
    case "administrateur":
      return "Admin";
    default:
      throw new Error("Rôle invalide");
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      nom,
      prenom,
      email,
      login,
      numInsc,
      matricule,
      password,
      role,
      specialite,
      groupe,
      departementId,
    } = body;

    // Champs obligatoires communs
    if (!nom || !prenom || !email || !login || !password || !role) {
      return NextResponse.json(
        { error: "Champs obligatoires manquants" },
        { status: 400 }
      );
    }

    // Normalisation du rôle
    let prismaRole: "Etudiant" | "Enseignant" | "Admin";
    try {
      prismaRole = normalizeRole(role) as "Etudiant" | "Enseignant" | "Admin";
    } catch (e) {
      return NextResponse.json(
        { error: "Rôle invalide" },
        { status: 400 }
      );
    }

    // Validation spécifique au rôle
    if (prismaRole === "Etudiant" && !numInsc) {
      return NextResponse.json(
        { error: "Le numéro d'inscription est obligatoire pour un étudiant" },
        { status: 400 }
      );
    }

    if (prismaRole === "Enseignant" && (!matricule || !departementId)) {
      return NextResponse.json(
        { error: "Matricule et département obligatoires pour un enseignant" },
        { status: 400 }
      );
    }

    // Vérifie si l'utilisateur existe déjà (email unique)
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Un compte existe déjà avec cet email" },
        { status: 400 }
      );
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l’utilisateur
    const newUser = await prisma.utilisateur.create({
      data: {
        nom,
        prenom,
        email,
        identifiant: login,
        mot_de_passe_hash: hashedPassword,
        role: prismaRole,

        // Création étudiant
        etudiant:
          prismaRole === "Etudiant"
            ? {
                create: {
                  numero_inscription: numInsc,
                  id_specialite: specialite ? Number(specialite) : null,
                  id_groupe: groupe ? Number(groupe) : null,
                },
              }
            : undefined,

        // Création enseignant
        enseignant:
          prismaRole === "Enseignant"
            ? {
                create: {
                  matricule,
                  id_departement: Number(departementId),
                },
              }
            : undefined,
      },
      select: {
        id_utilisateur: true,
        nom: true,
        prenom: true,
        email: true,
        identifiant: true,
        role: true,
        etudiant: true,
        enseignant: true,
      },
    });

    return NextResponse.json(
      { message: "Utilisateur créé avec succès", user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erreur API Register:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
