"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ShieldCheck,
  CheckCircle2,
  FileSearch,
  GitCompare,
  ShieldAlert,
  UserCheck,
  FileCheck2,
  ArrowRight,
  Info
} from "lucide-react";

export default function VerificationOverviewPage() {
  const verificationPillars = [
    {
      title: "AI-Assisted Document Verification",
      desc: "Algorithmic parsing extracts student credentials and queries official registrar ledger rails to corroborate records against authoritative registries.",
      icon: ShieldCheck
    },
    {
      title: "Document Review",
      desc: "Full-page inspection console for institutional reviewers to examine original scans, high-resolution details, and structural anomalies.",
      icon: FileSearch
    },
    {
      title: "Information Extraction",
      desc: "Normalized extraction of student names, registration numbers, qualifications, and marks into structured, searchable records.",
      icon: CheckCircle2
    },
    {
      title: "Document Comparison",
      desc: "Cross-document reconciliation matching candidate details across certificates, transcripts, and government identity proofs.",
      icon: GitCompare
    },
    {
      title: "AI-Assisted Integrity Checks",
      desc: "Automated heuristics highlighting font mismatches, grade arithmetic inconsistencies, and potential document layout irregularities.",
      icon: ShieldAlert
    },
    {
      title: "Human Review",
      desc: "Final verification decisions are always made with human-in-the-loop oversight by authorized admissions and compliance officers.",
      icon: UserCheck
    },
    {
      title: "Verification Records",
      desc: "Maintains tamper-evident audit trails with SHA-256 hashes and timestamped verification reports for compliance records.",
      icon: FileCheck2
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
          <span className="text-[#0F2942]">Verification</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Authoritative Verification
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            AI-Assisted Verification Framework
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Authoritative source corroboration connecting higher education institutions and authorized verifiers through digital ledger rails.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/verification/coverage"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] transition-all shadow-sm text-sm"
            >
              <span>Check Institutional Coverage</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/verification/process"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-[#0F2942] bg-white hover:bg-slate-50 border border-slate-300 transition-colors text-sm"
            >
              <span>How Verification Works</span>
            </Link>
          </div>
        </div>

        {/* Forensic Policy Callout */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 mb-12 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong className="font-semibold text-amber-950">Forensic Standard: </strong>
            LexProof provides <span className="font-medium">AI-assisted verification</span> and <span className="font-medium">AI-assisted integrity checks supporting human review</span>. We never state that AI guarantees authenticity. Authoritative confirmation requires corroboration against official issuing registries.
          </div>
        </div>

        {/* 7 Verification Pillars */}
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F2942] mb-2">
              Verification Architecture
            </h2>
            <p className="text-sm text-slate-600">
              The foundational pillars ensuring transparency, accuracy, and legal compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verificationPillars.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#0F2942] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
