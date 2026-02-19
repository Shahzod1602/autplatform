"use client";

import { useEffect, useState } from "react";
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          {t("leaderboard")}
        </h1>
      </div>

      {data.length > 0 ? (
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
              {data.map((entry) => (
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
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
          <Trophy className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 dark:text-gray-500">{t("noLeaderboard")}</p>
        </div>
      )}
    </div>
  );
}
