"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  FileSearch,
  Layers,
  Database,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function PlatformInformationExtractionPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/solutions" className="hover:text-blue-600">Platform</Link>
          <span>/</span>
          <span className="text-[#0F2942]">Information Extraction</span>
        </div>

        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Platform Capability
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Structured Information Extraction
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Converts raw document pixels into standardized JSON schemas, extracting candidate demographics, academic records, and institutional metadata with high precision.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] text-sm shadow-sm"
          >
            <span>Explore Extracted Schemas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <h3 className="font-bold text-base text-[#0F2942] mb-2">Key-Value Entity Recognition</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Extracts discrete attributes including candidate names, Permanent Registration Numbers (PRN), roll IDs, and issuance dates.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <h3 className="font-bold text-base text-[#0F2942] mb-2">Tabular Credit Parsing</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Parses semester mark tables into row-by-row grade items, course credits, internal assessments, and end-semester scores.
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <h3 className="font-bold text-base text-[#0F2942] mb-2">PII Masking &amp; Redaction</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Optionally redacts sensitive identifiers (like full Aadhaar digits) prior to presentation, preserving confidential data integrity.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
