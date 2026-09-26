"use client";

import React from "react";
import Link from "next/link";
import Navbar, { LexProofLogo } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Shield,
  User,
  Building2,
  FileCheck2,
  Search,
  CheckCircle2,
  ArrowRight,
  Info
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8FF] text-slate-800">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
        {/* Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              About LexProof
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-5">
            Document Intelligence &amp; Verification
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            LexProof is an AI-assisted document intelligence platform that helps individuals and organizations analyze, understand, compare and review documents.
          </p>
        </div>

        {/* Dual Pillar Positioning */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {/* For Individuals */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-6">
                <User className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F2942] mb-3">
                For Individuals
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Helping students, graduates, and individual applicants parse complex credentials, clarify document terms, and prepare complete submission dossiers.
              </p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Document Understanding:</strong> Plain-language explanations of requirements and complex provisions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Document Analysis:</strong> High-precision parsing of certificate structures, marks, and grades.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Information Extraction:</strong> Automatic structuring of essential identity and academic attributes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Document Comparison:</strong> Cross-document concordance between multiple applications and certificates.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Useful Suggestions:</strong> Proactive identification of missing fields, illegible zones, and next steps.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/solutions/document-analysis"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5"
              >
                <span>Explore Individual Solutions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* For Organizations */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#0F2942] mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-[#0F2942] mb-3">
                For Organizations
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Equipping universities, registrars, and authorized verifiers with automated extraction pipelines and authoritative verification workflows.
              </p>
              <ul className="space-y-3 text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Document Analysis:</strong> High-throughput batch processing of incoming candidate applications.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Structured Information Extraction:</strong> Standardized JSON output mapped to institutional databases.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Multi-Document Comparison:</strong> Automated name matching, grade sums, and sequence verification.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>AI-Assisted Integrity Checks:</strong> Detection of structural irregularities, font misalignments, and arithmetic anomalies.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Verification Workflows:</strong> Direct registry rail queries with human reviewer sign-off and audit trails.</span>
                </li>
              </ul>
            </div>
            <div className="mt-8 pt-6 border-t border-slate-100">
              <Link
                href="/solutions/authorized-verifiers"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5"
              >
                <span>Explore Verifier Tools</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Forensic Policy & Scope */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm mb-16">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h3 className="text-xl font-bold text-[#0F2942]">
              Forensic Honesty &amp; Scope Architecture
            </h3>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            LexProof maintains strict separation between <strong>Document Analysis</strong> and <strong>Authoritative Verification</strong>:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-[#0F2942] mb-1">Document Analysis</h4>
              <p className="text-slate-600">
                Operates globally on supported document formats. Optical reading and semantic parsing structure the text without asserting legal validity.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <h4 className="font-bold text-[#0F2942] mb-1">Authoritative Verification</h4>
              <p className="text-slate-600">
                Requires active connectivity to an official issuing registry. Currently active for selected Maharashtra educational institutions and central DigiLocker rails. If a registry rail is unavailable, documents are clearly designated &quot;Verification Unavailable&quot; rather than guessed.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
