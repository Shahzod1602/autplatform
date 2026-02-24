"use client";

import Link from "next/link";
import { BookOpen, FileText, Shield, Users, ArrowRight, GraduationCap, CheckCircle2, BrainCircuit, Trophy, TrendingUp } from "lucide-react";
import { useT } from "@/lib/useLocale";

export default function Home() {
  const t = useT();

  const features = [
    { icon: FileText, title: t("feat1Title"), desc: t("feat1Desc") },
    { icon: GraduationCap, title: t("feat2Title"), desc: t("feat2Desc") },
    { icon: Shield, title: t("feat3Title"), desc: t("feat3Desc") },
    { icon: BookOpen, title: t("feat4Title"), desc: t("feat4Desc") },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
        <nav className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            <span className="text-xl font-bold">AUT Platform</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 rounded-lg hover:bg-white/10 transition">
              {t("login")}
            </Link>
            <Link href="/register" className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
              {t("register")}
            </Link>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-4 py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left: Text */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
                <TrendingUp className="w-4 h-4 text-blue-200" />
                <span className="text-blue-100">AI-powered learning platform</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                {t("heroTitle1")}<br />
                <span className="text-blue-200">{t("heroTitle2")}</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl lg:max-w-xl">
                {t("heroDesc")}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition shadow-lg"
                >
                  {t("getStarted")} <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-white/20 transition"
                >
                  {t("login")}
                </Link>
              </div>
            </div>

            {/* Right: Floating UI Mockup */}
            <div className="flex-1 hidden lg:flex justify-center relative">
              {/* Background glow */}
              <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl scale-75" />

              <div className="relative w-full max-w-sm space-y-3">
                {/* Quiz card */}
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-400/30 flex items-center justify-center">
                      <BrainCircuit className="w-4 h-4 text-purple-200" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Data Structures Quiz</p>
                      <p className="text-xs text-blue-200">10 questions</p>
                    </div>
                    <span className="ml-auto text-xs bg-green-400/20 text-green-300 px-2 py-0.5 rounded-full">Active</span>
                  </div>
                  <div className="space-y-2">
                    {["Binary Trees", "Hash Maps", "Sorting Algorithms"].map((q, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-blue-100">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        {q}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Score card */}
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 shadow-xl flex items-center gap-4 ml-8">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="w-5 h-5 text-yellow-300" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-blue-200 mb-1">Your Score</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white/10 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full" style={{ width: "86%" }} />
                      </div>
                      <span className="text-sm font-bold text-white">86%</span>
                    </div>
                  </div>
                </div>

                {/* Stats mini card */}
                <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 shadow-xl flex gap-4 -ml-4">
                  {[
                    { label: "Courses", value: "20+" },
                    { label: "Materials", value: "100+" },
                    { label: "Students", value: "500+" },
                  ].map((s) => (
                    <div key={s.label} className="flex-1 text-center">
                      <p className="text-lg font-bold text-white">{s.value}</p>
                      <p className="text-xs text-blue-200">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20 bg-gray-50 dark:bg-slate-900">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
          {t("whyUs")}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md hover:-translate-y-1 transition-all duration-200"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md"
                style={{
                  background: [
                    "linear-gradient(to bottom right, #3b82f6, #06b6d4)",
                    "linear-gradient(to bottom right, #a855f7, #ec4899)",
                    "linear-gradient(to bottom right, #22c55e, #10b981)",
                    "linear-gradient(to bottom right, #f97316, #ef4444)",
                  ][i],
                }}
              >
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-gray-500 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold mb-2">20+</div>
            <div className="text-blue-200">{t("coursesCount")}</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-2">100+</div>
            <div className="text-blue-200">{t("materials")}</div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-4xl font-bold mb-2">
              <Users className="w-8 h-8" /> 500+
            </div>
            <div className="text-blue-200">{t("usersLabel")}</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <p>&copy; 2026 AUT Platform. {t("allRights")}</p>
      </footer>
    </div>
  );
}
