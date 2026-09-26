"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight
} from "lucide-react";

export default function IssuerVerificationPage() {
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
          <span className="text-[#0F2942]">Issuer Verification</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Authoritative Source Rails
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Direct Issuer Verification
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Authoritative confirmation obtained directly from university registrars, technical boards, and state examination databases.
          </p>

          <Link
            href="/verification/coverage"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] text-sm shadow-sm"
          >
            <span>View Active Institutional Rails</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Informational Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h3 className="text-lg font-bold text-[#0F2942] mb-3">
              How Direct Issuer Verification Works
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              When a document from a supported university (such as SPPU or the University of Mumbai) is ingested, LexProof queries the official registrar registry using the student&apos;s Permanent Registration Number (PRN) and convocation serial.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              If the official record matches the parsed document, the credential receives an authoritative &quot;Verified&quot; status.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm">
            <h3 className="text-lg font-bold text-[#0F2942] mb-3">
              Institutional Gateways &amp; Security
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Registrars integrate through read-only cryptographic endpoints. LexProof never modifies university databases.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              For institutions not yet connected, LexProof honestly designates credentials as &quot;Analysis Complete (Verification Unavailable)&quot;.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
