"use client";

import React, { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Shield,
  School,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  HelpCircle,
  AlertTriangle,
  ArrowRight,
  FileText,
  Layers,
  Sparkles,
  Award
} from "lucide-react";

export default function SupportedDocumentsPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setActiveFaq(activeFaq === idx ? null : idx);
  };

  const faqs = [
    {
      q: "What is the exact difference between Document Analysis and Verification?",
      a: "Document Analysis uses computer vision and OCR to read what is written on a file and structure the text into organized fields (Name, PRN, Marks). Verification, however, involves contacting the official issuer or authoritative registry (such as the university or DigiLocker) to prove that the document was legitimately issued. Analysis only reads the page; Verification authenticates the origin."
    },
    {
      q: "Which institutions are currently supported for authoritative verification?",
      a: "At present, direct authoritative verification is available for selected higher education institutions and boards in Maharashtra (including Savitribai Phule Pune University, University of Mumbai engineering records, and MSBTE), as well as central repositories via DigiLocker. For all other institutions, optical analysis is available, but verification will be honestly marked as 'Unavailable'."
    },
    {
      q: "Does an 'Analysis Complete' status mean my document is verified?",
      a: "No. 'Analysis Complete' simply signifies that the text was extracted legibly and passes basic syntactic checks. It does NOT mean the document has been certified by the issuing authority."
    },
    {
      q: "Why does a document show 'Unavailable' status instead of Verified or Failed?",
      a: "We adhere to strict forensic honesty. If an issuing university has not provided an API or digital registry rail, we cannot authoritatively corroborate the document. Rather than guessing or falsely labeling it invalid, we designate it 'Unavailable'."
    },
    {
      q: "How does the DigiLocker integration work?",
      a: "You are redirected to the official government DigiLocker consent screen. Once you authenticate using your credentials directly on their portal, DigiLocker issues a cryptographic token allowing LexProof to retrieve the authentic issuer-signed XML record."
    },
    {
      q: "Do you ever store my Aadhaar number or DigiLocker PIN?",
      a: "Never. Authentication happens directly on the official DigiLocker web interface. LexProof never observes, prompts for, or retains your PIN, password, or Aadhaar credentials."
    },
    {
      q: "Can HR departments use LexProof for pre-employment background checks?",
      a: "Yes. Organizations use our batch consoles to analyze candidate documents for internal consistency and automatically verify credentials against supported educational institutions with applicant consent."
    },
    {
      q: "What happens if a document has physical tampering or altered marks?",
      a: "Our heuristics engine inspects font alignment, pixel irregularities around numerical grades, and arithmetic consistency (e.g. subject mark sums). If discrepancies exist, the document is designated 'Needs Review' with the flagged zones clearly annotated."
    },
    {
      q: "How can universities integrate their registrar database?",
      a: "Registrars can connect through our secure institutional gateway using read-only API connectors or cryptographic public-key signed degree certificates. Contact our institutional team to schedule onboarding."
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8FF] text-[#131B2E] flex flex-col font-sans">
      <Navbar />
      {/* Scope Ticker */}
      <div className="bg-[#0F2942] text-white py-2 px-6 text-xs flex items-center justify-between border-b border-[#314863]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#0284C7] animate-pulse"></span>
          <span className="font-semibold uppercase text-[#B0C9E8]">Credential Specifications:</span>
          <span>Technical guidelines on supported education and employment documents.</span>
        </div>
        <Link href="/dashboard" className="text-[#93CCFF] hover:text-white underline">
          Open Workspace â†’
        </Link>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1 flex flex-col gap-12">
        {/* Header */}
        <div className="max-w-3xl flex flex-col gap-2">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-[#4338CA] uppercase tracking-wider bg-[#E3DFFF] px-2.5 py-1 rounded-full self-start">
            <FileText className="w-3.5 h-3.5" /> Classification Matrix
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-[#001428] tracking-tight">
            Supported Document Categories
          </h1>
          <p className="text-sm text-[#43474D]">
            LexProof analyzes information from all listed document classes, while authoritative verification depends on the respective source registry.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Education Credentials Category */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#C3C6CE]/40">
              <School className="w-5 h-5 text-[#4338CA]" />
              <h2 className="text-lg font-bold text-[#001428]">Education Credentials</h2>
            </div>

            <div className="flex flex-col gap-3">
              {/* Item 1 */}
              <div className="bg-white p-4 rounded-xl border border-[#C3C6CE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="font-bold text-sm text-[#001428] block">
                    Degree Certificates (UG / PG)
                  </span>
                  <span className="text-xs text-[#74777E]">
                    Conferment titles, PRN, passing division, convocation date
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold bg-[#EAEDFF] text-[#4338CA] px-2 py-0.5 rounded">
                    Analysis: âœ“ Active
                  </span>
                  <span className="text-[11px] font-semibold bg-[#FAF8FF] text-[#001428] px-2 py-0.5 rounded border border-[#C3C6CE]/40">
                    Verify: MH Rails Only
                  </span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="bg-white p-4 rounded-xl border border-[#C3C6CE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="font-bold text-sm text-[#001428] block">
                    Semester Mark Sheets & Transcripts
                  </span>
                  <span className="text-xs text-[#74777E]">
                    Credit tables, SGPA/CGPA formulas, subject breakdown
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold bg-[#EAEDFF] text-[#4338CA] px-2 py-0.5 rounded">
                    Analysis: âœ“ Active
                  </span>
                  <span className="text-[11px] font-semibold bg-[#FAF8FF] text-[#001428] px-2 py-0.5 rounded border border-[#C3C6CE]/40">
                    Verify: QR / Issuer
                  </span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="bg-white p-4 rounded-xl border border-[#C3C6CE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="font-bold text-sm text-[#001428] block">
                    Higher Secondary (HSC / 12th) Boards
                  </span>
                  <span className="text-xs text-[#74777E]">
                    State and central board pass certificates & migration cards
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold bg-[#EAEDFF] text-[#4338CA] px-2 py-0.5 rounded">
                    Analysis: âœ“ Active
                  </span>
                  <span className="text-[11px] font-semibold bg-[#FAF8FF] text-[#001428] px-2 py-0.5 rounded border border-[#C3C6CE]/40">
                    Verify: DigiLocker
                  </span>
                </div>
              </div>

              {/* Item 4 */}
              <div className="bg-white p-4 rounded-xl border border-[#C3C6CE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="font-bold text-sm text-[#001428] block">
                    Polytechnic & Technical Diplomas
                  </span>
                  <span className="text-xs text-[#74777E]">
                    MSBTE and affiliated technical education boards
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold bg-[#EAEDFF] text-[#4338CA] px-2 py-0.5 rounded">
                    Analysis: âœ“ Active
                  </span>
                  <span className="text-[11px] font-semibold bg-[#FAF8FF] text-[#001428] px-2 py-0.5 rounded border border-[#C3C6CE]/40">
                    Verify: MSBTE Rail
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Employment Records Category */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#C3C6CE]/40">
              <Briefcase className="w-5 h-5 text-[#4338CA]" />
              <h2 className="text-lg font-bold text-[#001428]">Employment Records</h2>
            </div>

            <div className="flex flex-col gap-3">
              {/* Item 1 */}
              <div className="bg-white p-4 rounded-xl border border-[#C3C6CE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="font-bold text-sm text-[#001428] block">
                    Experience & Relieving Letters
                  </span>
                  <span className="text-xs text-[#74777E]">
                    Tenure dates, designation title, signing authority
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold bg-[#EAEDFF] text-[#4338CA] px-2 py-0.5 rounded">
                    Analysis: âœ“ Active
                  </span>
                  <span className="text-[11px] font-semibold bg-[#FAF8FF] text-[#001428] px-2 py-0.5 rounded border border-[#C3C6CE]/40">
                    Verify: Issuer Domain
                  </span>
                </div>
              </div>

              {/* Item 2 */}
              <div className="bg-white p-4 rounded-xl border border-[#C3C6CE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="font-bold text-sm text-[#001428] block">
                    Corporate Offer Letters
                  </span>
                  <span className="text-xs text-[#74777E]">
                    Joining date, compensation grade, institutional seal
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold bg-[#EAEDFF] text-[#4338CA] px-2 py-0.5 rounded">
                    Analysis: âœ“ Active
                  </span>
                  <span className="text-[11px] font-semibold bg-[#FAF8FF] text-[#001428] px-2 py-0.5 rounded border border-[#C3C6CE]/40">
                    Verify: Manual Source
                  </span>
                </div>
              </div>

              {/* Item 3 */}
              <div className="bg-white p-4 rounded-xl border border-[#C3C6CE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="font-bold text-sm text-[#001428] block">
                    Salary Slips & Tax Deductions
                  </span>
                  <span className="text-xs text-[#74777E]">
                    Numeric salary breakdown, employer TAN matching
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold bg-[#EAEDFF] text-[#4338CA] px-2 py-0.5 rounded">
                    Analysis: âœ“ Active
                  </span>
                  <span className="text-[11px] font-semibold bg-[#FAF8FF] text-[#001428] px-2 py-0.5 rounded border border-[#C3C6CE]/40">
                    Verify: Structural Only
                  </span>
                </div>
              </div>

              {/* Item 4 */}
              <div className="bg-white p-4 rounded-xl border border-[#C3C6CE]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <span className="font-bold text-sm text-[#001428] block">
                    Apprenticeship Certificates
                  </span>
                  <span className="text-xs text-[#74777E]">
                    Skill council badges, registration ID numbers
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-semibold bg-[#EAEDFF] text-[#4338CA] px-2 py-0.5 rounded">
                    Analysis: âœ“ Active
                  </span>
                  <span className="text-[11px] font-semibold bg-[#FAF8FF] text-[#001428] px-2 py-0.5 rounded border border-[#C3C6CE]/40">
                    Verify: Depends on Council
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Split Comparison Matrix: Analysis vs Verification */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-[#C3C6CE]/30 flex flex-col gap-6">
          <div className="max-w-2xl flex flex-col gap-1">
            <span className="text-xs font-bold text-[#4338CA] uppercase tracking-wider">
              The Fundamental Law of Trust
            </span>
            <h2 className="text-2xl font-bold text-[#001428]">
              Analysis and Verification Are Not the Same
            </h2>
            <p className="text-xs text-[#43474D]">
              Automated vision reading is a convenience feature; institutional provenance is legal certainty.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Analysis Card */}
            <div className="bg-[#FAF8FF] p-6 rounded-xl border border-[#C3C6CE]/40 flex flex-col gap-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#C3C6CE]/30">
                <span className="font-bold text-[#001428] text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#4338CA]" />
                  AI & Document Analysis
                </span>
                <span className="text-xs bg-[#EAEDFF] text-[#4338CA] px-2 py-0.5 rounded font-semibold">
                  Syntactic Phase
                </span>
              </div>
              <ul className="text-xs text-[#43474D] space-y-2 flex-1">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4338CA] shrink-0 mt-0.5" />
                  <span><strong>Reads & transcribes:</strong> Parses low-contrast and rotated mobile phone scans.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4338CA] shrink-0 mt-0.5" />
                  <span><strong>Extracts key fields:</strong> Identifies Names, Candidate PRNs, CGPA, and Passing dates.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4338CA] shrink-0 mt-0.5" />
                  <span><strong>Structures messy data:</strong> Standardizes inconsistent semester tabular formats.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4338CA] shrink-0 mt-0.5" />
                  <span><strong>Flags structural oddities:</strong> Spots typographical mismatch, irregular spacing, or font tampering.</span>
                </li>
              </ul>
              <div className="p-3 bg-white rounded-lg border border-[#C3C6CE]/40 text-xs text-[#74777E] italic">
                Limitation: An edited, fake document formatted flawlessly will still pass pure AI analysis without error.
              </div>
            </div>

            {/* Verification Card */}
            <div className="bg-[#001428] text-white p-6 rounded-xl flex flex-col gap-3 shadow-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/20">
                <span className="font-bold text-white text-base flex items-center gap-2">
                  <Award className="w-5 h-5 text-[#93CCFF]" />
                  Authoritative Verification
                </span>
                <span className="text-xs bg-[#0F2942] text-[#93CCFF] px-2 py-0.5 rounded font-semibold">
                  Legal Provenance
                </span>
              </div>
              <ul className="text-xs text-white/90 space-y-2 flex-1">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#93CCFF] shrink-0 mt-0.5" />
                  <span><strong>Direct Issuer confirmation:</strong> Verifies with the official university ledger or state board.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#93CCFF] shrink-0 mt-0.5" />
                  <span><strong>DigiLocker API rail:</strong> Resolves authentic national repository cryptographic signatures.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#93CCFF] shrink-0 mt-0.5" />
                  <span><strong>Cryptographic QR decryption:</strong> Validates university-signed embedded public key payloads.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#93CCFF] shrink-0 mt-0.5" />
                  <span><strong>Definitive legal verdict:</strong> Issues Verified, Failed, or Honest Unavailable status.</span>
                </li>
              </ul>
              <div className="p-3 bg-[#0F2942] rounded-lg border border-white/10 text-xs text-[#B0C9E8] italic">
                Requirement: Relies on registered institutional partnerships and digital public infrastructure integrations.
              </div>
            </div>
          </div>
        </div>

        {/* 9-Question FAQ Accordion */}
        <div className="flex flex-col gap-6">
          <div className="max-w-2xl flex flex-col gap-1">
            <span className="text-xs font-bold text-[#4338CA] uppercase tracking-wider">
              Factual Clarifications
            </span>
            <h2 className="text-2xl font-bold text-[#001428]">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-[#43474D]">
              Clear, honest answers regarding capabilities, scope limits, and verification standards.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white rounded-xl border border-[#C3C6CE]/30 overflow-hidden shadow-xs transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="text-sm font-semibold text-[#001428]">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#4338CA] transition-transform duration-200 shrink-0 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-[#43474D] leading-relaxed border-t border-[#FAF8FF] pt-2">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

