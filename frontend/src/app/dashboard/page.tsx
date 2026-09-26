"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  FileText,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  Copy,
  Check,
  FileCheck,
  Layers,
  Sparkles,
  Info
} from "lucide-react";
import { api, CaseRecord, DocumentRecord, User } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";

export default function DashboardPage() {
  const router = useRouter();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [user, setUser] = useState<User | null>(null);
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [selectedCase, setSelectedCase] = useState<CaseRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // New Case Modal state
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [newCasePurpose, setNewCasePurpose] = useState("College Admission");
  const [newCaseTargetInst, setNewCaseTargetInst] = useState("Savitribai Phule Pune University");
  const [isCreatingCase, setIsCreatingCase] = useState(false);

  // Drag and drop state
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    if (!api.isAuthenticated()) {
      router.replace("/login");
      return;
    }
    const currentUser = api.getCurrentUser();
    if (currentUser?.role === "ORGANIZATION") {
      router.replace("/organization");
      return;
    } else {
      router.replace("/individual");
      return;
    }
  }, [router]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const currentUser = api.getCurrentUser();
      setUser(currentUser);

      const caseList = await api.listCases();
      setCases(caseList);

      if (caseList.length > 0) {
        const active = caseList[0];
        setSelectedCase(active);
        const detail = await api.getCase(active.id);
        setDocuments(detail.documents);
      } else {
        // Automatically create a default primary workspace case if none exist
        const defaultCase = await api.createCase(
          "Primary Document Inspection Dossier",
          "College Admission",
          "Savitribai Phule Pune University"
        );
        setCases([defaultCase]);
        setSelectedCase(defaultCase);
        setDocuments([]);
      }
    } catch (err: any) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCase = async (c: CaseRecord) => {
    setSelectedCase(c);
    setIsLoading(true);
    try {
      const detail = await api.getCase(c.id);
      setDocuments(detail.documents);
    } catch (err) {
      console.error("Failed to load case detail:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaseTitle.trim()) return;

    setIsCreatingCase(true);
    try {
      const created = await api.createCase(newCaseTitle, newCasePurpose, newCaseTargetInst);
      setCases((prev) => [created, ...prev]);
      setSelectedCase(created);
      setDocuments([]);
      setShowNewCaseModal(false);
      setNewCaseTitle("");
    } catch (err: any) {
      alert("Failed to create case: " + err.message);
    } finally {
      setIsCreatingCase(false);
    }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate size (25MB limit)
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("File exceeds 25MB limit. Please upload a smaller document.");
      return;
    }

    setUploadError(null);
    setUploadSuccess(null);
    setIsUploading(true);
    setUploadProgress(20);

    try {
      const interval = setInterval(() => {
        setUploadProgress((p) => (p < 80 ? p + 20 : p));
      }, 200);

      const targetCaseId = selectedCase ? selectedCase.id : undefined;
      const uploadedDoc = await api.uploadDocument(file, targetCaseId);

      clearInterval(interval);
      setUploadProgress(100);
      setUploadSuccess(`"${file.name}" uploaded and extracted successfully!`);

      // Refresh current case documents
      if (selectedCase) {
        const detail = await api.getCase(selectedCase.id);
        setDocuments(detail.documents);
        setSelectedCase(detail.case);
      } else {
        await loadDashboardData();
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to process document upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => {
        setUploadSuccess(null);
        setUploadProgress(0);
      }, 4000);
    }
  };

  const handleDeleteDocument = async (docId: string, docName: string) => {
    if (!confirm(`Are you sure you want to delete "${docName}"? In accordance with data governance, the file will be purged from the server.`)) {
      return;
    }

    try {
      await api.deleteDocument(docId);
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      if (selectedCase) {
        const detail = await api.getCase(selectedCase.id);
        setSelectedCase(detail.case);
      }
    } catch (err: any) {
      alert("Failed to delete document: " + err.message);
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerifyRail = async (docId: string, instName?: string) => {
    try {
      const updated = await api.verifyDocument({
        document_id: docId,
        institution_name: instName
      });
      setDocuments((prev) => prev.map((d) => (d.id === docId ? updated : d)));
      if (selectedCase) {
        const detail = await api.getCase(selectedCase.id);
        setSelectedCase(detail.case);
      }
    } catch (err: any) {
      alert("Verification query failed: " + err.message);
    }
  };

  // Compute status counts across documents
  const statusCounts = {
    total: documents.length,
    verified: documents.filter((d) => d.verification_result?.status === "VERIFIED").length,
    analysisComplete: documents.filter((d) => !d.verification_result && d.status === "PROCESSED").length,
    needsReview: documents.filter((d) => d.verification_result?.status === "NEEDS_REVIEW" || d.indicators.some(i => i.status === "NEEDS_REVIEW")).length,
    unavailable: documents.filter((d) => d.verification_result?.status === "UNAVAILABLE").length,
    failed: documents.filter((d) => d.verification_result?.status === "VERIFICATION_FAILED").length,
  };

  // Filter documents
  const filteredDocuments = documents.filter((d) => {
    const matchesSearch =
      d.original_filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.extracted_fields.candidate_name?.extracted_value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.extracted_fields.institution?.extracted_value?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.extracted_fields.registration_id?.extracted_value?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === "ALL") return true;
    if (statusFilter === "VERIFIED") return d.verification_result?.status === "VERIFIED";
    if (statusFilter === "ANALYSIS_COMPLETE") return !d.verification_result && d.status === "PROCESSED";
    if (statusFilter === "NEEDS_REVIEW") return d.verification_result?.status === "NEEDS_REVIEW";
    if (statusFilter === "UNAVAILABLE") return d.verification_result?.status === "UNAVAILABLE";
    if (statusFilter === "FAILED") return d.verification_result?.status === "VERIFICATION_FAILED";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF8FF] dark:bg-[#090d16] text-[#131B2E] dark:text-slate-100 flex flex-col font-sans">
      {/* Global Navigation */}
      <Navbar />

      {/* Top Breadcrumb & Scope Warning */}
      <div className="bg-[#0F2942] dark:bg-[#050b14] text-white py-2 px-6 text-xs flex flex-wrap items-center justify-between border-b border-[#314863] dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse"></span>
          <span className="font-semibold uppercase tracking-wider text-[#B0C9E8]">
            {t.dashboard?.pilotBannerLabel || "Pilot Infrastructure Active:"}
          </span>
          <span className="text-slate-200">
            {t.dashboard?.pilotBannerText || "Authoritative verification rails connected for selected Maharashtra institutions."}
          </span>
        </div>
        <Link
          href="/verification/coverage"
          className="text-[#93CCFF] hover:text-white underline transition-colors flex items-center gap-1"
        >
          {t.dashboard?.checkCoverage || "Check Coverage Directory"} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col gap-8">
        {/* Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#C3C6CE]/40 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-wider text-[#4338CA] dark:text-indigo-400 font-bold bg-[#E3DFFF] dark:bg-indigo-950/60 px-2 py-0.5 rounded">
                {t.dashboard?.sessionBadge || "Verification Workspace"}
              </span>
              <span className="text-xs text-[#74777E] dark:text-slate-500">•</span>
              <span className="text-xs text-[#74777E] dark:text-slate-400">
                {t.dashboard?.sessionId || "Session ID"}: {selectedCase ? selectedCase.id.slice(0, 8) : "Active"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#001428] dark:text-white tracking-tight">
              {t.dashboard?.title || "Universal Document Analysis & Verification Platform"}
            </h1>
            <p className="text-sm text-[#43474D] dark:text-slate-300 mt-1">
              {t.dashboard?.subtitle || "Extract structured credentials, audit internal mathematical validity, and execute authoritative provenance queries."}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* New Case Button */}
            <button
              onClick={() => setShowNewCaseModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#EAEDFF] dark:bg-slate-800 text-[#001428] dark:text-white hover:bg-[#DAE2FD] dark:hover:bg-slate-700 text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4 text-[#4338CA] dark:text-indigo-400" />
              {t.dashboard?.newCaseBtn || "New Case"}
            </button>

            {/* Official Report Link */}
            {selectedCase && (
              <Link
                href={`/cases/${selectedCase.id}/report`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#001428] dark:bg-blue-600 text-white hover:bg-[#0F2942] dark:hover:bg-blue-700 text-sm font-semibold transition-colors shadow-sm"
              >
                <FileCheck className="w-4 h-4 text-[#93CCFF]" />
                {t.dashboard?.auditReportBtn || "Audit Report"}
              </Link>
            )}
          </div>
        </div>

        {/* Case Switcher & Information Strip */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 shadow-sm border border-[#C3C6CE]/30 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#74777E] dark:text-slate-400 mb-1">
                {t.dashboard?.activeCase || "Active Verification Case:"}
              </label>
              <select
                value={selectedCase?.id || ""}
                onChange={(e) => {
                  const found = cases.find((c) => c.id === e.target.value);
                  if (found) handleSelectCase(found);
                }}
                className="bg-[#FAF8FF] dark:bg-slate-800 border border-[#C3C6CE] dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-semibold text-[#001428] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.purpose})
                  </option>
                ))}
              </select>
            </div>

            {selectedCase && (
              <div className="flex items-center gap-4 text-xs text-[#43474D] dark:text-slate-300 border-t sm:border-t-0 sm:border-l border-[#C3C6CE]/40 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-4">
                <div>
                  <span className="text-[#74777E] dark:text-slate-400 block">Target Institution:</span>
                  <span className="font-semibold text-[#001428] dark:text-white">
                    {selectedCase.target_institution || "General Intake"}
                  </span>
                </div>
                <div>
                  <span className="text-[#74777E] dark:text-slate-400 block">Overall Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                      selectedCase.overall_status === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                        : selectedCase.overall_status === "NEEDS_REVIEW"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                        : selectedCase.overall_status === "VERIFICATION_FAILED"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                        : selectedCase.overall_status === "UNAVAILABLE"
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300"
                    }`}
                  >
                    {selectedCase.overall_status.replace("_", " ")}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => selectedCase && handleSelectCase(selectedCase)}
              className="p-2 text-[#43474D] dark:text-slate-400 hover:text-[#001428] dark:hover:text-white hover:bg-[#FAF8FF] dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Refresh Case Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Contradiction & Anomaly Banner if detected */}
        {selectedCase && selectedCase.contradictions && selectedCase.contradictions.length > 0 && (
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm">
              <h4 className="font-semibold text-amber-900">
                Cross-Document Contradiction Detected ({selectedCase.contradictions.length})
              </h4>
              <ul className="mt-1 list-disc list-inside text-amber-800 space-y-1">
                {selectedCase.contradictions.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* 6-State Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total */}
          <div
            onClick={() => setStatusFilter("ALL")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              statusFilter === "ALL"
                ? "bg-white dark:bg-slate-800 border-[#001428] dark:border-blue-500 shadow-md ring-1 ring-[#001428] dark:ring-blue-500"
                : "bg-white dark:bg-slate-900 border-[#C3C6CE]/30 dark:border-slate-800 hover:border-[#001428]/40 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-[#74777E] dark:text-slate-400">
              <span className="text-xs font-semibold uppercase">{t.dashboard?.filterAll || "Total Files"}</span>
              <Layers className="w-4 h-4 text-[#001428] dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-[#001428] dark:text-white mt-2">{statusCounts.total}</div>
            <span className="text-[11px] text-[#74777E] dark:text-slate-400 block mt-1">In this case</span>
          </div>

          {/* Verified */}
          <div
            onClick={() => setStatusFilter("VERIFIED")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              statusFilter === "VERIFIED"
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500"
                : "bg-white dark:bg-slate-900 border-[#C3C6CE]/30 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700"
            }`}
          >
            <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400">
              <span className="text-xs font-semibold uppercase">{t.dashboard?.filterVerified || "Verified"}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-2">{statusCounts.verified}</div>
            <span className="text-[11px] text-emerald-800 dark:text-emerald-400 block mt-1">Authoritative match</span>
          </div>

          {/* Analysis Complete */}
          <div
            onClick={() => setStatusFilter("ANALYSIS_COMPLETE")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              statusFilter === "ANALYSIS_COMPLETE"
                ? "bg-sky-50 dark:bg-sky-950/60 border-sky-500 shadow-md ring-1 ring-sky-500"
                : "bg-white dark:bg-slate-900 border-[#C3C6CE]/30 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700"
            }`}
          >
            <div className="flex items-center justify-between text-sky-800 dark:text-sky-400">
              <span className="text-xs font-semibold uppercase">{t.common?.statusAuthentic || "Analyzed"}</span>
              <Sparkles className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            </div>
            <div className="text-2xl font-bold text-sky-700 dark:text-sky-300 mt-2">{statusCounts.analysisComplete}</div>
            <span className="text-[11px] text-sky-800 dark:text-sky-400 block mt-1">Optical syntax OK</span>
          </div>

          {/* Needs Review */}
          <div
            onClick={() => setStatusFilter("NEEDS_REVIEW")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              statusFilter === "NEEDS_REVIEW"
                ? "bg-amber-50 dark:bg-amber-950/60 border-amber-500 shadow-md ring-1 ring-amber-500"
                : "bg-white dark:bg-slate-900 border-[#C3C6CE]/30 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700"
            }`}
          >
            <div className="flex items-center justify-between text-amber-800 dark:text-amber-400">
              <span className="text-xs font-semibold uppercase">{t.dashboard?.filterIssues || "Review"}</span>
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300 mt-2">{statusCounts.needsReview}</div>
            <span className="text-[11px] text-amber-800 dark:text-amber-400 block mt-1">Heuristic flag</span>
          </div>

          {/* Unavailable */}
          <div
            onClick={() => setStatusFilter("UNAVAILABLE")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              statusFilter === "UNAVAILABLE"
                ? "bg-slate-100 dark:bg-slate-800 border-slate-500 shadow-md ring-1 ring-slate-500"
                : "bg-white dark:bg-slate-900 border-[#C3C6CE]/30 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-slate-800 dark:text-slate-300">
              <span className="text-xs font-semibold uppercase">{t.dashboard?.filterInconclusive || "Unavailable"}</span>
              <HelpCircle className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
            <div className="text-2xl font-bold text-slate-700 dark:text-slate-200 mt-2">{statusCounts.unavailable}</div>
            <span className="text-[11px] text-slate-700 dark:text-slate-400 block mt-1">No API endpoint</span>
          </div>

          {/* Failed */}
          <div
            onClick={() => setStatusFilter("FAILED")}
            className={`cursor-pointer p-4 rounded-xl border transition-all ${
              statusFilter === "FAILED"
                ? "bg-rose-50 dark:bg-rose-950/60 border-rose-500 shadow-md ring-1 ring-rose-500"
                : "bg-white dark:bg-slate-900 border-[#C3C6CE]/30 dark:border-slate-800 hover:border-rose-300 dark:hover:border-rose-700"
            }`}
          >
            <div className="flex items-center justify-between text-rose-800 dark:text-rose-400">
              <span className="text-xs font-semibold uppercase">{t.common?.statusTampered || "Failed"}</span>
              <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-700 dark:text-rose-300 mt-2">{statusCounts.failed}</div>
            <span className="text-[11px] text-rose-800 dark:text-rose-400 block mt-1">Origin mismatch</span>
          </div>
        </div>

        {/* Universal Document Intake Zone */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-[#C3C6CE]/30 dark:border-slate-800 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#001428] dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#4338CA] dark:text-indigo-400" />
                {t.dashboard?.uploadZoneTitle || "Universal Document Intake"}
              </h2>
              <p className="text-xs text-[#43474D] dark:text-slate-300 mt-0.5">
                {t.dashboard?.uploadZoneSub || "Upload scans or digital records. Cryptographic SHA-256 fingerprint generated at point of arrival."}
              </p>
            </div>
            <span className="hidden sm:inline-block text-xs bg-[#EAEDFF] dark:bg-slate-800 text-[#4338CA] dark:text-indigo-400 font-semibold px-2.5 py-1 rounded-md">
              PDF • PNG • JPG • DOCX (Max 25MB)
            </span>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragOver(false);
              handleFileUpload(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              isDragOver
                ? "border-[#4338CA] bg-[#FAF8FF] dark:bg-slate-800/80 scale-[1.01]"
                : "border-[#C3C6CE] dark:border-slate-700 hover:border-[#4338CA] dark:hover:border-indigo-400 bg-[#FAF8FF]/60 dark:bg-slate-800/30 hover:bg-[#FAF8FF] dark:hover:bg-slate-800/60"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              accept=".pdf,.png,.jpg,.jpeg,.docx"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-[#EAEDFF] dark:bg-indigo-950/80 text-[#4338CA] dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#001428] dark:text-white">
                {t.dashboard?.browseFilesBtn || "Click to browse or drag and drop your document here"}
              </p>
              <p className="text-xs text-[#74777E] dark:text-slate-400 mt-1">
                {t.dashboard?.securityGuarantee || "Non-custodial, DPDP compliant zero-knowledge credential extraction."}
              </p>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="flex flex-col gap-1.5 p-3 bg-[#FAF8FF] dark:bg-slate-800 rounded-lg border border-[#C3C6CE]/40 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-[#001428] dark:text-white font-semibold">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#4338CA] dark:text-indigo-400" />
                  Processing Magic Byte Validation & Text Extraction...
                </span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#EAEDFF] dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#4338CA] dark:bg-indigo-500 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {uploadError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{uploadError}</span>
            </div>
          )}
          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{uploadSuccess}</span>
            </div>
          )}
        </div>

        {/* Case Documents Inventory Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-[#C3C6CE]/30 dark:border-slate-800 overflow-hidden flex flex-col">
          {/* Table Toolbar */}
          <div className="p-4 sm:p-5 border-b border-[#C3C6CE]/30 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#FAF8FF] dark:bg-slate-800/50">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[#001428] dark:text-white text-base">
                {t.dashboard?.documentsTitle || "Case Documents"} ({filteredDocuments.length})
              </h3>
              {statusFilter !== "ALL" && (
                <span className="text-xs bg-[#EAEDFF] dark:bg-slate-800 text-[#4338CA] dark:text-indigo-400 px-2 py-0.5 rounded font-semibold">
                  Filter: {statusFilter.replace("_", " ")}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#74777E] dark:text-slate-400" />
                <input
                  type="text"
                  placeholder={t.common?.search || "Filter by candidate or file..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-[#C3C6CE] dark:border-slate-700 text-[#001428] dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-[#4338CA]"
                />
              </div>
            </div>
          </div>

          {/* Documents Table */}
          {isLoading ? (
            <div className="p-12 text-center text-sm text-[#74777E] dark:text-slate-400 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#4338CA] dark:text-indigo-400" />
              {t.common?.loading || "Loading case artifacts..."}
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <FileText className="w-12 h-12 text-[#C3C6CE] dark:text-slate-700" />
              <p className="text-sm font-semibold text-[#001428] dark:text-white">
                {t.dashboard?.emptyDocuments || "No documents found"}
              </p>
              <p className="text-xs text-[#74777E] dark:text-slate-400 max-w-sm">
                {documents.length === 0
                  ? t.dashboard?.emptyUploadPrompt || "Upload a degree certificate, transcript, or marksheet using the intake area above to start inspection."
                  : "No documents matched the active filter. Try resetting search filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF8FF] dark:bg-slate-800/80 text-[#74777E] dark:text-slate-400 border-b border-[#C3C6CE]/30 dark:border-slate-800 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">{t.dashboard?.colDocument || "Document / File"}</th>
                    <th className="py-3 px-4">SHA-256 Fingerprint</th>
                    <th className="py-3 px-4">{t.dashboard?.colType || "Extracted Candidate"}</th>
                    <th className="py-3 px-4">Conferring Body</th>
                    <th className="py-3 px-4">{t.dashboard?.colStatus || "Status"}</th>
                    <th className="py-3 px-4 text-right">{t.dashboard?.colActions || "Actions"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#C3C6CE]/20">
                  {filteredDocuments.map((doc) => {
                    const isVerified = doc.verification_result?.status === "VERIFIED";
                    const isFailed = doc.verification_result?.status === "VERIFICATION_FAILED";
                    const isUnavailable = doc.verification_result?.status === "UNAVAILABLE";
                    const isReview = doc.verification_result?.status === "NEEDS_REVIEW";

                    return (
                      <tr key={doc.id} className="hover:bg-[#FAF8FF]/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-[#EAEDFF] text-[#4338CA] flex items-center justify-center shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-semibold text-[#001428] block truncate max-w-[200px]">
                                {doc.original_filename}
                              </span>
                              <span className="text-[11px] text-[#74777E]">
                                {(doc.file_size_bytes / 1024).toFixed(1)} KB • {doc.file_type.split("/")[1]?.toUpperCase() || "DOC"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-[#43474D]">
                          <div className="flex items-center gap-1.5">
                            <span>{doc.file_hash_sha256.slice(0, 10)}...</span>
                            <button
                              onClick={() => handleCopyHash(doc.file_hash_sha256)}
                              className="text-[#74777E] hover:text-[#001428] p-1 rounded"
                              title="Copy full SHA-256"
                            >
                              {copiedHash === doc.file_hash_sha256 ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium text-[#001428] block">
                            {doc.extracted_fields.candidate_name?.extracted_value || "—"}
                          </span>
                          <span className="text-[11px] text-[#74777E]">
                            PRN: {doc.extracted_fields.registration_id?.extracted_value || "—"}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="text-[#001428] block truncate max-w-[180px]">
                            {doc.extracted_fields.institution?.extracted_value || "—"}
                          </span>
                          <span className="text-[11px] text-[#74777E]">
                            Passing: {doc.extracted_fields.passing_year?.extracted_value || "—"}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {isVerified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified
                            </span>
                          ) : isUnavailable ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                              <HelpCircle className="w-3 h-3" />
                              Unavailable
                            </span>
                          ) : isFailed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              <XCircle className="w-3 h-3" />
                              Failed
                            </span>
                          ) : isReview ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                              <AlertTriangle className="w-3 h-3" />
                              Needs Review
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-100 text-sky-800">
                              <Sparkles className="w-3 h-3" />
                              Analysis OK
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Inspect Console Link */}
                            <Link
                              href={`/cases/${selectedCase?.id}?doc=${doc.id}`}
                              className="px-2.5 py-1 bg-[#EAEDFF] dark:bg-slate-800 text-[#001428] dark:text-white hover:bg-[#DAE2FD] dark:hover:bg-slate-700 rounded font-semibold text-[11px] inline-flex items-center gap-1 transition-colors"
                            >
                              <Eye className="w-3 h-3 text-[#4338CA] dark:text-indigo-400" />
                              {t.dashboard?.btnViewDetails || "Inspect"}
                            </Link>

                            {/* Quick Rail Verification Button */}
                            {!isVerified && (
                              <button
                                onClick={() =>
                                  handleVerifyRail(
                                    doc.id,
                                    doc.extracted_fields.institution?.extracted_value
                                  )
                                }
                                className="px-2.5 py-1 bg-[#001428] dark:bg-blue-600 text-white hover:bg-[#0F2942] dark:hover:bg-blue-700 rounded font-semibold text-[11px] transition-colors"
                                title="Run authoritative verification rail check"
                              >
                                {t.dashboard?.btnVerifyNow || "Verify Rail"}
                              </button>
                            )}

                            {/* Delete Button */}
                            <button
                              onClick={() => handleDeleteDocument(doc.id, doc.original_filename)}
                              className="p-1 text-[#74777E] dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                              title={t.dashboard?.btnDelete || "Delete Document"}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* New Case Creation Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#C3C6CE]/30 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#C3C6CE]/30 dark:border-slate-800">
              <h3 className="font-bold text-[#001428] dark:text-white text-base">
                {t.dashboard?.newCaseBtn || "Initialize New Case Dossier"}
              </h3>
              <button
                onClick={() => setShowNewCaseModal(false)}
                className="text-[#74777E] dark:text-slate-400 hover:text-[#001428] dark:hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="flex flex-col gap-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-[#001428] dark:text-slate-200 block mb-1">
                  Case Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master's Admission 2026 Verification"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF8FF] dark:bg-slate-800 border border-[#C3C6CE] dark:border-slate-700 text-[#001428] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#001428] dark:text-slate-200 block mb-1">
                  Verification Purpose *
                </label>
                <select
                  value={newCasePurpose}
                  onChange={(e) => setNewCasePurpose(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF8FF] dark:bg-slate-800 border border-[#C3C6CE] dark:border-slate-700 text-[#001428] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                >
                  <option value="College Admission">College Admission</option>
                  <option value="Employment Background Check">Employment Background Check</option>
                  <option value="Professional Licensing">Professional Licensing</option>
                  <option value="Immigration / Visa Credential Evaluation">
                    Immigration / Visa Credential Evaluation
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#001428] dark:text-slate-200 block mb-1">
                  Target Concurring Institution
                </label>
                <select
                  value={newCaseTargetInst}
                  onChange={(e) => setNewCaseTargetInst(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FAF8FF] dark:bg-slate-800 border border-[#C3C6CE] dark:border-slate-700 text-[#001428] dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                >
                  <option value="Savitribai Phule Pune University">
                    Savitribai Phule Pune University (SPPU)
                  </option>
                  <option value="University of Mumbai">University of Mumbai</option>
                  <option value="Maharashtra State Board of Technical Education">
                    MSBTE Maharashtra
                  </option>
                  <option value="Rashtrasant Tukadoji Maharaj Nagpur University">
                    RTM Nagpur University
                  </option>
                  <option value="Other / External Institution">Other / External Institution</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#C3C6CE]/30 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#43474D] dark:text-slate-400 hover:bg-[#FAF8FF] dark:hover:bg-slate-800 rounded-lg"
                >
                  {t.common?.cancel || "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCase}
                  className="px-4 py-2 text-xs font-semibold bg-[#001428] dark:bg-blue-600 text-white hover:bg-[#0F2942] dark:hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isCreatingCase ? (t.common?.saving || "Creating...") : (t.common?.confirm || "Initialize Case")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
