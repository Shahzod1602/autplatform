import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const { score, totalQuestions, answers } = await req.json();

    const quiz = await prisma.quiz.findFirst({
      where: { id, userId },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: id,
        userId,
        score,
        totalQuestions,
        answers: JSON.stringify(answers),
      },
    });

    return NextResponse.json(attempt);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
