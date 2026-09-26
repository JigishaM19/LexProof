"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  Plus,
  RefreshCw,
  Search,
  ArrowLeft,
  FileCheck2,
  Inbox,
  AlertCircle,
} from "lucide-react";
import { api, User as UserType } from "@/lib/api";

export default function OrganizationVerificationsPage() {
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    setUser(api.getCurrentUser());
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/organization"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Back to Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Batch Credential Verifications
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Initiate and audit high-volume candidate verifications across partner university rails.
            </p>
          </div>
        </div>
      </div>

      {/* Verification Batches Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/40">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Verification Records & Batches
          </h2>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
            0 Records
          </div>
        </div>

        {/* Clean Empty State */}
        <div className="p-12 text-center flex flex-col items-center justify-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Inbox className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-800 dark:text-white">
            No batch requests registered
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
            When your organization submits candidate batches or automated API queries, they will be listed here with real-time rail status.
          </p>
        </div>
      </div>

      {/* Information Callout */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
            Institutional Data Isolation
          </span>
          In accordance with the Digital Personal Data Protection (DPDP) Act and LexProof data isolation architecture, organization verifications are strictly sandboxed. Candidate records submitted by {user?.institution || user?.full_name || "your organization"} are accessible only to authorized institutional operators.
        </div>
      </div>
    </div>
  );
}
