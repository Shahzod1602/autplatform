"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { Menu, X, BookOpen, LogOut, User, GraduationCap, Shield, BrainCircuit } from "lucide-react";
import { useT } from "@/lib/useLocale";

export default function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = useT();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">AUT Platform</span>
            </Link>
          </div>

          {session ? (
            <>
              <div className="hidden md:flex items-center gap-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {t("home")}
                </Link>
                <Link href="/courses" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {t("courses")}
                </Link>
                <Link href="/quiz" className="text-gray-600 hover:text-blue-600 transition-colors">
                  {t("quiz")}
                </Link>
                {(session.user as { role?: string })?.role === "ADMIN" && (
                  <Link href="/admin" className="text-gray-600 hover:text-blue-600 transition-colors">
                    {t("admin")}
                  </Link>
                )}
                <div className="flex items-center gap-3 ml-2 pl-4 border-l border-gray-200">
                  <div className="flex items-center gap-2">
                    <User className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-700">{session.user?.name}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title={t("logout")}
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="md:hidden flex items-center gap-2">
                <button onClick={() => setMenuOpen(!menuOpen)}>
                  {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
                {t("login")}
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("register")}
              </Link>
            </div>
          )}
        </div>
      </div>

      {menuOpen && session && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link href="/dashboard" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
              <GraduationCap className="w-4 h-4 inline mr-2" />{t("home")}
            </Link>
            <Link href="/courses" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
              <BookOpen className="w-4 h-4 inline mr-2" />{t("courses")}
            </Link>
            <Link href="/quiz" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
              <BrainCircuit className="w-4 h-4 inline mr-2" />{t("quiz")}
            </Link>
            {(session.user as { role?: string })?.role === "ADMIN" && (
              <Link href="/admin" className="block py-2 text-gray-600" onClick={() => setMenuOpen(false)}>
                <Shield className="w-4 h-4 inline mr-2" />{t("admin")}
              </Link>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="block w-full text-left py-2 text-red-500"
            >
              <LogOut className="w-4 h-4 inline mr-2" />{t("logout")}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
