"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  FileText,
  Presentation,
  Download,
  ArrowLeft,
  CheckCircle,
  UserPlus,
  UserMinus,
  File,
} from "lucide-react";
import { useT } from "@/lib/useLocale";

interface Material {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: string;
}

interface CourseDetail {
  id: string;
  name: string;
  description: string | null;
  color: string;
  examMaterials: Material[];
  textbooks: Material[];
  slides: Material[];
  _count: { enrollments: number };
  enrollments?: { userId: string }[];
}

type TabType = "exam" | "textbook" | "slide";

export default function CourseDetailPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const router = useRouter();
  const t = useT();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("exam");
  const [enrolled, setEnrolled] = useState(false);
  const [enrollLoading, setEnrollLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          router.push("/courses");
          return;
        }
        setCourse(data);
        if (session) {
          const userId = (session.user as { id: string }).id;
          const isEnrolled = data.enrollments?.some(
            (e: { userId: string }) => e.userId === userId
          );
          setEnrolled(!!isEnrolled);
        }
        setLoading(false);
      })
      .catch(() => {
        router.push("/courses");
      });
  }, [id, session, router]);

  const handleEnroll = async () => {
    setEnrollLoading(true);
    try {
      const res = await fetch(`/api/courses/${id}/enroll`, { method: "POST" });
      if (res.ok) {
        setEnrolled(true);
        setCourse((prev) =>
          prev ? { ...prev, _count: { ...prev._count, enrollments: prev._count.enrollments + 1 } } : prev
        );
      }
    } catch {
      // error
    }
    setEnrollLoading(false);
  };

  const handleUnenroll = async () => {
    setEnrollLoading(true);
    try {
      const res = await fetch(`/api/courses/${id}/enroll`, { method: "DELETE" });
      if (res.ok) {
        setEnrolled(false);
        setCourse((prev) =>
          prev ? { ...prev, _count: { ...prev._count, enrollments: prev._count.enrollments - 1 } } : prev
        );
      }
    } catch {
      // error
    }
    setEnrollLoading(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const tabs: { key: TabType; label: string; icon: typeof BookOpen; items: Material[] }[] = [
    { key: "exam", label: t("examMaterials"), icon: FileText, items: course.examMaterials },
    { key: "textbook", label: t("textbooks"), icon: BookOpen, items: course.textbooks },
    { key: "slide", label: t("slides"), icon: Presentation, items: course.slides },
  ];

  const currentTab = tabs.find((t) => t.key === tab)!;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link href="/courses" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-4">
          <ArrowLeft className="w-4 h-4" /> {t("goBack")}
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: course.color + "20" }}
            >
              <BookOpen className="w-7 h-7" style={{ color: course.color }} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.name}</h1>
              {course.description && (
                <p className="text-gray-500 mt-1">{course.description}</p>
              )}
              <p className="text-sm text-gray-400 mt-1">
                {course._count.enrollments} {t("enrolled")}
              </p>
            </div>
          </div>
          {session && (
            <div>
              {enrolled ? (
                <button
                  onClick={handleUnenroll}
                  disabled={enrollLoading}
                  className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition disabled:opacity-50"
                >
                  <UserMinus className="w-4 h-4" /> {t("unenroll")}
                </button>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrollLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" /> {t("enroll")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-6">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 pb-3 border-b-2 transition text-sm font-medium ${
                tab === t.key
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {t.items.length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Materials List */}
      {currentTab.items.length > 0 ? (
        <div className="space-y-3">
          {currentTab.items.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-lg border border-gray-100 p-4 flex items-center justify-between hover:shadow-sm transition"
            >
              <div className="flex items-center gap-3">
                <File className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{material.title}</p>
                  <p className="text-sm text-gray-400">
                    {material.fileName} &middot; {formatFileSize(material.fileSize)}
                  </p>
                </div>
              </div>
              <a
                href={material.fileUrl}
                download={material.fileName}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition text-sm font-medium"
              >
                <Download className="w-4 h-4" /> {t("download")}
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <currentTab.icon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">{t("noMaterials")}</p>
        </div>
      )}
    </div>
  );
}
