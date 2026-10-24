"use client";

import React, { useState, useEffect, use, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowLeft,
  FileCheck,
  RefreshCw,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  ExternalLink,
  Edit2,
  Save,
  Trash2,
  Sparkles,
  Award,
  Calendar,
  Building,
  User as UserIcon,
  Hash,
  Activity,
  ChevronRight,
  Info,
  Eye,
  EyeOff,
  Printer,
  X as XIcon,
} from "lucide-react";
import { api, CaseRecord, DocumentRecord, CaseReportResponse, VerificationRailResult, TamperRegion } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CaseInspectionPage({ params }: PageProps) {
  const unwrappedParams = use(params);
  const caseId = unwrappedParams.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialDocId = searchParams.get("doc");

  const [caseRecord, setCaseRecord] = useState<CaseRecord | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DocumentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"preview" | "text" | "forensics">("preview");

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
      navigator.clipboard.writeText(`${window.location.origin}/cases/${caseId}/report`);
      setReportCopied(true);
      setTimeout(() => setReportCopied(false), 2000);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowReportModal(false); };
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
    if (!api.isAuthenticated()) {
      router.replace(`/login?redirect=${encodeURIComponent(`/cases/${caseId}`)}`);
      return;
    }
    loadCaseData();
  }, [caseId, router]);


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
      <div className="min-h-screen bg-[#FAF8FF] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#4338CA]" />
          <p className="text-sm font-semibold text-[#001428]">Loading inspection console...</p>
        </div>
      </div>
    );
  }

  if (!caseRecord) {
    return (
      <div className="min-h-screen bg-[#FAF8FF] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-sm text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#001428]">Case Not Found</h2>
          <p className="text-xs text-[#74777E] mt-1 mb-4">
            The requested verification case could not be located or may have been deleted.
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

  return (
    <div className="min-h-screen bg-[#FAF8FF] dark:bg-[#090d16] text-[#131B2E] dark:text-slate-100 flex flex-col font-sans">
      {/* Global Navigation */}
      <Navbar />

      {/* Top Header & Breadcrumb */}
      <header className="bg-white border-b border-[#C3C6CE]/40 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="p-1.5 hover:bg-[#FAF8FF] rounded-lg text-[#74777E] hover:text-[#001428] transition-colors"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#4338CA] uppercase tracking-wider bg-[#E3DFFF] px-2 py-0.5 rounded">
                Inspection Console
              </span>
              <span className="text-xs text-[#74777E]">/</span>
              <span className="text-xs font-semibold text-[#001428] truncate max-w-[200px]">
                {caseRecord.title}
              </span>
            </div>
            <p className="text-[11px] text-[#74777E]">
              Case ID: {caseRecord.id} • Target: {caseRecord.target_institution || "General"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Official Audit Report button – opens in-page modal */}
          <button
            onClick={handleOpenReport}
            className="px-3.5 py-1.5 rounded-lg bg-[#001428] text-white hover:bg-[#0F2942] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileCheck className="w-4 h-4 text-[#93CCFF]" />
            Official Report
          </button>
        </div>
      </header>

      {/* Main Inspection Layout (Side-by-Side) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane: Interactive Document Viewer */}
        <div className="w-full lg:w-1/2 border-r border-[#C3C6CE]/40 flex flex-col bg-[#F2F3FF]/40">
          {/* Document Switcher Toolbar if multiple files */}
          <div className="p-3 bg-white border-b border-[#C3C6CE]/30 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1.5">
              {documents.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                    selectedDoc?.id === doc.id
                      ? "bg-[#001428] text-white shadow-sm"
                      : "bg-[#FAF8FF] text-[#43474D] hover:bg-[#EAEDFF]"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="truncate max-w-[120px]">{doc.original_filename}</span>
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center bg-[#FAF8FF] p-1 rounded-lg border border-[#C3C6CE]/30">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  activeTab === "preview"
                    ? "bg-white text-[#001428] shadow-xs"
                    : "text-[#74777E] hover:text-[#001428]"
                }`}
              >
                Visual
              </button>
              <button
                onClick={() => setActiveTab("text")}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  activeTab === "text"
                    ? "bg-white text-[#001428] shadow-xs"
                    : "text-[#74777E] hover:text-[#001428]"
                }`}
              >
                Extracted Text
              </button>
            </div>
          </div>

          {/* Document Viewer Action Controls */}
          {activeTab === "preview" && (
            <div className="px-4 py-2 bg-white/60 border-b border-[#C3C6CE]/20 flex items-center justify-between text-xs text-[#74777E]">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => Math.max(z - 15, 50))}
                  className="p-1 hover:bg-white rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="font-mono text-[11px] font-semibold">{zoomLevel}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.min(z + 15, 200))}
                  className="p-1 hover:bg-white rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomLevel(100)}
                  className="px-2 py-0.5 hover:bg-white rounded text-[11px]"
                >
                  Reset
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="p-1 hover:bg-white rounded ml-2"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              </div>

              {/* Forensic Highlights Toggle Button */}
              {selectedDoc?.tamper_regions && selectedDoc.tamper_regions.length > 0 && (
                <button
                  onClick={() => setShowTamperOverlay((prev) => !prev)}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                    showTamperOverlay
                      ? "bg-red-50 text-red-700 border border-red-300"
                      : "bg-[#FAF8FF] text-[#43474D] border border-[#C3C6CE]/30"
                  }`}
                  title="Toggle Visual Tamper Bounding Boxes"
                >
                  <Eye className="w-3.5 h-3.5 text-red-600" />
                  <span>Tamper Alerts ({selectedDoc.tamper_regions.length})</span>
                </button>
              )}

              {selectedDoc && (
                <a
                  href={api.getDocumentFileUrl(selectedDoc.id)}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#4338CA] hover:underline flex items-center gap-1 font-semibold text-[11px]"
                >
                  Open Raw <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Background Processing Banner */}
          {selectedDoc?.status === "PROCESSING" && (
            <div className="mx-4 mt-4 p-3.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200 rounded-xl flex items-center justify-between gap-3 shadow-xs animate-pulse">
              <div className="flex items-center gap-3">
                <RefreshCw className="w-4 h-4 text-sky-600 animate-spin shrink-0" />
                <div>
                  <div className="text-xs font-bold text-sky-950">
                    Background Multi-Page Forensics Engine Active
                  </div>
                  <div className="text-[11px] text-sky-700">
                    {selectedDoc.processing_stage || "Extracting text, analyzing fonts, and scanning for tampering..."}
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-200 text-sky-900">
                LIVE
              </span>
            </div>
          )}

          {/* Viewer Content Canvas */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative min-h-[500px]">
            {selectedDoc ? (
              activeTab === "preview" ? (
                <div
                  className="transition-transform duration-200 shadow-xl rounded-lg bg-white overflow-hidden max-w-full relative"
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                  }}
                >
                  <div className="relative inline-block max-w-full">
                    {selectedDoc.file_type === "application/pdf" ? (
                      <iframe
                        src={`${api.getDocumentFileUrl(selectedDoc.id)}#toolbar=0`}
                        className="w-[580px] h-[750px] border-0"
                        title={selectedDoc.original_filename}
                      />
                    ) : (
                      <img
                        src={api.getDocumentFileUrl(selectedDoc.id)}
                        alt={selectedDoc.original_filename}
                        className="max-w-[580px] max-h-[750px] object-contain block"
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
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 left-0 z-30 whitespace-nowrap bg-[#001428]/95 backdrop-blur text-white text-[10px] font-semibold px-2 py-0.5 rounded shadow-xl pointer-events-none flex items-center gap-1.5 border border-slate-700">
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
                /* Raw OCR Text View */
                <div className="w-full h-full bg-white p-6 rounded-xl border border-[#C3C6CE]/30 overflow-auto font-mono text-xs text-[#001428] leading-relaxed">
                  <h4 className="font-sans font-bold text-sm text-[#001428] mb-3 pb-2 border-b border-[#C3C6CE]/20 flex items-center justify-between">
                    <span>Non-Destructive Text Extraction Layer</span>
                    <span className="text-[11px] text-[#74777E] font-normal">
                      Encoding: UTF-8 • Engine: PyMuPDF / LexProof
                    </span>
                  </h4>
                  <pre className="whitespace-pre-wrap">
                    {Object.entries(selectedDoc.extracted_fields)
                      .map(([k, v]) => `${v.field_name}: ${v.extracted_value} [Confidence: ${(v.confidence * 100).toFixed(0)}%]`)
                      .join("\n")}
                  </pre>
                </div>
              )
            ) : (
              <div className="text-center text-xs text-[#74777E]">No document selected.</div>
            )}
          </div>


          {/* Floating Cryptographic Security Capsule */}
          {selectedDoc && (
            <div className="p-3 bg-white border-t border-[#C3C6CE]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#4338CA]" />
                <span className="font-semibold text-[#001428]">SHA-256 Fingerprint:</span>
                <span className="font-mono text-[11px] text-[#43474D]">
                  {selectedDoc.file_hash_sha256}
                </span>
                <button
                  onClick={() => handleCopyHash(selectedDoc.file_hash_sha256)}
                  className="text-[#74777E] hover:text-[#001428] p-1 rounded"
                  title="Copy full cryptographic SHA-256"
                >
                  {copiedHash === selectedDoc.file_hash_sha256 ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="text-[11px] text-[#74777E]">
                {(selectedDoc.file_size_bytes / 1024).toFixed(1)} KB • {selectedDoc.file_type}
              </div>
            </div>
          )}
        </div>

        {/* Right Pane: Extracted Structured Entities & Verification Workspace */}
        <div className="w-full lg:w-1/2 p-6 flex flex-col gap-6 overflow-y-auto bg-white">
          {selectedDoc ? (
            <>
              {/* Status Header & Action Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#C3C6CE]/30">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-bold text-[#001428]">Extracted Entity Schema</h2>
                    {selectedDoc.tamper_detected ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Tamper Detected ({selectedDoc.tamper_regions?.length || 0})
                      </span>
                    ) : selectedDoc.verification_result?.status === "VERIFIED" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    ) : selectedDoc.verification_result?.status === "UNAVAILABLE" ? (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 flex items-center gap-1">
                        <HelpCircle className="w-3.5 h-3.5" /> Unavailable
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Optical Extracted
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#43474D] mt-0.5">
                    Field-level parsing verified against official credential layout schemas.
                  </p>
                </div>

                {/* Authoritative Verification Trigger */}
                <button
                  onClick={handleRunRailVerification}
                  disabled={isVerifyingRail}
                  className="px-4 py-2 rounded-lg bg-[#001428] text-white hover:bg-[#0F2942] text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <Shield className="w-4 h-4 text-[#93CCFF]" />
                  {isVerifyingRail ? "Querying Rail..." : "Run Authoritative Rail"}
                </button>
              </div>

              {/* Forensic Tamper Alerts Card */}
              {selectedDoc.tamper_regions && selectedDoc.tamper_regions.length > 0 && (
                <div className="p-4 bg-red-50/75 border border-red-200 rounded-xl flex flex-col gap-3 shadow-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-950">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Tamper Detection Findings ({selectedDoc.tamper_regions.length} Alert{selectedDoc.tamper_regions.length > 1 ? "s" : ""})</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-red-200 text-red-900">
                      Forensic Risk: {Math.round((selectedDoc.tamper_score || 0) * 100)}%
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
                        className={`p-3 rounded-lg bg-white border text-xs cursor-pointer transition-all ${
                          activeHighlightedRegion === reg.id
                            ? "border-red-500 shadow-sm"
                            : "border-red-200 hover:border-red-400"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-semibold text-[#001428] flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
                            {reg.label}
                          </span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                            Page {reg.page} • {(reg.confidence * 100).toFixed(0)}% conf
                          </span>
                        </div>
                        <p className="text-[11px] text-[#43474D] leading-snug">
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
                  className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                    selectedDoc.verification_result?.status === "VERIFIED"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-800 border border-slate-300"
                  }`}
                >
                  {selectedDoc.verification_result?.status === "VERIFIED" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 text-slate-600 shrink-0" />
                  )}
                  <span>{railMessage}</span>
                </div>
              )}

              {/* Authoritative Verification Result Card (if verified or unavailable) */}
              {selectedDoc.verification_result && (
                <div
                  className={`p-4 rounded-xl border flex flex-col gap-2 ${
                    selectedDoc.verification_result.status === "VERIFIED"
                      ? "bg-emerald-50/60 border-emerald-300"
                      : "bg-slate-50 border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#001428] flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-[#4338CA]" />
                      Provenance Audit Result
                    </span>
                    <span className="font-mono text-[11px] text-[#74777E]">
                      CODE: {selectedDoc.verification_result.status_code}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-[#001428]">
                    {selectedDoc.verification_result.source_details}
                  </p>
                  <p className="text-xs text-[#43474D]">
                    {selectedDoc.verification_result.notes}
                  </p>

                  {Object.keys(selectedDoc.verification_result.matched_fields).length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-emerald-200 text-xs">
                      {Object.entries(selectedDoc.verification_result.matched_fields).map(
                        ([k, v]) => (
                          <div key={k} className="bg-white p-2 rounded border border-emerald-100">
                            <span className="text-[11px] text-[#74777E] block">{k}:</span>
                            <span className="font-semibold text-emerald-800">{v}</span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Extracted Fields Grid */}
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#74777E]">
                  Verified Credential Attributes
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(selectedDoc.extracted_fields).map(([key, field]) => {
                    const isEditing = editingField === key;
                    const confidencePercent = Math.round(field.confidence * 100);
                    // Cross-link: find a tamper region whose label/description relates to this field
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
                        className={`bg-[#FAF8FF] p-3.5 rounded-xl border flex flex-col justify-between gap-2 transition-all ${
                          isFieldHighlighted
                            ? "border-red-400 ring-2 ring-red-300 shadow-sm"
                            : relatedRegion
                            ? "border-amber-300/60 hover:border-amber-400 cursor-pointer"
                            : "border-[#C3C6CE]/30 hover:border-[#4338CA]/40"
                        }`}
                        title={relatedRegion ? `Click to highlight forensic region: ${relatedRegion.label}` : undefined}
                      >
                        <div className="flex items-center justify-between text-xs text-[#74777E]">
                          <span className="font-semibold text-[#001428] flex items-center gap-1">
                            {field.field_name}
                            {relatedRegion && (
                              <span title="Forensic alert linked">
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                              </span>
                            )}
                          </span>
                          <span
                            className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              confidencePercent > 85
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {confidencePercent}% conf
                          </span>
                        </div>

                        {/* Value Display / Edit Form */}
                        {isEditing ? (
                          <div className="flex items-center gap-1.5 mt-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="text"
                              value={fieldValues[key] || ""}
                              onChange={(e) =>
                                setFieldValues({ ...fieldValues, [key]: e.target.value })
                              }
                              className="w-full text-xs font-semibold px-2 py-1 bg-white border border-[#4338CA] rounded focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveField(key)}
                              disabled={isSavingField}
                              className="p-1 bg-[#4338CA] text-white rounded hover:bg-[#001428]"
                              title="Save confirmed value"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-sm font-bold text-[#001428] break-words">
                              {field.extracted_value || "—"}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingField(key); }}
                              className="text-[#74777E] hover:text-[#4338CA] p-1 rounded"
                              title="Edit/confirm attribute"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Confidence Meter Bar */}
                        <div className="w-full h-1 bg-[#EAEDFF] rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              confidencePercent > 85 ? "bg-emerald-500" : "bg-sky-500"
                            }`}
                            style={{ width: `${confidencePercent}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Forensic & Heuristic Audit Indicators */}
              <div className="flex flex-col gap-3 pt-4 border-t border-[#C3C6CE]/30">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#74777E]">
                  Forensic & Tamper Flags ({selectedDoc.indicators.length})
                </h3>

                <div className="flex flex-col gap-2">
                  {selectedDoc.indicators.map((ind, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-[#FAF8FF] border border-[#C3C6CE]/30 flex items-start gap-2.5 text-xs"
                    >
                      {ind.status === "VERIFIED" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      ) : ind.status === "NEEDS_REVIEW" ? (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#001428]">{ind.summary}</span>
                          <span className="text-[10px] text-[#74777E] uppercase">{ind.category}</span>
                        </div>
                        {ind.evidence_details && ind.evidence_details.length > 0 && (
                          <div className="text-[11px] text-[#43474D] mt-1 space-y-0.5">
                            {ind.evidence_details.map((ev, i) => (
                              <p key={i}>• {ev}</p>
                            ))}
                          </div>
                        )}
                        <span className="text-[10px] text-[#74777E] block mt-1">
                          Source: {ind.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center p-8 text-xs text-[#74777E]">
              Select a document from the left pane to view extracted entities and run provenance queries.
            </div>
          )}
        </div>
      </div>

      {/* ─── Audit Receipt Modal ─── */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowReportModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-[#C3C6CE]/40">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#C3C6CE]/30 bg-[#001428] text-white print:hidden">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-[#93CCFF]" />
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
                  className="px-3 py-1 text-xs font-semibold bg-[#4338CA] hover:bg-[#3730A3] text-white rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
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
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6" id="lexproof-print-area">
              {isLoadingReport ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <RefreshCw className="w-7 h-7 animate-spin text-[#4338CA]" />
                  <p className="text-xs text-[#74777E] font-semibold">Compiling cryptographic audit receipt...</p>
                </div>
              ) : !report ? (
                <div className="text-center py-12">
                  <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                  <p className="text-sm font-bold text-[#001428]">Report Compilation Failed</p>
                  <p className="text-xs text-[#74777E] mt-1">Could not load audit data. Please try again.</p>
                </div>
              ) : (
                <>
                  {/* Report Header */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b-2 border-[#001428]">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#001428] flex items-center justify-center shrink-0">
                        <Shield className="w-6 h-6 text-[#93CCFF]" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-lg text-[#001428]">LexProof</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-[#E3DFFF] text-[#4338CA] rounded">Admin Verification Dossier</span>
                        </div>
                        <p className="text-xs text-[#74777E] mt-0.5">Digital Credential Intelligence &amp; Provenance Audit Rail</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-[#74777E]">
                      <span className="font-mono text-xs font-bold text-[#001428] block">{report.report_id}</span>
                      <span className="text-[10px] text-[#74777E] mt-0.5 block">
                        Issued: {new Date(report.generated_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
                      </span>
                      <span className="font-mono text-[9px] text-[#74777E] truncate max-w-[200px] block">
                        HASH: {report.dossier_hash.slice(0, 16)}...
                      </span>
                    </div>
                  </div>

                  {/* Case Summary */}
                  <div className="bg-[#FAF8FF] p-4 rounded-xl border border-[#C3C6CE]/30 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-[#74777E] uppercase tracking-wider font-semibold block text-[10px]">Case Title</span>
                      <span className="font-bold text-[#001428] mt-0.5 block">{report.case.title}</span>
                    </div>
                    <div>
                      <span className="text-[#74777E] uppercase tracking-wider font-semibold block text-[10px]">Purpose</span>
                      <span className="font-semibold text-[#001428] mt-0.5 block">{report.case.purpose}</span>
                    </div>
                    <div>
                      <span className="text-[#74777E] uppercase tracking-wider font-semibold block text-[10px]">Target Institution</span>
                      <span className="font-semibold text-[#001428] mt-0.5 block">{report.case.target_institution || "General Intake"}</span>
                    </div>
                  </div>

                  {/* Verdict Banner */}
                  <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    report.overall_status === "VERIFIED" ? "bg-emerald-50 border-emerald-300 text-emerald-950" :
                    report.overall_status === "NEEDS_REVIEW" ? "bg-amber-50 border-amber-300 text-amber-950" :
                    report.overall_status === "VERIFICATION_FAILED" ? "bg-red-50 border-red-300 text-red-950" :
                    "bg-slate-100 border-slate-300 text-slate-900"
                  }`}>
                    <div className="flex items-center gap-3">
                      {report.overall_status === "VERIFIED" ? <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" /> :
                       report.overall_status === "NEEDS_REVIEW" ? <AlertTriangle className="w-7 h-7 text-amber-600 shrink-0" /> :
                       report.overall_status === "VERIFICATION_FAILED" ? <XCircle className="w-7 h-7 text-red-600 shrink-0" /> :
                       <HelpCircle className="w-7 h-7 text-slate-500 shrink-0" />}
                      <div>
                        <h3 className="font-bold text-sm">STATUS: {report.overall_status.replace(/_/g, " ")}</h3>
                        <p className="text-xs mt-0.5 opacity-80">
                          {report.overall_status === "VERIFIED"
                            ? "Records matched conclusively against official registrar records."
                            : report.overall_status === "UNAVAILABLE"
                            ? "Optical analysis completed. No authoritative rail for this institution."
                            : report.overall_status === "NEEDS_REVIEW"
                            ? "Heuristic discrepancies detected — manual review recommended."
                            : "Extraction completed. Authoritative verification query pending."}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-white/80 shadow-xs border border-current">{report.overall_status}</span>
                  </div>

                  {/* Document Inventory */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#001428] pb-1 border-b border-[#C3C6CE]/30">
                      01 • Intake Document Inventory ({report.documents.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#FAF8FF] text-[#74777E] border-b border-[#C3C6CE]/30 font-semibold text-[10px]">
                            <th className="py-2 px-3">File Name</th>
                            <th className="py-2 px-3">MIME / Size</th>
                            <th className="py-2 px-3">SHA-256 Fingerprint</th>
                            <th className="py-2 px-3 text-right">Intake Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#C3C6CE]/20">
                          {report.documents.map((d) => (
                            <tr key={d.id}>
                              <td className="py-2 px-3 font-semibold text-[#001428]">{d.original_filename}</td>
                              <td className="py-2 px-3 text-[#74777E] font-mono text-[10px]">{d.file_type} ({(d.file_size_bytes / 1024).toFixed(1)} KB)</td>
                              <td className="py-2 px-3 font-mono text-[10px] text-[#74777E]">{d.file_hash_sha256}</td>
                              <td className="py-2 px-3 text-right text-[#74777E] text-[10px]">{new Date(d.created_at).toLocaleDateString("en-IN")}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Extracted Credentials */}
                  <div className="flex flex-col gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#001428] pb-1 border-b border-[#C3C6CE]/30">
                      02 • Extracted Credential Attributes
                    </h3>
                    {report.documents.map((doc) => (
                      <div key={doc.id} className="bg-[#FAF8FF] p-3.5 rounded-xl border border-[#C3C6CE]/30 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between text-xs font-semibold text-[#001428]">
                          <span>{doc.original_filename}</span>
                          {doc.tamper_detected && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Tamper Detected
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {Object.entries(doc.extracted_fields).map(([k, f]) => (
                            <div key={k} className="bg-white p-2 rounded-lg border border-[#C3C6CE]/30">
                              <span className="text-[9px] text-[#74777E] uppercase block font-semibold">{f.field_name}</span>
                              <span className="font-bold text-[#001428] text-xs block mt-0.5 truncate">{f.extracted_value || "—"}</span>
                              <span className="text-[9px] text-emerald-700 font-semibold block mt-0.5">{(f.confidence * 100).toFixed(0)}% optical</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chain of Custody */}
                  <div className="flex flex-col gap-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#001428] pb-1 border-b border-[#C3C6CE]/30">
                      03 • Tamper-Evident Chain of Custody &amp; Audit Log
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-[#FAF8FF] text-[#74777E] border-b border-[#C3C6CE]/30 font-semibold text-[10px]">
                            <th className="py-2 px-3">Action Event</th>
                            <th className="py-2 px-3">Actor / Subsystem</th>
                            <th className="py-2 px-3 text-right">Timestamp (UTC)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#C3C6CE]/20 font-mono text-[10px]">
                          {report.audit_trail.map((at, i) => (
                            <tr key={i}>
                              <td className="py-1.5 px-3 font-semibold text-[#001428]">{at.action}</td>
                              <td className="py-1.5 px-3 text-[#74777E] font-sans text-xs">{at.actor}</td>
                              <td className="py-1.5 px-3 text-right text-[#74777E]">{at.timestamp}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Scope Notice */}
                  <div className="p-3 bg-[#FAF8FF] rounded-xl border border-[#C3C6CE]/30 text-[11px] text-[#74777E]">
                    <div className="flex items-center gap-1.5 font-bold text-[#001428] mb-1">
                      <Shield className="w-3.5 h-3.5 text-[#4338CA]" />
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
