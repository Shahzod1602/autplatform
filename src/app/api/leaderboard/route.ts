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

    const currentUserId = (session.user as { id: string }).id;

    const results = await prisma.$queryRaw<
      { userId: string; name: string; quizCount: number; avgScore: number; bestScore: number }[]
    >`
      SELECT
        qa."userId",
        u."name",
        COUNT(*) as quizCount,
        ROUND(AVG(qa."score" * 100.0 / qa."totalQuestions"), 1) as avgScore,
        MAX(ROUND(qa."score" * 100.0 / qa."totalQuestions", 1)) as bestScore
      FROM "QuizAttempt" qa
      JOIN "User" u ON u."id" = qa."userId"
      WHERE qa."totalQuestions" > 0
      GROUP BY qa."userId", u."name"
      ORDER BY avgScore DESC
      LIMIT 50
    `;

    const leaderboard = results.map((r, i) => ({
      rank: i + 1,
      userId: r.userId,
      name: r.name,
      quizCount: Number(r.quizCount),
      avgScore: Number(r.avgScore),
      bestScore: Number(r.bestScore),
      isCurrentUser: r.userId === currentUserId,
    }));

    return NextResponse.json(leaderboard);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
