"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  HelpCircle,
  ChevronDown,
  ArrowRight,
  Shield,
  Info
} from "lucide-react";

export default function FaqPage() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "What is the difference between Document Analysis and Verification?",
      a: "Document Analysis utilizes OCR and structural language models to extract and structure data from any supported document scan (names, roll numbers, marks, dates). Verification, by contrast, queries an authoritative digital registry (such as a university ledger rail or DigiLocker) to corroborate that the record was officially issued. Analysis reads the page; Verification authenticates the origin."
    },
    {
      q: "Does 'Analysis Complete' mean my document has been verified?",
      a: "No. 'Analysis Complete' means the file was scanned legibly, passed optical integrity checks, and was structured into standardized fields. It does not certify official authenticity."
    },
    {
      q: "Which educational institutions are currently supported for authoritative verification?",
      a: "Active authoritative ledger rails are currently live for selected institutions in Maharashtra, including Savitribai Phule Pune University (SPPU), University of Mumbai engineering records, MSBTE polytechnic certificates, RTM Nagpur University, and Maharashtra Secondary/Higher Secondary Boards via DigiLocker. For other universities, optical analysis is active while rails remain in roadmap development."
    },
    {
      q: "Why does my document show 'Verification Unavailable' instead of Verified or Failed?",
      a: "We adhere strictly to forensic honesty. If an issuing university has not yet established an active API or digital ledger rail with LexProof, we cannot authoritatively verify the record. Rather than guessing, we designate it 'Verification Unavailable'."
    },
    {
      q: "How does the DigiLocker integration handle my credentials?",
      a: "Authentication happens entirely on the official DigiLocker web interface. Once you authorize access with your credentials, DigiLocker issues a cryptographic token allowing LexProof to retrieve the authentic issuer-signed XML certificate. LexProof never prompts for, observes, or stores your Aadhaar number or DigiLocker PIN."
    },
    {
      q: "Can universities and recruiters use LexProof for candidate background screening?",
      a: "Yes. Admissions committees and authorized verifiers use LexProof to batch-process applicant dossiers, perform multi-document consistency checks, run AI-assisted integrity checks, and corroborate credentials with applicant consent."
    },
    {
      q: "Does AI guarantee authenticity or detect all fraudulent documents?",
      a: "No. LexProof provides AI-assisted verification and AI-assisted integrity checks designed to support human review. We never claim guaranteed authenticity or guaranteed fraud detection. Final evaluation decisions always remain with authorized human reviewers."
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
          <span className="text-[#0F2942]">Frequently Asked Questions</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Clear &amp; Transparent Answers
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
            Transparent explanations of our document analysis pipeline, authoritative verification coverage, and data privacy principles.
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl space-y-3 mb-16">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-sm sm:text-base font-bold text-[#0F2942]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-blue-600 transition-transform shrink-0 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 max-w-3xl">
          <div>
            <h4 className="font-bold text-base text-[#0F2942] mb-1">Still have questions?</h4>
            <p className="text-xs text-slate-600">Contact our support team for technical inquiries or institutional pilot details.</p>
          </div>
          <Link
            href="/contact"
            className="px-5 py-2.5 bg-[#0F2942] text-white font-semibold text-xs rounded-xl hover:bg-[#163b5f] transition-colors shrink-0"
          >
            Contact Support →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
