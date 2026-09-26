"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  User,
  Building2,
  FileText,
  Cpu,
  GraduationCap,
  ShieldCheck,
  Landmark,
  ArrowRight,
  CheckCircle2,
  FileSearch,
  GitCompare,
  ShieldAlert,
  Layers
} from "lucide-react";

export default function SolutionsOverviewPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Solutions Directory
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-5">
            Solutions Built for Document Intelligence
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Whether you are an individual verifying your academic records or an institution reviewing thousands of credentials, LexProof delivers tailored intelligence and verification tools.
          </p>
        </div>

        {/* SECTION 1: FOR INDIVIDUALS */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200/80">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F2942]">For Individuals</h2>
              <p className="text-xs text-slate-500">Analyze personal documents, academic degrees, and application requirements.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F2942] mb-2">Document Analysis</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  AI-powered assistance for analyzing documents: upload files, understand content, ask questions, extract key details, summarize provisions, and receive useful suggestions.
                </p>
              </div>
              <Link
                href="/solutions/document-analysis"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 pt-4 border-t border-slate-100"
              >
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F2942] mb-2">Student &amp; Graduate</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Support for academic documents: degree certificates, diplomas, marksheets, transcripts, provisional certificates, migration, and transfer certificates.
                </p>
              </div>
              <Link
                href="/solutions/student-graduate-documents"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 pt-4 border-t border-slate-100"
              >
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F2942] mb-2">Personal Documents</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Understand critical personal documents: identify important requirements, missing information, cross-document inconsistencies, and recommended next steps.
                </p>
              </div>
              <Link
                href="/solutions/personal-documents"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 pt-4 border-t border-slate-100"
              >
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION 2: FOR ORGANIZATIONS */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200/80">
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0F2942]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F2942]">For Organizations</h2>
              <p className="text-xs text-slate-500">Institutional tools for universities, government documents, and authorized verifiers.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F2942] flex items-center justify-center mb-4">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F2942] mb-2">Universities &amp; Colleges</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Explore supported universities and colleges. Check active digital ledger connections, registrar rails, and institution onboarding.
                </p>
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <Link href="/solutions/universities-colleges/supported-universities" className="block text-blue-600 hover:underline">
                    â†’ Supported Universities
                  </Link>
                  <Link href="/solutions/universities-colleges/supported-colleges" className="block text-blue-600 hover:underline">
                    â†’ Supported Colleges
                  </Link>
                </div>
              </div>
              <Link
                href="/solutions/universities-colleges"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 pt-4 border-t border-slate-100"
              >
                <span>Institutional details</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F2942] flex items-center justify-center mb-4">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F2942] mb-2">Government Documents Analysis</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Structured analysis across identity, address, educational, income, caste/category, employment/service, and other government certificates.
                </p>
              </div>
              <Link
                href="/solutions/government-documents"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 pt-4 border-t border-slate-100"
              >
                <span>View document classes</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-[#0F2942] flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-[#0F2942] mb-2">Authorized Verifiers</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  Workflows for verifiers to review submitted documents, inspect AI analysis, compare records, review integrity findings, and record actions.
                </p>
              </div>
              <Link
                href="/solutions/authorized-verifiers"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 pt-4 border-t border-slate-100"
              >
                <span>Verifier workflows</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* SECTION 3: PLATFORM CAPABILITIES */}
        <div>
          <div className="flex items-center gap-3 mb-6 pb-3 border-b border-slate-200/80">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F2942]">Platform Capabilities</h2>
              <p className="text-xs text-slate-500">Core technology modules powering the LexProof document engine.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Link
              href="/platform/document-analysis"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all block group"
            >
              <FileText className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-[#0F2942] mb-1">Document Analysis</h4>
              <p className="text-xs text-slate-500">Optical parsing, spatial layout mapping, and OCR.</p>
            </Link>

            <Link
              href="/platform/information-extraction"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all block group"
            >
              <FileSearch className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-[#0F2942] mb-1">Information Extraction</h4>
              <p className="text-xs text-slate-500">Structured key-value entities and tabular credits.</p>
            </Link>

            <Link
              href="/platform/document-comparison"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all block group"
            >
              <GitCompare className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-[#0F2942] mb-1">Document Comparison</h4>
              <p className="text-xs text-slate-500">Cross-dossier reconciliation and name alignment.</p>
            </Link>

            <Link
              href="/platform/integrity-checks"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all block group"
            >
              <ShieldAlert className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-[#0F2942] mb-1">Integrity Checks</h4>
              <p className="text-xs text-slate-500">AI-assisted anomaly alerts and arithmetic tests.</p>
            </Link>

            <Link
              href="/platform/verification-workflows"
              className="bg-white p-5 rounded-xl border border-slate-200 hover:border-blue-400 hover:shadow-sm transition-all block group"
            >
              <ShieldCheck className="w-5 h-5 text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-bold text-sm text-[#0F2942] mb-1">Verification Workflows</h4>
              <p className="text-xs text-slate-500">Registry rail queries with human review audit.</p>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
