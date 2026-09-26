"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  UserCheck,
  CreditCard,
  FileText,
  Shield,
  ArrowRight,
  CheckCircle2,
  Info
} from "lucide-react";

export default function IdentityDocumentsPage() {
  const docs = [
    {
      name: "Aadhaar Card",
      desc: "Inspection of UIDAI-issued demographic identity proofs. Extracts legal name, year of birth, gender, and masked last-4 digits with non-custodial privacy controls.",
      fields: ["Full Legal Name", "Year of Birth", "Gender", "Masked Identifier"]
    },
    {
      name: "PAN (Permanent Account Number)",
      desc: "Parsing of Income Tax Department PAN cards. Extracts 10-character alphanumeric PAN, father's name, applicant name, and date of birth.",
      fields: ["PAN Number", "Applicant Full Name", "Father's Name", "Date of Birth"]
    },
    {
      name: "Passport",
      desc: "Machine Readable Zone (MRZ) parsing and optical extraction from Republic of India passports. Extracts passport number, nationality, validity, and issuing office.",
      fields: ["Passport Number", "MRZ String", "Nationality", "Expiry Date", "Place of Issue"]
    },
    {
      name: "Voter ID (EPIC)",
      desc: "Analysis of Election Commission of India Electoral Photo Identity Cards. Extracts EPIC number, constituency, voter name, and relation details.",
      fields: ["EPIC Number", "Elector Name", "Relation Name", "Assembly Constituency"]
    },
    {
      name: "Driving Licence",
      desc: "Extraction of Motor Vehicles Department driving licences. Extracts DL number, authorized vehicle classes, validity dates, and issuing RTO.",
      fields: ["DL Number", "Issue Date", "Validity Period", "Licensing Authority (RTO)"]
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
          <Link href="/solutions/government-documents" className="hover:text-blue-600">Government Documents</Link>
          <span>/</span>
          <span className="text-[#0F2942]">Identity Documents</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Government Documents
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Identity Documents Analysis
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            AI-assisted extraction and cross-consistency checks for major government-issued personal identification credentials.
          </p>
        </div>

        {/* Mandatory Policy Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 mb-10 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong className="font-semibold text-slate-900">Policy Notice: </strong>
            No specific identity document listed here is universally mandatory. Institutional and regulatory processes specify which proofs are accepted for a given application.
          </p>
        </div>

        {/* Document List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {docs.map((d, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0F2942]">{d.name}</h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                  {d.desc}
                </p>
              </div>
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                  Extracted Entities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {d.fields.map((f, fIdx) => (
                    <span
                      key={fIdx}
                      className="text-[11px] bg-slate-50 text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-[#0F2942] text-white rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="text-lg font-bold">Inspect Identity Records in Dossier</h4>
            <p className="text-xs text-slate-300">Upload identity records to verify cross-document name concordance with academic certificates.</p>
          </div>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 bg-white text-[#0F2942] font-semibold text-xs rounded-xl hover:bg-slate-100 transition-colors shrink-0"
          >
            Open Workspace →
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
