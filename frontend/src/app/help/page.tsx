"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  HelpCircle,
  Search,
  BookOpen,
  ShieldCheck,
  FileQuestion,
  LifeBuoy,
  ArrowRight,
  MessageSquare
} from "lucide-react";

export default function HelpCenterPage() {
  const [search, setSearch] = useState("");

  const topics = [
    {
      title: "Getting Started with LexProof",
      desc: "Learn how to register an account, initialize a document dossier, and navigate your workspace dashboard.",
      link: "/how-it-works"
    },
    {
      title: "Understanding Verification Statuses",
      desc: "Understand the clear difference between Analysis Complete, Verified, Needs Review, and Verification Unavailable.",
      link: "/verification/statuses"
    },
    {
      title: "Supported Institutions in Pilot",
      desc: "Check which Maharashtra universities, polytechnic boards, and examination councils maintain active rails.",
      link: "/verification/coverage"
    },
    {
      title: "DigiLocker & Data Privacy",
      desc: "Discover how our zero-retention DigiLocker integration retrieves authoritative records without storing PINs or Aadhaar.",
      link: "/verification/digilocker"
    },
    {
      title: "Troubleshooting Scanning & Uploads",
      desc: "Resolve low OCR confidence warnings, orientation mismatches, or file size limit errors during ingestion.",
      link: "/resources/document-guidelines"
    },
    {
      title: "Institutional Registrar Integration",
      desc: "Guidance for university admissions teams and registrars looking to integrate with our verifier console.",
      link: "/solutions/authorized-verifiers"
    }
  ];

  const filtered = topics.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <span className="text-[#0F2942]">Help Center</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Support &amp; Assistance
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            How can we help you?
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Search our knowledge base for guides on document analysis, authoritative verification rails, and workspace troubleshooting.
          </p>
        </div>

        {/* Search */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm mb-12 max-w-xl">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search help topics (e.g. DigiLocker, SPPU, verification status)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filtered.map((top, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <h3 className="text-base font-bold text-[#0F2942] mb-2">{top.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {top.desc}
                </p>
              </div>
              <Link
                href={top.link}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 pt-3 border-t border-slate-100"
              >
                <span>Read guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* Still need help banner */}
        <div className="bg-[#0F2942] text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold mb-1">Didn&apos;t find what you were looking for?</h4>
            <p className="text-xs text-slate-300">Browse our comprehensive FAQ or contact our institutional support desk.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/faq"
              className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-semibold hover:bg-slate-700 border border-slate-700"
            >
              View FAQ
            </Link>
            <Link
              href="/contact"
              className="px-4 py-2 bg-white text-[#0F2942] rounded-xl text-xs font-semibold hover:bg-slate-100"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
