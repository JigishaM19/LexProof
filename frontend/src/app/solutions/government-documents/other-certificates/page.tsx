"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  FileCheck2,
  HeartHandshake,
  FileText,
  Shield,
  ArrowRight,
  Info
} from "lucide-react";

export default function OtherGovernmentCertificatesPage() {
  const docs = [
    {
      name: "Birth Certificate",
      desc: "Municipal corporation or registrar of births and deaths statutory certificates. Extracts child's name, parents' names, date and exact place of birth, and registration serial.",
      fields: ["Registration Number", "Date of Birth", "Place of Birth", "Father's Name", "Mother's Name", "Registrar Seal"]
    },
    {
      name: "Death Certificate",
      desc: "Statutory civil registration records confirming legal date, location, and registration details of demise for legal heirship or succession dossiers.",
      fields: ["Registration ID", "Date of Death", "Deceased Full Name", "Place of Demise", "Issuing Medical / Municipal Officer"]
    },
    {
      name: "Marriage Certificate",
      desc: "Marriage registrar certificates issued under Special Marriage Act or Hindu Marriage Act, verifying spousal details and marriage solemnization date.",
      fields: ["Marriage Serial Number", "Spouse A Full Name", "Spouse B Full Name", "Solemnization Date", "Marriage Officer"]
    },
    {
      name: "Disability Certificate",
      desc: "UDID (Unique Disability ID) and Medical Board evaluation certificates detailing permanent impairment percentage and medical classification.",
      fields: ["UDID Number", "Disability Type", "Percentage Impairment", "Medical Board Hospital", "Valid Validity Period"]
    },
    {
      name: "Other Government-Issued Certificates",
      desc: "Character certificates, gazette notification name change proofs, notary affidavits, and civil authority undertakings.",
      fields: ["Certificate Category", "Issuing Magistrate / Authority", "Affidavit Date", "Statutory Purpose"]
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
          <span className="text-[#0F2942]">Other Government Certificates</span>
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
            Other Government Certificates
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            AI-assisted analysis and structured parsing for statutory civil registration certificates and official government records.
          </p>
        </div>

        {/* Policy Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 mb-10 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong className="font-semibold text-slate-900">Policy Notice: </strong>
            Submission requirements for civil certificates depend on individual case needs. No certificate listed is universally mandatory.
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
                    <FileCheck2 className="w-5 h-5" />
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
