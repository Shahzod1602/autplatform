"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { useT } from "@/lib/useLocale";

interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

export default function FlashcardViewer({ flashcards }: { flashcards: Flashcard[] }) {
  const t = useT();
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (flashcards.length === 0) return null;

  const card = flashcards[current];

  const goNext = () => {
    setFlipped(false);
    setCurrent((prev) => (prev + 1) % flashcards.length);
  };

  const goPrev = () => {
    setFlipped(false);
    setCurrent((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className="w-full max-w-lg cursor-pointer mb-6"
        style={{ perspective: "1000px" }}
        onClick={() => setFlipped(!flipped)}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "250px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-200 p-8 flex flex-col items-center justify-center"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Term</p>
            <p className="text-xl font-semibold text-gray-900 text-center">{card.term}</p>
            <p className="text-xs text-gray-400 mt-6">{t("flipCard")}</p>
          </div>
          {/* Back */}
          <div
            className="absolute inset-0 bg-blue-50 rounded-xl shadow-sm border border-blue-200 p-8 flex flex-col items-center justify-center"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-xs text-blue-500 uppercase tracking-wide mb-3">Definition</p>
            <p className="text-gray-800 text-center leading-relaxed">{card.definition}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={goPrev}
          className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          <ChevronLeft className="w-4 h-4" /> {t("prev")}
        </button>
        <span className="text-sm text-gray-500">
          {current + 1} / {flashcards.length}
        </span>
        <button
          onClick={goNext}
          className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
        >
          {t("next")} <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => setFlipped(false)}
          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
