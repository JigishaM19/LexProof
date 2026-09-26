"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  ArrowRight,
  Copy,
  Check,
  FileCheck,
  Layers,
  Sparkles,
} from "lucide-react";
import { api, CaseRecord, DocumentRecord, User } from "@/lib/api";
import { useI18n } from "@/lib/i18n";

export default function IndividualOverviewPage() {
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
    loadIndividualData();
  }, []);

  const loadIndividualData = async () => {
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
        setDocuments(detail.documents || []);
      } else {
        const defaultCase = await api.createCase(
          "Personal Document Dossier",
          "College Admission",
          "Savitribai Phule Pune University"
        );
        setCases([defaultCase]);
        setSelectedCase(defaultCase);
        setDocuments([]);
      }
    } catch (err: any) {
      console.error("Individual data load error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectCase = async (c: CaseRecord) => {
    setSelectedCase(c);
    setIsLoading(true);
    try {
      const detail = await api.getCase(c.id);
      setDocuments(detail.documents || []);
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
      await api.uploadDocument(file, targetCaseId);

      clearInterval(interval);
      setUploadProgress(100);
      setUploadSuccess(`"${file.name}" uploaded and extracted successfully!`);

      if (selectedCase) {
        const detail = await api.getCase(selectedCase.id);
        setDocuments(detail.documents || []);
        setSelectedCase(detail.case);
      } else {
        await loadIndividualData();
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

  // Compute status counts strictly from real documents
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
    <div className="flex flex-col gap-6">
      {/* Pilot Infrastructure Notice */}
      <div className="animate-slideUp bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-3 px-4 text-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-200">
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulseRing"></span>
          <span className="font-semibold uppercase tracking-wider">Pilot Infrastructure Active:</span>
          <span>Authoritative verification rails connected for selected Maharashtra institutions.</span>
        </div>
        <Link
          href="/verification/coverage"
          className="text-blue-700 dark:text-blue-300 hover:underline font-semibold flex items-center gap-1 btn-press"
        >
          Check Coverage Directory <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Workspace Header */}
      <div className="animate-slideUp stagger-1 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider text-blue-700 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-800/60">
              Individual Workspace
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              Session: {selectedCase ? selectedCase.id.slice(0, 8) : "Active"}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Document Analysis & Verification
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
            Manage your personal credentials, extract verifiable fields, and run authoritative institutional queries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setShowNewCaseModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors shadow-xs btn-press"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            New Dossier
          </button>

          {selectedCase && (
            <Link
              href={`/individual/cases/${selectedCase.id}/report`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#0f2942] dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 text-xs font-semibold transition-colors shadow-xs btn-press"
            >
              <FileCheck className="w-3.5 h-3.5 text-blue-200" />
              Audit Report
            </Link>
          )}
        </div>
      </div>

      {/* Case Switcher & Information Strip */}
      <div className="animate-slideUp stagger-2 bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex flex-col">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Active Verification Dossier:
            </label>
            <select
              value={selectedCase?.id || ""}
              onChange={(e) => {
                const found = cases.find((c) => c.id === e.target.value);
                if (found) handleSelectCase(found);
              }}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} ({c.purpose})
                </option>
              ))}
            </select>
          </div>

          {selectedCase && (
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-300 border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-2 sm:pt-0 sm:pl-4">
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Target Institution:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                  {selectedCase.target_institution || "General Intake"}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Dossier Status:</span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
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

        <button
          onClick={() => selectedCase && handleSelectCase(selectedCase)}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors self-end lg:self-auto"
          title="Refresh Dossier Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Contradiction Warning */}
      {selectedCase && selectedCase.contradictions && selectedCase.contradictions.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border-l-4 border-amber-500 p-3 rounded-r-xl flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-semibold text-amber-900 dark:text-amber-200">
              Cross-Document Contradiction Detected ({selectedCase.contradictions.length})
            </h4>
            <ul className="mt-1 list-disc list-inside text-amber-800 dark:text-amber-300 space-y-0.5">
              {selectedCase.contradictions.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 6-State Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 animate-slideUp stagger-3">
        {/* Total */}
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all card-hover-lift animate-scalePop stagger-1 ${
            statusFilter === "ALL"
              ? "bg-white dark:bg-slate-800 border-blue-600 dark:border-blue-500 shadow-xs ring-1 ring-blue-600"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
          }`}
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-[11px] font-semibold uppercase">Total Files</span>
            <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1.5">{statusCounts.total}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">In this dossier</span>
        </div>

        {/* Verified */}
        <div
          onClick={() => setStatusFilter("VERIFIED")}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all card-hover-lift animate-scalePop stagger-2 ${
            statusFilter === "VERIFIED"
              ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 shadow-xs ring-1 ring-emerald-500"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400">
            <span className="text-[11px] font-semibold uppercase">Verified</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1.5">{statusCounts.verified}</div>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">Rail confirmed</span>
        </div>

        {/* Analysis Complete */}
        <div
          onClick={() => setStatusFilter("ANALYSIS_COMPLETE")}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all card-hover-lift animate-scalePop stagger-3 ${
            statusFilter === "ANALYSIS_COMPLETE"
              ? "bg-sky-50 dark:bg-sky-950/60 border-sky-500 shadow-xs ring-1 ring-sky-500"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-300"
          }`}
        >
          <div className="flex items-center justify-between text-sky-800 dark:text-sky-400">
            <span className="text-[11px] font-semibold uppercase">Analyzed</span>
            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="text-xl font-bold text-sky-700 dark:text-sky-300 mt-1.5">{statusCounts.analysisComplete}</div>
          <span className="text-[10px] text-sky-700 dark:text-sky-400 block mt-0.5">Optical syntax OK</span>
        </div>

        {/* Needs Review */}
        <div
          onClick={() => setStatusFilter("NEEDS_REVIEW")}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all card-hover-lift animate-scalePop stagger-4 ${
            statusFilter === "NEEDS_REVIEW"
              ? "bg-amber-50 dark:bg-amber-950/60 border-amber-500 shadow-xs ring-1 ring-amber-500"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between text-amber-800 dark:text-amber-400">
            <span className="text-[11px] font-semibold uppercase">Review</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-700 dark:text-amber-300 mt-1.5">{statusCounts.needsReview}</div>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-0.5">Heuristic flag</span>
        </div>

        {/* Unavailable */}
        <div
          onClick={() => setStatusFilter("UNAVAILABLE")}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all card-hover-lift animate-scalePop stagger-5 ${
            statusFilter === "UNAVAILABLE"
              ? "bg-slate-100 dark:bg-slate-800 border-slate-500 shadow-xs ring-1 ring-slate-500"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300"
          }`}
        >
          <div className="flex items-center justify-between text-slate-800 dark:text-slate-300">
            <span className="text-[11px] font-semibold uppercase">Unavailable</span>
            <HelpCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-1.5">{statusCounts.unavailable}</div>
          <span className="text-[10px] text-slate-600 dark:text-slate-400 block mt-0.5">No API rail</span>
        </div>

        {/* Failed */}
        <div
          onClick={() => setStatusFilter("FAILED")}
          className={`cursor-pointer p-3.5 rounded-xl border transition-all card-hover-lift animate-scalePop stagger-6 ${
            statusFilter === "FAILED"
              ? "bg-rose-50 dark:bg-rose-950/60 border-rose-500 shadow-xs ring-1 ring-rose-500"
              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between text-rose-800 dark:text-rose-400">
            <span className="text-[11px] font-semibold uppercase">Failed</span>
            <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="text-xl font-bold text-rose-700 dark:text-rose-300 mt-1.5">{statusCounts.failed}</div>
          <span className="text-[10px] text-rose-700 dark:text-rose-400 block mt-0.5">Origin mismatch</span>
        </div>
      </div>

      {/* Universal Document Intake Zone */}
      <div className="animate-slideUp stagger-4 bg-white dark:bg-slate-900 rounded-xl p-5 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Document Intake & Extraction
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Upload credentials. Automatic SHA-256 fingerprint computed immediately at point of arrival.
            </p>
          </div>
          <span className="hidden sm:inline-block text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold px-2 py-0.5 rounded">
            PDF • PNG • JPG (Max 25MB)
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
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]"
              : "border-slate-200 dark:border-slate-700 hover:border-blue-500 bg-slate-50/60 dark:bg-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/60 animate-breathe"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e.target.files)}
            accept=".pdf,.png,.jpg,.jpeg,.docx"
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-white">
              Click to select or drag and drop your document here
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              DPDP compliant non-custodial extraction
            </p>
          </div>
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="flex flex-col gap-1 p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between text-xs text-slate-800 dark:text-white font-medium">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3 animate-spin text-blue-600 dark:text-blue-400" />
                Validating Magic Bytes & Parsing Text...
              </span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-300 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Alerts */}
        {uploadError && (
          <div className="animate-notifSlide p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span>{uploadError}</span>
          </div>
        )}
        {uploadSuccess && (
          <div className="animate-notifSlide p-2.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs rounded-lg flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span>{uploadSuccess}</span>
          </div>
        )}
      </div>

      {/* Case Documents Inventory Table */}
      <div className="animate-slideUp stagger-5 bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-3.5 px-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Dossier Documents ({filteredDocuments.length})
            </h3>
            {statusFilter !== "ALL" && (
              <span className="text-[11px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded font-semibold">
                Filter: {statusFilter.replace("_", " ")}
              </span>
            )}
          </div>

          <div className="relative flex-1 sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search file, candidate, or PRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Documents Table Content */}
        {isLoading ? (
          <div className="p-10 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
            Loading dossier documents...
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="p-10 text-center flex flex-col items-center justify-center gap-2.5">
            <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-semibold text-slate-800 dark:text-white">
              No documents yet
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
              {documents.length === 0
                ? "Upload your degree certificate, marksheet, or transcript above to get started."
                : "No documents matched your active search query."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-4">Document / File</th>
                  <th className="py-2.5 px-4">SHA-256 Fingerprint</th>
                  <th className="py-2.5 px-4">Extracted Candidate</th>
                  <th className="py-2.5 px-4">Conferring Body</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDocuments.map((doc) => {
                  const isVerified = doc.verification_result?.status === "VERIFIED";
                  const isFailed = doc.verification_result?.status === "VERIFICATION_FAILED";
                  const isUnavailable = doc.verification_result?.status === "UNAVAILABLE";
                  const isReview = doc.verification_result?.status === "NEEDS_REVIEW";

                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors animate-rowReveal" style={{ animationDelay: `${0.03 * filteredDocuments.indexOf(doc)}s` }}>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <FileText className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate max-w-[180px]">
                              {doc.original_filename}
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              {(doc.file_size_bytes / 1024).toFixed(1)} KB • {doc.file_type.split("/")[1]?.toUpperCase() || "DOC"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-2.5 px-4 font-mono text-[10px] text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span>{doc.file_hash_sha256.slice(0, 8)}...</span>
                          <button
                            onClick={() => handleCopyHash(doc.file_hash_sha256)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded"
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

                      <td className="py-2.5 px-4">
                        <span className="font-medium text-slate-800 dark:text-slate-200 block">
                          {doc.extracted_fields.candidate_name?.extracted_value || "—"}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          PRN: {doc.extracted_fields.registration_id?.extracted_value || "—"}
                        </span>
                      </td>

                      <td className="py-2.5 px-4">
                        <span className="text-slate-800 dark:text-slate-200 block truncate max-w-[160px]">
                          {doc.extracted_fields.institution?.extracted_value || "—"}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          Year: {doc.extracted_fields.passing_year?.extracted_value || "—"}
                        </span>
                      </td>

                      <td className="py-2.5 px-4">
                        {isVerified ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : isUnavailable ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            <HelpCircle className="w-3 h-3" />
                            Unavailable
                          </span>
                        ) : isFailed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
                            <XCircle className="w-3 h-3" />
                            Failed
                          </span>
                        ) : isReview ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                            <AlertTriangle className="w-3 h-3" />
                            Review
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300">
                            <Sparkles className="w-3 h-3" />
                            Analyzed
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/individual/cases/${selectedCase?.id}?doc=${doc.id}`}
                            className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded font-semibold text-[10px] inline-flex items-center gap-1 transition-colors"
                          >
                            <Eye className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            Inspect
                          </Link>

                          {!isVerified && (
                            <button
                              onClick={() =>
                                handleVerifyRail(
                                  doc.id,
                                  doc.extracted_fields.institution?.extracted_value
                                )
                              }
                              className="px-2 py-0.5 bg-[#0f2942] dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 rounded font-semibold text-[10px] transition-colors"
                              title="Run authoritative verification rail check"
                            >
                              Verify Rail
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteDocument(doc.id, doc.original_filename)}
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3 h-3" />
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

      {/* New Case Creation Modal */}
      {showNewCaseModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-modalOverlay">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-modalContent">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Create New Verification Dossier
              </h3>
              <button
                onClick={() => setShowNewCaseModal(false)}
                className="text-slate-400 hover:text-slate-800 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCase} className="flex flex-col gap-3.5 mt-3.5">
              <div>
                <label className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Dossier Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master's Admission 2026 Credentials"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Verification Purpose *
                </label>
                <select
                  value={newCasePurpose}
                  onChange={(e) => setNewCasePurpose(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                <label className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Target Concurring Institution
                </label>
                <select
                  value={newCaseTargetInst}
                  onChange={(e) => setNewCaseTargetInst(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
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

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewCaseModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCase}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#0f2942] dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {isCreatingCase ? "Creating..." : "Initialize Dossier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
