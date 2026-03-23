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
    <div className="rounded-xl border border-[#d4d4d4] bg-[#efefef] p-4 md:p-8 text-[#1f1f1f]">
      <p className="text-[13px] md:text-[18px] text-[#2d5f95]">home / other / gpa calculator</p>

      <h2 className="mt-2 text-[42px] leading-none md:text-[56px] font-bold text-[#173a70]">GPA Calculator</h2>
      <p className="mt-4 max-w-[1080px] text-[24px] leading-[1.08] md:text-[44px]">
        Use this calculator to calculate grade point average (GPA) and generate a GPA report.
      </p>

      <div className="mt-5 max-w-[980px] bg-[#446b9d] px-4 py-2 text-center text-white text-[14px] md:text-[40px]">
        Modify the values and click the Calculate button to use
      </div>

      <div className="mt-2 max-w-[980px] border border-[#c8c8c8] bg-[#e5e5e5] p-3 md:p-6">
        <div className="mb-2 grid grid-cols-12 gap-2 md:gap-3 text-[15px] md:text-[40px] font-semibold">
          <div className="col-span-6">Course (optional)</div>
          <div className="col-span-3">Credits</div>
          <div className="col-span-3">Grade</div>
        </div>

        <div className="space-y-3">
          {entries.map((entry) => (
            <div key={entry.id} className="grid grid-cols-12 gap-2 md:gap-3 items-center">
              <input
                value={entry.courseName}
                readOnly
                className="col-span-6 h-11 md:h-[62px] rounded border-2 border-[#476ea0] bg-white px-2 md:px-3 text-base md:text-[34px]"
              />
              <input
                value={entry.credits}
                readOnly
                className="col-span-3 h-11 md:h-[62px] rounded border-2 border-[#476ea0] bg-white px-2 md:px-3 text-base md:text-[34px]"
              />
              <div className="col-span-3 flex items-center gap-2">
                <select
                  value={entry.grade}
                  disabled
                  className="h-11 md:h-[62px] w-full rounded border-2 border-[#476ea0] bg-white px-2 md:px-3 text-base md:text-[34px]"
                >
                  {Object.keys(GRADE_POINTS).map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="h-11 w-11 md:h-[62px] md:w-[62px] shrink-0 rounded border border-gray-300 bg-white text-gray-500 hover:text-red-600"
                  aria-label="Delete course"
                >
                  <Trash2 className="mx-auto h-5 w-5 md:h-6 md:w-6" />
                </button>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-12 gap-2 md:gap-3 items-center">
            <input
              placeholder="Data structure"
              value={newCourse.courseName}
              onChange={(e) => setNewCourse((prev) => ({ ...prev, courseName: e.target.value }))}
              className="col-span-6 h-11 md:h-[62px] rounded border-2 border-[#476ea0] bg-white px-2 md:px-3 text-base md:text-[34px]"
            />
            <input
              type="number"
              min="1"
              max="30"
              value={newCourse.credits}
              onChange={(e) => setNewCourse((prev) => ({ ...prev, credits: e.target.value }))}
              className="col-span-3 h-11 md:h-[62px] rounded border-2 border-[#476ea0] bg-white px-2 md:px-3 text-base md:text-[34px]"
            />
            <select
              value={newCourse.grade}
              onChange={(e) => setNewCourse((prev) => ({ ...prev, grade: e.target.value }))}
              className="col-span-3 h-11 md:h-[62px] rounded border-2 border-[#476ea0] bg-white px-2 md:px-3 text-base md:text-[34px]"
            >
              {Object.keys(GRADE_POINTS).map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={addEntry}
            disabled={saving || !newCourse.courseName.trim()}
            className="text-[14px] md:text-[36px] text-[#2f6094] underline disabled:text-gray-400"
          >
            + add more courses
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-2 md:gap-3">
          <button
            onClick={addEntry}
            disabled={saving || !newCourse.courseName.trim()}
            className="h-11 md:h-[68px] rounded bg-[#5b8634] px-5 md:px-10 text-base md:text-[36px] font-bold text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Calculate"}
          </button>
          <button
            onClick={() => setShowGpaResult(true)}
            className="h-11 md:h-[68px] rounded bg-[#5b8634] px-5 md:px-10 text-base md:text-[36px] font-bold text-white"
          >
            Recalculate
          </button>
          <button
            onClick={() => {
              setShowGpaResult(false);
              setPlannerResult(null);
            }}
            className="h-11 md:h-[68px] rounded bg-[#b8b8b8] px-5 md:px-10 text-base md:text-[36px] font-bold text-white"
          >
            Clear
          </button>
        </div>

        {showGpaResult && (
          <div className="mt-6 rounded border border-[#476ea0] bg-white p-4 text-base md:text-[30px]">
            <div className="font-semibold text-[#123d74]">Current GPA: {gpa.toFixed(2)}</div>
            <div className="text-gray-700">Total Credits: {totalCredits}</div>
          </div>
        )}
      </div>

      <div className="mt-14 max-w-[980px]">
        <h3 className="text-[30px] leading-none md:text-[56px] font-bold text-[#173a70]">GPA Planning Calculator</h3>
        <p className="mt-3 text-[18px] leading-[1.08] md:text-[44px]">
          The calculator can be used to determine the minimum GPA required in future courses to raise GPA to desired
          level or maintain the GPA above a certain level.
        </p>

        <div className="mt-4 border border-[#c8c8c8] bg-[#e5e5e5] p-4 md:p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="text-[16px] md:text-[40px]">Current GPA</label>
              <input
                value={planner.currentGpa}
                onChange={(e) => setPlanner((prev) => ({ ...prev, currentGpa: e.target.value }))}
                className="h-11 md:h-[70px] rounded border-2 border-[#476ea0] bg-white px-2 md:px-3 text-base md:text-[34px]"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="text-[16px] md:text-[40px]">Target GPA</label>
              <input
                value={planner.targetGpa}
                onChange={(e) => setPlanner((prev) => ({ ...prev, targetGpa: e.target.value }))}
                className="h-11 md:h-[70px] rounded border-2 border-[#476ea0] bg-white px-2 md:px-3 text-base md:text-[34px]"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="text-[16px] md:text-[40px]">Current Credits</label>
              <input
                value={planner.currentCredits}
                onChange={(e) => setPlanner((prev) => ({ ...prev, currentCredits: e.target.value }))}
                className="h-11 md:h-[70px] rounded border-2 border-[#476ea0] bg-white px-2 md:px-3 text-base md:text-[34px]"
              />
            </div>
            <div className="grid grid-cols-2 items-center gap-4">
              <label className="text-[16px] md:text-[40px]">Additional Credits</label>
              <input
                value={planner.additionalCredits}
                onChange={(e) => setPlanner((prev) => ({ ...prev, additionalCredits: e.target.value }))}
                className="h-11 md:h-[70px] rounded border-2 border-[#476ea0] bg-white px-2 md:px-3 text-base md:text-[34px]"
              />
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button
              onClick={calculatePlanningGpa}
              className="h-11 md:h-[68px] rounded bg-[#5b8634] px-5 md:px-10 text-base md:text-[36px] font-bold text-white"
            >
              Calculate
            </button>
            <button
              onClick={() => setPlannerResult(null)}
              className="h-11 md:h-[68px] rounded bg-[#b8b8b8] px-5 md:px-10 text-base md:text-[36px] font-bold text-white"
            >
              Clear
            </button>
          </div>

          {plannerResult && <div className="mt-4 rounded bg-white p-3 text-sm md:text-[28px] text-gray-800">{plannerResult}</div>}
        </div>

        <div className="mt-6 border border-[#d5d5d5] bg-[#dfdfdf] p-3 md:p-4">
          <div className="inline-block bg-[#40699d] px-3 py-1 text-white text-[14px] md:text-[32px]">Grade Calculator</div>
        </div>
      </div>

      <div className="mt-12 max-w-[980px] rounded border border-[#d0d0d0] bg-white p-4">
        <h4 className="text-[18px] md:text-[40px] font-semibold text-[#123d74]">Grade Points (4.3 Scale)</h4>
        <ul className="mt-3 space-y-1 text-[16px] md:text-[38px] leading-[1.05]">
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
