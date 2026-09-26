"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  FileText,
  HelpCircle,
  BookOpen,
  ListChecks,
  MessageSquare,
  Mail,
  ArrowRight,
  Shield
} from "lucide-react";

export default function ResourcesOverviewPage() {
  const resourceCards = [
    {
      title: "Supported Documents",
      path: "/resources/supported-documents",
      desc: "Complete classification matrix of education credentials, board marksheets, and employment records supported for analysis.",
      icon: FileText
    },
    {
      title: "Document Requirements",
      path: "/resources/document-requirements",
      desc: "Technical file specifications including accepted formats (PDF, JPEG, PNG), resolution thresholds, and file size limits.",
      icon: ListChecks
    },
    {
      title: "Document Guidelines",
      path: "/resources/document-guidelines",
      desc: "Best practices for document scanning, lighting, edge detection, multi-page transcripts, and avoiding optical occlusion.",
      icon: BookOpen
    },
    {
      title: "Help Center",
      path: "/help",
      desc: "Central knowledge base with operational guides, error troubleshooting, and step-by-step workspace tutorials.",
      icon: HelpCircle
    },
    {
      title: "Frequently Asked Questions",
      path: "/faq",
      desc: "Answers to common individual and institutional questions regarding analysis, verification, DigiLocker, and data privacy.",
      icon: MessageSquare
    },
    {
      title: "Contact Us",
      path: "/contact",
      desc: "Get in touch with our institutional onboarding team, technical support, or submit an institution expansion request.",
      icon: Mail
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
          <span className="text-[#0F2942]">Resources</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Knowledge Base &amp; Guides
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Resources &amp; Documentation
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Technical guidelines, document specifications, support guides, and FAQs designed to help you prepare and verify your credentials.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {resourceCards.map((res, idx) => {
            const Icon = res.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F2942] mb-2">
                    {res.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                    {res.desc}
                  </p>
                </div>
                <Link
                  href={res.path}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 pt-4 border-t border-slate-100"
                >
                  <span>Open {res.title}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
}
