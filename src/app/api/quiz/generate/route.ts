import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractText } from "@/lib/extractText";
import { generateQuizContent } from "@/lib/groq";
import { readFile } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as { id: string }).id;
    const { quizId } = await req.json();

    if (!quizId) {
      return NextResponse.json({ error: "Quiz ID required" }, { status: 400 });
    }

    const quiz = await prisma.quiz.findFirst({
      where: { id: quizId, userId },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Read the uploaded file
    const filePath = path.join(process.cwd(), "public", quiz.fileUrl);
    const fileBuffer = await readFile(filePath);

    // Extract text from the file
    const text = await extractText(fileBuffer, quiz.fileName);

    if (!text || text.trim().length < 50) {
      await prisma.quiz.update({
        where: { id: quizId },
        data: { status: "FAILED" },
      });
      return NextResponse.json(
        { error: "Could not extract enough text from the file" },
        { status: 400 }
      );
    }

    // Generate quiz content using Groq
    const content = await generateQuizContent(text);

    // Save all questions to the database
    await prisma.$transaction([
      ...content.flashcards.map((fc, i) =>
        prisma.flashcard.create({
          data: {
            quizId,
            term: fc.term,
            definition: fc.definition,
            sortOrder: i,
          },
        })
      ),
      ...content.mcqs.map((mcq, i) =>
        prisma.mCQ.create({
          data: {
            quizId,
            question: mcq.question,
            optionA: mcq.optionA,
            optionB: mcq.optionB,
            optionC: mcq.optionC,
            optionD: mcq.optionD,
            correctOption: mcq.correctOption,
            sortOrder: i,
          },
        })
      ),
      ...content.openQuestions.map((oq, i) =>
        prisma.openQuestion.create({
          data: {
            quizId,
            question: oq.question,
            modelAnswer: oq.modelAnswer,
            sortOrder: i,
          },
        })
      ),
      prisma.quiz.update({
        where: { id: quizId },
        data: { status: "READY" },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Try to mark quiz as failed
    try {
      const { quizId } = await req.clone().json();
      if (quizId) {
        await prisma.quiz.update({
          where: { id: quizId },
          data: { status: "FAILED" },
        });
      }
    } catch {
      // ignore
    }
    console.error("Quiz generation error:", error);
    return NextResponse.json({ error: "Generation failed" }, { status: 500 });
  }
}
