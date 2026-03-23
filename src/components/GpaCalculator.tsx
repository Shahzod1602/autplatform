"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.3,
  "A": 4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B": 3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C": 2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D": 1.0,
  "D-": 0.7,
  "F": 0.0,
};

interface GpaEntry {
  id: string;
  courseName: string;
  credits: number;
  grade: string;
  semester: string;
}

function calcGpa(entries: GpaEntry[]): number {
  const totalPoints = entries.reduce((sum, e) => sum + (GRADE_POINTS[e.grade] ?? 0) * e.credits, 0);
  const totalCredits = entries.reduce((sum, e) => sum + e.credits, 0);
  return totalCredits === 0 ? 0 : totalPoints / totalCredits;
}

function clampNumber(value: string, fallback: number): number {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return parsed;
}

export default function GpaCalculator() {
  const [entries, setEntries] = useState<GpaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showGpaResult, setShowGpaResult] = useState(false);

  const [newCourse, setNewCourse] = useState({
    courseName: "",
    credits: "6",
    grade: "A",
  });

  const [planner, setPlanner] = useState({
    currentGpa: "2.8",
    targetGpa: "3",
    currentCredits: "25",
    additionalCredits: "15",
  });
  const [plannerResult, setPlannerResult] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/gpa")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const gpa = useMemo(() => calcGpa(entries), [entries]);
  const totalCredits = useMemo(() => entries.reduce((s, e) => s + e.credits, 0), [entries]);

  async function addEntry() {
    if (!newCourse.courseName.trim()) return;

    setSaving(true);
    const res = await fetch("/api/gpa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        courseName: newCourse.courseName,
        credits: newCourse.credits,
        grade: newCourse.grade,
        semester: "Current",
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setEntries((prev) => [...prev, data]);
      setNewCourse({ courseName: "", credits: "6", grade: "A" });
    }

    setSaving(false);
  }

  async function deleteEntry(id: string) {
    await fetch(`/api/gpa/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function calculatePlanningGpa() {
    const currentGpa = clampNumber(planner.currentGpa, 0);
    const targetGpa = clampNumber(planner.targetGpa, 0);
    const currentCredits = clampNumber(planner.currentCredits, 0);
    const additionalCredits = clampNumber(planner.additionalCredits, 0);

    if (currentCredits < 0 || additionalCredits <= 0) {
      setPlannerResult("Credits qiymati noto'g'ri. Additional credits 0 dan katta bo'lishi kerak.");
      return;
    }

    const requiredPoints = targetGpa * (currentCredits + additionalCredits) - currentGpa * currentCredits;
    const requiredGpa = requiredPoints / additionalCredits;

    if (requiredGpa <= 0) {
      setPlannerResult(`Maqsadga yetish uchun kamida 0.00 GPA kifoya (allaqachon ${targetGpa.toFixed(2)} yoki undan yuqori).`);
      return;
    }

    if (requiredGpa > 4.3) {
      setPlannerResult(`Imkonsiz: kerakli GPA ${requiredGpa.toFixed(2)} (maksimal 4.30 dan yuqori).`);
      return;
    }

    setPlannerResult(`Kelgusi ${additionalCredits} kredit uchun kerakli o'rtacha GPA: ${requiredGpa.toFixed(2)}`);
  }

  if (loading) return null;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 md:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">Academic Tools</p>
          <h2 className="mt-1 text-lg font-semibold md:text-xl">GPA Calculator</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
            Course baholaringizni kiriting va joriy GPA natijasini ko‘ring.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
          4.3 scale
        </span>
      </div>

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-900/50 md:p-4">
        <div className="overflow-x-auto">
          <div className="mb-2 min-w-[620px] grid grid-cols-12 gap-2 text-xs font-semibold text-gray-600 dark:text-slate-300 md:text-sm">
            <div className="col-span-6">Course</div>
            <div className="col-span-3">Credits</div>
            <div className="col-span-3">Grade</div>
          </div>

          <div className="space-y-2 min-w-[620px]">
          {entries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-12 gap-2 items-center">
              <input
                value={entry.courseName}
                readOnly
                className="col-span-6 h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <input
                value={entry.credits}
                readOnly
                className="col-span-3 h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
              <div className="col-span-3 flex items-center gap-2">
                <select
                  value={entry.grade}
                  disabled
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  {Object.keys(GRADE_POINTS).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="h-10 w-10 shrink-0 rounded-md border border-gray-300 bg-white text-gray-500 transition hover:text-red-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  aria-label="Delete course"
                >
                  <Trash2 className="mx-auto h-5 w-5" />
                </button>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-12 gap-2 items-center">
            <input
              placeholder="Data Structures"
              value={newCourse.courseName}
              onChange={(e) => setNewCourse((prev) => ({ ...prev, courseName: e.target.value }))}
              className="col-span-6 h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <input
              type="number"
              min="1"
              max="30"
              value={newCourse.credits}
              onChange={(e) => setNewCourse((prev) => ({ ...prev, credits: e.target.value }))}
              className="col-span-3 h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
            <select
              value={newCourse.grade}
              onChange={(e) => setNewCourse((prev) => ({ ...prev, grade: e.target.value }))}
              className="col-span-3 h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              {Object.keys(GRADE_POINTS).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            onClick={addEntry}
            disabled={saving || !newCourse.courseName.trim()}
            className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : "Add Course"}
          </button>
          <button
            onClick={() => setShowGpaResult(true)}
            className="h-10 rounded-md bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Calculate GPA
          </button>
          <button
            onClick={() => {
              setShowGpaResult(false);
              setPlannerResult(null);
            }}
            className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            Clear
          </button>
        </div>

        {showGpaResult && (
          <div className="mt-4 grid gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-500/40 dark:bg-blue-500/10">
            <div className="font-semibold text-blue-900 dark:text-blue-200">Current GPA: {gpa.toFixed(2)}</div>
            <div className="text-blue-800 dark:text-blue-100">Total Credits: {totalCredits}</div>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-900/50 md:p-4">
        <h3 className="text-base font-semibold md:text-lg">GPA Planning</h3>
        <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
          Kelgusi kreditlar bo‘yicha kerakli o‘rtacha GPA ni hisoblang.
        </p>

        <div className="mt-3">
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2 md:gap-4">
              <label className="text-sm text-gray-600 dark:text-slate-300">Current GPA</label>
              <input
                value={planner.currentGpa}
                onChange={(e) => setPlanner((prev) => ({ ...prev, currentGpa: e.target.value }))}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2 md:gap-4">
              <label className="text-sm text-gray-600 dark:text-slate-300">Target GPA</label>
              <input
                value={planner.targetGpa}
                onChange={(e) => setPlanner((prev) => ({ ...prev, targetGpa: e.target.value }))}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2 md:gap-4">
              <label className="text-sm text-gray-600 dark:text-slate-300">Current Credits</label>
              <input
                value={planner.currentCredits}
                onChange={(e) => setPlanner((prev) => ({ ...prev, currentCredits: e.target.value }))}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-2 md:gap-4">
              <label className="text-sm text-gray-600 dark:text-slate-300">Additional Credits</label>
              <input
                value={planner.additionalCredits}
                onChange={(e) => setPlanner((prev) => ({ ...prev, additionalCredits: e.target.value }))}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3 flex-wrap">
            <button
              onClick={calculatePlanningGpa}
              className="h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Calculate
            </button>
            <button
              onClick={() => setPlannerResult(null)}
              className="h-10 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              Clear
            </button>
          </div>

          {plannerResult && (
            <div className="mt-4 rounded-md border border-gray-200 bg-white p-3 text-sm text-gray-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
              {plannerResult}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-slate-700 dark:bg-slate-900/50 md:p-4">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-200">Grade Points (4.3 Scale)</h4>
        <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600 dark:text-slate-300 md:grid-cols-4 md:text-sm">
          {Object.entries(GRADE_POINTS).map(([grade, points]) => (
            <li key={grade}>
              {grade} = {points.toFixed(1)} grade point{points === 1 ? "" : "s"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
