"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Layers, ListChecks, MessageSquare, BookOpen } from "lucide-react";
import { useT } from "@/lib/useLocale";
import FlashcardViewer from "@/components/quiz/FlashcardViewer";
import MCQViewer from "@/components/quiz/MCQViewer";
import OpenQuestionViewer from "@/components/quiz/OpenQuestionViewer";

interface QuizData {
  id: string;
  title: string;
  flashcards: { id: string; term: string; definition: string }[];
  mcqs: {
    id: string;
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOption: string;
  }[];
  openQuestions: { id: string; question: string; modelAnswer: string }[];
}

type TabType = "flashcards" | "mcq" | "open";

export default function SharedQuizPage() {
  const { token } = useParams();
  const t = useT();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState<TabType>("flashcards");

  useEffect(() => {
    fetch(`/api/quiz/share/${token}`)
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((data) => {
        setQuiz(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Quiz not found or link expired</p>
        </div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: typeof Layers; count: number }[] = [
    { key: "flashcards", label: t("flashcards"), icon: Layers, count: quiz.flashcards.length },
    { key: "mcq", label: t("multipleChoice"), icon: ListChecks, count: quiz.mcqs.length },
    { key: "open", label: t("openQuestions"), icon: MessageSquare, count: quiz.openQuestions.length },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <nav className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <span className="font-bold text-gray-900 dark:text-white">AUT Platform</span>
          <span className="text-gray-400 mx-2">|</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">{t("sharedQuiz")}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{quiz.title}</h1>
        </div>

        <div className="border-b border-gray-200 dark:border-slate-700 mb-6">
          <div className="flex gap-6">
            {tabs.map((tc) => (
              <button
                key={tc.key}
                onClick={() => setTab(tc.key)}
                className={`flex items-center gap-2 pb-3 border-b-2 transition text-sm font-medium ${
                  tab === tc.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <tc.icon className="w-4 h-4" />
                {tc.label}
                <span className="bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                  {tc.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {tab === "flashcards" && <FlashcardViewer flashcards={quiz.flashcards} />}
        {tab === "mcq" && <MCQViewer mcqs={quiz.mcqs} />}
        {tab === "open" && <OpenQuestionViewer questions={quiz.openQuestions} />}
      </main>
    </div>
  );
}
