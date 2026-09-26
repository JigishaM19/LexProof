"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  QrCode,
  CheckCircle2,
  Clock,
  ArrowRight
} from "lucide-react";

export default function QrCodeVerificationPage() {
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
          <span className="text-[#0F2942]">QR / Code Verification</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Cryptographic Code Inspection
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            QR / Code Verification
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Inspection and cryptographic validation of machine-readable 2D barcodes, secure QR blocks, and alphanumeric serial verification hashes.
          </p>
        </div>

        {/* Dual Cards: Active vs Coming Soon */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Active: Institutional Degree QR Parsing */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <QrCode className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Active in Pilot
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F2942] mb-2">
                Supported Institutional QR Codes
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                LexProof parses standard digital signature QR codes embedded on degree certificates issued by supported pilot universities and technical boards.
              </p>
              <ul className="text-xs text-slate-600 space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Public key signature validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cross-check decoded text against OCR extraction</span>
                </li>
              </ul>
            </div>
            <Link
              href="/dashboard"
              className="mt-6 pt-4 border-t border-slate-100 text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>Test in Workspace</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Coming Soon: Generalized Mobile Camera Scanner */}
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
                <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  Coming Soon (Q4 Roadmap)
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#0F2942] mb-2">
                Direct Mobile Camera Scanner
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                A live mobile web scanner allowing admissions officers to point their camera directly at physical document QR seals is currently under engineering validation.
              </p>
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 font-mono">
                Status: In development â€¢ Integration with API Setu QR payload standard scheduled for next release.
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
