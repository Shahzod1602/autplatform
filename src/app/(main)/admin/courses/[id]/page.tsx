"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Upload,
  Trash2,
  FileText,
  BookOpen,
  Presentation,
  File,
  Save,
} from "lucide-react";
import { useT } from "@/lib/useLocale";

interface Material {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

interface CourseDetail {
  id: string;
  name: string;
  description: string | null;
  color: string;
  examMaterials: Material[];
  textbooks: Material[];
  slides: Material[];
}

type TabType = "EXAM_MATERIAL" | "TEXTBOOK" | "SLIDE";

export default function AdminCourseManagePage() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useT();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabType>("EXAM_MATERIAL");
  const [editData, setEditData] = useState({ name: "", description: "", color: "#3B82F6" });
  const [saving, setSaving] = useState(false);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session && (session.user as { role?: string })?.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  const fetchCourse = () => {
    fetch(`/api/courses/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data);
        setEditData({ name: data.name, description: data.description || "", color: data.color });
        setLoading(false);
      })
      .catch(() => router.push("/admin"));
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch(`/api/courses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      fetchCourse();
    } catch {
      // error
    }
    setSaving(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) return;
    setUploading(true);

    try {
      // Upload file first
      const formData = new FormData();
      formData.append("file", uploadFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        alert(uploadData.error);
        setUploading(false);
        return;
      }

      // Create material
      await fetch(`/api/courses/${id}/materials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: uploadTitle,
          type: tab,
          fileUrl: uploadData.fileUrl,
          fileName: uploadData.fileName,
          fileSize: uploadData.fileSize,
        }),
      });

      setUploadTitle("");
      setUploadFile(null);
      // Reset file input
      const fileInput = document.getElementById("file-input") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      fetchCourse();
    } catch {
      // error
    }
    setUploading(false);
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (!confirm(t("confirmDelete"))) return;
    try {
      await fetch(`/api/courses/${id}/materials/${materialId}`, { method: "DELETE" });
      fetchCourse();
    } catch {
      // error
    }
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

  const tabConfig: { key: TabType; label: string; icon: typeof FileText; items: Material[] }[] = [
    { key: "EXAM_MATERIAL", label: t("examMaterials"), icon: FileText, items: course.examMaterials },
    { key: "TEXTBOOK", label: t("textbooks"), icon: BookOpen, items: course.textbooks },
    { key: "SLIDE", label: t("slides"), icon: Presentation, items: course.slides },
  ];

  const currentTab = tabConfig.find((tc) => tc.key === tab)!;

  return (
    <div>
      <Link href="/admin" className="text-blue-600 hover:underline text-sm flex items-center gap-1 mb-4">
        <ArrowLeft className="w-4 h-4" /> {t("backToAdmin")}
      </Link>

      {/* Edit Course Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("editCourse")}</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t("courseName")}</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
              <input
                type="color"
                value={editData.color}
                onChange={(e) => setEditData({ ...editData, color: e.target.value })}
                className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("courseDescription")}</label>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              rows={2}
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? t("saving") : t("save")}
          </button>
        </form>
      </div>

      {/* Materials Management */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("materials")}</h2>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            {tabConfig.map((tc) => (
              <button
                key={tc.key}
                onClick={() => setTab(tc.key)}
                className={`flex items-center gap-2 pb-3 border-b-2 transition text-sm font-medium ${
                  tab === tc.key
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tc.icon className="w-4 h-4" />
                {tc.label} ({tc.items.length})
              </button>
            ))}
          </div>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleUpload} className="flex flex-col sm:flex-row gap-3 mb-6 p-4 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder={t("materialTitle")}
            value={uploadTitle}
            onChange={(e) => setUploadTitle(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
            required
          />
          <input
            id="file-input"
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx"
            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-white"
            required
          />
          <button
            type="submit"
            disabled={uploading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 whitespace-nowrap"
          >
            <Upload className="w-4 h-4" /> {uploading ? t("uploading") : t("uploadFile")}
          </button>
        </form>

        {/* Materials List */}
        {currentTab.items.length > 0 ? (
          <div className="space-y-2">
            {currentTab.items.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-3 border border-gray-100 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <File className="w-6 h-6 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{material.title}</p>
                    <p className="text-xs text-gray-400">
                      {material.fileName} &middot; {formatFileSize(material.fileSize)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMaterial(material.id)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">{t("noMaterials")}</p>
        )}
      </div>
    </div>
  );
}
