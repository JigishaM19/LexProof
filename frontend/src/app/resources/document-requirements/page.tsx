"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ListChecks,
  FileType,
  Maximize2,
  HardDrive,
  Eye,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

export default function DocumentRequirementsPage() {
  const specs = [
    {
      title: "Supported File Formats",
      desc: "PDF (.pdf), JPEG (.jpg, .jpeg), and PNG (.png) files are fully supported. For transcripts, multi-page PDFs are recommended.",
      icon: FileType
    },
    {
      title: "Resolution & Clarity",
      desc: "Minimum recommended scanning resolution is 300 DPI (dots per inch). Ensure that micro-printed numbers and university seals are clearly legible.",
      icon: Maximize2
    },
    {
      title: "Maximum File Size",
      desc: "Individual uploads up to 25 MB per document are supported. Dossier cases can hold multiple documents up to 100 MB aggregate.",
      icon: HardDrive
    },
    {
      title: "Color & Contrast",
      desc: "Color or high-grade greyscale scans are preferred. Avoid black-and-white 1-bit thresholding which destroys faint watermarks and ink stamps.",
      icon: Eye
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
          <Link href="/resources" className="hover:text-blue-600">Resources</Link>
          <span>/</span>
          <span className="text-[#0F2942]">Document Requirements</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Technical Specifications
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Document Ingestion Requirements
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Ensure your files comply with these formatting and resolution standards to maximize OCR extraction accuracy and automated rail matching.
          </p>
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {specs.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F2942] mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="font-bold text-base text-[#0F2942] mb-1">Have your documents ready?</h4>
            <p className="text-xs text-slate-600">Open your LexProof dashboard to upload and analyze your files now.</p>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-[#0F2942] text-white font-semibold text-xs rounded-xl hover:bg-[#163b5f] transition-colors shrink-0"
          >
            Go to Workspace →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
