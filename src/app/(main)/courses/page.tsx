"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { BookOpen, Users, FileText, CheckCircle } from "lucide-react";
import { useT } from "@/lib/useLocale";

interface Course {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string;
  _count: { materials: number; enrollments: number };
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const t = useT();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/courses")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (session) {
      // Check enrollment for each course
      const userId = (session.user as { id: string }).id;
      courses.forEach(async (course) => {
        try {
          const res = await fetch(`/api/courses/${course.id}`);
          const data = await res.json();
          if (data.enrollments) {
            const isEnrolled = data.enrollments.some(
              (e: { userId: string }) => e.userId === userId
            );
            if (isEnrolled) {
              setEnrolledIds((prev) => new Set([...prev, course.id]));
            }
          }
        } catch {
          // skip
        }
      });
    }
  }, [session, courses]);

  const handleEnroll = async (courseId: string) => {
    setEnrollingId(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, { method: "POST" });
      if (res.ok) {
        setEnrolledIds((prev) => new Set([...prev, courseId]));
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId
              ? { ...c, _count: { ...c._count, enrollments: c._count.enrollments + 1 } }
              : c
          )
        );
      }
    } catch {
      // error
    }
    setEnrollingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t("courses")}</h1>
        <p className="text-gray-500 mt-1">{t("browseCourses")}</p>
      </div>

      {courses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition"
            >
              <div
                className="h-2"
                style={{ backgroundColor: course.color }}
              />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: course.color + "20" }}
                  >
                    <BookOpen className="w-5 h-5" style={{ color: course.color }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{course.name}</h3>
                </div>
                {course.description && (
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" /> {course._count.materials} {t("materials")}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {course._count.enrollments}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/courses/${course.id}`}
                    className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition text-sm font-medium"
                  >
                    {t("viewCourse")}
                  </Link>
                  {session && !enrolledIds.has(course.id) ? (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      disabled={enrollingId === course.id}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium disabled:opacity-50"
                    >
                      {enrollingId === course.id ? "..." : t("enroll")}
                    </button>
                  ) : enrolledIds.has(course.id) ? (
                    <span className="flex-1 py-2 text-center text-green-600 bg-green-50 rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                      <CheckCircle className="w-4 h-4" /> {t("enrolled")}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400">{t("noCourses")}</p>
        </div>
      )}
    </div>
  );
}
