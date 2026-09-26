"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  FileText,
  Upload,
  MessageSquare,
  Sparkles,
  FileSearch,
  AlertTriangle,
  GitCompare,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Layers,
  Shield
} from "lucide-react";

export default function DocumentAnalysisSolutionPage() {
  const capabilities = [
    {
      title: "Upload Documents",
      desc: "Drag-and-drop or browse multiple document formats including PDF, JPEG, and PNG directly into a secured workspace case.",
      icon: Upload
    },
    {
      title: "Understand Document Content",
      desc: "Transforms complex institutional jargon and multi-page transcripts into plain, transparent summaries.",
      icon: Layers
    },
    {
      title: "Ask Questions",
      desc: "Interactive question-answering allows you to query specific clauses, grade boundaries, credit calculations, and deadlines.",
      icon: MessageSquare
    },
    {
      title: "Summarize Documents",
      desc: "Generate concise, executive summaries of key qualifications, issuing bodies, dates, and candidate credentials.",
      icon: Sparkles
    },
    {
      title: "Extract Information",
      desc: "Automatically extracts names, registration numbers, GPA/CGPA scores, issuing authority, and issuance timestamps into structured fields.",
      icon: FileSearch
    },
    {
      title: "Identify Missing Information",
      desc: "Flags omissions such as missing registrar signatures, unsealed endorsements, or omitted academic semesters.",
      icon: AlertTriangle
    },
    {
      title: "Identify Inconsistencies",
      desc: "Highlights typographic discrepancies, name spelling mismatches, or internal arithmetic contradictions across subject marks.",
      icon: Shield
    },
    {
      title: "Compare Documents",
      desc: "Align and compare two or more records side-by-side to ensure candidate details match consistently across certificates.",
      icon: GitCompare
    },
    {
      title: "Receive Useful Suggestions",
      desc: "Provides actionable next steps, advising on supplementary documents required or authoritative verification options.",
      icon: Lightbulb
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
          <Link href="/solutions" className="hover:text-blue-600">Solutions</Link>
          <span>/</span>
          <span className="text-[#0F2942]">Document Analysis</span>
        </div>

        {/* Hero Section */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              For Individuals
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            AI-Powered Document Analysis
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            AI-powered assistance for analyzing documents. Understand document contents, extract structured fields, detect missing data, and receive helpful recommendations.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] transition-all shadow-sm text-sm"
            >
              <span>Upload Document to Analyze</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/resources/supported-documents"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-[#0F2942] bg-white hover:bg-slate-50 border border-slate-300 transition-colors text-sm"
            >
              <span>View Supported Documents</span>
            </Link>
          </div>
        </div>

        {/* 9 Core Analysis Capabilities Grid */}
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F2942] mb-2">What You Can Do</h2>
            <p className="text-sm text-slate-600">Complete toolset for inspecting, structuring, and interrogating your documents.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capabilities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#0F2942] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Workspace Ingestion Callout */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="text-xl font-bold text-[#0F2942] mb-2">
              Ready to explore your documents?
            </h3>
            <p className="text-sm text-slate-600">
              Open your LexProof workspace to upload files, generate instant OCR extractions, and ask questions directly to the document inspector.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] transition-colors text-sm shrink-0"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
