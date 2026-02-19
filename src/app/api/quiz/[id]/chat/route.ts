import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { chatWithMaterial } from "@/lib/groq";
import { extractText } from "@/lib/extractText";
import fs from "fs";
import path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { id } = await params;

    const quiz = await prisma.quiz.findFirst({
      where: { id, userId },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const { message, history } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Extract text from quiz file
    const filePath = path.join(process.cwd(), "public", quiz.fileUrl);
    let materialText = "";
    try {
      const buffer = fs.readFileSync(filePath);
      materialText = await extractText(Buffer.from(buffer), quiz.fileName);
    } catch {
      // Fallback: use quiz content as context
      const fullQuiz = await prisma.quiz.findFirst({
        where: { id },
        include: {
          flashcards: true,
          mcqs: true,
          openQuestions: true,
        },
      });
      if (fullQuiz) {
        const parts: string[] = [];
        fullQuiz.flashcards.forEach((f) => parts.push(`${f.term}: ${f.definition}`));
        fullQuiz.mcqs.forEach((m) => parts.push(`Q: ${m.question} A: ${m.correctOption}`));
        fullQuiz.openQuestions.forEach((q) => parts.push(`Q: ${q.question} A: ${q.modelAnswer}`));
        materialText = parts.join("\n");
      }
    }

    const reply = await chatWithMaterial(materialText, message, history || []);

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
