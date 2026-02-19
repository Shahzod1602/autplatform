import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;

    const quizzes = await prisma.quiz.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            flashcards: true,
            mcqs: true,
            openQuestions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(quizzes);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { title, fileName, fileUrl, fileSize, flashcardCount, mcqCount, openQuestionCount } = await req.json();

    if (!title || !fileName || !fileUrl) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const clampCount = (val: unknown, def: number) => {
      const n = typeof val === "number" ? val : def;
      return Math.max(1, Math.min(30, Math.round(n)));
    };

    const quiz = await prisma.quiz.create({
      data: {
        userId,
        title,
        fileName,
        fileUrl,
        fileSize: fileSize || 0,
        status: "GENERATING",
        flashcardCount: clampCount(flashcardCount, 10),
        mcqCount: clampCount(mcqCount, 10),
        openQuestionCount: clampCount(openQuestionCount, 5),
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
