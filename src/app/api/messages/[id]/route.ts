import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// =============================
// GET : جلب جميع الرسائل بين المستخدم والمنشئ
// =============================
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = 1; // ID متاع الي عامل login (بدّلها وقت تعمل auth)
    const otherId = params?.id ? parseInt(params.id, 10) : NaN;
    if (Number.isNaN(otherId)) {
      return NextResponse.json({ error: 'Invalid recipient id' }, { status: 400 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { id_expediteur: userId, id_destinataire: otherId },
          { id_expediteur: otherId, id_destinataire: userId }
        ],
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /messages error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// =============================
// POST : إرسال رسالة جديدة
// =============================
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const userId = 1; // ID متاع الي عامل login (بدّلها لاحقاً)
    const otherId = params?.id ? parseInt(params.id, 10) : NaN;
    if (Number.isNaN(otherId)) {
      return NextResponse.json({ error: 'Invalid recipient id' }, { status: 400 });
    }

    if (!body.contenu || body.contenu.trim() === "") {
      return NextResponse.json(
        { error: "Le contenu du message est vide" },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        contenu: body.contenu,
        id_expediteur: userId,
        id_destinataire: otherId,
      },
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("POST /messages error:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
