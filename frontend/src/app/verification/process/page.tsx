"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Info
} from "lucide-react";

export default function VerificationProcessPage() {
  const steps = [
    {
      num: "01",
      title: "Document Intake & Validation",
      desc: "Applicant uploads academic degree, transcript, or credential. The engine validates resolution, file integrity, and supported format standards."
    },
    {
      num: "02",
      title: "OCR Extraction & Schema Mapping",
      desc: "Computer vision structures student name, registration ID (PRN), degree conferment date, and issuing institution into normalized JSON."
    },
    {
      num: "03",
      title: "Authoritative Rail Query",
      desc: "If the issuing university maintains an active digital ledger rail (e.g. SPPU, University of Mumbai), a cryptographic verification lookup is dispatched."
    },
    {
      num: "04",
      title: "AI-Assisted Integrity Scrutiny",
      desc: "Automated checks examine mark totals, prerequisite date consistency, and alignment heuristics to highlight items needing review."
    },
    {
      num: "05",
      title: "Human Officer Review",
      desc: "Authorized university or organizational personnel review the extracted attributes and rail findings to make final determinations."
    },
    {
      num: "06",
      title: "Verification Dossier Recorded",
      desc: "The verification status is finalized, sealed with a SHA-256 hash, and archived with a tamper-evident audit trail."
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
          <span className="text-[#0F2942]">Verification Process</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Operational Workflow
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            The Verification Process
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            A step-by-step breakdown of how LexProof corroborates documents through AI-assisted parsing and authoritative institutional registries.
          </p>
        </div>

        {/* Policy Notice */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 mb-12 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong className="font-semibold text-amber-950">Notice: </strong>
            LexProof utilizes <span className="font-medium">AI-assisted verification</span> and <span className="font-medium">AI-assisted integrity checks</span> supporting human review. AI does not guarantee authenticity without confirmation from the issuing registry.
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <span className="text-2xl font-black text-slate-300 font-mono mb-2 block">
                  {s.num}
                </span>
                <h3 className="text-base font-bold text-[#0F2942] mb-2">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
