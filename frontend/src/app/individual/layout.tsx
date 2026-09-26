"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, User as UserType } from "@/lib/api";
import { IndividualNavbar } from "@/components/workspace/IndividualNavbar";
import { Loader2 } from "lucide-react";

export default function IndividualLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.replace("/login?redirect=/individual");
      return;
    }
    const user = api.getCurrentUser();

    if (user && user.role !== "INDIVIDUAL") {
      // Is an organization account trying to access individual workspace
      router.replace("/organization");
      return;
    }

    setIsAuthorized(true);
    setLoading(false);
  }, [router]);

  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center animate-fadeIn">
        <div className="animate-scalePop flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Loading Individual Workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      <IndividualNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
}
