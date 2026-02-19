"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useT } from "@/lib/useLocale";

interface OpenQuestion {
  id: string;
  question: string;
  modelAnswer: string;
}

export default function OpenQuestionViewer({ questions }: { questions: OpenQuestion[] }) {
  const t = useT();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  if (questions.length === 0) return null;

  const toggle = (id: string) => {
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {questions.map((q, i) => (
        <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-xs text-gray-400 mb-2">Question {i + 1}</p>
          <p className="text-gray-900 font-medium mb-4">{q.question}</p>

          <button
            onClick={() => toggle(q.id)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 transition"
          >
            {revealed.has(q.id) ? (
              <>
                <EyeOff className="w-4 h-4" /> {t("hideAnswer")}
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" /> {t("showAnswer")}
              </>
            )}
          </button>

          {revealed.has(q.id) && (
            <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{q.modelAnswer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
