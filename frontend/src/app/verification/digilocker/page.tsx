"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ShieldCheck,
  Lock,
  ExternalLink,
  ArrowRight
} from "lucide-react";

export default function DigiLockerIntegrationPage() {
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
          <span className="text-[#0F2942]">DigiLocker Integration</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              National Digital Repository
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            DigiLocker &amp; API Setu Integration
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Connecting directly with government-accredited digital repositories to retrieve authentic, cryptographically signed academic records.
          </p>
        </div>

        {/* Environment Architecture Notice */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 sm:p-8 mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="font-bold text-sm text-[#0F2942]">Official API Setu Gateway Deployment</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              Official DigiLocker / API Setu integration is configured in production environments with government partner credentials.
            </p>
          </div>
          <Link
            href="/verification/coverage"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-xs text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors shrink-0"
          >
            <span>View DigiLocker-Enabled Issuers</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Privacy & Protocol Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <ExternalLink className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0F2942] mb-2">Consent-Driven Redirection</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Authentication happens directly on the official DigiLocker web interface. You log in using your own credentials with explicit consent.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0F2942] mb-2">Zero PIN or Aadhaar Retention</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              LexProof never observes, prompts for, or retains your DigiLocker PIN, password, or master Aadhaar number.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#0F2942] mb-2">Issuer-Signed XML Records</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Receives tamper-evident, PKI-signed XML certificate data directly from the state board or university server node.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
