"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n";
import {
  ChevronDown,
  Menu,
  X,
  Shield,
  FileText,
  CheckCircle2,
  Building2,
  User,
  HelpCircle,
  Globe,
  Sun,
  Moon,
  Laptop,
  LogIn,
  UserPlus,
  LayoutDashboard,
  Settings,
  LogOut,
  Check,
  SunMoon,
} from "lucide-react";
import { api, User as UserType } from "@/lib/api";

export function LexProofLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`${className} flex-shrink-0 relative`}>
      <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        <path d="M24 3L42 13V35L24 45L6 35V13L24 3Z" stroke="#0f2942" strokeWidth="3" strokeLinejoin="round" fill="#f0f5fa" />
        <circle cx="24" cy="24" r="11" stroke="#2563eb" strokeWidth="2.5" fill="#ffffff" />
        <circle cx="24" cy="24" r="4.5" fill="#0f2942" />
        <line x1="31" y1="31" x2="38" y2="38" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { locale, setLocale, t, languages, currentLanguage } = useI18n();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null);
  const [hoveredOrgItem, setHoveredOrgItem] = useState<string | null>(null);
  const [mobileOrgItem, setMobileOrgItem] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const navRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const toggleMobileSubmenu = (name: string) => {
    setMobileSubmenu((prev) => (prev === name ? null : name));
  };

  // Synchronize authentication status across tabs, storage, and local state
  useEffect(() => {
    const checkAuth = () => {
      const authed = api.isAuthenticated();
      setIsLoggedIn(authed);
      if (authed) {
        setCurrentUser(api.getCurrentUser());
      } else {
        setCurrentUser(null);
      }
    };

    api.syncCookie();
    checkAuth();

    window.addEventListener("lexproof-auth-change", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("lexproof-auth-change", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    api.clearToken();
    setIsLoggedIn(false);
    setCurrentUser(null);
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    router.push("/");
  };

  // Intercept protected feature clicks: redirect unauthenticated users to login
  const handleProtectedClick = (e: React.MouseEvent, targetUrl: string) => {
    e.preventDefault();
    setActiveDropdown(null);
    setMobileMenuOpen(false);
    if (!api.isAuthenticated()) {
      router.push(`/login?redirect=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={navRef}>
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none" aria-label="LexProof Home">
            <LexProofLogo className="w-10 h-10 transition-transform group-hover:scale-105 duration-200" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#0f2942] dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                LexProof
              </span>
              <span className="text-[9.5px] uppercase tracking-[0.16em] font-semibold text-slate-500 dark:text-slate-400">
                {t("brand.tagline", "Document Intelligence")}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation: Home | Solutions ▾ | How It Works | Verification ▾ | Resources ▾ | About */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Primary Navigation">
            <Link
              href="/"
              className="px-3.5 py-2 text-sm font-semibold text-[#0f2942] dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors"
              aria-current="page"
            >
              {t("nav.home", "Home")}
            </Link>

            {/* Solutions Trigger */}
            <div className="relative">
              <button
                type="button"
                id="solutions-btn"
                onClick={() => toggleDropdown("solutions")}
                aria-expanded={activeDropdown === "solutions"}
                className="px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#0f2942] dark:hover:text-white rounded-md flex items-center gap-1.5 transition-colors"
              >
                {t("nav.solutions", "Solutions")}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                    activeDropdown === "solutions" ? "rotate-180 text-[#0f2942] dark:text-white" : ""
                  }`}
                />
              </button>

              {/* Solutions Mega-Menu */}
              {activeDropdown === "solutions" && (
                <div
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[820px] bg-white dark:bg-slate-900 rounded-xl shadow-card-3d border border-slate-200/90 dark:border-slate-800 p-6 z-50 animate-fadeIn"
                  onMouseLeave={() => setHoveredOrgItem(null)}
                >
                  <div className="grid grid-cols-3 gap-6">

                    {/* ── COLUMN 1: FOR INDIVIDUALS ── */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> {t("solutionsMenu.forStudents", "For Individuals")}
                      </h4>
                      <ul className="space-y-1">
                        <li>
                          <Link
                            href="/solutions/document-analysis"
                            onClick={(e) => handleProtectedClick(e, "/solutions/document-analysis")}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {t("solutionsMenu.documentIntegrity", "Document Analysis")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/solutions/student-graduate-documents"
                            onClick={(e) => handleProtectedClick(e, "/solutions/student-graduate-documents")}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {t("solutionsMenu.degreeDiploma", "Student & Graduate")}
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/solutions/personal-documents"
                            onClick={(e) => handleProtectedClick(e, "/solutions/personal-documents")}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {t("solutionsMenu.transcriptsMarksheets", "Personal Documents")}
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* ── COLUMN 2: FOR ORGANIZATIONS ── */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5" /> {t("solutionsMenu.forUniversities", "For Organizations")}
                      </h4>
                      <ul className="space-y-1">

                        {/* Universities & Colleges */}
                        <li className="relative" onMouseEnter={() => setHoveredOrgItem("universities")} onMouseLeave={() => setHoveredOrgItem(null)}>
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                          >
                            <span>{t("solutionsMenu.forUniversities", "Universities & Colleges")}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400 -rotate-90 flex-shrink-0" />
                          </button>
                          {hoveredOrgItem === "universities" && (
                            <div className="absolute left-full top-0 ml-1 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-card-3d border border-slate-200/90 dark:border-slate-800 py-2 z-50">
                              <Link
                                href="/solutions/universities-colleges/supported-universities"
                                onClick={() => setActiveDropdown(null)}
                                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                {t("verificationMenu.supportedUniversities", "Supported Universities")}
                              </Link>
                              <Link
                                href="/solutions/universities-colleges/supported-colleges"
                                onClick={() => setActiveDropdown(null)}
                                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                              >
                                Supported Colleges
                              </Link>
                            </div>
                          )}
                        </li>

                        {/* Government Documents Analysis */}
                        <li className="relative" onMouseEnter={() => setHoveredOrgItem("govdocs")} onMouseLeave={() => setHoveredOrgItem(null)}>
                          <button
                            type="button"
                            className="w-full flex items-center justify-between px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                          >
                            <span>{t("solutionsMenu.forGovt", "Government Documents")}</span>
                            <ChevronDown className="w-3 h-3 text-slate-400 -rotate-90 flex-shrink-0" />
                          </button>
                          {hoveredOrgItem === "govdocs" && (
                            <div className="absolute left-full top-0 ml-1 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-card-3d border border-slate-200/90 dark:border-slate-800 py-2 z-50">
                              <Link href="/solutions/government-documents/identity" onClick={(e) => handleProtectedClick(e, "/solutions/government-documents/identity")} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors">Identity Documents</Link>
                              <Link href="/solutions/government-documents/address" onClick={(e) => handleProtectedClick(e, "/solutions/government-documents/address")} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors">Address Documents</Link>
                              <Link href="/solutions/government-documents/educational" onClick={(e) => handleProtectedClick(e, "/solutions/government-documents/educational")} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors">Educational Documents</Link>
                              <Link href="/solutions/government-documents/income-financial" onClick={(e) => handleProtectedClick(e, "/solutions/government-documents/income-financial")} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors">Income &amp; Financial Documents</Link>
                              <Link href="/solutions/government-documents/caste-category" onClick={(e) => handleProtectedClick(e, "/solutions/government-documents/caste-category")} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors">Caste / Category Documents</Link>
                              <Link href="/solutions/government-documents/employment-service" onClick={(e) => handleProtectedClick(e, "/solutions/government-documents/employment-service")} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors">Employment / Service Documents</Link>
                              <Link href="/solutions/government-documents/other-certificates" onClick={(e) => handleProtectedClick(e, "/solutions/government-documents/other-certificates")} className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors">Other Government Certificates</Link>
                            </div>
                          )}
                        </li>

                        {/* Authorized Verifiers */}
                        <li>
                          <Link
                            href="/solutions/authorized-verifiers"
                            onClick={(e) => handleProtectedClick(e, "/solutions/authorized-verifiers")}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            {t("solutionsMenu.officialVerifier", "Authorized Verifiers")}
                          </Link>
                        </li>
                      </ul>
                    </div>

                    {/* ── COLUMN 3: PLATFORM CAPABILITIES ── */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> Platform Capabilities
                      </h4>
                      <ul className="space-y-1">
                        <li>
                          <Link
                            href="/platform/document-analysis"
                            onClick={(e) => handleProtectedClick(e, "/platform/document-analysis")}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            Document Analysis
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/platform/information-extraction"
                            onClick={(e) => handleProtectedClick(e, "/platform/information-extraction")}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            Information Extraction
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/platform/document-comparison"
                            onClick={(e) => handleProtectedClick(e, "/platform/document-comparison")}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            Document Comparison
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/platform/integrity-checks"
                            onClick={(e) => handleProtectedClick(e, "/platform/integrity-checks")}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            Integrity Checks
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/platform/verification-workflows"
                            onClick={(e) => handleProtectedClick(e, "/platform/verification-workflows")}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            Verification Workflows
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
                    <span>{t("solutionsMenu.subtitle", "Explore all institutional & individual tools")}</span>
                    <Link
                      href="/solutions"
                      onClick={() => setActiveDropdown(null)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      {t("solutionsMenu.exploreSolutions", "Explore all solutions →")}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/how-it-works"
              className="px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#0f2942] dark:hover:text-white rounded-md transition-colors"
            >
              {t("nav.howItWorks", "How It Works")}
            </Link>

            {/* Verification Trigger */}
            <div className="relative">
              <button
                type="button"
                id="verification-btn"
                onClick={() => toggleDropdown("verification")}
                aria-expanded={activeDropdown === "verification"}
                className="px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#0f2942] dark:hover:text-white rounded-md flex items-center gap-1.5 transition-colors"
              >
                {t("nav.verification", "Verification")}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                    activeDropdown === "verification" ? "rotate-180 text-[#0f2942] dark:text-white" : ""
                  }`}
                />
              </button>

              {activeDropdown === "verification" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[540px] bg-white dark:bg-slate-900 rounded-xl shadow-card-3d border border-slate-200/90 dark:border-slate-800 p-6 z-50 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t("verificationMenu.methods", "How Verification Works")}
                      </h4>
                      <ul className="space-y-1">
                        <li>
                          <Link
                            href="/dashboard"
                            onClick={(e) => handleProtectedClick(e, "/dashboard")}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Document Verification
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/verification/process"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Verification Process
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/verification/statuses"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Verification Statuses
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/platform/integrity-checks"
                            onClick={(e) => handleProtectedClick(e, "/platform/integrity-checks")}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Integrity Checks
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" /> {t("verificationMenu.coverage", "Verification Sources")}
                      </h4>
                      <ul className="space-y-1">
                        <li>
                          <Link
                            href="/verification/issuer-verification"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Issuer Verification
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/verification/qr-code"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            QR / Code Verification
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/verification/digilocker"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            DigiLocker Integration
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/verification/supported-issuers"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Supported Issuers
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
                    <span className="text-amber-700 dark:text-amber-400 font-medium">Maharashtra Pilot Coverage Active</span>
                    <Link
                      href="/verification/coverage"
                      onClick={() => setActiveDropdown(null)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      {t("verificationMenu.exploreCoverage", "View Coverage Directory →")}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Resources Trigger */}
            <div className="relative">
              <button
                type="button"
                id="resources-btn"
                onClick={() => toggleDropdown("resources")}
                aria-expanded={activeDropdown === "resources"}
                className="px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#0f2942] dark:hover:text-white rounded-md flex items-center gap-1.5 transition-colors"
              >
                {t("nav.resources", "Resources")}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
                    activeDropdown === "resources" ? "rotate-180 text-[#0f2942] dark:text-white" : ""
                  }`}
                />
              </button>

              {activeDropdown === "resources" && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[500px] bg-white dark:bg-slate-900 rounded-xl shadow-card-3d border border-slate-200/90 dark:border-slate-800 p-6 z-50 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" /> {t("resourcesMenu.requirements", "Documents")}
                      </h4>
                      <ul className="space-y-1">
                        <li>
                          <Link
                            href="/resources/supported-documents"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Supported Documents
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/resources/document-requirements"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Document Requirements
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/resources/document-guidelines"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Document Guidelines
                          </Link>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 px-2 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> Help
                      </h4>
                      <ul className="space-y-1">
                        <li>
                          <Link
                            href="/help"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Help Center
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/faq"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Frequently Asked Questions
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/contact"
                            onClick={() => setActiveDropdown(null)}
                            className="block px-2.5 py-2 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            Contact Us
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
                    <span>{t("resourcesMenu.specsNote", "Developer specs and legal verification guides")}</span>
                    <Link
                      href="/resources"
                      onClick={() => setActiveDropdown(null)}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      {t("resourcesMenu.exploreResources", "Explore Resources →")}
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/about"
              className="px-3.5 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#0f2942] dark:hover:text-white rounded-md transition-colors"
            >
              {t("nav.about", "About")}
            </Link>
          </nav>

          {/* Desktop Right Group: 🌐 EN | ☀/🌙 | 👤 */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-2.5">
            
            {/* 1. Language Selector: 🌐 EN ▾ */}
            <div className="relative">
              <button
                type="button"
                id="language-selector-btn"
                onClick={() => toggleDropdown("language")}
                aria-expanded={activeDropdown === "language"}
                aria-label="Select Language"
                className="h-9 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer focus:ring-2 focus:ring-blue-500/20"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="uppercase font-mono tracking-wider">{currentLanguage.short}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform duration-150 ${activeDropdown === "language" ? "rotate-180" : ""}`} />
              </button>

              {activeDropdown === "language" && (
                <div
                  className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-fadeIn"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    Select Language
                  </div>
                  {languages.map((lang) => {
                    const isSelected = lang.code === locale;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLocale(lang.code);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                        }`}
                        role="menuitem"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{lang.nativeLabel}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase">({lang.short})</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Theme Toggle: ☀/🌙 */}
            <div className="relative">
              <button
                type="button"
                id="theme-toggle-btn"
                onClick={() => toggleDropdown("theme")}
                aria-expanded={activeDropdown === "theme"}
                aria-label="Toggle Theme"
                className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center transition-all shadow-xs cursor-pointer focus:ring-2 focus:ring-blue-500/20"
              >
                {mounted ? (
                  resolvedTheme === "dark" ? (
                    <Moon className="w-4 h-4 text-amber-300 transition-transform duration-200 hover:rotate-12" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-500 transition-transform duration-200 hover:rotate-45" />
                  )
                ) : (
                  <Sun className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {activeDropdown === "theme" && (
                <div
                  className="absolute right-0 top-full mt-2 w-36 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-fadeIn"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 font-mono">
                    Appearance
                  </div>
                  {[
                    { id: "light", label: t("theme.light", "Light"), icon: Sun },
                    { id: "dark", label: t("theme.dark", "Dark"), icon: Moon },
                    { id: "system", label: t("theme.system", "System"), icon: Laptop },
                  ].map((item) => {
                    const isSelected = theme === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setTheme(item.id);
                          setActiveDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 text-xs rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                        }`}
                        role="menuitem"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Account / Profile Menu: 👤 */}
            <div className="relative">
              <button
                type="button"
                id="account-menu-btn"
                onClick={() => toggleDropdown("account")}
                aria-expanded={activeDropdown === "account"}
                aria-label="Account Menu"
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all relative cursor-pointer focus:ring-2 focus:ring-blue-500/20 ${
                  isLoggedIn
                    ? "bg-[#0f2942] dark:bg-blue-600 text-white border-transparent hover:ring-2 hover:ring-blue-400/30"
                    : "bg-white/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-xs"
                }`}
              >
                {isLoggedIn && currentUser?.full_name ? (
                  <span className="text-xs font-bold font-mono">
                    {currentUser.full_name.charAt(0).toUpperCase()}
                  </span>
                ) : (
                  <User className="w-4.5 h-4.5" />
                )}

                {/* Active indicator dot if logged in */}
                {isLoggedIn && (
                  <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
                )}
              </button>

              {activeDropdown === "account" && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-fadeIn"
                  role="menu"
                  aria-orientation="vertical"
                >
                  {!isLoggedIn ? (
                    <div className="space-y-2">
                      <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                        <div className="text-xs font-bold text-[#0f2942] dark:text-white">
                          {t("auth.welcome", "Welcome to LexProof")}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                          {t("auth.welcomeSubtitle", "Access your verification workspace and manage credentials.")}
                        </p>
                      </div>

                      <div className="space-y-1 pt-1">
                        <Link
                          href="/login"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-white bg-[#0f2942] hover:bg-[#163b5f] dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
                          role="menuitem"
                        >
                          <LogIn className="w-3.5 h-3.5" />
                          <span>{t("auth.login", "Log In")}</span>
                        </Link>
                        <Link
                          href="/register"
                          onClick={() => setActiveDropdown(null)}
                          className="flex items-center gap-2.5 w-full px-3 py-2 text-xs font-semibold text-[#0f2942] dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          role="menuitem"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>{t("auth.register", "Create Account")}</span>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {/* User Header */}
                      <div className="px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-[#0f2942] dark:text-white truncate max-w-[150px]">
                            {currentUser?.full_name || "Authenticated User"}
                          </span>
                          <span className="px-1.5 py-0.5 text-[9px] font-bold font-mono uppercase rounded bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-300">
                            {currentUser?.role || "USER"}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                          {currentUser?.email}
                        </div>
                      </div>

                      {/* Logged in Menu links */}
                      {(() => {
                        const userRole = (currentUser?.role || "INDIVIDUAL").toUpperCase();
                        const workspaceUrl = userRole === "ORGANIZATION" ? "/organization" : "/individual";
                        const workspaceLabel = userRole === "ORGANIZATION" ? "Organization Workspace" : "Individual Workspace";
                        return (
                          <div className="pt-1 space-y-0.5">
                            <Link
                              href={workspaceUrl}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors"
                              role="menuitem"
                            >
                              <LayoutDashboard className="w-3.5 h-3.5" />
                              <span>{workspaceLabel}</span>
                            </Link>

                            <Link
                              href={workspaceUrl}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              role="menuitem"
                            >
                              <User className="w-3.5 h-3.5 text-slate-400" />
                              <span>{t("auth.profile", "Profile")}</span>
                            </Link>

                            <Link
                              href={workspaceUrl}
                              onClick={() => setActiveDropdown(null)}
                              className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              role="menuitem"
                            >
                              <Settings className="w-3.5 h-3.5 text-slate-400" />
                              <span>{t("auth.settings", "Settings")}</span>
                            </Link>
                          </div>
                        );
                      })()}

                      {/* Divider */}
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                      {/* Quick language and appearance status */}
                      <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-300">
                        <button
                          type="button"
                          onClick={() => toggleDropdown("language")}
                          className="flex items-center justify-between w-full px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-left"
                        >
                          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                            <Globe className="w-3.5 h-3.5" />
                            {t("auth.language", "Language")}
                          </span>
                          <span className="font-semibold text-[11px] text-[#0f2942] dark:text-slate-200 flex items-center gap-1">
                            {currentLanguage.nativeLabel}
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleDropdown("theme")}
                          className="flex items-center justify-between w-full px-2.5 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer text-left"
                        >
                          <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px]">
                            <SunMoon className="w-3.5 h-3.5" />
                            {t("auth.appearance", "Appearance")}
                          </span>
                          <span className="font-semibold text-[11px] text-[#0f2942] dark:text-slate-200 capitalize flex items-center gap-1">
                            {theme || "system"}
                            <ChevronDown className="w-3 h-3 text-slate-400" />
                          </span>
                        </button>
                      </div>

                      {/* Divider */}
                      <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                      {/* Logout */}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 w-full px-2.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        role="menuitem"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>{t("auth.logout", "Log Out")}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Mobile quick theme button */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            >
              {mounted && resolvedTheme === "dark" ? (
                <Moon className="w-5 h-5 text-amber-300" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-[#0f2942] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3 max-h-[85vh] overflow-y-auto animate-fadeIn">
          
          {/* Mobile Language Switcher Row */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 font-mono flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5" /> {t("auth.language", "Language")}
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLocale(l.code)}
                  className={`py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    locale === l.code
                      ? "bg-[#0f2942] dark:bg-blue-600 text-white shadow-xs"
                      : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {l.nativeLabel}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Theme Switcher Row */}
          <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 border border-slate-200/60 dark:border-slate-700/60">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 font-mono flex items-center gap-1.5">
              <SunMoon className="w-3.5 h-3.5" /> {t("auth.appearance", "Appearance")}
            </div>
            <div className="grid grid-cols-3 gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
              {[
                { id: "light", label: t("theme.light", "Light"), icon: Sun },
                { id: "dark", label: t("theme.dark", "Dark"), icon: Moon },
                { id: "system", label: t("theme.system", "System"), icon: Laptop },
              ].map((item) => {
                const isSelected = theme === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id)}
                    className={`py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#0f2942] dark:bg-blue-600 text-white shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Navigation Links */}
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-[#0f2942] dark:text-white bg-slate-50 dark:bg-slate-800"
          >
            {t("nav.home", "Home")}
          </Link>

          {/* Solutions Mobile Submenu */}
          <div>
            <button
              type="button"
              onClick={() => toggleMobileSubmenu("solutions")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <span>{t("nav.solutions", "Solutions")}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubmenu === "solutions" ? "rotate-180" : ""}`} />
            </button>
            {mobileSubmenu === "solutions" && (
              <div className="pl-4 pr-2 py-2 space-y-3 bg-slate-50/50 dark:bg-slate-800/40 rounded-lg mt-1 text-sm">
                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    {t("solutionsMenu.forStudents", "For Individuals")}
                  </span>
                  <div className="pl-2 space-y-1">
                    <Link href="/solutions/document-analysis" onClick={(e) => { handleProtectedClick(e, "/solutions/document-analysis"); }} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">
                      Document Analysis
                    </Link>
                    <Link href="/solutions/student-graduate-documents" onClick={(e) => { handleProtectedClick(e, "/solutions/student-graduate-documents"); }} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">
                      Student &amp; Graduate
                    </Link>
                    <Link href="/solutions/personal-documents" onClick={(e) => { handleProtectedClick(e, "/solutions/personal-documents"); }} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">
                      Personal Documents
                    </Link>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    {t("solutionsMenu.forUniversities", "For Organizations")}
                  </span>
                  <div className="pl-2 space-y-2">
                    <div>
                      <button
                        type="button"
                        onClick={() => setMobileOrgItem((prev) => (prev === "universities" ? null : "universities"))}
                        className="w-full flex items-center justify-between py-1 text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                      >
                        <span>Universities &amp; Colleges</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileOrgItem === "universities" ? "rotate-180" : ""}`} />
                      </button>
                      {mobileOrgItem === "universities" && (
                        <div className="pl-3 py-1 space-y-1 text-xs border-l-2 border-blue-200 dark:border-blue-800 ml-1">
                          <Link href="/solutions/universities-colleges/supported-universities" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600">Supported Universities</Link>
                          <Link href="/solutions/universities-colleges/supported-colleges" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600">Supported Colleges</Link>
                        </div>
                      )}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setMobileOrgItem((prev) => (prev === "govdocs" ? null : "govdocs"))}
                        className="w-full flex items-center justify-between py-1 text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
                      >
                        <span>Government Documents</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${mobileOrgItem === "govdocs" ? "rotate-180" : ""}`} />
                      </button>
                      {mobileOrgItem === "govdocs" && (
                        <div className="pl-3 py-1 space-y-1 text-xs border-l-2 border-blue-200 dark:border-blue-800 ml-1">
                          <Link href="/solutions/government-documents/identity" onClick={(e) => { handleProtectedClick(e, "/solutions/government-documents/identity"); }} className="block py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600">Identity Documents</Link>
                          <Link href="/solutions/government-documents/address" onClick={(e) => { handleProtectedClick(e, "/solutions/government-documents/address"); }} className="block py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600">Address Documents</Link>
                          <Link href="/solutions/government-documents/educational" onClick={(e) => { handleProtectedClick(e, "/solutions/government-documents/educational"); }} className="block py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600">Educational Documents</Link>
                          <Link href="/solutions/government-documents/income-financial" onClick={(e) => { handleProtectedClick(e, "/solutions/government-documents/income-financial"); }} className="block py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600">Income &amp; Financial</Link>
                          <Link href="/solutions/government-documents/caste-category" onClick={(e) => { handleProtectedClick(e, "/solutions/government-documents/caste-category"); }} className="block py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600">Caste / Category</Link>
                          <Link href="/solutions/government-documents/employment-service" onClick={(e) => { handleProtectedClick(e, "/solutions/government-documents/employment-service"); }} className="block py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600">Employment / Service</Link>
                          <Link href="/solutions/government-documents/other-certificates" onClick={(e) => { handleProtectedClick(e, "/solutions/government-documents/other-certificates"); }} className="block py-1 text-slate-500 dark:text-slate-400 hover:text-blue-600">Other Certificates</Link>
                        </div>
                      )}
                    </div>

                    <Link href="/solutions/authorized-verifiers" onClick={(e) => { handleProtectedClick(e, "/solutions/authorized-verifiers"); }} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">
                      Authorized Verifiers
                    </Link>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    Platform Capabilities
                  </span>
                  <div className="pl-2 space-y-1">
                    <Link href="/platform/document-analysis" onClick={(e) => { handleProtectedClick(e, "/platform/document-analysis"); }} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">Document Analysis</Link>
                    <Link href="/platform/information-extraction" onClick={(e) => { handleProtectedClick(e, "/platform/information-extraction"); }} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">Information Extraction</Link>
                    <Link href="/platform/document-comparison" onClick={(e) => { handleProtectedClick(e, "/platform/document-comparison"); }} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">Document Comparison</Link>
                    <Link href="/platform/integrity-checks" onClick={(e) => { handleProtectedClick(e, "/platform/integrity-checks"); }} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">Integrity Checks</Link>
                    <Link href="/platform/verification-workflows" onClick={(e) => { handleProtectedClick(e, "/platform/verification-workflows"); }} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">Verification Workflows</Link>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Link href="/solutions" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    {t("solutionsMenu.exploreSolutions", "Explore All Solutions →")}
                  </Link>
                </div>
              </div>
            )}
          </div>

          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {t("nav.howItWorks", "How It Works")}
          </Link>

          {/* Verification Mobile Submenu */}
          <div>
            <button
              type="button"
              onClick={() => toggleMobileSubmenu("verification")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <span>{t("nav.verification", "Verification")}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubmenu === "verification" ? "rotate-180" : ""}`} />
            </button>
            {mobileSubmenu === "verification" && (
              <div className="pl-4 pr-2 py-2 space-y-3 bg-slate-50/50 dark:bg-slate-800/40 rounded-lg mt-1 text-sm">
                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    {t("verificationMenu.methods", "Verification Methods")}
                  </span>
                  <div className="pl-2 space-y-1">
                    <Link href="/dashboard" onClick={(e) => { handleProtectedClick(e, "/dashboard"); }} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">Document Verification</Link>
                    <Link href="/verification/process" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">Verification Process</Link>
                    <Link href="/verification/statuses" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">Verification Statuses</Link>
                    <Link href="/platform/integrity-checks" onClick={(e) => { handleProtectedClick(e, "/platform/integrity-checks"); }} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">Integrity Checks</Link>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                    {t("verificationMenu.coverage", "Verification Sources")}
                  </span>
                  <div className="pl-2 space-y-1">
                    <Link href="/verification/issuer-verification" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">Issuer Verification</Link>
                    <Link href="/verification/qr-code" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">QR / Code Verification</Link>
                    <Link href="/verification/digilocker" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">DigiLocker Integration</Link>
                    <Link href="/verification/supported-issuers" onClick={() => setMobileMenuOpen(false)} className="block py-1 text-slate-600 dark:text-slate-300 hover:text-blue-600">Supported Issuers</Link>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <Link href="/verification/coverage" onClick={() => setMobileMenuOpen(false)} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                    {t("verificationMenu.exploreCoverage", "View Coverage Directory →")}
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Resources Mobile Submenu */}
          <div>
            <button
              type="button"
              onClick={() => toggleMobileSubmenu("resources")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <span>{t("nav.resources", "Resources")}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${mobileSubmenu === "resources" ? "rotate-180" : ""}`} />
            </button>
            {mobileSubmenu === "resources" && (
              <div className="pl-4 pr-2 py-2 space-y-1 bg-slate-50/50 dark:bg-slate-800/40 rounded-lg mt-1 text-sm">
                <Link href="/resources/supported-documents" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600">Supported Documents</Link>
                <Link href="/resources/document-requirements" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600">Document Requirements</Link>
                <Link href="/resources/document-guidelines" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600">Document Guidelines</Link>
                <Link href="/help" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600">Help Center</Link>
                <Link href="/faq" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600">FAQ</Link>
                <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-1.5 text-slate-600 dark:text-slate-300 hover:text-blue-600">Contact Us</Link>
              </div>
            )}
          </div>

          <Link
            href="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            {t("nav.about", "About")}
          </Link>

          {/* Mobile Bottom Profile/Auth Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-[#0f2942] dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {t("auth.login", "Log In")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#0f2942] dark:bg-blue-600 hover:bg-[#163b5f] dark:hover:bg-blue-500 rounded-lg transition-colors shadow-xs"
                >
                  {t("auth.register", "Create Account")}
                </Link>
              </>
            ) : (
              <>
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[180px]">
                      {currentUser?.full_name || "Active Session"}
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-400 font-semibold">{currentUser?.role || "USER"}</span>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-[#0f2942] dark:bg-blue-600 hover:bg-[#163b5f] dark:hover:bg-blue-500 rounded-lg transition-colors shadow-sm"
                >
                  {t("auth.workspace", "Open Workspace Console")}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-2.5 text-center text-sm font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-950/60 transition-colors cursor-pointer"
                >
                  {t("auth.logout", "Log Out")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
