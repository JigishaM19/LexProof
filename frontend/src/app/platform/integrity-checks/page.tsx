"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ShieldAlert,
  SearchCheck,
  Calculator,
  ScanLine,
  ArrowRight,
  Info
} from "lucide-react";

export default function PlatformIntegrityChecksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/solutions" className="hover:text-blue-600">Platform</Link>
          <span>/</span>
          <span className="text-[#0F2942]">Integrity Checks</span>
        </div>

        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Platform Capability
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            AI-Assisted Integrity Checks
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Algorithmic inspection routines that highlight potential discrepancies, structural anomalies, and internal arithmetic contradictions across submitted documents.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] text-sm shadow-sm"
          >
            <span>Run Integrity Checks</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Forensic Honesty Banner */}
        <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 sm:p-5 mb-12 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-amber-900 leading-relaxed">
            <strong className="font-semibold text-amber-950">Notice: </strong>
            Integrity checks are <span className="font-medium">AI-assisted anomaly flags</span> designed to highlight zones requiring human scrutiny. LexProof does not claim guaranteed fraud detection or guaranteed authenticity.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0F2942] mb-2">Arithmetic Sum Validation</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Recalculates subject marks against grand totals, percentage thresholds, and GPA formulas to detect typographical alterations.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <ScanLine className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0F2942] mb-2">Font &amp; Alignment Heuristics</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Evaluates font family consistency, baseline alignment, and pixel noise around numerical marks and candidate names.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <SearchCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0F2942] mb-2">Missing Mandatory Elements</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Identifies absent registrar signatures, missing serial barcodes, unendorsed stamps, or cropped certificate margins.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
