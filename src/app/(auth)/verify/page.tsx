"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { BookOpen, CheckCircle, XCircle, Loader2 } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token not found");
      return;
    }

    fetch(`/api/auth/verify?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setStatus("error");
          setMessage(data.error);
        } else {
          setStatus("success");
          setMessage(data.message);
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Server error");
      });
  }, [token]);

  return (
    <>
      {status === "loading" && (
        <div className="py-8">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying email...</p>
        </div>
      )}

      {status === "success" && (
        <div className="py-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">{message}</h2>
          <p className="text-gray-500 mb-6">You can now sign in to your account.</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Sign In
          </Link>
        </div>
      )}

      {status === "error" && (
        <div className="py-8">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-500 mb-6">{message}</p>
          <Link
            href="/register"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Register Again
          </Link>
        </div>
      )}
    </>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">AUT Platform</span>
        </Link>
        <Suspense
          fallback={
            <div className="py-8">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Loading...</p>
            </div>
          }
        >
          <VerifyContent />
        </Suspense>
      </div>
    </div>
  );
}
