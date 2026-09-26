"use client";

import React from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-[#071626] dark:bg-[#050b14] text-slate-400 text-xs border-t border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Summary */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-base">
              <div className="w-6 h-6">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                  <path d="M24 3L42 13V35L24 45L6 35V13L24 3Z" stroke="#ffffff" strokeWidth="3" strokeLinejoin="round" fill="#0f2942" />
                  <circle cx="24" cy="24" r="10" stroke="#3b82f6" strokeWidth="2.5" fill="#0f2942" />
                </svg>
              </div>
              <span>{t("brand.name", "LexProof")}</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-slate-400">
              {t("footer.description", "Enterprise educational document intelligence and authoritative credential verification platform.")}
            </p>
            <div className="text-[11px] text-slate-500 font-mono">
              {t("footer.activeNode", "Active Node: Maharashtra Pilot Scope")}
            </div>
          </div>

          {/* Navigation Links: Solutions */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              {t("footer.solutionsHeading", "Solutions")}
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/solutions/document-analysis" className="hover:text-white transition-colors">
                  {t("footer.solutions.docAnalysis", "Document Analysis")}
                </Link>
              </li>
              <li>
                <Link href="/solutions/student-graduate-documents" className="hover:text-white transition-colors">
                  {t("footer.solutions.studentCreds", "Student Credentials")}
                </Link>
              </li>
              <li>
                <Link href="/solutions/universities-colleges" className="hover:text-white transition-colors">
                  {t("footer.solutions.higherEd", "Higher Ed Gateways")}
                </Link>
              </li>
              <li>
                <Link href="/solutions/authorized-verifiers" className="hover:text-white transition-colors">
                  {t("footer.solutions.hrScreening", "Authorized Verifiers")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Links: Verification */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              {t("footer.verificationHeading", "Verification")}
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/verification/process" className="hover:text-white transition-colors">
                  {t("footer.verification.process", "Verification Process")}
                </Link>
              </li>
              <li>
                <Link href="/verification/statuses" className="hover:text-white transition-colors">
                  {t("footer.verification.statuses", "Status Definitions")}
                </Link>
              </li>
              <li>
                <Link href="/verification/coverage" className="hover:text-white transition-colors">
                  {t("footer.verification.coverage", "Maharashtra Coverage")}
                </Link>
              </li>
              <li>
                <Link href="/verification/digilocker" className="hover:text-white transition-colors">
                  {t("footer.verification.digilocker", "DigiLocker Integration")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation Links: Platform & Legal */}
          <div>
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase mb-3">
              {t("footer.platformLegalHeading", "Platform & Legal")}
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/resources/document-requirements" className="hover:text-white transition-colors">
                  {t("footer.legal.requirements", "Document Requirements")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors">
                  {t("footer.legal.faq", "Frequently Asked Questions")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  {t("footer.legal.about", "About LexProof")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  {t("footer.legal.support", "Support & Contact")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer & Copyright */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © {new Date().getFullYear()} {t("footer.copyright", "LexProof Technologies. All rights reserved.")}
          </div>
          <div className="text-center sm:text-right max-w-xl">
            {t("footer.disclaimer", "Verification availability is currently limited to selected Maharashtra education institutions and supported state issuers.")}
          </div>
        </div>
      </div>
    </footer>
  );
}
