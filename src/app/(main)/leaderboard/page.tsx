"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trophy } from "lucide-react";
import { useT } from "@/lib/useLocale";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  quizCount: number;
  avgScore: number;
  bestScore: number;
  isCurrentUser: boolean;
}

const podiumStyles = {
  1: {
    gradient: "linear-gradient(to bottom, #facc15, #eab308)",
    borderColor: "#facc15",
    ringColor: "#facc15",
    height: 112,
    order: 2,
    medal: "🥇",
    label: "1st",
  },
  2: {
    gradient: "linear-gradient(to bottom, #d1d5db, #9ca3af)",
    borderColor: "#d1d5db",
    ringColor: "#d1d5db",
    height: 80,
    order: 1,
    medal: "🥈",
    label: "2nd",
  },
  3: {
    gradient: "linear-gradient(to bottom, #fb923c, #f97316)",
    borderColor: "#fb923c",
    ringColor: "#fb923c",
    height: 56,
    order: 3,
    medal: "🥉",
    label: "3rd",
  },
} as const;

function PodiumBlock({ entry, rank }: { entry: LeaderboardEntry; rank: 1 | 2 | 3 }) {
  const s = podiumStyles[rank];

  return (
    <div className="flex flex-col items-center" style={{ order: s.order }}>
      <div className="flex flex-col items-center mb-2">
        <div
          className={`w-14 h-14 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-2xl font-bold ring-4 shadow-lg mb-1 ${entry.isCurrentUser ? "ring-offset-2" : ""}`}
          style={{ "--tw-ring-color": s.ringColor } as React.CSSProperties}
        >
          {entry.name.charAt(0).toUpperCase()}
        </div>
        <p className={`text-sm font-semibold text-center max-w-[90px] truncate ${entry.isCurrentUser ? "text-blue-600 dark:text-blue-400" : "text-gray-800 dark:text-white"}`}>
          {entry.name}
          {entry.isCurrentUser && <span className="block text-xs text-blue-400">(you)</span>}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{entry.avgScore}% avg</p>
      </div>
      <div
        className="w-24 rounded-t-xl flex flex-col items-center justify-center shadow-md"
        style={{
          height: s.height,
          background: s.gradient,
          borderTop: `2px solid ${s.borderColor}`,
        }}
      >
        <span className="text-2xl">{s.medal}</span>
        <span className="text-xs font-bold text-white/90">{s.label}</span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useT();
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/leaderboard")
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

  const medal = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return rank;
  };

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          {t("leaderboard")}
        </h1>
      </div>

      {data.length > 0 ? (
        <>
          {top3.length >= 1 && (
            <div className="flex items-end justify-center gap-4 mb-10">
              {top3[1] && <PodiumBlock entry={top3[1]} rank={2} />}
              {top3[0] && <PodiumBlock entry={top3[0]} rank={1} />}
              {top3[2] && <PodiumBlock entry={top3[2]} rank={3} />}
            </div>
          )}

          {rest.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-slate-700/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">
                      {t("rank")}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("player")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("quizzesPlayed")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("avgScore")}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {t("bestScore")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                  {rest.map((entry) => (
                    <tr
                      key={entry.userId}
                      className={entry.isCurrentUser ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-slate-700/30"}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {medal(entry.rank)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-medium ${entry.isCurrentUser ? "text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}`}>
                          {entry.name}
                          {entry.isCurrentUser && <span className="ml-2 text-xs text-blue-500">(you)</span>}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        {entry.quizCount}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                          {entry.avgScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                        {entry.bestScore}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
          <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-gray-500">{t("noLeaderboard")}</p>
        </div>
      )}
    </div>
  );
}
