"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Trophy, Calendar, Target } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useT } from "@/lib/useLocale";

interface AnalyticsData {
  totalQuizzes: number;
  totalAttempts: number;
  averageScore: number;
  bestScore: number;
  quizzesThisWeek: number;
  scoreOverTime: { date: string; score: number; quiz: string }[];
  perQuiz: { title: string; avgScore: number }[];
  mostMissed: { question: string; count: number }[];
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useT();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/analytics")
        .then((res) => res.json())
        .then((d) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data || data.totalAttempts === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            {t("analytics")}
          </h1>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
          <BarChart3 className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-gray-500">{t("noAnalytics")}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: Target, label: t("totalQuizzes"), value: data.totalQuizzes, color: "text-blue-600" },
    { icon: TrendingUp, label: t("averageScore"), value: `${data.averageScore}%`, color: "text-green-600" },
    { icon: Trophy, label: t("bestScoreLabel"), value: `${data.bestScore}%`, color: "text-yellow-500" },
    { icon: Calendar, label: t("quizzesThisWeek"), value: data.quizzesThisWeek, color: "text-purple-600" },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-blue-600" />
          {t("analytics")}
        </h1>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5"
          >
            <card.icon className={`w-6 h-6 ${card.color} mb-2`} />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Score Over Time */}
        {data.scoreOverTime.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("scoreOverTime")}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.scoreOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, #fff)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#3b82f6" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Per Quiz Score */}
        {data.perQuiz.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-5">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t("perQuizScore")}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.perQuiz}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis dataKey="title" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--tooltip-bg, #fff)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "13px",
                  }}
                />
                <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Most Missed Questions */}
      {data.mostMissed.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t("mostMissed")}</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-slate-700/50">
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">#</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t("question")}</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{t("missCount")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {data.mostMissed.map((m, i) => (
                <tr key={i} className="hover:bg-gray-50 dark:hover:bg-slate-700/30">
                  <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{i + 1}</td>
                  <td className="px-5 py-3 text-sm text-gray-900 dark:text-white">{m.question}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
                      {m.count}x
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
