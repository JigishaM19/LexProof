"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Home,
  MapPin,
  FileText,
  Shield,
  ArrowRight,
  Info
} from "lucide-react";

export default function AddressDocumentsPage() {
  const docs = [
    {
      name: "Residence / Domicile Certificate",
      desc: "State revenue department certificates proving continuous domicile status. Extracts certificate serial number, applicant residential duration, and competent tehsildar authority.",
      fields: ["Certificate Number", "State / District", "Domicile Duration", "Issuing Tehsildar"]
    },
    {
      name: "Address Proof",
      desc: "Official state-approved address verifications including bank passbooks and postal records. Structures street address, taluka, district, and PIN code components.",
      fields: ["Full Address String", "District", "State", "PIN Code", "Verification Seal"]
    },
    {
      name: "Ration Card",
      desc: "Civil Supplies Department cards. Extracts head of household, household members, ration card category (BPL/APL/Antyodaya), and fair price shop number.",
      fields: ["Ration Card Number", "Head of Family", "Category", "Member Details", "Issuing Inspector"]
    },
    {
      name: "Utility-Related Documents",
      desc: "Electricity, piped gas, or municipal water billing statements used for address corroboration. Structures consumer number, billing cycle, and consumer address.",
      fields: ["Consumer Account ID", "Billing Address", "Billing Date", "Utility Provider"]
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
          <span className="text-[#0F2942]">Address Documents</span>
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
            Address Documents Analysis
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            AI-assisted extraction of residential locations, postal codes, and domicile attributes from state-issued address records.
          </p>
        </div>

        {/* Policy Note */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 mb-10 flex items-start gap-3">
          <Info className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            <strong className="font-semibold text-slate-900">Requirements Notice: </strong>
            Acceptance criteria for address verification vary by institution. No single document listed here is universally mandatory.
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
                    <Home className="w-5 h-5" />
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
