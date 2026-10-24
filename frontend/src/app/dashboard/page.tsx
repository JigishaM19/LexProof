"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { RefreshCw, Shield } from "lucide-react";

/**
 * Unified Dashboard Redirect Controller.
 * Eliminates code duplication between /dashboard and role workspaces (/individual and /organization).
 * Directs users to their canonical portal based on authenticated credentials.
 */
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const currentUser = api.getCurrentUser();
    if (currentUser?.role === "ADMIN") {
      router.replace("/organization");
    } else {
      router.replace("/individual");
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-3 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 animate-fadeIn">
        <div className="w-12 h-12 rounded-xl bg-blue-600/10 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Shield className="w-6 h-6 animate-pulse" />
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
          <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
          Routing to Workspace...
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          Loading authenticated session and dossier records
        </p>
      </div>
    </div>
  );
}
