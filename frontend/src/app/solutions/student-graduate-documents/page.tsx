"use client";

import React from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  GraduationCap,
  Award,
  FileText,
  Layers,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  ArrowUpRight,
  Shield,
  FileCheck
} from "lucide-react";

export default function StudentGraduateSolutionPage() {
  const docTypes = [
    {
      name: "Degree Certificates",
      desc: "Analysis of undergraduate, postgraduate, and doctoral degree certificates. Parses conferment honors, university seals, convocation dates, and registration numbers.",
      fields: ["Degree Title", "Candidate Full Name", "Registration / PRN", "Class / Division", "Convocation Date"]
    },
    {
      name: "Diplomas",
      desc: "Inspection of technical polytechnic and professional diploma credentials issued by state technical education boards and certified polytechnic institutes.",
      fields: ["Diploma Specialization", "Board Name", "Enrollment Number", "Year of Passing", "Institutional Center"]
    },
    {
      name: "Marksheets",
      desc: "Detailed semester-wise or annual mark sheets. Structures subject breakdown, internal/external assessments, minimum passing thresholds, and arithmetic sums.",
      fields: ["Subject Scores", "Maximum Marks", "Marks Obtained", "Total Sum Verification", "Pass / Fail Status"]
    },
    {
      name: "Transcripts",
      desc: "Comprehensive multi-semester official academic transcripts. Analyzes credit weightings, course codes, cumulative Grade Point Averages (CGPA), and grading scales.",
      fields: ["Credit Breakdown", "SGPA per Semester", "Cumulative CGPA", "Grading Scale Formula", "University Seal"]
    },
    {
      name: "Provisional Certificates",
      desc: "Temporary conferment documents issued pending convocation. Verifies eligibility statements, completion validity periods, and issuing registrar signatures.",
      fields: ["Provisional Number", "Eligibility Criteria", "Valid Period", "Registrar Endorsement"]
    },
    {
      name: "Migration Certificates",
      desc: "Official inter-university relocation clearance certificates. Cross-checks previous institution details, roll numbers, and clearance clearances.",
      fields: ["Previous University", "Candidate Details", "Serial Number", "Clearance Statement"]
    },
    {
      name: "Transfer Certificates",
      desc: "School or college leaving certificates (TC / SLC). Parses date of birth records, conduct assessments, class progression, and last date attended.",
      fields: ["Student Name", "Date of Birth (Recorded)", "Reason for Leaving", "Academic Year", "Head of Institute"]
    },
    {
      name: "Other Academic Documents",
      desc: "Support for bonafide certificates, course completion letters, character certificates, ranking letters, and academic achievement records.",
      fields: ["Document Purpose", "Endorsement Date", "Authorized Authority", "Candidate Concordance"]
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
          <span className="text-[#0F2942]">Student &amp; Graduate</span>
        </div>

        {/* Hero */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/60 mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-blue-900">
              Academic Documents
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-[#0F2942] tracking-tight mb-4">
            Student &amp; Graduate Document Analysis
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-6">
            Intelligent extraction and consistency checking for your academic journey. Structure marks, verify formulas, and prepare verified dossiers for higher education admissions and job applications.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-[#0F2942] hover:bg-[#163b5f] transition-all shadow-sm text-sm"
            >
              <span>Analyze Academic Records</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/verification/coverage"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl font-semibold text-[#0F2942] bg-white hover:bg-slate-50 border border-slate-300 transition-colors text-sm"
            >
              <span>Check University Coverage</span>
            </Link>
          </div>
        </div>

        {/* Document Classes Grid */}
        <div className="mb-16">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0F2942] mb-2">
              Supported Academic Document Types
            </h2>
            <p className="text-sm text-slate-600">
              Specialized parsing models trained on university schemas and board formats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {docTypes.map((doc, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0F2942]">
                      {doc.name}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                    {doc.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Key Extracted Fields:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.fields.map((f, fIdx) => (
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
        </div>

        {/* Verification Rail Connection */}
        <div className="bg-white rounded-2xl border border-blue-200/80 p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0F2942] mb-1">
                Authoritative Degree Verification
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                In addition to optical analysis, LexProof connects directly to digital ledger rails for supported universities in Maharashtra (including SPPU and University of Mumbai) and central DigiLocker repositories for authoritative source confirmation.
              </p>
              <Link
                href="/verification/coverage"
                className="text-sm font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
              >
                <span>View All Supported Institutions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
