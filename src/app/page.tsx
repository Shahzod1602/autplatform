"use client";

import Link from "next/link";
import { BookOpen, FileText, Shield, Users, ArrowRight, GraduationCap } from "lucide-react";
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
      <header className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
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

        <div className="max-w-7xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {t("heroTitle1")}<br />
            <span className="text-blue-200">{t("heroTitle2")}</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t("heroDesc")}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-100 transition shadow-lg"
          >
            {t("getStarted")} <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          {t("whyUs")}
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <feature.icon className="w-10 h-10 text-blue-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500">{feature.desc}</p>
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
