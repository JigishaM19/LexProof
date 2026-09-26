"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Landmark,
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  MapPin,
  Check
} from "lucide-react";

export default function SupportedUniversitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Actual institutions from project verification registry (backend/app/api/verification.py)
  const actualUniversities = [
    {
      id: "sppu-mh",
      name: "Savitribai Phule Pune University (SPPU)",
      state: "Maharashtra",
      status: "Supported" as const,
      rail_type: "Direct Digital Ledger Rail Available",
      supported_documents: ["Degree Certificate", "Passing Certificate", "Marksheet"]
    },
    {
      id: "uom-mh",
      name: "University of Mumbai (Engineering & Science)",
      state: "Maharashtra",
      status: "Supported" as const,
      rail_type: "Degree Registry Connected",
      supported_documents: ["Degree Certificate", "Provisional Certificate", "Transcript"]
    },
    {
      id: "msbte-mh",
      name: "Maharashtra State Board of Technical Education (MSBTE)",
      state: "Maharashtra",
      status: "Supported" as const,
      rail_type: "Polytechnic Verification Active",
      supported_documents: ["Polytechnic Diploma", "Provisional Passing Certificate"]
    },
    {
      id: "rtmnu-mh",
      name: "Rashtrasant Tukadoji Maharaj Nagpur University",
      state: "Maharashtra",
      status: "Supported" as const,
      rail_type: "Roll Concurrence Active",
      supported_documents: ["Degree Certificate", "Grade Card"]
    },
    {
      id: "msbshse-mh",
      name: "Maharashtra State Board of Secondary and Higher Secondary Education",
      state: "Maharashtra",
      status: "Supported" as const,
      rail_type: "DigiLocker Central Rail Active",
      supported_documents: ["SSC Marksheet", "HSC Marksheet", "Migration Certificate"]
    },
    {
      id: "du-delhi",
      name: "University of Delhi (DU)",
      state: "Delhi",
      status: "Analysis Only" as const,
      rail_type: "Verification Unavailable (Roadmap Q4)",
      supported_documents: ["Degree Certificate", "Marksheet"]
    },
    {
      id: "anna-tn",
      name: "Anna University",
      state: "Tamil Nadu",
      status: "Analysis Only" as const,
      rail_type: "Verification Unavailable (Roadmap Q4)",
      supported_documents: ["Degree Certificate", "Consolidated Grade Sheet"]
    }
  ];

  const filtered = actualUniversities.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <span className="text-[#0F2942]">Supported Universities</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Institutional Registry
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Supported Universities &amp; Boards
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Authoritative verification availability for higher education institutions. Grounded strictly in active digital ledger rails and official pilot repositories.
          </p>
        </div>

        {/* Search Input */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm mb-8 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter universities by name or state (e.g. Pune, Mumbai, Delhi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>
        </div>

        {/* Universities List */}
        <div className="space-y-4 mb-16">
          {filtered.map((inst) => {
            const isSupported = inst.status === "Supported";
            return (
              <div
                key={inst.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base sm:text-lg font-bold text-[#0F2942]">
                      {inst.name}
                    </h3>
                    <span
                      className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
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
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {inst.state}
                    </span>
                    <span>â€¢</span>
                    <span className="font-mono text-slate-600">{inst.rail_type}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {inst.supported_documents.map((doc, docIdx) => (
                      <span
                        key={docIdx}
                        className="text-[11px] bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-200"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <Link
                    href={`/verification/coverage?search=${encodeURIComponent(inst.name)}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <span>Check Rail Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Lookup CTA */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold text-[#0F2942] mb-1">
              Looking for another institution?
            </h3>
            <p className="text-sm text-slate-600">
              Use our live pilot coverage directory to test query endpoints or submit an institution onboarding request.
            </p>
          </div>
          <Link
            href="/verification/coverage"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] text-sm shrink-0"
          >
            <span>Open Coverage Directory</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
