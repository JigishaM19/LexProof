"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Upload,
  Cpu,
  FileSearch,
  MessageSquare,
  GitCompare,
  ShieldAlert,
  UserCheck,
  FileCheck2,
  ArrowRight,
  Shield,
  CheckCircle2,
  Info
} from "lucide-react";

export default function HowItWorksPage() {
  const steps = [
    {
      num: "01",
      title: "Upload",
      desc: "Upload a supported document in PDF, JPEG, or PNG format into your secure workspace dossier.",
      icon: Upload,
      note: "Non-custodial ingestion preserves original byte integrity without destructive transformation."
    },
    {
      num: "02",
      title: "Analyze",
      desc: "LexProof analyzes the document using computer vision and structural OCR pipelines to parse page layout.",
      icon: Cpu,
      note: "Extracts semantic headings, tables, signatures, stamps, and credential identifiers."
    },
    {
      num: "03",
      title: "Extract",
      desc: "Important information is extracted into normalized, machine-readable structured key-value fields.",
      icon: FileSearch,
      note: "Standardizes candidate names, registration IDs, passing criteria, marks, and issuing authorities."
    },
    {
      num: "04",
      title: "Understand",
      desc: "Users can ask questions, request summaries, and understand complex document requirements and clauses.",
      icon: MessageSquare,
      note: "Interactive AI assistance helps clarify document meaning, eligibility conditions, and next steps."
    },
    {
      num: "05",
      title: "Compare",
      desc: "Compare documents where supported to cross-verify consistency across multi-document submissions.",
      icon: GitCompare,
      note: "Cross-references candidate details across certificates, transcripts, and identity records."
    },
    {
      num: "06",
      title: "Integrity Checks",
      desc: "Identify inconsistencies, missing information, and supported document anomalies.",
      icon: ShieldAlert,
      note: "AI-assisted integrity checks inspect arithmetic totals, date sequencing, and structural format irregularities."
    },
    {
      num: "07",
      title: "Human Review",
      desc: "Organizations can review AI-assisted findings with human-in-the-loop oversight.",
      icon: UserCheck,
      note: "AI assists and highlights potential discrepancies; authorized human personnel make final verification determinations."
    },
    {
      num: "08",
      title: "Verification Record",
      desc: "Store verification results where supported with tamper-evident audit logs and verification reports.",
      icon: FileCheck2,
      note: "Maintains structured verification dossiers and audit histories for organizational compliance."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Platform Workflow
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            How LexProof Works
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            LexProof provides an end-to-end pipeline that turns unstructured educational and organizational documents into structured intelligence â€” combining automated analysis with authoritative verification rails.
          </p>
        </div>

        {/* Disclaimer / Transparency Banner */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 mb-12 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong className="font-semibold text-amber-950">Forensic Integrity Notice: </strong>
            LexProof provides <span className="font-medium">AI-assisted verification</span> and <span className="font-medium">AI-assisted integrity checks</span> supporting human review. LexProof does not claim guaranteed authenticity or guaranteed fraud detection. Authoritative corroboration is performed exclusively against supported source registries.
          </div>
        </div>

        {/* 8-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-slate-300 font-mono">
                      {step.num}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h2 className="text-lg font-bold text-[#0F2942] mb-2">
                    {step.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {step.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 italic">
                  {step.note}
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive CTA Banner */}
        <div className="bg-[#0F2942] text-white rounded-2xl p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-elevation-2">
          <div className="max-w-xl">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
              Ready to analyze your first document?
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              Upload transcripts, degree certificates, or personal records to inspect structured fields and test automated integrity checks.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-[#0F2942] bg-white hover:bg-slate-100 transition-colors text-sm shadow-sm"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/verification/coverage"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors text-sm"
            >
              <span>Check Coverage</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
