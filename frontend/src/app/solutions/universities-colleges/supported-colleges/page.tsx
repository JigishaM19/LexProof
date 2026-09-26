"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Building2,
  Building,
  Info,
  ArrowRight,
  Shield,
  HelpCircle
} from "lucide-react";

export default function SupportedCollegesPage() {
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
          <Link href="/solutions/universities-colleges" className="hover:text-blue-600">Universities &amp; Colleges</Link>
          <span>/</span>
          <span className="text-[#0F2942]">Supported Colleges</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Institutional Registry
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Supported Colleges
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Status of autonomous and affiliated colleges under direct institutional verification rails.
          </p>
        </div>

        {/* REQUIRED EMPTY STATE */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm mb-12">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
            <Building className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#0F2942] mb-2">
            No supported institutions available yet.
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            Standalone individual colleges do not currently maintain independent direct digital verification rails in the pilot infrastructure.
          </p>

          <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-100 text-left text-xs sm:text-sm text-slate-700 space-y-2 mb-6">
            <div className="font-semibold text-blue-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              How are affiliated colleges verified?
            </div>
            <p className="text-slate-600 leading-relaxed">
              Degrees and certificates issued to students of affiliated colleges under recognized universities (such as Savitribai Phule Pune University or the University of Mumbai) are verified through the <strong>parent university&apos;s authoritative registrar rail</strong>, not through individual college offices.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/solutions/universities-colleges/supported-universities"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] text-sm"
            >
              <span>View Supported Parent Universities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/verification/coverage"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-[#0F2942] bg-white border border-slate-300 hover:bg-slate-50 text-sm"
            >
              <span>Search Coverage Directory</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
