"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield,
  FileText,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
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
} from "lucide-react";
import { api, CaseRecord, DocumentRecord } from "@/lib/api";

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

  // Field editing state
  const [editingField, setEditingField] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [isSavingField, setIsSavingField] = useState(false);

  // Verification Rail triggering
  const [isVerifyingRail, setIsVerifyingRail] = useState(false);
  const [railMessage, setRailMessage] = useState<string | null>(null);

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
          <Link
            href={`/individual/cases/${caseRecord.id}/report`}
            className="px-3 py-1.5 rounded-lg bg-[#0f2942] dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs btn-press"
          >
            <FileCheck className="w-3.5 h-3.5 text-blue-200" />
            Audit Report
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

          {/* Viewer Content Canvas */}
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative min-h-[460px] bg-slate-100/50 dark:bg-slate-950/50">
            {selectedDoc ? (
              activeTab === "preview" ? (
                <div
                  className="transition-transform duration-200 shadow-md rounded-lg bg-white overflow-hidden max-w-full"
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                    transformOrigin: "center center",
                  }}
                >
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
                      className="max-w-[520px] max-h-[680px] object-contain"
                    />
                  )}
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
                {(selectedDoc.file_size_bytes / 1024).toFixed(1)} KB • {selectedDoc.file_type}
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
                    {selectedDoc.verification_result?.status === "VERIFIED" ? (
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
                  return (
                    <div
                      key={key}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col gap-1.5 animate-rowReveal"
                      style={{ animationDelay: `${0.04 * Object.keys(selectedDoc.extracted_fields).indexOf(key)}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {field.field_name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">
                            {(field.confidence * 100).toFixed(0)}% conf
                          </span>
                          {!isEditing ? (
                            <button
                              onClick={() => setEditingField(key)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                              title="Edit Field"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSaveField(key)}
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
    </div>
  );
}
