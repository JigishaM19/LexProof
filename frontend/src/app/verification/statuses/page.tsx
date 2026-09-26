"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";


export default function VerificationStatusesPage() {
  const statuses = [
    {
      name: "Verified",
      color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      badgeColor: "bg-emerald-600 text-white",
      desc: "The document credential has been independently corroborated against an official authoritative source registry or university digital ledger rail.",
      implication: "Legitimate registration confirmed with matching student credentials in the institutional database."
    },
    {
      name: "Analysis Complete",
      color: "bg-blue-50 text-blue-800 border-blue-200",
      badgeColor: "bg-blue-600 text-white",
      desc: "Document text was successfully extracted, structured into JSON fields, and passed initial optical syntax checks.",
      implication: "CRITICAL: Analysis Complete does NOT mean the document is verified by the issuing authority. It only signifies that the page has been parsed and structured."
    },
    {
      name: "Needs Review",
      color: "bg-amber-50 text-amber-800 border-amber-200",
      badgeColor: "bg-amber-600 text-white",
      desc: "AI-assisted integrity checks identified potential discrepancies, such as mark calculation anomalies, blurriness, or date order mismatches.",
      implication: "Requires human review by an admissions officer or authorized verifier before a final determination is made."
    },
    {
      name: "Verification Unavailable",
      color: "bg-slate-100 text-slate-800 border-slate-300",
      badgeColor: "bg-slate-700 text-white",
      desc: "Optical analysis succeeded, but the issuing institution does not currently maintain an active digital ledger or API rail with LexProof.",
      implication: "IMPORTANT: This denotes a lack of registry connection, NOT automatic fraud or illegitimacy. It simply reflects our honest scope boundary."
    },
    {
      name: "Not Supported",
      color: "bg-rose-50 text-rose-800 border-rose-200",
      badgeColor: "bg-rose-600 text-white",
      desc: "The document format, language, or document class is outside LexProof's current ingestion and parsing capabilities.",
      implication: "The document cannot be reliably parsed. Users are advised to submit standard supported format scans."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/verification" className="hover:text-blue-600">Verification</Link>
          <span>/</span>
          <span className="text-[#0F2942]">Verification Statuses</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Taxonomy &amp; Definitions
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Verification Status Definitions
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            LexProof upholds strict forensic honesty. We never present ambiguous results. Understand what each status badge means for your document.
          </p>
        </div>

        {/* Statuses Cards */}
        <div className="space-y-4 mb-16">
          {statuses.map((st, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl border ${st.color} shadow-sm transition-all`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${st.badgeColor}`}>
                    {st.name}
                  </span>
                </div>
              </div>
              <p className="text-sm font-medium mb-2 leading-relaxed">
                {st.desc}
              </p>
              <div className="text-xs opacity-90 italic">
                {st.implication}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
