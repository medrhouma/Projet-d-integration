import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { receiverId, contenu } = body;

    if (!receiverId || !contenu) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    // المستخدم المتصل (بش تتبدل بعد بالـ Auth الحقيقي)
    const senderId = Number(localStorage?.getItem("userId")) || 1;

    const message = await prisma.message.create({
      data: {
        contenu,
        id_expediteur: senderId,
        id_destinataire: Number(receiverId),
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("SEND MESSAGE ERROR:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
