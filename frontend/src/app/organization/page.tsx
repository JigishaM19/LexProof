"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  ShieldCheck,
  FileCheck2,
  Users,
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  Inbox,
  Loader2,
} from "lucide-react";
import { api, User as UserType, BatchVerificationRecord } from "@/lib/api";

export default function OrganizationOverviewPage() {
  const pathname = usePathname();
  const basePath = pathname.startsWith("/admin") ? "/admin" : "/organization";

  const [user, setUser] = useState<UserType | null>(null);
  const [batches, setBatches] = useState<BatchVerificationRecord[]>([]);
  const [connectedRailsCount, setConnectedRailsCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = api.getCurrentUser();
      setUser(currentUser);

      const [batchList, coverage] = await Promise.allSettled([
        api.listBatchVerifications(),
        api.getCoverage(),
      ]);

      if (batchList.status === "fulfilled") {
        setBatches(batchList.value || []);
      }
      if (coverage.status === "fulfilled") {
        setConnectedRailsCount(coverage.value?.total_active_pilot || 0);
      }
    } catch (e) {
      console.error("Failed to load organization data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalCandidates = batches.reduce((sum, b) => sum + (b.total_candidates || 0), 0);
  const verifiedRecords = batches.reduce((sum, b) => sum + (b.verified_candidates || 0), 0);
  const activeBatches = batches.filter(
    (b) => b.status === "PENDING" || b.status === "NEEDS_REVIEW"
  ).length;

  const filteredBatches = batches.filter(
    (b) =>
      b.batch_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.target_institution.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Pilot Institutional Rail Notice */}
      <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl p-3 px-4 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200">
          <span className="w-2 h-2 rounded-full bg-purple-600 dark:bg-purple-400 animate-pulse"></span>
          <span className="font-semibold uppercase tracking-wider">Institutional Rail Pilot Active:</span>
          <span>SPPU, University of Mumbai, MSBTE, and DigiLocker rails connected for institutional verification.</span>
        </div>
        <Link
          href="/verification/coverage"
          className="text-purple-700 dark:text-purple-300 hover:underline font-semibold flex items-center gap-1"
        >
          Check Coverage Directory <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Organization Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-purple-700 dark:text-purple-300 font-bold bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200/60 dark:border-purple-800/60 flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              Organization Workspace
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-semibold">
              {user?.institution || user?.full_name || "Institution"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Institutional Verification Console
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Manage bulk candidate credential verifications, departmental access, and authoritative ledger provenance.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={loadData}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh metrics and batches"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href={`${basePath}/verifications`}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f2942] dark:bg-purple-700 text-white hover:bg-slate-800 dark:hover:bg-purple-800 text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-purple-200" />
            New Batch Verification
          </Link>
        </div>
      </div>

      {/* Real Metric Summary Cards (Strict Real Data - Zero Hardcode) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Total Batches</span>
            <Layers className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : batches.length}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            {activeBatches} active / review
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
            <span className="text-[11px] font-semibold uppercase">Verified Records</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1.5">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-emerald-600" /> : verifiedRecords}
          </div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">Rail confirmed</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Total Candidates</span>
            <Users className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalCandidates}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">Enrolled dossiers</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Connected Rails</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : connectedRailsCount}
          </div>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 block mt-0.5">Active pilot rails</span>
        </div>
      </div>

      {/* Institutional Verification Section */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Institutional Verification Requests
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Authoritative batch records submitted by {user?.institution || user?.full_name || "your organization"}.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search request ID or university..."
              className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            <p className="text-xs text-slate-500">Loading verification records...</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white">
              {searchQuery ? "No matching verification batches found" : "No institutional verification requests yet"}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
              {searchQuery
                ? `No batches matching "${searchQuery}". Clear your search query to see all records.`
                : "Initialize your first candidate verification batch to verify student or employee academic records directly against university registrar rails."}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <Link
                href={`${basePath}/verifications`}
                className="px-3.5 py-1.5 rounded-lg bg-[#0f2942] dark:bg-purple-700 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Start Batch Request
              </Link>
              <Link
                href="/verification/coverage"
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                View Rail Coverage
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Batch Details</th>
                  <th className="py-3 px-4 font-semibold">Target University</th>
                  <th className="py-3 px-4 font-semibold">Candidates</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Created</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBatches.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {b.batch_title}
                      </div>
                      <div className="text-[11px] text-slate-400">{b.purpose}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                      {b.target_institution}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {b.verified_candidates} / {b.total_candidates}
                        </span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded font-semibold">
                          Verified
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`${basePath}/verifications`}
                        className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                      >
                        Inspect Batch →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Connected Authoritative Rails Status Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Institutional Rail Connectivity
          </h3>
          <Link
            href="/verification/coverage"
            className="text-xs text-purple-600 dark:text-purple-400 hover:underline font-semibold flex items-center gap-1"
          >
            Explore All Supported Issuers <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              name: "Savitribai Phule Pune University",
              code: "SPPU",
              status: "Connected",
              type: "Authoritative Ledger",
            },
            {
              name: "University of Mumbai",
              code: "MU",
              status: "Connected",
              type: "Authoritative Ledger",
            },
            {
              name: "Maharashtra State Board of Tech. Ed.",
              code: "MSBTE",
              status: "Connected",
              type: "Direct Verification Rail",
            },
            {
              name: "DigiLocker / NAD Ecosystem",
              code: "DPI",
              status: "Active Rail",
              type: "Public Digital Infrastructure",
            },
          ].map((rail) => (
            <div
              key={rail.code}
              className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between gap-2"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold text-purple-700 dark:text-purple-300">
                    {rail.code}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {rail.status}
                  </span>
                </div>
                <div className="font-semibold text-xs text-slate-800 dark:text-slate-200 line-clamp-1">
                  {rail.name}
                </div>
              </div>
              <div className="text-[10px] text-slate-400">{rail.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
