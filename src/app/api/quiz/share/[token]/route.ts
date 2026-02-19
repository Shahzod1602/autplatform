import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { shareToken: token },
      include: {
        flashcards: { orderBy: { sortOrder: "asc" } },
        mcqs: { orderBy: { sortOrder: "asc" } },
        openQuestions: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: quiz.id,
      title: quiz.title,
      flashcards: quiz.flashcards,
      mcqs: quiz.mcqs,
      openQuestions: quiz.openQuestions,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
