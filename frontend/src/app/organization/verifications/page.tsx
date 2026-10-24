"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  User,
  X,
  Loader2,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Printer,
  FileText,
  Check,
  Shield,
  Hash,
} from "lucide-react";
import {
  api,
  User as UserType,
  BatchVerificationRecord,
  CandidateEntry,
} from "@/lib/api";
import {
  parseCandidateFile,
  exportBatchToCsv,
  downloadSampleTemplate,
} from "@/lib/batchUtils";

export default function OrganizationVerificationsPage() {
  const pathname = usePathname();
  const basePath = pathname.startsWith("/admin") ? "/admin" : "/organization";

  const [user, setUser] = useState<UserType | null>(null);
  const [batches, setBatches] = useState<BatchVerificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<BatchVerificationRecord | null>(null);

  // New Batch Modal State
  const [showModal, setShowModal] = useState(false);
  const [inputMode, setInputMode] = useState<"upload" | "manual">("upload");
  const [batchTitle, setBatchTitle] = useState("");
  const [targetInstitution, setTargetInstitution] = useState("Savitribai Phule Pune University");
  const [purpose, setPurpose] = useState("Employment Background Check");
  const [candidatesText, setCandidatesText] = useState(
    "Aarav Sharma, MH-2023-CS-0101, B.E. Computer Engineering, 2023\n" +
    "Priya Deshmukh, MH-2023-EE-0402, B.Tech Electrical Engineering, 2023\n" +
    "Rohan Kulkarni, MU-2022-IT-0899, B.Sc Information Technology, 2022"
  );
  const [parsedCandidates, setParsedCandidates] = useState<CandidateEntry[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Print Batch Modal State
  const [showPrintModal, setShowPrintModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setUser(api.getCurrentUser());
    loadBatches();
  }, []);

  const loadBatches = async () => {
    setIsLoading(true);
    try {
      const data = await api.listBatchVerifications();
      setBatches(data);
    } catch (e) {
      console.error("Failed to load batch verifications:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcessFile = async (file: File) => {
    setFileError(null);
    const result = await parseCandidateFile(file);
    if (result.error) {
      setFileError(result.error);
      return;
    }
    if (result.candidates.length === 0) {
      setFileError("No valid candidate rows detected in file.");
      return;
    }
    setUploadedFileName(file.name);
    setParsedCandidates(result.candidates);
    setCandidatesText(result.rawText);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchTitle.trim() || !targetInstitution.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    let candidates: CandidateEntry[] = [];

    if (inputMode === "upload" && parsedCandidates.length > 0) {
      candidates = parsedCandidates;
    } else {
      // Parse manual text lines
      const lines = candidatesText.split("\n");
      for (const line of lines) {
        const parts = line.split(",").map((s) => s.trim());
        if (parts[0]) {
          candidates.push({
            candidate_name: parts[0],
            roll_number: parts[1] || `REG-${Math.floor(100000 + Math.random() * 900000)}`,
            degree: parts[2] || "Degree Certificate",
            passing_year: parts[3] || "2023",
            status: "PENDING",
          });
        }
      }
    }

    if (candidates.length === 0) {
      setErrorMsg("Please provide at least one valid candidate entry or upload a CSV file.");
      setIsSubmitting(false);
      return;
    }

    try {
      const newBatch = await api.createBatchVerification({
        batch_title: batchTitle.trim(),
        target_institution: targetInstitution.trim(),
        purpose,
        candidates,
      });

      setBatches((prev) => [newBatch, ...prev]);
      setShowModal(false);
      setBatchTitle("");
      setUploadedFileName(null);
      setParsedCandidates([]);
      setFileError(null);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create batch verification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintDossier = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.batch_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.target_institution.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href={basePath}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Back to Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200/60 dark:border-purple-800/60">
                Admin Batch Auditing
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mt-0.5">
              Batch Credential Verifications
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Initiate and audit high-volume candidate verifications across partner university rails.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadSampleTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors"
            title="Download formatted CSV spreadsheet template"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sample Template</span>
          </button>
          <button
            onClick={loadBatches}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0F2942] dark:bg-purple-700 text-white hover:bg-slate-800 dark:hover:bg-purple-800 text-xs font-semibold shadow-xs transition-colors btn-press"
          >
            <Plus className="w-3.5 h-3.5 text-purple-200" />
            <span>New Batch Verification</span>
          </button>
        </div>
      </div>

      {/* Verification Batches Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xs border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Verification Records &amp; Batches
            </h2>
            <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full font-mono">
              {batches.length} Records
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search batch or institution..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            <p className="text-xs text-slate-500">Loading batch verifications from database...</p>
          </div>
        ) : filteredBatches.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-800 dark:text-white">
              No batch requests registered
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
              Submit your first candidate batch via direct CSV upload to initiate cryptographic verification against connected university ledger rails.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create First Batch</span>
              </button>
              <button
                onClick={downloadSampleTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample CSV Template</span>
              </button>
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
                  <th className="py-3 px-4 font-semibold">Rail Status</th>
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
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => exportBatchToCsv(b)}
                          className="p-1.5 text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Export Batch to CSV"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedBatch(b)}
                          className="text-purple-600 dark:text-purple-400 hover:underline font-semibold"
                        >
                          Inspect Batch →
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Candidate Details & Audit Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scalePop">
            <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedBatch.batch_title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {selectedBatch.target_institution} • {selectedBatch.total_candidates} Candidates ({selectedBatch.verified_candidates} verified)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportBatchToCsv(selectedBatch)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-100 text-slate-800 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Export results to CSV"
                >
                  <Download className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="px-2.5 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Generate printable audit dossier"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={() => setSelectedBatch(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50/40 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-center py-2.5 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Rostered</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{selectedBatch.total_candidates}</span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-600 uppercase font-semibold block">Rail Verified</span>
                <span className="font-bold text-emerald-600 text-sm">{selectedBatch.verified_candidates}</span>
              </div>
              <div>
                <span className="text-[10px] text-purple-600 uppercase font-semibold block">Batch Status</span>
                <span className="font-bold text-purple-700 dark:text-purple-400 text-sm">{selectedBatch.status}</span>
              </div>
            </div>

            {/* Candidates List */}
            <div className="p-6 overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {selectedBatch.candidates.map((c, i) => (
                <div key={i} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-lg transition-colors">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{c.candidate_name}</span>
                      <span className="font-mono text-[10px] text-slate-400">PRN: {c.roll_number}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {c.degree} • Class of {c.passing_year}
                    </div>
                    {c.notes && (
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Rail Note: {c.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                        c.status === "VERIFIED"
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                          : c.status === "NEEDS_REVIEW"
                          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {c.status === "VERIFIED" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                      {c.status === "NEEDS_REVIEW" && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                      {c.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 px-6 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-[11px] text-slate-500 font-mono">
                Batch ID: {selectedBatch.id}
              </span>
              <button
                onClick={() => setSelectedBatch(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Batch Audit Dossier Modal */}
      {showPrintModal && selectedBatch && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full text-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-[#0f2942] text-white p-4 px-6 flex items-center justify-between shrink-0 print:hidden">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-purple-300" />
                <span className="font-bold text-sm">Official Batch Audit Dossier</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintDossier}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
                <button
                  onClick={() => setShowPrintModal(false)}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-8 overflow-y-auto flex-1 flex flex-col gap-6" id="lexproof-batch-print-area">
              {/* Report Header */}
              <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0f2942] text-white flex items-center justify-center font-bold text-lg">
                    LP
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#0f2942]">LexProof Institutional Registry</h2>
                    <p className="text-xs text-slate-500">Autonomous Digital Credential Verification &amp; Provenance Ledger</p>
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span className="font-mono font-bold text-slate-900 block">{selectedBatch.id}</span>
                  <span>Issued: {new Date().toLocaleDateString("en-IN")} IST</span>
                </div>
              </div>

              {/* Batch Metadata */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Batch Title</span>
                  <span className="font-bold text-slate-900 block mt-0.5">{selectedBatch.batch_title}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Target University</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">{selectedBatch.target_institution}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block text-[10px] uppercase">Verification Purpose</span>
                  <span className="font-semibold text-slate-900 block mt-0.5">{selectedBatch.purpose}</span>
                </div>
              </div>

              {/* Verification Summary Banner */}
              <div className="p-4 rounded-xl bg-purple-50 border border-purple-200 flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-purple-900 text-sm">AUDIT STATUS: {selectedBatch.status}</span>
                  <p className="text-purple-700 mt-0.5">
                    {selectedBatch.verified_candidates} of {selectedBatch.total_candidates} candidates successfully authenticated against the authoritative university register.
                  </p>
                </div>
                <span className="font-mono text-sm font-bold text-purple-900 px-3 py-1 bg-white rounded-lg border border-purple-200 shadow-xs">
                  {Math.round((selectedBatch.verified_candidates / (selectedBatch.total_candidates || 1)) * 100)}% Match
                </span>
              </div>

              {/* Candidates Table */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Candidate Verification Roster ({selectedBatch.candidates.length})
                </h4>
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-slate-600 border-b border-slate-200 text-[10px] font-semibold">
                      <th className="py-2 px-3">Candidate Name</th>
                      <th className="py-2 px-3">PRN / Roll Number</th>
                      <th className="py-2 px-3">Degree &amp; Program</th>
                      <th className="py-2 px-3">Year</th>
                      <th className="py-2 px-3 text-right">Verdict</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px]">
                    {selectedBatch.candidates.map((c, i) => (
                      <tr key={i}>
                        <td className="py-2 px-3 font-semibold text-slate-900">{c.candidate_name}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{c.roll_number}</td>
                        <td className="py-2 px-3 text-slate-700">{c.degree}</td>
                        <td className="py-2 px-3 text-slate-600">{c.passing_year}</td>
                        <td className="py-2 px-3 text-right">
                          <span className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                            c.status === "VERIFIED" ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Cryptographic Certification Footer */}
              <div className="mt-auto pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                <span>AUTHENTICATION RAIL: {selectedBatch.target_institution}</span>
                <span>SHA-256 LEDGER CERTIFIED • LEXPROOF AUTONOMOUS FORENSICS</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Batch Creation Modal with Drag & Drop CSV Upload */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scalePop">
            <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Initiate Candidate Batch Verification
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Batch Title
                </label>
                <input
                  type="text"
                  required
                  value={batchTitle}
                  onChange={(e) => setBatchTitle(e.target.value)}
                  placeholder="e.g., Campus Hire Verification Batch Q3"
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Target University
                  </label>
                  <select
                    value={targetInstitution}
                    onChange={(e) => setTargetInstitution(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="Savitribai Phule Pune University">Savitribai Phule Pune University (SPPU)</option>
                    <option value="University of Mumbai">University of Mumbai (UoM)</option>
                    <option value="Maharashtra State Board of Technical Education">MSBTE (Polytechnic)</option>
                    <option value="Rashtrasant Tukadoji Maharaj Nagpur University">RTMNU (Nagpur)</option>
                    <option value="University of Delhi">University of Delhi (DU)</option>
                    <option value="Anna University">Anna University</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Verification Purpose
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="Employment Background Check">Employment Background Check</option>
                    <option value="College / Master's Admission">College / Master&apos;s Admission Eligibility</option>
                    <option value="Professional License Verification">Professional License Verification</option>
                    <option value="Government Compliance Audit">Government Compliance Audit</option>
                  </select>
                </div>
              </div>

              {/* Input Mode Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Candidate Roster Intake
                  </label>
                  <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                    <button
                      type="button"
                      onClick={() => setInputMode("upload")}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                        inputMode === "upload"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      CSV / Excel Upload
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("manual")}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                        inputMode === "manual"
                          ? "bg-purple-600 text-white shadow-xs"
                          : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                      }`}
                    >
                      Manual / Text
                    </button>
                  </div>
                </div>

                {inputMode === "upload" ? (
                  <div className="flex flex-col gap-2">
                    {/* Drag and Drop Zone */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                        isDragging
                          ? "border-purple-600 bg-purple-50/60 dark:bg-purple-950/30 ring-2 ring-purple-400/40"
                          : uploadedFileName
                          ? "border-emerald-400 bg-emerald-50/30 dark:bg-emerald-950/20"
                          : "border-slate-300 dark:border-slate-700 hover:border-purple-500 bg-slate-50/50 dark:bg-slate-800/40"
                      }`}
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileInputChange}
                        accept=".csv,.tsv,.txt"
                        className="hidden"
                      />
                      {uploadedFileName ? (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center">
                            <Check className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                              {uploadedFileName}
                            </span>
                            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
                              {parsedCandidates.length} candidate entries parsed successfully
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 underline mt-1">
                            Click or drop another file to replace
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                            <UploadCloud className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="font-semibold text-xs text-slate-900 dark:text-white block">
                              Drag and drop candidate CSV / spreadsheet here
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                              or click to browse from your device (.csv, .tsv, .txt)
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                      <span>Supported columns: Name, PRN / Roll No, Degree, Passing Year</span>
                      <button
                        type="button"
                        onClick={downloadSampleTemplate}
                        className="text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Download className="w-3 h-3" /> Sample CSV
                      </button>
                    </div>

                    {fileError && (
                      <div className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-lg border border-red-200 dark:border-red-900">
                        {fileError}
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <textarea
                      rows={4}
                      required
                      value={candidatesText}
                      onChange={(e) => setCandidatesText(e.target.value)}
                      placeholder="Name, PRN/Roll, Degree, Year (one per line)"
                      className="w-full px-3 py-2 text-xs font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                    <span className="text-[10px] text-slate-400 block mt-1">
                      Format: Name, Roll Number, Degree, Year (one per line)
                    </span>
                  </div>
                )}
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-xs font-semibold bg-[#0F2942] dark:bg-purple-700 text-white hover:bg-slate-800 dark:hover:bg-purple-800 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors btn-press"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Submit Batch Verification</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Information Callout */}
      <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">
            Institutional Data Isolation &amp; Pilot Rails
          </span>
          In accordance with the Digital Personal Data Protection (DPDP) Act and LexProof data isolation architecture, organization verifications are strictly sandboxed. Candidate records submitted by {user?.institution || user?.full_name || "your organization"} are verified against authoritative registrar feeds from Savitribai Phule Pune University, University of Mumbai, MSBTE, and DigiLocker.
        </div>
      </div>
    </div>
  );
}
