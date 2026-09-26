"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Award,
  FileCheck2,
  Shield,
  ArrowRight,
  Info
} from "lucide-react";

export default function CasteCategoryDocumentsPage() {
  const docs = [
    {
      name: "Caste Certificate",
      desc: "District Magistrate / Competent Authority issued certificates establishing recognized Scheduled Caste (SC), Scheduled Tribe (ST), or Other Backward Class (OBC) status.",
      fields: ["Certificate Number", "Beneficiary Name", "Recognized Sub-Caste", "Issuing District Authority"]
    },
    {
      name: "Non-Creamy Layer (NCL) Certificate",
      desc: "Certification confirming candidate eligibility under non-creamy layer parameters for OBC/VJNT quotas, validating annual family gross income thresholds.",
      fields: ["NCL Certificate ID", "Validity Financial Year", "Competent Officer", "Applicant Name"]
    },
    {
      name: "EWS (Economically Weaker Section) Certificate",
      desc: "Income and Asset Certificate for Economically Weaker Sections issued under central or state administrative guidelines.",
      fields: ["EWS Certificate ID", "Family Income Range", "Residential Asset Declaration", "Issuing Tehsildar"]
    },
    {
      name: "Other Category Certificates",
      desc: "Tribal validation certificates, ex-servicemen ward proofs, and special domicile quota documentation.",
      fields: ["Category Type", "Scrutiny Committee ID", "Order Date", "Authorized Authority"]
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
          <span className="text-[#0F2942]">Caste / Category Documents</span>
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
            Caste &amp; Category Documents Analysis
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            AI-assisted extraction of reservation classifications, scrutiny committee endorsements, and statutory validity periods.
          </p>
        </div>

        {/* Policy Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 mb-10 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong className="font-semibold text-slate-900">Notice: </strong>
            Category documentation applies solely to candidates seeking statutory reservation or fee exemptions under specific regulations. It is not universally required.
          </p>
        </div>

        {/* Docs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {docs.map((d, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Award className="w-5 h-5" />
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
      </main>

      <Footer />
    </div>
  );
}
