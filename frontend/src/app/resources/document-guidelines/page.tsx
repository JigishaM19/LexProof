"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  BookOpen,
  Camera,
  Sun,
  Crop,
  Check,
  X,
  FileCheck2,
  ArrowRight
} from "lucide-react";

export default function DocumentGuidelinesPage() {
  const dos = [
    "Place the document on a flat, contrasting background (e.g. dark tabletop for light paper).",
    "Ensure uniform lighting without strong cast shadows or flashlight flare across stamps.",
    "Capture all four document corners including registration numbers and outer borders.",
    "Keep camera lens directly parallel to the paper to prevent acute perspective skew.",
    "Upload original multi-page documents in sequential chronological order."
  ];

  const donts = [
    "Do not crop out registrar signatures, convocation dates, or issuing stamps.",
    "Avoid taking photos in dim lighting that causes pixel blurriness around small numbers.",
    "Do not fold or crumple certificates prior to scanning.",
    "Do not apply heavy contrast filters or black-and-white photocopy effects that erase seals.",
    "Do not obscure confidential numbers with physical objects; use our non-custodial redaction tool."
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/resources" className="hover:text-blue-600">Resources</Link>
          <span>/</span>
          <span className="text-[#0F2942]">Document Guidelines</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Scanning Best Practices
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Document Scanning Guidelines
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Follow these operational recommendations to ensure your uploaded certificates and marksheets are read with maximum optical precision.
          </p>
        </div>

        {/* Dos and Don'ts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Best Practices */}
          <div className="bg-white rounded-2xl border border-emerald-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                âœ“
              </span>
              <h2 className="text-lg font-bold text-emerald-950">Recommended Practices</h2>
            </div>
            <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
              {dos.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Things to Avoid */}
          <div className="bg-white rounded-2xl border border-rose-200/80 p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
                âœ•
              </span>
              <h2 className="text-lg font-bold text-rose-950">Things to Avoid</h2>
            </div>
            <ul className="space-y-4 text-xs sm:text-sm text-slate-700">
              {donts.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <X className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
