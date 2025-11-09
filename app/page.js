"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page's only job is to redirect to your main dashboard.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return (
    <div className="w-full h-screen flex items-center justify-center bg-slate-100">
      <p className="text-slate-600 animate-pulse">
        Redirecting to your dashboard...
      </p>
    </div>
  );
}
