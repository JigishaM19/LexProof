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
  Award,
  Calendar,
  Building,
  User,
  Hash,
  ExternalLink,
  Layers,
  RefreshCw,
  Clock
} from "lucide-react";
import { api, CaseReportResponse } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CaseReportPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const caseId = unwrappedParams.id;
  const router = useRouter();

  const [report, setReport] = useState<CaseReportResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.replace(`/login?redirect=${encodeURIComponent(`/cases/${caseId}/report`)}`);
      return;
    }
    loadReport();
  }, [caseId, router]);

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
      <div className="min-h-screen bg-[#FAF8FF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#4338CA]" />
          <p className="text-sm font-semibold text-[#001428]">Generating audit report...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-[#FAF8FF] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#001428]">Report Generation Failed</h2>
          <p className="text-xs text-[#74777E] mt-1 mb-4">
            Could not compile verification dossier for this case ID.
          </p>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[#001428] text-white rounded-lg text-xs font-semibold"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isVerified = report.overall_status === "VERIFIED";
  const isNeedsReview = report.overall_status === "NEEDS_REVIEW";
  const isFailed = report.overall_status === "VERIFICATION_FAILED";
  const isUnavailable = report.overall_status === "UNAVAILABLE";

  return (
    <div className="min-h-screen bg-[#FAF8FF] dark:bg-[#090d16] text-[#131B2E] dark:text-slate-100 flex flex-col font-sans print:bg-white print:p-0">
      <div className="print:hidden">
        <Navbar />
      </div>

      {/* Non-Printable Action Toolbar */}
      <div className="bg-white border-b border-[#C3C6CE]/40 px-6 py-3 flex items-center justify-between print:hidden sticky top-0 z-30 shadow-sm">
        <Link
          href={`/cases/${caseId}`}
          className="text-xs font-semibold text-[#43474D] hover:text-[#001428] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Console
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 text-xs font-semibold bg-[#FAF8FF] hover:bg-[#EAEDFF] text-[#001428] rounded-lg border border-[#C3C6CE]/40 flex items-center gap-1.5 transition-colors"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? "Link Copied" : "Share Report"}
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-semibold bg-[#001428] hover:bg-[#0F2942] text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#93CCFF]" /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Formal Printable Report Paper */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-8 my-6 bg-white shadow-md rounded-2xl border border-[#C3C6CE]/30 print:shadow-none print:border-none print:m-0 print:p-0 flex flex-col gap-8">
        {/* Report Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b-2 border-[#001428]">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#001428] flex items-center justify-center text-white shrink-0 shadow-md">
              <Shield className="w-7 h-7 text-[#93CCFF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-[#001428] tracking-tight">LexProof</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#EAEDFF] text-[#4338CA] rounded">
                  Official Verification Dossier
                </span>
              </div>
              <p className="text-xs text-[#43474D] mt-0.5">
                National Digital Document Intelligence & Provenance Audit Rail
              </p>
            </div>
          </div>

          <div className="text-right sm:text-right flex flex-col sm:items-end text-xs text-[#43474D]">
            <span className="font-mono text-sm font-bold text-[#001428] block">
              {report.report_id}
            </span>
            <span className="text-[11px] text-[#74777E] mt-0.5">
              Issued: {new Date(report.generated_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
            </span>
            <span className="font-mono text-[10px] text-[#74777E] truncate max-w-[200px]">
              DOSSIER HASH: {report.dossier_hash.slice(0, 16)}...
            </span>
          </div>
        </div>

        {/* Case & Purpose Summary */}
        <div className="bg-[#FAF8FF] p-5 rounded-xl border border-[#C3C6CE]/30 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-[#74777E] uppercase tracking-wider font-semibold block text-[10px]">
              Dossier Title
            </span>
            <span className="font-bold text-sm text-[#001428] mt-0.5 block">
              {report.case.title}
            </span>
          </div>
          <div>
            <span className="text-[#74777E] uppercase tracking-wider font-semibold block text-[10px]">
              Verification Purpose
            </span>
            <span className="font-semibold text-[#001428] mt-0.5 block">
              {report.case.purpose}
            </span>
          </div>
          <div>
            <span className="text-[#74777E] uppercase tracking-wider font-semibold block text-[10px]">
              Target Institution
            </span>
            <span className="font-semibold text-[#001428] mt-0.5 block">
              {report.case.target_institution || "General Intake"}
            </span>
          </div>
        </div>

        {/* Executive Verdict Banner */}
        <div
          className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isVerified
              ? "bg-emerald-50 border-emerald-300 text-emerald-950"
              : isNeedsReview
              ? "bg-amber-50 border-amber-300 text-amber-950"
              : isFailed
              ? "bg-rose-50 border-rose-300 text-rose-950"
              : isUnavailable
              ? "bg-slate-100 border-slate-300 text-slate-900"
              : "bg-sky-50 border-sky-300 text-sky-950"
          }`}
        >
          <div className="flex items-center gap-3">
            {isVerified ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
            ) : isNeedsReview ? (
              <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
            ) : isFailed ? (
              <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
            ) : (
              <HelpCircle className="w-8 h-8 text-slate-500 shrink-0" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">
                  STATUS: {report.overall_status.replace("_", " ")}
                </h3>
              </div>
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

          <div className="text-right sm:text-right shrink-0">
            <span className="font-mono text-xs font-bold px-3 py-1 rounded bg-white/80 shadow-xs border border-current">
              VERDICT CODE: {report.overall_status}
            </span>
          </div>
        </div>

        {/* Section 1: Attached Document Inventory */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#001428] pb-1 border-b border-[#C3C6CE]/30">
            01 • Intake Document Inventory ({report.documents.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8FF] text-[#74777E] border-b border-[#C3C6CE]/30 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">MIME / Size</th>
                  <th className="py-2.5 px-3">SHA-256 Fingerprint</th>
                  <th className="py-2.5 px-3 text-right">Intake Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C3C6CE]/20">
                {report.documents.map((d) => (
                  <tr key={d.id}>
                    <td className="py-2.5 px-3 font-semibold text-[#001428]">
                      {d.original_filename}
                    </td>
                    <td className="py-2.5 px-3 text-[#43474D]">
                      {d.file_type} ({(d.file_size_bytes / 1024).toFixed(1)} KB)
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[10px] text-[#43474D]">
                      {d.file_hash_sha256}
                    </td>
                    <td className="py-2.5 px-3 text-right text-[#74777E]">
                      {new Date(d.created_at).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 2: Structured Credential Findings */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#001428] pb-1 border-b border-[#C3C6CE]/30">
            02 • Extracted Educational Credentials & Attributes
          </h3>

          {report.documents.map((doc, docIdx) => (
            <div key={doc.id} className="bg-[#FAF8FF] p-4 rounded-xl border border-[#C3C6CE]/30 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-semibold text-[#001428]">
                <span>Document: {doc.original_filename}</span>
                <span className="text-[11px] text-[#4338CA]">
                  Confidence:{" "}
                  {Math.round(
                    (Object.values(doc.extracted_fields).reduce((acc, f) => acc + f.confidence, 0) /
                      (Object.keys(doc.extracted_fields).length || 1)) *
                      100
                  )}
                  %
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                {Object.entries(doc.extracted_fields).map(([k, f]) => (
                  <div key={k} className="bg-white p-2.5 rounded-lg border border-[#C3C6CE]/30">
                    <span className="text-[10px] text-[#74777E] uppercase block">{f.field_name}</span>
                    <span className="font-bold text-[#001428] text-xs block mt-0.5">
                      {f.extracted_value || "—"}
                    </span>
                    <span className="text-[10px] text-emerald-800 font-semibold block mt-1">
                      {(f.confidence * 100).toFixed(0)}% optical score
                    </span>
                  </div>
                ))}
              </div>

              {/* Provenance Result if queried */}
              {doc.verification_result && (
                <div className="p-3 bg-white rounded-lg border border-[#C3C6CE]/40 text-xs">
                  <span className="font-bold text-[#001428] block mb-1">
                    Authoritative Rail Response: {doc.verification_result.rail_name}
                  </span>
                  <p className="text-[#43474D]">{doc.verification_result.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Section 3: Chain of Custody & Audit Trail */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#001428] pb-1 border-b border-[#C3C6CE]/30">
            03 • Tamper-Evident Chain of Custody & Audit Log
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#FAF8FF] text-[#74777E] border-b border-[#C3C6CE]/30 font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Action Event</th>
                  <th className="py-2.5 px-3">Actor / Subsystem</th>
                  <th className="py-2.5 px-3 text-right">Timestamp (UTC)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#C3C6CE]/20 font-mono text-[11px]">
                {report.audit_trail.map((at, i) => (
                  <tr key={i}>
                    <td className="py-2 px-3 font-semibold text-[#001428]">{at.action}</td>
                    <td className="py-2 px-3 text-[#43474D] font-sans text-xs">{at.actor}</td>
                    <td className="py-2 px-3 text-right text-[#74777E]">{at.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statutory Scope Policy & Disclaimer */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-[#43474D] flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5 font-bold text-[#001428]">
            <Shield className="w-4 h-4 text-[#4338CA]" />
            <span>Institutional Scope & Legal Notice</span>
          </div>
          <p>
            {report.scope_notice} Optical analysis extracts and structures textual parameters from scans without altering source pixels. Analysis does not constitute legal conferment of degrees or credentials unless corroborated by authoritative registrar rails or government digital public infrastructure.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[10px] text-[#74777E]">
            <span>LexProof Cryptographic Verification Rail • Version 1.0</span>
            <span>Zero Speculative Claims Standard</span>
          </div>
        </div>
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
