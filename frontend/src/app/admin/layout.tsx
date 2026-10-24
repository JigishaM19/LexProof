"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { OrganizationNavbar } from "@/components/workspace/OrganizationNavbar";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.replace("/login?redirect=/admin");
      return;
    }
    const user = api.getCurrentUser();

    if (user && user.role !== "ADMIN") {
      // Regular USER (Peoples/Students) accounts are routed to user workspace
      router.replace("/individual");
      return;
    }

    setIsAuthorized(true);
    setLoading(false);
  }, [router]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-3" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Loading Admin Console...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <OrganizationNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
