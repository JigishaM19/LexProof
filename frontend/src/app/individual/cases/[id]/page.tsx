"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  XCircle,
  ArrowLeft,
  FileCheck,
  RefreshCw,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Edit2,
  Save,
  Sparkles,
  Eye,
  EyeOff,
  Layers,
  ScanLine,
  Printer,
  X as XIcon,
} from "lucide-react";
import { api, CaseRecord, DocumentRecord, TamperRegion, CaseReportResponse } from "@/lib/api";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function IndividualCaseInspectionPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const caseId = unwrappedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("doc");

  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"preview" | "text">("preview");

  // Document viewer controls
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [showTamperOverlay, setShowTamperOverlay] = useState(true);
  const [activeHighlightedRegion, setActiveHighlightedRegion] = useState<string | null>(null);

  // Field editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isSavingField, setIsSavingField] = useState(false);

  // Verification Rail triggering
  const [isVerifyingRail, setIsVerifyingRail] = useState(false);
  const [railMessage, setRailMessage] = useState<string | null>(null);

  // Audit Report Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [report, setReport] = useState<CaseReportResponse | null>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [reportCopied, setReportCopied] = useState(false);

  const handleOpenReport = useCallback(async () => {
    setShowReportModal(true);
    if (report) return; // already loaded
    setIsLoadingReport(true);
    try {
      const data = await api.getCaseReport(caseId);
      setReport(data);
    } catch (err) {
      console.error("Failed to load audit report:", err);
    } finally {
      setIsLoadingReport(false);
    }
  }, [caseId, report]);

  const handlePrintReport = () => {
    if (typeof window !== "undefined") window.print();
  };

  const handleCopyReportLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(`${window.location.origin}/individual/cases/${caseId}/report`);
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2000);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowReportModal(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Background Forensics polling
  useEffect(() => {
    if (!selectedDoc || selectedDoc.status !== "PROCESSING") return;
    let isMounted = true;
    const pollTimer = setInterval(async () => {
      try {
        const statusData = await api.getDocumentStatus(selectedDoc.id);
        if (!isMounted) return;
        if (statusData.status === "PROCESSED" || statusData.status === "ERROR") {
          clearInterval(pollTimer);
          const fullDoc = await api.getDocument(selectedDoc.id);
          setSelectedDoc(fullDoc);
          setDocuments((prev) => prev.map((d) => (d.id === fullDoc.id ? fullDoc : d)));
        } else {
          setSelectedDoc((prev) => (prev ? { ...prev, processing_stage: statusData.processing_stage } : null));
        }
      } catch (e) {
        console.warn("Polling document status notice:", e);
      }
    }, 1500);

    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, [selectedDoc?.id, selectedDoc?.status]);

  useEffect(() => {
    loadCaseData();
  }, [caseId]);


  const loadCaseData = async () => {
    setIsLoading(true);
    try {
      const data = await api.getCase(caseId);
      setCaseRecord(data.case);
      setDocuments(data.documents);

      if (data.documents.length > 0) {
        if (initialDocId) {
          const match = data.documents.find((d) => d.id === initialDocId);
          setSelectedDoc(match || data.documents[0]);
        } else {
          setSelectedDoc(data.documents[0]);
        }
      }
    } catch (err: any) {
      console.error("Failed to load case data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedDoc) {
      const initialVals: Record<string, string> = {};
      Object.entries(selectedDoc.extracted_fields).forEach(([k, v]) => {
        initialVals[k] = v.extracted_value || "";
      });
      setFieldValues(initialVals);
    }
  }, [selectedDoc]);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSaveField = async (fieldKey: string) => {
    if (!selectedDoc) return;
    setIsSavingField(true);
    try {
      const updated = await api.updateDocumentFields(selectedDoc.id, {
        [fieldKey]: fieldValues[fieldKey] || "",
      });
      setSelectedDoc(updated);
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setEditingField(null);
    } catch (err: any) {
      alert("Failed to update field: " + err.message);
    } finally {
      setIsSavingField(false);
    }
  };

  const handleRunRailVerification = async () => {
    if (!selectedDoc) return;
    setIsVerifyingRail(true);
    setRailMessage(null);
    try {
      const updated = await api.verifyDocument({
        document_id: selectedDoc.id,
        institution_name: selectedDoc.extracted_fields.institution?.extracted_value,
        candidate_name: selectedDoc.extracted_fields.candidate_name?.extracted_value,
        roll_number: selectedDoc.extracted_fields.registration_id?.extracted_value,
      });
      setSelectedDoc(updated);
      setDocuments((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

      if (updated.verification_result?.status === "VERIFIED") {
        setRailMessage("Authoritative verification confirmed via institutional ledger rail!");
      } else {
        setRailMessage("Verification unavailable: Issuing body outside active pilot rail coverage.");
      }
    } catch (err: any) {
      alert("Verification query failed: " + err.message);
    } finally {
      setIsVerifyingRail(false);
      setTimeout(() => setRailMessage(null), 5000);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
        Loading inspection console...
      </div>
    );
  }

  if (!caseRecord) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 text-center max-w-md mx-auto my-8">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Dossier Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
          The requested verification dossier could not be located or may have been deleted.
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

  return (
    <div className="flex flex-col gap-4">
      {/* Top Header & Breadcrumb */}
      <div className="animate-slideUp bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/individual"
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Back to Overview"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/50 dark:border-blue-900/50">
                Inspection Console
              </span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                {caseRecord.title}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              ID: {caseRecord.id.slice(0, 8)} • Target: {caseRecord.target_institution || "General"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenReport}
            className="px-3 py-1.5 rounded-lg bg-[#0f2942] dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs btn-press"
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-200" />
            Audit Receipt
          </button>
          <Link
            href={`/individual/cases/${caseRecord.id}/report`}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
            title="Open Dedicated Full Page Report"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Inspection Layout (Side-by-Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left Pane: Interactive Document Viewer */}
        <div className="animate-slideUp stagger-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col">
          {/* Document Switcher Toolbar */}
          <div className="p-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all btn-press ${
                    selectedDoc?.id === doc.id
                      ? "bg-[#0f2942] dark:bg-blue-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  <FileText className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{doc.original_filename}</span>
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-2 py-0.5 font-semibold rounded ${
                  activeTab === "preview"
                    ? "bg-[#0f2942] dark:bg-blue-600 text-white"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Visual
              </button>
              <button
                onClick={() => setActiveTab("text")}
                className={`px-2 py-0.5 font-semibold rounded ${
                  activeTab === "text"
                    ? "bg-[#0f2942] dark:bg-blue-600 text-white"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                Extracted Text
              </button>
            </div>
          </div>

          {/* Document Viewer Action Controls */}
          {activeTab === "preview" && (
            <div className="px-3 py-1.5 bg-slate-50/50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 15, 50))}
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[10px] font-semibold">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 15, 200))}
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="px-1.5 py-0.5 hover:bg-white dark:hover:bg-slate-700 rounded text-[10px]"
                >
                  Reset
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded ml-1"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Forensic Highlights Toggle Button */}
              {selectedDoc?.tamper_regions && selectedDoc.tamper_regions.length > 0 && (
                <button
                  onClick={() => setShowTamperOverlay((prev) => !prev)}
                  className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 transition-all ${
                    showTamperOverlay
                      ? "bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/40"
                      : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  }`}
                  title="Toggle Visual Tamper Bounding Boxes"
                >
                  <Eye className="w-3 h-3 text-red-500" />
                  <span>Tamper Alerts ({selectedDoc.tamper_regions.length})</span>
                </button>
              )}

              {selectedDoc && (
                <a
                  href={api.getDocumentFileUrl(selectedDoc.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                >
                  Open Raw <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Background Processing Banner */}
          {selectedDoc?.status === "PROCESSING" && (
            <div className="mx-3 mt-3 p-3 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/40 dark:to-blue-950/30 border border-sky-200 dark:border-sky-800 rounded-xl flex items-center justify-between gap-3 shadow-xs animate-pulse">
              <div className="flex items-center gap-2.5">
                <RefreshCw className="w-4 h-4 text-sky-600 dark:text-sky-400 animate-spin shrink-0" />
                <div>
                  <div className="text-xs font-bold text-sky-900 dark:text-sky-200">
                    Background Multi-Page Forensics Engine Active
                  </div>
                  <div className="text-[11px] text-sky-700 dark:text-sky-400">
                    {selectedDoc.processing_stage || "Extracting text, analyzing fonts, and scanning for tampering..."}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-200 dark:bg-sky-900 text-sky-900 dark:text-sky-200">
                LIVE
              </span>
            </div>
          )}

          {/* Viewer Content Canvas */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative min-h-[460px] bg-slate-100/50 dark:bg-slate-950/50">
            {selectedDoc ? (
              activeTab === "preview" ? (
                <div
                  className="transition-transform duration-200 shadow-md rounded-lg bg-white overflow-hidden max-w-full relative"
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                  }}
                >
                  <div className="relative inline-block max-w-full">
                    {selectedDoc.file_type === "application/pdf" ? (
                      <iframe
                        src={`${api.getDocumentFileUrl(selectedDoc.id)}#toolbar=0`}
                        className="w-[520px] h-[680px] border-0"
                        title={selectedDoc.original_filename}
                      />
                    ) : (
                      <img
                        src={api.getDocumentFileUrl(selectedDoc.id)}
                        alt={selectedDoc.original_filename}
                        className="max-w-[520px] max-h-[680px] object-contain block"
                      />
                    )}

                    {/* Forensic Tamper Bounding Boxes Overlay */}
                    {showTamperOverlay &&
                      selectedDoc.tamper_regions?.map((reg) => {
                        const isSelected = activeHighlightedRegion === reg.id;
                        return (
                          <div
                            key={reg.id}
                            style={{
                              left: `${reg.bbox[0]}%`,
                              top: `${reg.bbox[1]}%`,
                              width: `${reg.bbox[2]}%`,
                              height: `${reg.bbox[3]}%`,
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveHighlightedRegion(reg.id);
                            }}
                            className={`absolute border-2 rounded transition-all duration-200 cursor-pointer pointer-events-auto group ${
                              reg.severity === "HIGH"
                                ? "border-red-500 bg-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.5)]"
                                : "border-amber-500 bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                            } ${isSelected ? "ring-4 ring-red-400 scale-[1.02] z-30" : "z-10"}`}
                          >
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-0 z-30 whitespace-nowrap bg-slate-900/95 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xl pointer-events-none flex items-center gap-1.5 border border-slate-700">
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              <span>{reg.label}: {reg.description}</span>
                              <span className="text-slate-400 font-mono">({Math.round(reg.confidence * 100)}%)</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 overflow-auto font-mono text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                  <div className="font-sans font-bold text-xs text-slate-900 dark:text-white mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span>Non-Destructive Text Extraction Layer</span>
                    <span className="text-[10px] text-slate-400 font-normal">
                      PyMuPDF / LexProof
                    </span>
                  </div>
                  <pre className="whitespace-pre-wrap">
                    {Object.entries(selectedDoc.extracted_fields)
                      .map(([k, v]) => `${v.field_name}: ${v.extracted_value} [Confidence: ${(v.confidence * 100).toFixed(0)}%]`)
                      .join("\n")}
                  </pre>
                </div>
              )
            ) : (
              <div className="text-center text-xs text-slate-400">No document selected.</div>
            )}
          </div>

          {/* Cryptographic SHA-256 Capsule */}
          {selectedDoc && (
            <div className="p-2.5 px-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">SHA-256:</span>
                <span className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {selectedDoc.file_hash_sha256}
                </span>
                <button
                  onClick={() => handleCopyHash(selectedDoc.file_hash_sha256)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded"
                  title="Copy SHA-256"
                >
                  {copiedHash === selectedDoc.file_hash_sha256 ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                {(selectedDoc.file_size_bytes / 1024).toFixed(1)} KB • {selectedDoc.file_type} {selectedDoc.page_count ? `• ${selectedDoc.page_count} page(s)` : ""}
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Extracted Structured Entities & Verification Workspace */}
        <div className="animate-slideInRight stagger-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col gap-4">
          {selectedDoc ? (
            <>
              {/* Status Header & Action Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Extracted Entity Schema</h2>
                    {selectedDoc.tamper_detected ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Tamper Detected ({selectedDoc.tamper_regions?.length || 0})
                      </span>
                    ) : selectedDoc.verification_result?.status === "VERIFIED" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    ) : selectedDoc.verification_result?.status === "UNAVAILABLE" ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Unavailable
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Optical Extracted
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Field-level parsing verified against official credential layout schemas.
                  </p>
                </div>

                <button
                  onClick={handleRunRailVerification}
                  disabled={isVerifyingRail}
                  className="px-3 py-1.5 rounded-lg bg-[#0f2942] dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0 btn-press"
                >
                  <Shield className="w-3.5 h-3.5 text-blue-200" />
                  {isVerifyingRail ? "Querying Rail..." : "Run Authoritative Rail"}
                </button>
              </div>

              {/* Forensic Tamper Alerts Card */}
              {selectedDoc.tamper_regions && selectedDoc.tamper_regions.length > 0 && (
                <div className="p-3.5 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 rounded-xl flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-red-900 dark:text-red-200">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Tamper Detection Findings ({selectedDoc.tamper_regions.length} Alert{selectedDoc.tamper_regions.length > 1 ? "s" : ""})</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-200">
                      Risk Score: {Math.round((selectedDoc.tamper_score || 0) * 100)}%
                    </span>

                  </div>

                  <div className="flex flex-col gap-2">
                    {selectedDoc.tamper_regions.map((reg) => (
                      <div
                        key={reg.id}
                        onClick={() => {
                          setActiveHighlightedRegion(reg.id);
                          setShowTamperOverlay(true);
                        }}
                        className={`p-2.5 rounded-lg bg-white dark:bg-slate-900 border text-xs cursor-pointer transition-all ${
                          activeHighlightedRegion === reg.id
                            ? "border-red-500 shadow-sm"
                            : "border-red-200 dark:border-red-900/40 hover:border-red-400"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                            {reg.label}
                          </span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300">
                            Page {reg.page} • {(reg.confidence * 100).toFixed(0)}% conf
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                          {reg.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              {/* Rail Notification Message */}
              {railMessage && (
                <div
                  className={`animate-notifSlide p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                    selectedDoc.verification_result?.status === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-800 border border-slate-300"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{railMessage}</span>
                </div>
              )}

              {/* Extracted Fields Table */}
              <div className="flex flex-col gap-2">
                {Object.entries(selectedDoc.extracted_fields).map(([key, field]) => {
                  const isEditing = editingField === key;
                  // Cross-link: find a tamper region whose label relates to this field
                  const relatedRegion = selectedDoc.tamper_regions?.find(
                    (r) =>
                      r.label.toLowerCase().includes(field.field_name.toLowerCase().split(" ")[0]) ||
                      field.field_name.toLowerCase().includes(r.label.toLowerCase().split(" ")[0])
                  );
                  const isFieldHighlighted = relatedRegion && activeHighlightedRegion === relatedRegion.id;

                  return (
                    <div
                      key={key}
                      onClick={() => {
                        if (relatedRegion) {
                          setActiveHighlightedRegion(relatedRegion.id);
                          setShowTamperOverlay(true);
                          setActiveTab("preview");
                        }
                      }}
                      className={`p-3 rounded-lg border flex flex-col gap-1.5 animate-rowReveal transition-all ${
                        isFieldHighlighted
                          ? "border-red-500 ring-2 ring-red-400/50 bg-red-50/40 dark:bg-red-950/20 shadow-xs"
                          : relatedRegion
                          ? "border-amber-300 dark:border-amber-700/60 bg-amber-50/20 dark:bg-amber-950/10 hover:border-amber-400 cursor-pointer"
                          : "border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40"
                      }`}
                      style={{ animationDelay: `${0.04 * Object.keys(selectedDoc.extracted_fields).indexOf(key)}s` }}
                      title={relatedRegion ? `Click to highlight forensic region: ${relatedRegion.label}` : undefined}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          {field.field_name}
                          {relatedRegion && (
                            <span title="Forensic alert linked to this attribute">
                              <AlertTriangle className="w-3 h-3 text-amber-500" />
                            </span>
                          )}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(field.confidence * 100).toFixed(0)}% conf
                          </span>
                          {!isEditing ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingField(key);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                              title="Edit Field"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveField(key);
                              }}
                              disabled={isSavingField}
                              className="p-1 text-emerald-600 hover:text-emerald-700 rounded"
                              title="Save Field"
                            >
                              <Save className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {isEditing ? (
                        <input
                          type="text"
                          value={fieldValues[key] || ""}
                          onChange={(e) =>
                            setFieldValues((prev) => ({ ...prev, [key]: e.target.value }))
                          }
                          className="px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-blue-500 rounded focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="text-xs font-semibold text-slate-800 dark:text-white">
                          {field.extracted_value || "—"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-slate-400">
              No document selected for inspection.
            </div>
          )}
        </div>
      </div>

      {/* In-Page Audit Receipt Modal Overlay */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scalePop">
            {/* Modal Header */}
            <div className="bg-[#0f2942] dark:bg-slate-950 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-300" />
                <div>
                  <span className="font-bold text-sm">Official Audit Receipt</span>
                  {report && (
                    <span className="ml-2 font-mono text-[11px] text-slate-400">{report.report_id}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyReportLink}
                  className="px-2.5 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-lg flex items-center gap-1.5 transition-colors"
                  title="Copy shareable report link"
                >
                  {reportCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {reportCopied ? "Copied!" : "Copy Link"}
                </button>
                <button
                  onClick={handlePrintReport}
                  className="px-3 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / PDF
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title="Close"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" id="lexproof-individual-print-area">
              {isLoadingReport ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <RefreshCw className="w-7 h-7 animate-spin text-blue-600 dark:text-blue-400" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Compiling cryptographic audit receipt...</p>
                </div>
              ) : !report ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-900 dark:text-white">Report Compilation Failed</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Could not load audit data. Please try again.</p>
                </div>
              ) : (
                <>
                  {/* Report Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-slate-900 dark:border-slate-700">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0f2942] dark:bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
                        <Shield className="w-6 h-6 text-blue-200" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-slate-900 dark:text-white">LexProof</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 rounded border border-blue-200/50">
                            Verification Dossier
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Digital Credential Intelligence &amp; Provenance Audit Rail</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono text-xs font-bold text-slate-900 dark:text-white block">{report.report_id}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Issued: {new Date(report.generated_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                      </span>
                      <span className="font-mono text-[9px] text-slate-400 truncate max-w-[200px] block">
                        HASH: {report.dossier_hash.slice(0, 16)}...
                      </span>
                    </div>
                  </div>

                  {/* Case Summary */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 uppercase tracking-wider font-semibold block text-[10px]">Case Title</span>
                      <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{report.case.title}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase tracking-wider font-semibold block text-[10px]">Purpose</span>
                      <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{report.case.purpose}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 uppercase tracking-wider font-semibold block text-[10px]">Target Institution</span>
                      <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{report.case.target_institution || "General Intake"}</span>
                    </div>
                  </div>

                  {/* Verdict Banner */}
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    report.overall_status === "VERIFIED"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200"
                      : report.overall_status === "NEEDS_REVIEW"
                      ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200"
                      : report.overall_status === "VERIFICATION_FAILED"
                      ? "bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200"
                      : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200"
                  }`}>
                    <div className="flex items-center gap-3">
                      {report.overall_status === "VERIFIED" ? (
                        <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
                      ) : report.overall_status === "NEEDS_REVIEW" ? (
                        <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" />
                      ) : report.overall_status === "VERIFICATION_FAILED" ? (
                        <XCircle className="w-7 h-7 text-rose-600 shrink-0" />
                      ) : (
                        <HelpCircle className="w-7 h-7 text-slate-500 shrink-0" />
                      )}
                      <div>
                        <h3 className="font-bold text-sm">STATUS: {report.overall_status.replace(/_/g, " ")}</h3>
                        <p className="text-xs mt-0.5 opacity-90">
                          {report.overall_status === "VERIFIED"
                            ? "Records matched conclusively against official registrar records or public cryptographic key signatures."
                            : report.overall_status === "UNAVAILABLE"
                            ? "Optical analysis completed with high confidence, but no authoritative verification rail exists for this institution."
                            : report.overall_status === "NEEDS_REVIEW"
                            ? "Internal heuristic discrepancies detected (e.g. arithmetic mark mismatch or date logic conflict)."
                            : "Extraction completed. Authoritative verification query pending."}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white/80 dark:bg-slate-900 shadow-xs border border-current">
                      {report.overall_status}
                    </span>
                  </div>

                  {/* Document Inventory */}
                  <div className="flex flex-col gap-2">
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
                              <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{d.original_filename}</td>
                              <td className="py-2 px-3 text-slate-500 dark:text-slate-400 font-mono text-[10px]">{d.file_type} ({(d.file_size_bytes / 1024).toFixed(1)} KB)</td>
                              <td className="py-2 px-3 font-mono text-[10px] text-slate-500 dark:text-slate-400">{d.file_hash_sha256}</td>
                              <td className="py-2 px-3 text-right text-slate-500 dark:text-slate-400 text-[10px]">{new Date(d.created_at).toLocaleDateString("en-IN")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Extracted Credentials */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800">
                      02 • Extracted Credential Attributes
                    </h3>
                    {report.documents.map((doc) => (
                      <div key={doc.id} className="bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white">
                          <span>{doc.original_filename}</span>
                          {doc.tamper_detected && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300 rounded-full text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Tamper Detected
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {Object.entries(doc.extracted_fields).map(([k, f]) => (
                            <div key={k} className="bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                              <span className="text-[9px] text-slate-400 uppercase block font-semibold">{f.field_name}</span>
                              <span className="font-bold text-slate-900 dark:text-white text-xs block mt-0.5 truncate">{f.extracted_value || "—"}</span>
                              <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">{(f.confidence * 100).toFixed(0)}% optical</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chain of Custody */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white pb-1 border-b border-slate-200 dark:border-slate-800">
                      03 • Tamper-Evident Chain of Custody &amp; Audit Log
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
                            <tr key={i}>
                              <td className="py-1.5 px-3 font-semibold text-slate-900 dark:text-white">{at.action}</td>
                              <td className="py-1.5 px-3 text-slate-500 dark:text-slate-400 font-sans text-xs">{at.actor}</td>
                              <td className="py-1.5 px-3 text-right text-slate-500 dark:text-slate-400">{at.timestamp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Scope Notice */}
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1">
                      <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      Scope Notice &amp; Data Governance Standard
                    </div>
                    <p>{report.scope_notice}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
