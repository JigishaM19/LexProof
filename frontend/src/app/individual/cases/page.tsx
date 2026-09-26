"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  Eye,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  FolderLock,
} from "lucide-react";
import { api, CaseRecord } from "@/lib/api";

export default function IndividualCasesListPage() {
  const router = useRouter();
  const [cases, setCases] = useState<CaseRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("College Admission");
  const [institution, setInstitution] = useState("Savitribai Phule Pune University");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    setIsLoading(true);
    try {
      const list = await api.listCases();
      setCases(list);
    } catch (e) {
      console.error("Failed to load cases:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const created = await api.createCase(title, purpose, institution);
      setCases((prev) => [created, ...prev]);
      setShowModal(false);
      setTitle("");
      router.push(`/individual/cases/${created.id}`);
    } catch (err: any) {
      alert("Failed to create dossier: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCases = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.target_institution && c.target_institution.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="animate-slideUp flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Verification Dossiers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organize credentials by admission, licensing, or immigration purpose.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0f2942] dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 text-xs font-semibold transition-colors self-start sm:self-auto btn-press"
        >
          <Plus className="w-3.5 h-3.5" />
          Create Dossier
        </button>
      </div>

      {/* Toolbar */}
      <div className="animate-slideUp stagger-1 flex items-center justify-between gap-3">
        <div className="relative flex-1 sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search dossiers by title or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={loadCases}
          className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="Refresh Dossiers"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Dossier Cards Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
          Loading your verification dossiers...
        </div>
      ) : filteredCases.length === 0 ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
          <FolderLock className="w-10 h-10 text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-semibold text-slate-800 dark:text-white">
            No dossiers found
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
            {cases.length === 0
              ? "Create your first dossier to begin organizing and verifying your documents."
              : "No dossiers match your search query."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 shadow-xs border border-slate-200 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all card-hover-lift animate-scalePop"
              style={{ animationDelay: `${0.05 * filteredCases.indexOf(c)}s` }}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900/50">
                    {c.purpose}
                  </span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                      c.overall_status === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300"
                        : c.overall_status === "NEEDS_REVIEW"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300"
                        : c.overall_status === "VERIFICATION_FAILED"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300"
                        : c.overall_status === "UNAVAILABLE"
                        ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        : "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300"
                    }`}
                  >
                    {c.overall_status.replace("_", " ")}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">
                  {c.title}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                  Target: {c.target_institution || "General Intake"}
                </p>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-mono">
                  {c.document_ids.length} document(s) attached
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                <Link
                  href={`/individual/cases/${c.id}`}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Open Dossier <ArrowRight className="w-3 h-3" />
                </Link>

                <Link
                  href={`/individual/cases/${c.id}/report`}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  title="View Audit Report"
                >
                  <FileCheck className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-modalOverlay">
          <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-modalContent">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Create New Verification Dossier
              </h3>
              <button
                onClick={() => setShowModal(false)}
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
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block mb-1">
                  Verification Purpose *
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
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
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
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
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 text-xs font-semibold bg-[#0f2942] dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 rounded-lg transition-colors"
                >
                  {isSubmitting ? "Creating..." : "Initialize Dossier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
