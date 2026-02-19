"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Layers,
  ListChecks,
  MessageSquare,
  Trash2,
} from "lucide-react";
import { useT } from "@/lib/useLocale";
import FlashcardViewer from "@/components/quiz/FlashcardViewer";
import MCQViewer from "@/components/quiz/MCQViewer";
import OpenQuestionViewer from "@/components/quiz/OpenQuestionViewer";

interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

interface MCQ {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

interface OpenQuestion {
  id: string;
  question: string;
  modelAnswer: string;
}

interface QuizDetail {
  id: string;
  title: string;
  fileName: string;
  status: string;
  createdAt: string;
  flashcards: Flashcard[];
  mcqs: MCQ[];
  openQuestions: OpenQuestion[];
}

type TabType = "flashcards" | "mcq" | "open";

export default function QuizViewerPage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useT();
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("flashcards");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch(`/api/quiz/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data) => {
          setQuiz(data);
          setLoading(false);
        })
        .catch(() => router.push("/quiz"));
    }
  }, [session, id, router]);

  const handleDelete = async () => {
    if (!confirm(t("confirmDelete"))) return;
    await fetch(`/api/quiz/${id}`, { method: "DELETE" });
    router.push("/quiz");
  };

  if (status === "loading" || loading || !quiz) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: typeof Layers; count: number }[] = [
    { key: "flashcards", label: t("flashcards"), icon: Layers, count: quiz.flashcards.length },
    { key: "mcq", label: t("multipleChoice"), icon: ListChecks, count: quiz.mcqs.length },
    { key: "open", label: t("openQuestions"), icon: MessageSquare, count: quiz.openQuestions.length },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/quiz" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> {t("goBack")}
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {quiz.fileName} &middot; {new Date(quiz.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-3 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition text-sm"
          >
            <Trash2 className="w-4 h-4" /> {t("deleteQuiz")}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {tabs.map((tc) => (
            <button
              key={tc.key}
              onClick={() => setTab(tc.key)}
              className={`flex items-center gap-2 pb-3 border-b-2 transition text-sm font-medium ${
                tab === tc.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <tc.icon className="w-4 h-4" />
              {tc.label}
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {tc.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {tab === "flashcards" && <FlashcardViewer flashcards={quiz.flashcards} />}
      {tab === "mcq" && <MCQViewer mcqs={quiz.mcqs} />}
      {tab === "open" && <OpenQuestionViewer questions={quiz.openQuestions} />}
    </div>
  );
}
