"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ShieldCheck,
  UserCheck,
  FileSearch,
  Sparkles,
  GitCompare,
  ShieldAlert,
  CheckCircle2,
  FileCheck2,
  ArrowRight,
  Shield,
  Info
} from "lucide-react";

export default function AuthorizedVerifiersSolutionPage() {
  const verifierCapabilities = [
    {
      title: "Review Submitted Documents",
      desc: "Authorized organizational verifiers can view and inspect full high-resolution document scans uploaded by applicants in a centralized review queue.",
      icon: FileSearch
    },
    {
      title: "Inspect Extracted Information",
      desc: "Examine machine-extracted entities side-by-side with original document zones, validating candidate names, marks, grades, and serial identifiers.",
      icon: CheckCircle2
    },
    {
      title: "Review AI Analysis",
      desc: "Inspect automated structural breakdowns, optical confidence scores, and OCR transcription text generated during document ingestion.",
      icon: Sparkles
    },
    {
      title: "Compare Documents",
      desc: "Execute multi-document comparison to verify consistency across academic certificates, secondary school transcripts, and government identity cards.",
      icon: GitCompare
    },
    {
      title: "Review Integrity Findings",
      desc: "Examine AI-assisted integrity checks flagging font irregularities, layout anomalies, missing registrar seals, or arithmetic grade sum discrepancies.",
      icon: ShieldAlert
    },
    {
      title: "Perform Supported Verification Actions",
      desc: "Execute direct institutional registrar queries against supported Maharashtra university ledger rails and official DigiLocker central repositories.",
      icon: ShieldCheck
    },
    {
      title: "Maintain Verification Records",
      desc: "Generate and store cryptographically timestamped verification records, audit histories, and compliance dossiers for institutional records.",
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
          <Link href="/solutions" className="hover:text-blue-600">Solutions</Link>
          <span>/</span>
          <span className="text-[#0F2942]">Authorized Verifiers</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              For Organizations
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Authorized Verifiers Console
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Institutional verification workflows equipping authorized university admissions officers, registrars, and organizational screeners with AI-assisted verification and integrity checks supporting human review.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] transition-all shadow-sm text-sm"
            >
              <span>Open Verifier Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/verification/coverage"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-[#0F2942] bg-white hover:bg-slate-50 border border-slate-300 transition-colors text-sm"
            >
              <span>View Institution Coverage</span>
            </Link>
          </div>
        </div>

        {/* Mandatory Transparency Callout */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 mb-12 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong className="font-semibold text-amber-950">Transparency Standard: </strong>
            LexProof provides <span className="font-medium">AI-assisted verification</span> and <span className="font-medium">AI-assisted integrity checks</span> designed to support, not replace, human review. AI does not guarantee authenticity. Final credential acceptance decisions rest with authorized organizational reviewers.
          </div>
        </div>

        {/* Verifier Workflow Capabilities */}
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F2942] mb-2">
              Verifier Operational Workflow
            </h2>
            <p className="text-sm text-slate-600">
              End-to-end tooling engineered for admissions, compliance, and credential evaluation teams.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {verifierCapabilities.map((item, idx) => {
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
