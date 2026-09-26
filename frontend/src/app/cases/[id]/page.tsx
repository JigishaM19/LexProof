"use client";

import React, { useState, useEffect, use } from "react";
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
  Info
} from "lucide-react";
import { api, CaseRecord, DocumentRecord, VerificationRailResult } from "@/lib/api";
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

  // Field editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isSavingField, setIsSavingField] = useState(false);

  // Verification Rail triggering
  const [isVerifyingRail, setIsVerifyingRail] = useState(false);
  const [railMessage, setRailMessage] = useState<string | null>(null);

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
          {/* Official Audit Report button */}
          <Link
            href={`/cases/${caseRecord.id}/report`}
            className="px-3.5 py-1.5 rounded-lg bg-[#001428] text-white hover:bg-[#0F2942] text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <FileCheck className="w-4 h-4 text-[#93CCFF]" />
            Official Report
          </Link>
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

          {/* Viewer Content Canvas */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative min-h-[500px]">
            {selectedDoc ? (
              activeTab === "preview" ? (
                <div
                  className="transition-transform duration-200 shadow-xl rounded-lg bg-white overflow-hidden max-w-full"
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                  }}
                >
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
                      className="max-w-[580px] max-h-[750px] object-contain"
                    />
                  )}
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
                    {selectedDoc.verification_result?.status === "VERIFIED" ? (
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

                    return (
                      <div
                        key={key}
                        className="bg-[#FAF8FF] p-3.5 rounded-xl border border-[#C3C6CE]/30 flex flex-col justify-between gap-2 hover:border-[#4338CA]/40 transition-colors"
                      >
                        <div className="flex items-center justify-between text-xs text-[#74777E]">
                          <span className="font-semibold text-[#001428] flex items-center gap-1">
                            {field.field_name}
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
                          <div className="flex items-center gap-1.5 mt-1">
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
                              onClick={() => setEditingField(key)}
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
    </div>
  );
}
