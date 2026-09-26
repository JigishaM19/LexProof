"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Building2,
  Landmark,
  Shield,
  FileCheck,
  Search,
  ArrowRight,
  CheckCircle2,
  Layers,
  ArrowUpRight
} from "lucide-react";

export default function UniversitiesCollegesOverviewPage() {
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
          <span className="text-[#0F2942]">Universities &amp; Colleges</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              For Organizations
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Universities &amp; Colleges Solutions
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Connecting higher education institutions with automated document extraction, candidate admissions verification, and authoritative digital degree rails.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/solutions/universities-colleges/supported-universities"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] transition-all shadow-sm text-sm"
            >
              <span>View Supported Universities</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/solutions/universities-colleges/supported-colleges"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-[#0F2942] bg-white hover:bg-slate-50 border border-slate-300 transition-colors text-sm"
            >
              <span>View Supported Colleges</span>
            </Link>
          </div>
        </div>

        {/* Dual Cards for Universities and Colleges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Supported Universities Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                <Landmark className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F2942] mb-3">
                Supported Universities
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                View universities currently connected via digital ledger rails or available for optical analysis. Covers Maharashtra pilot coverage and national examination boards.
              </p>
              <ul className="space-y-2 text-sm text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Savitribai Phule Pune University (SPPU)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>University of Mumbai (Engineering &amp; Science)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>RTM Nagpur University</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Maharashtra Technical &amp; Secondary Boards</span>
                </li>
              </ul>
            </div>
            <Link
              href="/solutions/universities-colleges/supported-universities"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              <span>Explore University Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Supported Colleges Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0F2942] mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F2942] mb-3">
                Supported Colleges
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Status of standalone college portals and affiliated constituent colleges. Learn how affiliated colleges are verified through parent university registrar systems.
              </p>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 mb-6">
                Affiliated colleges submit credentials under parent university registries. Standalone individual college registries are in onboarding.
              </div>
            </div>
            <Link
              href="/solutions/universities-colleges/supported-colleges"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              <span>Check College Status</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Institutional Ingestion Overview */}
        <div className="bg-[#0F2942] text-white rounded-2xl p-8 sm:p-12">
          <div className="max-w-2xl">
            <h3 className="text-2xl font-bold tracking-tight mb-3">
              Institutional Registrar Onboarding
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Universities and boards can integrate their student database or digital convocation registry directly with LexProof through read-only cryptographic APIs.
            </p>
            <Link
              href="/verification/coverage"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-[#0F2942] bg-white hover:bg-slate-100 text-sm"
            >
              <span>Request Institution Addition</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
