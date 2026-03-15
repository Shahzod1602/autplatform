"use client";

import { useEffect, useState } from "react";
import { Trash2, Plus, GraduationCap, TrendingUp } from "lucide-react";

const GRADE_POINTS: Record<string, number> = {
  "A+": 4.33,
  "A":  4.00,
  "A-": 3.67,
  "B+": 3.33,
  "B":  3.00,
  "B-": 2.67,
  "C+": 2.33,
  "C":  2.00,
  "C-": 1.67,
  "D+": 1.33,
  "D":  1.00,
  "F":  0.00,
};

const GRADE_COLORS: Record<string, string> = {
  "A+": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "A":  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "A-": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "B+": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "B":  "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "B-": "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400",
  "C+": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "C":  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  "C-": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  "D+": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "D":  "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  "F":  "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
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

function gpaColor(gpa: number): string {
  if (gpa >= 3.7) return "text-emerald-600 dark:text-emerald-400";
  if (gpa >= 3.0) return "text-blue-600 dark:text-blue-400";
  if (gpa >= 2.0) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

export default function GpaCalculator() {
  const [entries, setEntries] = useState<GpaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ courseName: "", credits: "3", grade: "A", semester: "Current" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/gpa")
      .then((r) => r.json())
      .then((data) => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function addEntry() {
    if (!form.courseName.trim()) return;
    setSaving(true);
    const res = await fetch("/api/gpa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setEntries((prev) => [...prev, data]);
    setForm({ courseName: "", credits: "3", grade: "A", semester: form.semester });
    setShowForm(false);
    setSaving(false);
  }

  async function deleteEntry(id: string) {
    await fetch(`/api/gpa/${id}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const semesters = [...new Set(entries.map((e) => e.semester))];
  const gpa = calcGpa(entries);
  const totalCredits = entries.reduce((s, e) => s + e.credits, 0);

  if (loading) return null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">GPA Calculator</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">ASU 4.33 Scale</p>
          </div>
        </div>

        {/* GPA Badge */}
        {entries.length > 0 && (
          <div className="text-right">
            <div className={`text-3xl font-bold ${gpaColor(gpa)}`}>{gpa.toFixed(2)}</div>
            <div className="text-xs text-gray-400 dark:text-gray-500">{totalCredits} credits</div>
          </div>
        )}
      </div>

      {/* Semester groups */}
      {entries.length > 0 && (
        <div className="p-6 space-y-6">
          {semesters.map((sem) => {
            const semEntries = entries.filter((e) => e.semester === sem);
            const semGpa = calcGpa(semEntries);
            return (
              <div key={sem}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{sem}</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                    <span className={`text-sm font-semibold ${gpaColor(semGpa)}`}>{semGpa.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {semEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-slate-700/50 rounded-lg px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-md flex-shrink-0 ${GRADE_COLORS[entry.grade] ?? ""}`}>
                          {entry.grade}
                        </span>
                        <span className="text-sm text-gray-800 dark:text-gray-200 truncate">{entry.courseName}</span>
                      </div>
                      <div className="flex items-center gap-3 ml-2 flex-shrink-0">
                        <span className="text-xs text-gray-400">{entry.credits} cr</span>
                        <span className="text-xs text-gray-400">{GRADE_POINTS[entry.grade]?.toFixed(2)}</span>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && !showForm && (
        <div className="p-10 text-center">
          <GraduationCap className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-400 dark:text-gray-500">Hali kurslar qo&apos;shilmagan</p>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <div className="p-6 border-t border-gray-100 dark:border-slate-700 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <input
                type="text"
                placeholder="Kurs nomi (e.g. Calculus I)"
                value={form.courseName}
                onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Credit soat</label>
              <select
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {[1, 2, 3, 4, 5, 6].map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Baho</label>
              <select
                value={form.grade}
                onChange={(e) => setForm({ ...form, grade: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {Object.keys(GRADE_POINTS).map((g) => (
                  <option key={g} value={g}>{g} ({GRADE_POINTS[g].toFixed(2)})</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Semester</label>
              <input
                type="text"
                placeholder="e.g. Fall 2025"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={addEntry}
              disabled={saving || !form.courseName.trim()}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-medium py-2 rounded-lg transition"
            >
              {saving ? "Saqlanmoqda..." : "Qo'shish"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
            >
              Bekor
            </button>
          </div>
        </div>
      )}

      {/* Add button */}
      {!showForm && (
        <div className="px-6 pb-6 pt-2">
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-slate-600 hover:border-violet-400 dark:hover:border-violet-500 text-gray-400 dark:text-gray-500 hover:text-violet-600 dark:hover:text-violet-400 rounded-lg py-3 text-sm transition"
          >
            <Plus className="w-4 h-4" /> Kurs qo&apos;shish
          </button>
        </div>
      )}
    </div>
  );
}
