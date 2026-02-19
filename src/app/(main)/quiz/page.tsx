"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Upload,
  BrainCircuit,
  Trash2,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import { useT } from "@/lib/useLocale";

interface Quiz {
  id: string;
  title: string;
  fileName: string;
  fileSize: number;
  status: string;
  createdAt: string;
  _count: {
    flashcards: number;
    mcqs: number;
    openQuestions: number;
  };
}

export default function QuizDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useT();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [flashcardCount, setFlashcardCount] = useState(10);
  const [mcqCount, setMcqCount] = useState(10);
  const [openQuestionCount, setOpenQuestionCount] = useState(5);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quiz");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchQuizzes();
  }, [session]);

  useEffect(() => {
    const hasGenerating = quizzes.some((q) => q.status === "GENERATING");
    if (hasGenerating) {
      pollRef.current = setInterval(fetchQuizzes, 3000);
    } else if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [quizzes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) return;
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/quiz/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        alert(uploadData.error);
        setSubmitting(false);
        return;
      }

      const quizRes = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          fileName: uploadData.fileName,
          fileUrl: uploadData.fileUrl,
          fileSize: uploadData.fileSize,
          flashcardCount,
          mcqCount,
          openQuestionCount,
        }),
      });
      const quizData = await quizRes.json();

      if (!quizRes.ok) {
        alert(quizData.error);
        setSubmitting(false);
        return;
      }

      fetch("/api/quiz/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId: quizData.id }),
      });

      setTitle("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchQuizzes();
    } catch {
      alert("Something went wrong");
    }
    setSubmitting(false);
  };

  const handleDelete = async (quizId: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await fetch(`/api/quiz/${quizId}`, { method: "DELETE" });
      fetchQuizzes();
    } catch {
      // ignore
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const statusBadge = (s: string) => {
    switch (s) {
      case "READY":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full">
            <CheckCircle className="w-3 h-3" /> {t("quizReady")}
          </span>
        );
      case "GENERATING":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full">
            <Loader2 className="w-3 h-3 animate-spin" /> {t("quizGenerating")}
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full">
            <XCircle className="w-3 h-3" /> {t("quizFailed")}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 bg-gray-50 dark:bg-slate-700 dark:text-gray-300 px-2 py-1 rounded-full">
            <Clock className="w-3 h-3" /> {t("quizPending")}
          </span>
        );
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-blue-600" />
          {t("quizDashboard")}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t("quizDashboardDesc")}</p>
      </div>

      {/* Upload Form */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("quizTitle")}
              </label>
              <input
                type="text"
                placeholder={t("quizTitlePlaceholder")}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("uploadLesson")}
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.pptx,.docx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 dark:text-gray-300"
                required
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t("acceptedFormats")}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("flashcardCountLabel")}
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={flashcardCount}
                onChange={(e) => setFlashcardCount(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("mcqCountLabel")}
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={mcqCount}
                onChange={(e) => setMcqCount(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t("openQuestionCountLabel")}
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={openQuestionCount}
                onChange={(e) => setOpenQuestionCount(Math.max(1, Math.min(30, Number(e.target.value))))}
                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={submitting || !file || !title.trim()}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {t("generating")}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" /> {t("generateQuiz")}
              </>
            )}
          </button>
        </form>
      </div>

      {/* Quiz List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t("myQuizzes")}</h2>
        {quizzes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    {quiz.status === "READY" ? (
                      <Link href={`/quiz/${quiz.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors block truncate">
                        {quiz.title}
                      </Link>
                    ) : (
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{quiz.title}</p>
                    )}
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {quiz.fileName} &middot; {formatFileSize(quiz.fileSize)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(quiz.id)}
                    className="text-gray-400 hover:text-red-500 p-1 rounded transition ml-2"
                    title={t("deleteQuiz")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  {statusBadge(quiz.status)}
                  {quiz.status === "READY" && (
                    <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{quiz._count.flashcards} {t("flashcards")}</span>
                      <span>{quiz._count.mcqs} MCQ</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-3">
                  {new Date(quiz.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
            <BrainCircuit className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-gray-500">{t("noQuizzes")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
