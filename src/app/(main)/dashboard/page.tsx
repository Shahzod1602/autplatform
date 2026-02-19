"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ArrowRight, GraduationCap } from "lucide-react";
import { useT } from "@/lib/useLocale";

interface EnrolledCourse {
  id: string;
  enrolledAt: string;
  course: {
    id: string;
    name: string;
    description: string | null;
    color: string;
    _count: { materials: number };
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useT();
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/courses")
        .then((res) => res.json())
        .then(async (courses) => {
          const userId = (session.user as { id: string }).id;
          const enrolled: EnrolledCourse[] = [];
          for (const course of courses) {
            try {
              const res = await fetch(`/api/courses/${course.id}`);
              const data = await res.json();
              if (data.enrollments) {
                const userEnrollment = data.enrollments.find(
                  (e: { userId: string }) => e.userId === userId
                );
                if (userEnrollment) {
                  enrolled.push({
                    id: userEnrollment.id,
                    enrolledAt: userEnrollment.enrolledAt,
                    course: {
                      id: course.id,
                      name: course.name,
                      description: course.description,
                      color: course.color,
                      _count: course._count,
                    },
                  });
                }
              }
            } catch {
              // skip
            }
          }
          setEnrollments(enrolled);
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("hello")}, {session?.user?.name}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">{t("startToday")}</p>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t("myCourses")}</h2>
          <Link href="/courses" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
            {t("browseCourses")} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {enrollments.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <Link
                key={enrollment.id}
                href={`/courses/${enrollment.course.id}`}
                className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-6 hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: enrollment.course.color + "20" }}
                  >
                    <BookOpen className="w-5 h-5" style={{ color: enrollment.course.color }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{enrollment.course.name}</h3>
                </div>
                {enrollment.course.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{enrollment.course.description}</p>
                )}
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  {enrollment.course._count.materials} {t("materials")}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-12 text-center">
            <GraduationCap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 dark:text-gray-500 mb-4">{t("noEnrollments")}</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              {t("browseCourses")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
