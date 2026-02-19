import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
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
      include: {
        flashcards: { orderBy: { sortOrder: "asc" } },
        mcqs: { orderBy: { sortOrder: "asc" } },
        openQuestions: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(quiz.title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
    h1 { font-size: 28px; margin-bottom: 8px; color: #1e40af; }
    h2 { font-size: 20px; margin: 32px 0 16px; padding-bottom: 8px; border-bottom: 2px solid #3b82f6; color: #1e40af; }
    .subtitle { color: #6b7280; font-size: 14px; margin-bottom: 32px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    th, td { border: 1px solid #d1d5db; padding: 10px 14px; text-align: left; font-size: 14px; }
    th { background: #eff6ff; font-weight: 600; color: #1e40af; }
    .mcq { margin-bottom: 24px; page-break-inside: avoid; }
    .mcq-q { font-weight: 600; margin-bottom: 8px; font-size: 15px; }
    .mcq-opt { margin-left: 20px; margin-bottom: 4px; font-size: 14px; }
    .mcq-opt.correct { color: #059669; font-weight: 600; }
    .oq { margin-bottom: 24px; page-break-inside: avoid; }
    .oq-q { font-weight: 600; margin-bottom: 6px; font-size: 15px; }
    .oq-a { background: #f0f9ff; padding: 12px; border-radius: 6px; border-left: 3px solid #3b82f6; font-size: 14px; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>${escapeHtml(quiz.title)}</h1>
  <p class="subtitle">${escapeHtml(quiz.fileName)} &middot; ${new Date(quiz.createdAt).toLocaleDateString()}</p>

  ${quiz.flashcards.length > 0 ? `
  <h2>Flashcards (${quiz.flashcards.length})</h2>
  <table>
    <thead><tr><th>#</th><th>Term</th><th>Definition</th></tr></thead>
    <tbody>
      ${quiz.flashcards.map((f, i) => `
        <tr><td>${i + 1}</td><td>${escapeHtml(f.term)}</td><td>${escapeHtml(f.definition)}</td></tr>
      `).join("")}
    </tbody>
  </table>` : ""}

  ${quiz.mcqs.length > 0 ? `
  <h2>Multiple Choice (${quiz.mcqs.length})</h2>
  ${quiz.mcqs.map((m, i) => `
    <div class="mcq">
      <div class="mcq-q">${i + 1}. ${escapeHtml(m.question)}</div>
      <div class="mcq-opt${m.correctOption === "A" ? " correct" : ""}">A) ${escapeHtml(m.optionA)}${m.correctOption === "A" ? " ✓" : ""}</div>
      <div class="mcq-opt${m.correctOption === "B" ? " correct" : ""}">B) ${escapeHtml(m.optionB)}${m.correctOption === "B" ? " ✓" : ""}</div>
      <div class="mcq-opt${m.correctOption === "C" ? " correct" : ""}">C) ${escapeHtml(m.optionC)}${m.correctOption === "C" ? " ✓" : ""}</div>
      <div class="mcq-opt${m.correctOption === "D" ? " correct" : ""}">D) ${escapeHtml(m.optionD)}${m.correctOption === "D" ? " ✓" : ""}</div>
    </div>
  `).join("")}` : ""}

  ${quiz.openQuestions.length > 0 ? `
  <h2>Open Questions (${quiz.openQuestions.length})</h2>
  ${quiz.openQuestions.map((q, i) => `
    <div class="oq">
      <div class="oq-q">${i + 1}. ${escapeHtml(q.question)}</div>
      <div class="oq-a">${escapeHtml(q.modelAnswer)}</div>
    </div>
  `).join("")}` : ""}
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Content-Disposition": `attachment; filename="${quiz.title.replace(/[^a-zA-Z0-9]/g, "_")}.html"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
