"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ShieldCheck,
  FileText,
  AlertCircle,
  GitCompare,
  ListChecks,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers
} from "lucide-react";

export default function PersonalDocumentsSolutionPage() {
  const analysisDimensions = [
    {
      title: "Important Information Extraction",
      desc: "Extracts key identifying numbers, dates of birth, full legal names, parent/spouse names, permanent addresses, and issuing government authorities.",
      icon: FileText
    },
    {
      title: "Document Requirements Clarification",
      desc: "Explains standard submission requirements, valid expiration guidelines, acceptable seal types, and necessary attestation procedures.",
      icon: ListChecks
    },
    {
      title: "Missing Information Detection",
      desc: "Detects missing stamps, omitted parent details, incomplete address lines, or absent state seals that may lead to rejection.",
      icon: AlertCircle
    },
    {
      title: "Inconsistency Identification",
      desc: "Flags spelling variations across names, mismatched date of birth records, or conflicting address records between different personal files.",
      icon: GitCompare
    },
    {
      title: "Relationships Between Documents",
      desc: "Maps logical relationships across a dossier â€” linking identity documents (Aadhaar/PAN) with address proofs and educational credentials.",
      icon: Layers
    },
    {
      title: "Useful Next Steps",
      desc: "Generates step-by-step guidance on how to rectify discrepancies, update state records, or submit supplementary proofs.",
      icon: Lightbulb
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
          <span className="text-[#0F2942]">Personal Documents</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              For Individuals
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Personal Documents Analysis
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Analyze personal documents to understand important information, check document requirements, spot missing details and inconsistencies, and discover useful next steps.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] transition-all shadow-sm text-sm"
            >
              <span>Analyze Personal Documents</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/solutions/government-documents"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-[#0F2942] bg-white hover:bg-slate-50 border border-slate-300 transition-colors text-sm"
            >
              <span>Government Document Types</span>
            </Link>
          </div>
        </div>

        {/* 6 Analysis Dimensions */}
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F2942] mb-2">
              Comprehensive Personal Document Intelligence
            </h2>
            <p className="text-sm text-slate-600">
              Ensure your documents are clear, accurate, and ready for official submissions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysisDimensions.map((dim, idx) => {
              const Icon = dim.icon;
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
                      {dim.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {dim.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy & Non-Custodial Security */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F2942] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F2942] mb-1">
                Privacy-Preserving &amp; Non-Custodial Architecture
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">
                LexProof is designed with privacy-first principles. We do not permanently store unredacted Aadhaar numbers or government credentials. Personal information is processed strictly within your authenticated session to generate analysis and verify consistency.
              </p>
              <div className="text-xs text-slate-500 font-mono">
                Encrypted in transit â€¢ Session-isolated parsing â€¢ Non-custodial storage
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
