import { NextResponse } from "next/server";
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

    const [totalQuizzes, attempts] = await Promise.all([
      prisma.quiz.count({ where: { userId } }),
      prisma.quizAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        include: { quiz: { select: { title: true } } },
      }),
    ]);

    const totalAttempts = attempts.length;

    if (totalAttempts === 0) {
      return NextResponse.json({
        totalQuizzes,
        totalAttempts: 0,
        averageScore: 0,
        bestScore: 0,
        quizzesThisWeek: 0,
        scoreOverTime: [],
        perQuiz: [],
        mostMissed: [],
      });
    }

    const scores = attempts.map(
      (a) => (a.totalQuestions > 0 ? (a.score / a.totalQuestions) * 100 : 0)
    );
    const averageScore = Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const bestScore = Math.round(Math.max(...scores));

    // Quizzes this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const quizzesThisWeek = attempts.filter(
      (a) => new Date(a.createdAt) >= weekAgo
    ).length;

    // Score over time (last 20)
    const scoreOverTime = attempts
      .slice(0, 20)
      .reverse()
      .map((a) => ({
        date: new Date(a.createdAt).toLocaleDateString(),
        score: a.totalQuestions > 0 ? Math.round((a.score / a.totalQuestions) * 100) : 0,
        quiz: a.quiz.title,
      }));

    // Per quiz breakdown
    const quizMap = new Map<string, { title: string; scores: number[] }>();
    for (const a of attempts) {
      const pct = a.totalQuestions > 0 ? Math.round((a.score / a.totalQuestions) * 100) : 0;
      const existing = quizMap.get(a.quizId);
      if (existing) {
        existing.scores.push(pct);
      } else {
        quizMap.set(a.quizId, { title: a.quiz.title, scores: [pct] });
      }
    }
    const perQuiz = Array.from(quizMap.entries()).map(([, v]) => ({
      title: v.title.length > 20 ? v.title.slice(0, 20) + "..." : v.title,
      avgScore: Math.round(v.scores.reduce((s, x) => s + x, 0) / v.scores.length),
    }));

    // Most missed questions
    const missMap = new Map<string, { question: string; count: number }>();
    for (const a of attempts) {
      try {
        const answersArr = JSON.parse(a.answers) as { mcqId: string; correct: boolean }[];
        for (const ans of answersArr) {
          if (!ans.correct) {
            const existing = missMap.get(ans.mcqId);
            if (existing) {
              existing.count++;
            } else {
              missMap.set(ans.mcqId, { question: ans.mcqId, count: 1 });
            }
          }
        }
      } catch {
        // skip malformed answers
      }
    }

    // Fetch actual question texts for missed questions
    const missedIds = Array.from(missMap.keys()).slice(0, 10);
    const mcqs = missedIds.length > 0
      ? await prisma.mCQ.findMany({
          where: { id: { in: missedIds } },
          select: { id: true, question: true },
        })
      : [];
    const mcqTextMap = new Map(mcqs.map((m) => [m.id, m.question]));

    const mostMissed = Array.from(missMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 10)
      .map(([id, v]) => ({
        question: mcqTextMap.get(id) || id,
        count: v.count,
      }));

    return NextResponse.json({
      totalQuizzes,
      totalAttempts,
      averageScore,
      bestScore,
      quizzesThisWeek,
      scoreOverTime,
      perQuiz,
      mostMissed,
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
