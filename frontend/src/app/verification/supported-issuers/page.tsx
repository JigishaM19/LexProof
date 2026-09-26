"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin
} from "lucide-react";

export default function SupportedIssuersPage() {
  const issuers = [
    {
      name: "Savitribai Phule Pune University (SPPU)",
      state: "Maharashtra",
      type: "University",
      status: "Supported",
      rail: "Direct Digital Ledger Rail"
    },
    {
      name: "University of Mumbai (Engineering & Science)",
      state: "Maharashtra",
      type: "University",
      status: "Supported",
      rail: "Degree Registry Connected"
    },
    {
      name: "Maharashtra State Board of Technical Education (MSBTE)",
      state: "Maharashtra",
      type: "Technical Board",
      status: "Supported",
      rail: "Polytechnic Verification Active"
    },
    {
      name: "Rashtrasant Tukadoji Maharaj Nagpur University",
      state: "Maharashtra",
      type: "University",
      status: "Supported",
      rail: "Roll Concurrence Active"
    },
    {
      name: "Maharashtra State Board of Secondary and Higher Secondary Education",
      state: "Maharashtra",
      type: "Examination Board",
      status: "Supported",
      rail: "DigiLocker Central Rail Active"
    },
    {
      name: "University of Delhi (DU)",
      state: "Delhi",
      type: "University",
      status: "Analysis Only",
      rail: "Verification Unavailable (Roadmap Q4)"
    },
    {
      name: "Anna University",
      state: "Tamil Nadu",
      type: "University",
      status: "Analysis Only",
      rail: "Verification Unavailable (Roadmap Q4)"
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
          <span className="text-[#0F2942]">Supported Issuers</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Institutional Rails
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Supported Issuers Directory
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Official universities, technical education boards, and examination authorities with active verification or analysis coverage.
          </p>

          <Link
            href="/verification/coverage"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] text-sm shadow-sm"
          >
            <span>Live Interactive Search</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Issuers List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-16">
          {issuers.map((iss, idx) => {
            const isSupported = iss.status === "Supported";
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      {iss.type}
                    </span>
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        isSupported
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {isSupported ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Supported
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3" /> Analysis Only
                        </>
                      )}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-[#0F2942] mb-1">
                    {iss.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{iss.state}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-600">
                    {iss.rail}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
