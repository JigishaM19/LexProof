"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  FileText,
  UserCheck,
  Home,
  GraduationCap,
  Banknote,
  Award,
  Briefcase,
  FileCheck2,
  ArrowRight,
  Shield,
  Info
} from "lucide-react";

export default function GovernmentDocumentsOverviewPage() {
  const categories = [
    {
      title: "Identity Documents",
      path: "/solutions/government-documents/identity",
      desc: "Analysis and structured entity extraction from national and state identity documents.",
      examples: ["Aadhaar", "PAN", "Passport", "Voter ID", "Driving Licence"],
      icon: UserCheck
    },
    {
      title: "Address Documents",
      path: "/solutions/government-documents/address",
      desc: "Verification of residential validity and location consistency across state proofs.",
      examples: ["Residence/Domicile Certificate", "Address Proof", "Ration Card", "Utility-related documents"],
      icon: Home
    },
    {
      title: "Educational Documents",
      path: "/solutions/government-documents/educational",
      desc: "Examination boards and university certificates issued under state education departments.",
      examples: ["Degree Certificate", "Diploma", "Marksheet", "School Leaving Certificate", "Transfer Certificate"],
      icon: GraduationCap
    },
    {
      title: "Income & Financial Documents",
      path: "/solutions/government-documents/income-financial",
      desc: "Financial assessment records, revenue circle income certificates, and tax records.",
      examples: ["Income Certificate", "Financial eligibility documents", "Relevant income/tax documents"],
      icon: Banknote
    },
    {
      title: "Caste / Category Documents",
      path: "/solutions/government-documents/caste-category",
      desc: "Caste scrutiny validity certificates and reservation category documentation.",
      examples: ["Caste Certificate", "Non-Creamy Layer Certificate", "EWS Certificate", "Other category certificates"],
      icon: Award
    },
    {
      title: "Employment / Service Documents",
      path: "/solutions/government-documents/employment-service",
      desc: "Service books, experience letters, and appointment records across state departments.",
      examples: ["Experience Certificate", "Employment Certificate", "Service Certificate", "Government service-related documents"],
      icon: Briefcase
    },
    {
      title: "Other Government Certificates",
      path: "/solutions/government-documents/other-certificates",
      desc: "Civil registration certificates and gazetted statutory documentation.",
      examples: ["Birth Certificate", "Death Certificate", "Marriage Certificate", "Disability Certificate", "Other government-issued certificates"],
      icon: FileCheck2
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
          <span className="text-[#0F2942]">Government Documents</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Government Documents Analysis
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Government Documents Intelligence
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Comprehensive AI-assisted analysis and structured extraction for official government-issued records across all major civil and regulatory categories.
          </p>
        </div>

        {/* Mandatory Disclaimer */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 mb-12 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong className="font-semibold text-slate-900">Document Requirements Note: </strong>
            Document requirements vary depending on specific institutional policies, statutory schemes, or regulatory guidelines. No specific document listed here is universally mandatory for all applications.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
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
                    {cat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {cat.desc}
                  </p>

                  <div className="mb-4">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                      Supported Examples:
                    </span>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {cat.examples.map((ex, eIdx) => (
                        <li key={eIdx} className="flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-blue-600" />
                          <span>{ex}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  href={cat.path}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 pt-4 border-t border-slate-100"
                >
                  <span>Explore {cat.title}</span>
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
