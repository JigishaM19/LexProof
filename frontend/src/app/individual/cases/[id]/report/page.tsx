"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  Printer,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
} from "lucide-react";
import { api, CaseReportResponse } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function IndividualCaseReportPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const caseId = unwrappedParams.id;
  const router = useRouter();

  const [report, setReport] = useState<CaseReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    loadReport();
  }, [caseId]);

  const loadReport = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCaseReport(caseId);
      setReport(data);
    } catch (err: any) {
      console.error("Failed to load case report:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
        Generating audit report...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto my-8">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Report Generation Failed</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          Could not compile verification dossier report for this dossier ID.
        </p>
        <Link
          href="/individual/cases"
          className="px-3.5 py-1.5 bg-[#0f2942] dark:bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Dossiers
        </Link>
      </div>
    );
  }

  const isVerified = report.overall_status === "VERIFIED";
  const isNeedsReview = report.overall_status === "NEEDS_REVIEW";
  const isFailed = report.overall_status === "VERIFICATION_FAILED";
  const isUnavailable = report.overall_status === "UNAVAILABLE";

  return (
    <div className="flex flex-col gap-6 print:m-0 print:p-0">
      {/* Non-Printable Action Toolbar */}
      <div className="animate-slideUp bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between print:hidden shadow-xs">
        <Link
          href={`/individual/cases/${caseId}`}
          className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Console
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors btn-press"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? "Link Copied" : "Share Report"}
          </button>
          <button
            onClick={handlePrint}
            className="px-3.5 py-1.5 text-xs font-semibold bg-[#0f2942] dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs transition-colors btn-press"
          >
            <Printer className="w-3.5 h-3.5 text-blue-200" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Formal Printable Report Paper */}
      <div className="animate-slideUp stagger-1 max-w-4xl mx-auto w-full p-6 sm:p-8 bg-white dark:bg-slate-900 shadow-md rounded-2xl border border-slate-200 dark:border-slate-800 print:shadow-none print:border-none print:m-0 print:p-0 flex flex-col gap-6">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-slate-900 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0f2942] dark:bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Shield className="w-6 h-6 text-blue-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight">LexProof</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded border border-blue-200/50">
                  Individual Verification Dossier
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Digital Credential Intelligence & Provenance Audit Rail
              </p>
            </div>
          </div>

          <div className="text-right flex flex-col sm:items-end text-xs text-slate-500 dark:text-slate-400">
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white block">
              {report.report_id}
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">
              Issued: {new Date(report.generated_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
            </span>
            <span className="font-mono text-[9px] text-slate-400 truncate max-w-[200px]">
              HASH: {report.dossier_hash.slice(0, 16)}...
            </span>
          </div>
        </div>

        {/* Case & Purpose Summary */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-400 uppercase tracking-wider font-semibold block text-[10px]">
              Dossier Title
            </span>
            <span className="font-bold text-xs text-slate-900 dark:text-white mt-0.5 block">
              {report.case.title}
            </span>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider font-semibold block text-[10px]">
              Verification Purpose
            </span>
            <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
              {report.case.purpose}
            </span>
          </div>
          <div>
            <span className="text-slate-400 uppercase tracking-wider font-semibold block text-[10px]">
              Target Institution
            </span>
            <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">
              {report.case.target_institution || "General Intake"}
            </span>
          </div>
        </div>

        {/* Executive Verdict Banner */}
        <div
          className={`animate-scalePop stagger-2 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isVerified
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
              : isNeedsReview
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200"
              : isFailed
              ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200"
              : isUnavailable
              ? "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200"
              : "bg-sky-50 dark:bg-sky-950/40 border-sky-300 dark:border-sky-800 text-sky-950 dark:text-sky-200"
          }`}
        >
          <div className="flex items-center gap-3">
            {isVerified ? (
              <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
            ) : isNeedsReview ? (
              <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
            ) : isFailed ? (
              <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
            ) : (
              <HelpCircle className="w-7 h-7 text-slate-500 shrink-0" />
            )}
            <div>
              <h3 className="font-bold text-sm">
                STATUS: {report.overall_status.replace("_", " ")}
              </h3>
              <p className="text-xs mt-0.5 opacity-90">
                {isVerified
                  ? "Records matched conclusively against official registrar records or public cryptographic key signatures."
                  : isUnavailable
                  ? "Optical analysis completed with high confidence, but no authoritative verification rail exists for this institution."
                  : isNeedsReview
                  ? "Internal heuristic discrepancies detected (e.g. arithmetic mark mismatch or date logic conflict)."
                  : "Optical extraction completed. Authoritative issuer query pending or unverified."}
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white/80 dark:bg-slate-900/80 shadow-xs border border-current">
              {report.overall_status}
            </span>
          </div>
        </div>

        {/* Section 1: Attached Document Inventory */}
        <div className="animate-slideUp stagger-3 flex flex-col gap-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800">
            01 • Intake Document Inventory ({report.documents.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-[10px]">
                  <th className="py-2 px-3">File Name</th>
                  <th className="py-2 px-3">MIME / Size</th>
                  <th className="py-2 px-3">SHA-256 Fingerprint</th>
                  <th className="py-2 px-3 text-right">Intake Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {report.documents.map((d) => (
                  <tr key={d.id}>
                    <td className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200">
                      {d.original_filename}
                    </td>
                    <td className="py-2 px-3 text-slate-500 font-mono text-[10px]">
                      {d.file_type} ({(d.file_size_bytes / 1024).toFixed(1)} KB)
                    </td>
                    <td className="py-2 px-3 font-mono text-[10px] text-slate-500">
                      {d.file_hash_sha256}
                    </td>
                    <td className="py-2 px-3 text-right text-slate-400 text-[10px]">
                      {new Date(d.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Structured Credential Findings */}
        <div className="animate-slideUp stagger-4 flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800">
            02 • Extracted Educational Credentials & Attributes
          </h3>

          {report.documents.map((doc) => (
            <div key={doc.id} className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
                <span>Document: {doc.original_filename}</span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400">
                  Confidence:{" "}
                  {Math.round(
                    (Object.values(doc.extracted_fields).reduce((acc, f) => acc + f.confidence, 0) /
                      (Object.keys(doc.extracted_fields).length || 1)) *
                      100
                  )}
                  %
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                {Object.entries(doc.extracted_fields).map(([k, f]) => (
                  <div key={k} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                    <span className="text-[9px] text-slate-400 uppercase block font-semibold">{f.field_name}</span>
                    <span className="font-bold text-slate-800 dark:text-white text-xs block mt-0.5 truncate">
                      {f.extracted_value || "—"}
                    </span>
                    <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-semibold block mt-0.5">
                      {(f.confidence * 100).toFixed(0)}% optical score
                    </span>
                  </div>
                ))}
              </div>

              {doc.verification_result && (
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5 text-xs">
                    Authoritative Rail: {doc.verification_result.rail_name}
                  </span>
                  <p className="text-slate-500 text-[11px]">{doc.verification_result.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section 3: Chain of Custody & Audit Trail */}
        <div className="animate-slideUp stagger-5 flex flex-col gap-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800">
            03 • Tamper-Evident Chain of Custody & Audit Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold text-[10px]">
                  <th className="py-2 px-3">Action Event</th>
                  <th className="py-2 px-3">Actor / Subsystem</th>
                  <th className="py-2 px-3 text-right">Timestamp (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[10px]">
                {report.audit_trail.map((at, i) => (
                  <tr key={i} className="animate-rowReveal" style={{ animationDelay: `${0.04 * i}s` }}>
                    <td className="py-1.5 px-3 font-semibold text-slate-800 dark:text-slate-200">{at.action}</td>
                    <td className="py-1.5 px-3 text-slate-500 font-sans text-xs">{at.actor}</td>
                    <td className="py-1.5 px-3 text-right text-slate-400">{at.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Scope Policy */}
        <div className="animate-slideUp stagger-6 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Scope Notice & Data Governance Standard</span>
          </div>
          <p>{report.scope_notice}</p>
        </div>
      </div>
    </div>
  );
}
