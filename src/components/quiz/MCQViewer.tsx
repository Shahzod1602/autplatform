"use client";

import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Trophy,
  RotateCcw,
  Save,
} from "lucide-react";
import { useT } from "@/lib/useLocale";

interface MCQ {
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

interface MCQViewerProps {
  mcqs: MCQ[];
  quizId?: string;
}

export default function MCQViewer({ mcqs, quizId }: MCQViewerProps) {
  const t = useT();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Map<string, string>>(new Map());
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [retryMode, setRetryMode] = useState(false);
  const [retryMcqs, setRetryMcqs] = useState<MCQ[]>([]);

  const activeMcqs = retryMode ? retryMcqs : mcqs;

  if (activeMcqs.length === 0) return null;

  const q = activeMcqs[current];
  const options = [
    { key: "A", text: q.optionA },
    { key: "B", text: q.optionB },
    { key: "C", text: q.optionC },
    { key: "D", text: q.optionD },
  ];

  const handleSelect = (key: string) => {
    if (selected) return;
    setSelected(key);
    setAnswers((prev) => new Map(prev).set(q.id, key));
  };

  const goNext = () => {
    setSelected(null);
    setCurrent((prev) => (prev + 1) % activeMcqs.length);
  };

  const goPrev = () => {
    setSelected(null);
    setCurrent((prev) => (prev - 1 + activeMcqs.length) % activeMcqs.length);
  };

  const handleFinish = () => {
    setFinished(true);
  };

  const score = activeMcqs.filter(
    (m) => answers.get(m.id) === m.correctOption
  ).length;
  const total = activeMcqs.length;
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const wrongMcqs = activeMcqs.filter(
    (m) => answers.has(m.id) && answers.get(m.id) !== m.correctOption
  );

  const handleSaveScore = async () => {
    if (!quizId) return;
    setSaving(true);
    try {
      const answersArr = activeMcqs
        .filter((m) => answers.has(m.id))
        .map((m) => ({
          mcqId: m.id,
          selected: answers.get(m.id),
          correct: answers.get(m.id) === m.correctOption,
        }));
      await fetch(`/api/quiz/${quizId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, totalQuestions: total, answers: answersArr }),
      });
      setSaved(true);
    } catch {
      // ignore
    }
    setSaving(false);
  };

  const handleRetry = () => {
    setRetryMcqs(wrongMcqs);
    setRetryMode(true);
    setFinished(false);
    setCurrent(0);
    setSelected(null);
    setAnswers(new Map());
    setSaved(false);
  };

  const handleBackToResults = () => {
    setRetryMode(false);
    setRetryMcqs([]);
    setFinished(true);
    setCurrent(0);
    setSelected(null);
  };

  if (finished) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t("scoreTitle")}</h2>
          <div className="text-5xl font-bold text-blue-600 mb-2">
            {percent}%
          </div>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {score}/{total} {t("questionsCorrect")}
          </p>

          <div className="flex justify-center gap-3 mb-6">
            {quizId && !saved && (
              <button
                onClick={handleSaveScore}
                disabled={saving}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "..." : t("saveScore")}
              </button>
            )}
            {saved && (
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" /> {t("scoreSaved")}
              </span>
            )}
            {wrongMcqs.length > 0 && (
              <button
                onClick={handleRetry}
                className="flex items-center gap-2 border border-orange-300 text-orange-600 px-5 py-2.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
              >
                <RotateCcw className="w-4 h-4" /> {t("retryWrong")} ({wrongMcqs.length})
              </button>
            )}
          </div>

          {wrongMcqs.length > 0 && (
            <div className="text-left mt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{t("wrongAnswers")}</h3>
              <div className="space-y-3">
                {wrongMcqs.map((m, i) => (
                  <div key={m.id} className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium mb-1">
                      {i + 1}. {m.question}
                    </p>
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Your answer: {answers.get(m.id)} &middot; Correct: {m.correctOption}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const answeredCount = activeMcqs.filter((m) => answers.has(m.id)).length;
  const allAnswered = answeredCount === activeMcqs.length;

  return (
    <div className="max-w-2xl mx-auto">
      {retryMode && (
        <button
          onClick={handleBackToResults}
          className="text-sm text-blue-600 hover:underline mb-4 flex items-center gap-1"
        >
          <ChevronLeft className="w-4 h-4" /> {t("backToResults")}
        </button>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 mb-4">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
          Question {current + 1} / {activeMcqs.length}
          {answeredCount > 0 && (
            <span className="ml-2 text-blue-500">({answeredCount} answered)</span>
          )}
        </p>
        <p className="text-lg font-medium text-gray-900 dark:text-white mb-6">{q.question}</p>

        <div className="space-y-3">
          {options.map((opt) => {
            let className =
              "w-full text-left px-4 py-3 rounded-lg border transition flex items-center gap-3";

            if (!selected) {
              className +=
                " border-gray-200 dark:border-slate-600 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 dark:text-gray-200";
            } else if (opt.key === q.correctOption) {
              className += " border-green-400 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300";
            } else if (opt.key === selected && opt.key !== q.correctOption) {
              className += " border-red-400 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300";
            } else {
              className += " border-gray-100 dark:border-slate-700 text-gray-400 dark:text-gray-500";
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleSelect(opt.key)}
                className={className}
                disabled={!!selected}
              >
                <span className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm font-semibold shrink-0">
                  {opt.key}
                </span>
                <span className="flex-1">{opt.text}</span>
                {selected && opt.key === q.correctOption && (
                  <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
                )}
                {selected && opt.key === selected && opt.key !== q.correctOption && (
                  <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {selected && (
          <p
            className={`mt-4 text-sm font-medium ${
              selected === q.correctOption ? "text-green-600" : "text-red-600"
            }`}
          >
            {selected === q.correctOption ? t("correct") : t("incorrect")}
          </p>
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goPrev}
          className="flex items-center gap-1 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition text-sm dark:text-gray-300"
        >
          <ChevronLeft className="w-4 h-4" /> {t("prev")}
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {current + 1} / {activeMcqs.length}
        </span>
        {current === activeMcqs.length - 1 && allAnswered ? (
          <button
            onClick={handleFinish}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
          >
            <Trophy className="w-4 h-4" /> {t("finishQuiz")}
          </button>
        ) : (
          <button
            onClick={goNext}
            className="flex items-center gap-1 px-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition text-sm dark:text-gray-300"
          >
            {t("next")} <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
