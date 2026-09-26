"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Shield,
  Search,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Building,
  MapPin,
  Send,
  Check,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import { api } from "@/lib/api";

interface Issuer {
  id: string;
  name: string;
  state: string;
  status: "Supported" | "Analysis Only" | "Not Supported";
  rail_type: string;
  supported_documents: string[];
}

export default function VerificationCoveragePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [issuers, setIssuers] = useState<Issuer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Request form state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqInstName, setReqInstName] = useState("");
  const [reqState, setReqState] = useState("Maharashtra");
  const [reqEmail, setReqEmail] = useState("");
  const [reqNotes, setReqNotes] = useState("");
  const [isSubmittingReq, setIsSubmittingReq] = useState(false);
  const [reqSuccess, setReqSuccess] = useState<string | null>(null);

  const loadCoverage = async (q: string) => {
    setIsLoading(true);
    try {
      const data = await api.getCoverage(q);
      setIssuers(data.issuers || []);
    } catch (err) {
      console.error("Failed to load coverage:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoverage(searchQuery);
  }, [searchQuery]);

  const handleShortcutClick = (name: string) => {
    setSearchQuery(name);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqInstName || !reqEmail) return;

    setIsSubmittingReq(true);
    try {
      await api.requestInstitution({
        institution_name: reqInstName,
        state: reqState,
        applicant_email: reqEmail,
        notes: reqNotes,
      });
      setReqSuccess("Institution addition request submitted successfully! Our institutional onboarding team will review it.");
      setReqInstName("");
      setReqEmail("");
      setReqNotes("");
      setTimeout(() => {
        setReqSuccess(null);
        setShowRequestModal(false);
      }, 3000);
    } catch (err: unknown) {
      alert("Submission failed: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmittingReq(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#131B2E] flex flex-col font-sans">
      <Navbar />
      {/* Scope Banner */}
      <div className="bg-[#0F2942] text-white py-2 px-6 text-xs flex items-center justify-between border-b border-[#314863]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse"></span>
          <span className="font-semibold uppercase text-[#B0C9E8]">Pilot Infrastructure Directory:</span>
          <span>Live status of educational ledger rails and authoritative digital repositories.</span>
        </div>
        <Link href="/dashboard" className="text-[#93CCFF] hover:text-white underline">
          Open Workspace →
        </Link>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col gap-10">
        {/* Header */}
        <div className="max-w-3xl flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#4338CA] uppercase tracking-wider bg-[#E3DFFF] px-2.5 py-1 rounded-full self-start">
            <Building className="w-3.5 h-3.5" /> Institutional Coverage Directory
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#001428] tracking-tight">
            Is Your Institution Supported?
          </h1>
          <p className="text-sm text-[#43474D]">
            Type the name of any university, college, or examination board to verify current direct authoritative verification availability.
          </p>
        </div>

        {/* Search & Filter Container */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#C3C6CE]/30 flex flex-col gap-5">
          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#74777E]" />
            <input
              type="text"
              placeholder="Search e.g., 'Pune University', 'Mumbai University', 'Delhi University', 'MSBTE'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#FAF8FF] border border-[#C3C6CE] rounded-xl text-sm font-medium text-[#001428] placeholder-[#74777E] focus:outline-none focus:ring-2 focus:ring-[#4338CA] transition-all"
            />
          </div>

          {/* Quick Filter Shortcut Chips */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#43474D]">
            <span className="font-semibold text-[#001428]">Quick test shortcuts:</span>
            <button
              onClick={() => handleShortcutClick("Savitribai Phule Pune University")}
              className="px-3 py-1 rounded-lg bg-[#FAF8FF] hover:bg-[#EAEDFF] text-[#001428] border border-[#C3C6CE]/40 transition-colors"
            >
              SPPU Pune
            </button>
            <button
              onClick={() => handleShortcutClick("University of Mumbai")}
              className="px-3 py-1 rounded-lg bg-[#FAF8FF] hover:bg-[#EAEDFF] text-[#001428] border border-[#C3C6CE]/40 transition-colors"
            >
              Mumbai Univ
            </button>
            <button
              onClick={() => handleShortcutClick("MSBTE")}
              className="px-3 py-1 rounded-lg bg-[#FAF8FF] hover:bg-[#EAEDFF] text-[#001428] border border-[#C3C6CE]/40 transition-colors"
            >
              MSBTE Board
            </button>
            <button
              onClick={() => handleShortcutClick("University of Delhi")}
              className="px-3 py-1 rounded-lg bg-[#FAF8FF] hover:bg-[#EAEDFF] text-[#001428] border border-[#C3C6CE]/40 transition-colors"
            >
              Delhi Univ
            </button>
            <button
              onClick={() => handleShortcutClick("Autonomous Tech Institute")}
              className="px-3 py-1 rounded-lg bg-[#FAF8FF] hover:bg-[#EAEDFF] text-[#001428] border border-[#C3C6CE]/40 transition-colors"
            >
              Unsupported Example
            </button>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs text-[#4338CA] hover:underline ml-2"
              >
                Clear filter
              </button>
            )}
          </div>

          {/* Directory Results List */}
          <div className="flex flex-col gap-2.5 mt-2">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-[#74777E]">
                Querying institutional directory...
              </div>
            ) : issuers.length === 0 ? (
              <div className="p-6 bg-[#FAF8FF] rounded-xl text-center text-xs text-[#43474D]">
                No exact registry record found for &quot;{searchQuery}&quot;. This institution is currently{" "}
                <strong className="text-[#001428]">Analysis Only (Verification Unavailable)</strong>.
              </div>
            ) : (
              issuers.map((issuer) => {
                const isSupported = issuer.status === "Supported";
                const isAnalysisOnly = issuer.status === "Analysis Only";

                return (
                  <div
                    key={issuer.id}
                    className="p-4 bg-[#FAF8FF] hover:bg-[#F2F3FF] rounded-xl border border-[#C3C6CE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {isSupported ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      ) : isAnalysisOnly ? (
                        <HelpCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-bold text-sm text-[#001428] block">
                          {issuer.name}
                        </span>
                        <span className="text-xs text-[#43474D]">
                          {issuer.state} • {issuer.rail_type}
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {issuer.supported_documents.map((doc, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-white px-2 py-0.5 rounded border border-[#C3C6CE]/30 text-[#74777E]"
                            >
                              {doc}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="self-start sm:self-auto shrink-0">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isSupported
                            ? "bg-emerald-100 text-emerald-800"
                            : isAnalysisOnly
                            ? "bg-slate-200 text-slate-700"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {issuer.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="pt-3 border-t border-[#C3C6CE]/30 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#74777E]">
            <span>
              Displaying verified registry entries from Maharashtra Higher & Technical Education API rails.
            </span>
            <span className="font-mono text-[10px] uppercase bg-[#FAF8FF] px-2 py-0.5 rounded">
              SYNCED_WEEKLY
            </span>
          </div>
        </div>

        {/* Missing Institution Callout Card */}
        <div className="bg-[#EAEDFF] p-6 rounded-2xl border border-[#4338CA]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-[#001428] text-base">
              Cannot find your university or examination board?
            </h3>
            <p className="text-xs text-[#43474D] mt-1">
              You can still analyze and extract information from any document. If you require authoritative registrar verification, request rail addition.
            </p>
          </div>
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-4 py-2 bg-[#4338CA] hover:bg-[#001428] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm shrink-0"
          >
            Request Institution Addition →
          </button>
        </div>
      </main>

      {/* Request Institution Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#C3C6CE]/30 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#C3C6CE]/30">
              <h3 className="font-bold text-[#001428] text-base">Request Institution Addition</h3>
              <button
                onClick={() => setShowRequestModal(false)}
                className="text-[#74777E] hover:text-[#001428]"
              >
                ✕
              </button>
            </div>

            {reqSuccess ? (
              <div className="p-4 my-4 bg-emerald-50 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{reqSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="flex flex-col gap-4 mt-4">
                <div>
                  <label className="text-xs font-semibold text-[#001428] block mb-1">
                    Institution or Board Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shivaji University, Kolhapur"
                    value={reqInstName}
                    onChange={(e) => setReqInstName(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF8FF] border border-[#C3C6CE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#001428] block mb-1">State / Jurisdiction</label>
                  <input
                    type="text"
                    required
                    value={reqState}
                    onChange={(e) => setReqState(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF8FF] border border-[#C3C6CE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#001428] block mb-1">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={reqEmail}
                    onChange={(e) => setReqEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF8FF] border border-[#C3C6CE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#001428] block mb-1">Additional Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Any specific degree format or contact details..."
                    value={reqNotes}
                    onChange={(e) => setReqNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FAF8FF] border border-[#C3C6CE] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4338CA]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#C3C6CE]/30">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-[#43474D] hover:bg-[#FAF8FF] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReq}
                    className="px-4 py-2 text-xs font-semibold bg-[#001428] text-white hover:bg-[#0F2942] rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    {isSubmittingReq ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
