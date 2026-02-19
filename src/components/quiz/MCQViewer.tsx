"use client";

import { useState } from "react";
import { CheckCircle, XCircle, ChevronLeft, ChevronRight } from "lucide-react";
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

export default function MCQViewer({ mcqs }: { mcqs: MCQ[] }) {
  const t = useT();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  if (mcqs.length === 0) return null;

  const q = mcqs[current];
  const options = [
    { key: "A", text: q.optionA },
    { key: "B", text: q.optionB },
    { key: "C", text: q.optionC },
    { key: "D", text: q.optionD },
  ];

  const goNext = () => {
    setSelected(null);
    setCurrent((prev) => (prev + 1) % mcqs.length);
  };

  const goPrev = () => {
    setSelected(null);
    setCurrent((prev) => (prev - 1 + mcqs.length) % mcqs.length);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Question */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-4">
        <p className="text-xs text-gray-400 mb-2">
          Question {current + 1} / {mcqs.length}
        </p>
        <p className="text-lg font-medium text-gray-900 mb-6">{q.question}</p>

        {/* Options */}
        <div className="space-y-3">
          {options.map((opt) => {
            let className =
              "w-full text-left px-4 py-3 rounded-lg border transition flex items-center gap-3";

            if (!selected) {
              className += " border-gray-200 hover:border-blue-300 hover:bg-blue-50";
            } else if (opt.key === q.correctOption) {
              className += " border-green-400 bg-green-50 text-green-800";
            } else if (opt.key === selected && opt.key !== q.correctOption) {
              className += " border-red-400 bg-red-50 text-red-800";
            } else {
              className += " border-gray-100 text-gray-400";
            }

            return (
              <button
                key={opt.key}
                onClick={() => !selected && setSelected(opt.key)}
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
          <p className={`mt-4 text-sm font-medium ${selected === q.correctOption ? "text-green-600" : "text-red-600"}`}>
            {selected === q.correctOption ? t("correct") : t("incorrect")}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={goPrev}
          className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> {t("prev")}
        </button>
        <span className="text-sm text-gray-500">
          {current + 1} / {mcqs.length}
        </span>
        <button
          onClick={goNext}
          className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          {t("next")} <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
