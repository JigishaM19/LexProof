"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar, { LexProofLogo } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  Layers,
  MapPin,
  Lock,
  ChevronRight,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashProgress, setSplashProgress] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);

  const handleAnalyzeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!api.isAuthenticated()) {
      router.push("/login?redirect=/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  // Splash screen transition logic
  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("LexProof_splash_shown");
    if (hasSeenSplash) {
      setSplashVisible(false);
      return;
    }

    const progressTimer = setTimeout(() => {
      setSplashProgress(100);
    }, 150);

    const fadeTimer = setTimeout(() => {
      setSplashVisible(false);
      sessionStorage.setItem("LexProof_splash_shown", "true");
    }, 1300);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(fadeTimer);
    };
  }, []);

  // 3D Parallax tilt effect on hero interaction
  useEffect(() => {
    const hero = heroRef.current;
    const container = parallaxRef.current;
    if (!hero || !container) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const percentX = (x - centerX) / centerX;
      const percentY = (y - centerY) / centerY;

      const rotateY = percentX * 4;
      const rotateX = -percentY * 4;

      container.style.transform = `rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
    };

    const handleMouseLeave = () => {
      container.style.transform = "rotateX(0deg) rotateY(0deg)";
    };

    hero.addEventListener("mousemove", handleMouseMove);
    hero.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8ff] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 relative selection:bg-blue-100 selection:text-[#0f2942] transition-colors duration-200">
      {/* 1. INITIAL WEBSITE OPENING: 1.2s Branded Loading Splash Screen */}
      {splashVisible && (
        <div
          id="splash-screen"
          className="fixed inset-0 z-[100] bg-white dark:bg-[#090d16] flex flex-col items-center justify-center p-6 transition-opacity duration-500 ease-out"
          style={{ opacity: splashProgress === 100 ? 0.95 : 1 }}
          aria-live="polite"
          aria-busy="true"
        >
          <div className="relative flex flex-col items-center max-w-sm text-center">
            {/* Logo */}
            <div className="w-16 h-16 mb-5 transform transition-transform duration-700 hover:scale-105">
              <LexProofLogo className="w-16 h-16" />
            </div>

            {/* Brand Title & Tagline */}
            <h1 className="text-2xl font-bold text-[#0f2942] dark:text-white tracking-tight">
              {t("brand.name", "LexProof")}
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] font-semibold text-slate-500 dark:text-slate-400 mt-1 mb-6">
              {t("brand.taglineFull", "Understand. Analyze. Verify.")}
            </p>

            {/* Progress bar */}
            <div className="w-48 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
              <div
                className="h-full bg-[#0f2942] dark:bg-blue-500 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${splashProgress}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-2.5">
              Initializing verified interface…
            </span>
          </div>
        </div>
      )}

      {/* Ambient background lighting */}
      <div className="absolute top-0 right-0 w-[800px] h-[750px] bg-gradient-to-b from-blue-100/40 via-indigo-50/20 to-transparent dark:from-blue-900/15 dark:via-indigo-950/10 rounded-full blur-3xl pointer-events-none -z-10 translate-x-1/3 -translate-y-1/4" />
      <div className="absolute top-80 left-0 w-[550px] h-[550px] bg-gradient-to-tr from-slate-100/70 to-transparent dark:from-slate-800/20 rounded-full blur-2xl pointer-events-none -z-10 -translate-x-1/3" />

      {/* Navigation Bar */}
      <Navbar />

      {/* Main Hero Section */}
      <main
        ref={heroRef}
        className="flex-1 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 lg:pt-16 lg:pb-28 w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* =============================================================== */}
          {/* LEFT COLUMN: Value Proposition, Scope, and CTAs (5 Columns)     */}
          {/* =============================================================== */}
          <div className="lg:col-span-5 flex flex-col items-start text-left">
            {/* Eyebrow Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800 mb-6">
              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
              <span className="text-xs font-bold tracking-wider uppercase text-blue-900 dark:text-blue-300">
                {t("landing.eyebrow", "Document Analysis & Verification")}
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.12] font-extrabold text-[#0f2942] dark:text-white tracking-tight mb-5">
              {t("landing.headlineLine1", "Understand.")} <br />
              {t("landing.headlineLine2", "Analyze.")} <br className="hidden sm:inline" />
              {t("landing.headlineLine3", "Verify.")}
            </h1>

            {/* Supporting Paragraph */}
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-6">
              {t("landing.subheadline", "Turn complex documents into structured, understandable information — and verify eligible documents through authoritative sources.")}
            </p>

            {/* Scope Statement Card */}
            <div className="w-full p-4 rounded-xl bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 mb-8 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-snug">
                <span className="font-semibold text-[#0f2942] dark:text-white">{t("landing.pilotScopeLabel", "Pilot Scope:")}</span>{" "}
                {t("landing.pilotScopeText", "Analyze supported documents from anywhere. Verify eligible education documents from selected supported institutions in Maharashtra.")}
              </div>
            </div>

            {/* CTA Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-4">
              {/* Primary CTA */}
              <Link
                href="/dashboard"
                onClick={handleAnalyzeClick}
                className="group inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-white bg-[#0f2942] hover:bg-[#163b5f] dark:bg-blue-600 dark:hover:bg-blue-500 shadow-md hover:shadow-lg transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base cursor-pointer"
              >
                <span>{t("landing.ctaAnalyze", "Analyze a Document")}</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
              </Link>

              {/* Secondary CTA */}
              <Link
                href="/verification/coverage"
                className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl font-semibold text-[#0f2942] dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 shadow-sm hover:shadow transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 text-sm sm:text-base"
              >
                {t("landing.ctaCheckCoverage", "Check Verification Coverage →")}
              </Link>
            </div>

            {/* View Supported Documents Link */}
            <div className="mb-6">
              <Link
                href="/resources/supported-documents"
                className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-1 group"
              >
                <span>{t("landing.viewSupportedDocs", "View Supported Documents")}</span>
                <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Trust / Scope Informational Strip */}
            <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800 w-full flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Shield className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span>
                {t("landing.trustStrip", "Current verification coverage: Selected Maharashtra education institutions and supported issuers")}
              </span>
            </div>
          </div>

          {/* =============================================================== */}
          {/* RIGHT COLUMN: Premium 3D Layered Document Workflow (7 Columns)  */}
          {/* =============================================================== */}
          <div className="lg:col-span-7 perspective-canvas w-full flex justify-center lg:justify-end">
            <div
              ref={parallaxRef}
              id="parallax-container"
              className="parallax-tilt-group relative w-full max-w-[620px] py-4"
            >
              {/* Subtle 3D SVG Flow Lines Behind Cards */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-visible"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M 230 180 C 230 250, 420 200, 440 260 S 260 330, 240 400 S 330 460, 330 510"
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="2"
                  className="flow-line dark:opacity-30"
                />
                <path
                  d="M 230 180 C 230 250, 420 200, 440 260 S 260 330, 240 400 S 330 460, 330 510"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                  className="flow-line"
                />
              </svg>

              {/* LAYER 1: CENTERPIECE UPLOADED DOCUMENT CARD */}
              <div className="anim-float-doc relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-card-3d p-6 w-[88%] sm:w-[82%] mx-auto z-20 transition-all duration-300">
                {/* Document Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/80 border border-blue-100 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#0f2942] dark:text-white tracking-tight">
                        {t("landing.specimenCard.title", "Academic Record / Degree Transcript")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {t("landing.specimenCard.id", "SPECIMEN-INPUT-2026-X")}
                      </div>
                    </div>
                  </div>

                  {/* Uploaded Pill */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t("landing.specimenCard.status", "Document uploaded")}
                  </span>
                </div>

                {/* Abstract Document Fields */}
                <div className="space-y-3 font-mono text-[11px] sm:text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">{t("landing.specimenCard.fieldName", "NAME")}</span>
                    <span className="text-slate-700 dark:text-slate-200 font-semibold tracking-wider">
                      •••••••••• ••••••••
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400 font-medium">{t("landing.specimenCard.fieldInstitution", "INSTITUTION")}</span>
                    <span className="text-slate-700 dark:text-slate-200 font-semibold tracking-wider">
                      ••••••••••••• UNIVERSITY (MH)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400">{t("landing.specimenCard.fieldQualification", "QUALIFICATION")}</div>
                      <div className="text-slate-700 dark:text-slate-200 font-semibold">{t("landing.specimenCard.qualificationVal", "BACHELOR OF TECH")}</div>
                    </div>
                    <div className="p-2 rounded bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                      <div className="text-[10px] text-slate-400">{t("landing.specimenCard.fieldRegId", "REGISTRATION ID")}</div>
                      <div className="text-slate-700 dark:text-slate-200 font-semibold">MH-2024-••••••</div>
                    </div>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 font-sans">
                  <span>{t("landing.specimenCard.schemaNote", "Standard Form Document Schema")}</span>
                  <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
                    <Lock className="w-3 h-3 text-slate-400" />
                    {t("landing.specimenCard.ingestionNote", "Non-Custodial Ingestion")}
                  </span>
                </div>
              </div>

              {/* LAYER 2: FLOATING AI ANALYSIS CARD */}
              <div className="anim-float-panel1 absolute -top-5 sm:-top-8 -right-2 sm:-right-4 w-60 sm:w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-blue-200/90 dark:border-blue-900 shadow-elevation-3 p-4 z-30">
                <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
                    <span className="text-xs font-bold text-[#0f2942] dark:text-white">{t("landing.aiCard.title", "AI Analysis")}</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 px-2 py-0.5 rounded font-medium">
                    {t("landing.aiCard.stage", "Stage 01")}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                    <span>{t("landing.aiCard.ocr", "OCR Pipeline")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                    <span>{t("landing.aiCard.extraction", "Information Extraction")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                    <span>{t("landing.aiCard.structure", "Structure Identified")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-medium">
                    <span className="text-blue-600 dark:text-blue-400 font-bold">✓</span>
                    <span>{t("landing.aiCard.consistency", "Consistency Check")}</span>
                  </div>
                </div>
                <div className="mt-2 text-[10px] text-slate-400 font-sans italic">
                  {t("landing.aiCard.footnote", "Extracting semantic keys without altering original bytes")}
                </div>
              </div>

              {/* LAYER 3: STRUCTURED DATA PANEL */}
              <div className="anim-float-panel2 relative sm:-mt-6 mt-4 -left-1 sm:-left-3 w-[92%] sm:w-[84%] bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-elevation-3 p-4 z-30">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#0f2942] dark:text-blue-400" />
                    <span className="text-xs font-bold text-[#0f2942] dark:text-white">{t("landing.structuredCard.title", "Structured Information")}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {t("landing.structuredCard.badge", "Parsed JSON Schema")}
                  </span>
                </div>

                {/* Neutral field-value grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[9.5px] uppercase font-semibold text-slate-400">{t("landing.structuredCard.nameKey", "Candidate Name")}</div>
                    <div className="font-medium text-slate-700 dark:text-slate-200 truncate">S•••••• R••••• (Masked)</div>
                  </div>
                  <div className="p-2 rounded bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[9.5px] uppercase font-semibold text-slate-400">{t("landing.structuredCard.institutionKey", "Institution Node")}</div>
                    <div className="font-medium text-slate-700 dark:text-slate-200 truncate">{t("landing.structuredCard.institutionVal", "Univ. of Mumbai (Pilot Rail)")}</div>
                  </div>
                  <div className="p-2 rounded bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[9.5px] uppercase font-semibold text-slate-400">{t("landing.structuredCard.dateKey", "Conferred Date")}</div>
                    <div className="font-medium text-slate-700 dark:text-slate-200 truncate">2024-05-18</div>
                  </div>
                  <div className="p-2 rounded bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div className="text-[9.5px] uppercase font-semibold text-slate-400">{t("landing.structuredCard.regKey", "Registration ID")}</div>
                    <div className="font-medium text-slate-700 dark:text-slate-200 font-mono truncate">ENG-••••-9812</div>
                  </div>
                </div>
              </div>

              {/* LAYER 4: TRUST PILL: ANALYSIS ≠ VERIFICATION */}
              <div className="my-4 max-w-md mx-auto relative z-30">
                <div className="bg-gradient-to-r from-blue-50 via-slate-50 to-amber-50 dark:from-blue-950/40 dark:via-slate-900 dark:to-amber-950/30 rounded-xl border border-slate-200 dark:border-slate-800 p-3 shadow-sm flex items-center gap-3">
                  <div className="px-2.5 py-1 rounded bg-[#0f2942] dark:bg-blue-600 text-white font-mono font-bold text-[11px] whitespace-nowrap">
                    {t("landing.trustPill.badge", "Analysis ≠ Verification")}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    {t("landing.trustPill.text", "Analysis structures document content. Verification independently confirms it against authoritative institutional rails.")}
                  </p>
                </div>
              </div>

              {/* LAYER 5: VERIFICATION OUTCOME PANEL: State A & State B */}
              <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-card-3d p-4 w-[96%] sm:w-[90%] mx-auto z-30">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-[#0f2942] dark:text-white">{t("landing.outcomeCard.title", "Verification Outcome States")}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">{t("landing.outcomeCard.badge", "Conceptual Outputs")}</span>
                </div>

                {/* Two Outcome Cards Side-by-Side */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* STATE A: Verified */}
                  <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        {t("landing.outcomeCard.verifiedTitle", "Verified")}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-900/60 px-1.5 py-0.5 rounded">
                        {t("landing.outcomeCard.verifiedState", "State A")}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-snug">
                      {t("landing.outcomeCard.verifiedDesc", "Confirmed through an authoritative source registry rail.")}
                    </p>
                  </div>

                  {/* STATE B: Verification Unavailable */}
                  <div className="p-3 rounded-lg bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 transition-all hover:bg-amber-50 dark:hover:bg-amber-950/60">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                        {t("landing.outcomeCard.unavailableTitle", "Verification unavailable")}
                      </span>
                      <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-900/60 px-1.5 py-0.5 rounded">
                        {t("landing.outcomeCard.unavailableState", "State B")}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-900 dark:text-amber-200 leading-snug">
                      {t("landing.outcomeCard.unavailableDesc", "Analysis completed. Authoritative source unavailable.")}
                    </p>
                  </div>
                </div>

                <div className="mt-2 text-[10px] text-slate-400 text-center font-sans">
                  {t("landing.outcomeCard.footnote", "Unverified status denotes lack of registry connection, not automatic fraud.")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
