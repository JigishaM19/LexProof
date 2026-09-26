"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar, { LexProofLogo } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { api } from "@/lib/api";
import { useI18n } from "@/lib/i18n";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  X,
  ChevronRight,
  HelpCircle,
  Globe,
  Loader2,
  Info,
} from "lucide-react";

function determineAuthorizedDestination(role: string, requestedRedirect?: string | null): string {
  const normalizedRole = (role || "INDIVIDUAL").toUpperCase();
  const defaultTarget = normalizedRole === "ORGANIZATION" ? "/organization" : "/individual";
  if (!requestedRedirect || requestedRedirect === "/dashboard" || requestedRedirect === "/") {
    return defaultTarget;
  }
  // Only honor redirect if it belongs to the user's authorized workspace
  if (normalizedRole === "ORGANIZATION" && requestedRedirect.startsWith("/organization")) {
    return requestedRedirect;
  }
  if (normalizedRole === "INDIVIDUAL" && (requestedRedirect.startsWith("/individual") || requestedRedirect.startsWith("/cases"))) {
    return requestedRedirect;
  }
  return defaultTarget;
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const { t, currentLanguage } = useI18n();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalNotice, setModalNotice] = useState<string | null>(null);

  // Sync token from Google OAuth redirect or display URL error parameter
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    const errorParam = searchParams.get("error");
    if (tokenParam) {
      api.setToken(tokenParam);
      // Fetch user profile to read real role from backend
      api.getMe().then((user) => {
        const dest = determineAuthorizedDestination(user.role, redirectParam);
        router.push(dest);
      }).catch(() => {
        router.push("/individual");
      });
    } else if (errorParam) {
      setErrorMsg(decodeURIComponent(errorParam));
    }
  }, [searchParams, redirectParam, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!identifier.trim() || !password) {
      setErrorMsg(t("common.required", "Please enter both your email/mobile and password."));
      return;
    }

    setLoading(true);
    try {
      const authResp = await api.login(identifier, password);
      const dest = determineAuthorizedDestination(authResp.user.role, redirectParam);
      router.push(dest);
    } catch (err: any) {
      setErrorMsg(err.message || t("loginPage.errorInvalid", "Invalid email/mobile or password."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      const res = await api.getGoogleAuthUrl(redirectParam || "/dashboard");
      if (res && res.url) {
        window.location.href = res.url;
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Google authentication service is currently unavailable.");
    }
  };

  const handleExternalAuth = (provider: string) => {
    setModalNotice(
      `Official ${provider} authentication requires government-authorized partner credentials currently configured only in production environments. Please sign in using your registered credentials, or create an account.`
    );
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#faf8ff] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-[#0f2942] transition-colors duration-200">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative">
          
          {/* =============================================================== */}
          {/* Left Panel: Architectural Trust Infrastructure                 */}
          {/* =============================================================== */}
          <div className="lg:col-span-5 bg-[#0f2942] dark:bg-slate-950 text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
            {/* Subtle background grid */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <svg className="w-full h-full" fill="none" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid-pattern" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#ffffff" strokeWidth="0.75" />
                    <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                <path d="M40 120 L200 240 L360 160" strokeDasharray="4 4" strokeWidth="1.5" />
                <path d="M200 240 L200 420" strokeWidth="1.5" />
                <circle cx="200" cy="240" r="6" fill="#ffffff" />
                <circle cx="200" cy="420" r="4" fill="#ffffff" />
              </svg>
            </div>

            {/* Upper Section */}
            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                {t("loginPage.eyebrow", "Digital Trust Rails")}
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
                  {t("loginPage.title", "Welcome back")}
                </h1>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {t("loginPage.subtitle", "Authoritative educational verification and non-custodial document forensics console.")}
                </p>
              </div>

              {/* Cryptographic Pipeline Technical Schema */}
              <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-blue-300 uppercase tracking-wider font-semibold">
                    Cryptographic Pipeline
                  </span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    LIVE NODE
                  </span>
                </div>

                <div className="relative py-2">
                  <svg className="w-full h-24" fill="none" viewBox="0 0 320 100" xmlns="http://www.w3.org/2000/svg">
                    <rect x="8" y="20" width="76" height="54" rx="4" fill="#001428" stroke="#7991af" strokeWidth="1.2" />
                    <path d="M18 36h32M18 46h44M18 56h20" stroke="#7991af" strokeWidth="1.5" strokeLinecap="round" />
                    <circle cx="68" cy="32" r="4" fill="#6860ef" />
                    <text x="46" y="86" fill="#dae2fd" fontFamily="Inter" fontSize="8" fontWeight="500" textAnchor="middle">
                      SEALED VAULT
                    </text>

                    <line x1="88" y1="47" x2="118" y2="47" stroke="#4e45d5" strokeWidth="1.5" strokeDasharray="2 2" />
                    <polygon points="120,47 114,44 114,50" fill="#4e45d5" />

                    <rect x="122" y="12" width="76" height="70" rx="6" fill="#002a44" stroke="#2e95da" strokeWidth="1.5" />
                    <circle cx="160" cy="40" r="12" fill="#0f2942" stroke="#2e95da" strokeWidth="1" />
                    <path d="M160 34v6M157 40h6" stroke="#93ccff" strokeWidth="1.5" strokeLinecap="round" />
                    <text x="160" y="64" fill="#cce5ff" fontFamily="JetBrains Mono" fontSize="7.5" textAnchor="middle">
                      ECDSA-256
                    </text>
                    <text x="160" y="94" fill="#dae2fd" fontFamily="Inter" fontSize="8" fontWeight="500" textAnchor="middle">
                      TRUST BROKER
                    </text>

                    <line x1="202" y1="47" x2="232" y2="47" stroke="#4e45d5" strokeWidth="1.5" strokeDasharray="2 2" />
                    <polygon points="234,47 228,44 228,50" fill="#4e45d5" />

                    <rect x="236" y="20" width="76" height="54" rx="4" fill="#001428" stroke="#7991af" strokeWidth="1.2" />
                    <circle cx="274" cy="42" r="9" fill="#002a44" />
                    <path d="M270 42l3 3 6-6" stroke="#2e95da" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <text x="274" y="86" fill="#dae2fd" fontFamily="Inter" fontSize="8" fontWeight="500" textAnchor="middle">
                      AUDIT LEDGER
                    </text>
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 text-[11px] text-slate-400">
              {t("landing.pilotScopeLabel", "Pilot Scope:")} {t("landing.pilotScopeText", "Selected Maharashtra institutions")}
            </div>
          </div>

          {/* =============================================================== */}
          {/* Right Panel: Authentication Form & External Providers          */}
          {/* =============================================================== */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#0f2942] dark:text-white tracking-tight">
                {t("loginPage.formTitle", "Sign in to LexProof")}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                {t("loginPage.formSubtitle", "Enter your verified credentials to access the digital trust console.")}
              </p>
            </div>

            {/* Alert Banner */}
            {errorMsg && (
              <div className="mb-5 p-4 rounded-lg bg-red-50 dark:bg-rose-950/40 border border-red-200 dark:border-rose-900/60 text-red-900 dark:text-rose-200 flex items-start gap-3 relative transition-all">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1 pr-6">
                  <p className="text-sm font-semibold text-red-800 dark:text-rose-300 leading-tight">
                    {errorMsg}
                  </p>
                  <p className="text-xs text-red-700 dark:text-rose-400 mt-1 leading-relaxed">
                    For system security, we do not indicate whether an account exists for a specific address or phone number.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMsg(null)}
                  className="absolute top-2.5 right-2.5 text-red-400 hover:text-red-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field 1: Email or Mobile */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="identifier">
                  {t("loginPage.identifierLabel", "Email or Mobile Number")} <span className="text-red-500 font-semibold">*</span>
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    id="identifier"
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={t("loginPage.identifierPlaceholder", "Enter email or mobile number")}
                    className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 pt-0.5">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  {t("loginPage.identifierHelp", "Supports registered Indian 10-digit mobile (+91) or institutional email.")}
                </p>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="password">
                  {t("loginPage.passwordLabel", "Password")} <span className="text-red-500 font-semibold">*</span>
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("loginPage.passwordPlaceholder", "Enter your security password")}
                    className="w-full h-11 pl-10 pr-12 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded text-[#0f2942] focus:ring-blue-600 cursor-pointer"
                    />
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {t("loginPage.rememberMe", "Remember me")}
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[#4338ca] dark:text-blue-400 hover:underline font-semibold transition-colors"
                  >
                    {t("loginPage.forgotPassword", "Forgot password?")}
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-[#0f2942] hover:bg-[#163b5f] dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md transition-all duration-150 flex items-center justify-center gap-2 group disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{t("loginPage.signingIn", "Verifying Credentials…")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("loginPage.signInBtn", "Sign In")}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />
              </div>
              <div className="relative px-3 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-xs uppercase tracking-wider font-semibold">
                {t("loginPage.orDivider", "or continue with")}
              </div>
            </div>

            {/* External Providers */}
            <div className="space-y-3">
              {/* DigiLocker Button */}
              <button
                type="button"
                onClick={() => handleExternalAuth("DigiLocker")}
                className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700 transition-all flex items-center justify-between group shadow-sm text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="4" width="20" height="16" rx="2" fill="#002A44" />
                      <path d="M6 8h12M6 12h8M6 16h5" stroke="#93CCFF" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="17" cy="14" r="3" fill="#2E95DA" />
                      <path d="M16 14l1 1 2-2" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">DigiLocker</span>
                      <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono rounded font-bold uppercase tracking-wider">
                        Official Gateway
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Authoritative Citizen Identity (MeriPehchaan OAuth 2.0)
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
              </button>

              {/* Google OAuth Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full p-3 rounded-lg bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700 transition-all flex items-center justify-between group shadow-sm text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.14z" fill="#4285F4" />
                      <path d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z" fill="#34A853" />
                      <path d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.97 0 12s.45 3.84 1.25 5.42l4.03-3.15z" fill="#FBBC05" />
                      <path d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" fill="#EA4335" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      {t("loginPage.googleAuth", "Continue with Google")}
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Institutional G-Suite or Personal Verified Account
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>

            {/* Create Account Link */}
            <div className="mt-6 pt-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-lg p-3 flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {t("loginPage.noAccount", "Don't have an account?")}
              </span>
              <Link
                href={redirectParam && redirectParam !== "/dashboard" ? `/register?redirect=${encodeURIComponent(redirectParam)}` : "/register"}
                className="text-sm text-[#4338ca] dark:text-blue-400 hover:underline font-bold transition-colors"
              >
                {t("loginPage.createAccountLink", "Create Account")}
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Honest Provider Status Modal */}
      {modalNotice && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
                <Info className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Provider Notice</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Government Gateway Integration</p>
              </div>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{modalNotice}</p>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setModalNotice(null)}
                className="px-4 py-2 bg-[#0f2942] hover:bg-[#163b5f] dark:bg-blue-600 dark:hover:bg-blue-500 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                {t("common.close", "Understand")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf8ff] dark:bg-[#090d16]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#0f2942] dark:text-blue-400" />
            <span className="text-xs text-slate-500 font-mono">Loading authentication portal…</span>
          </div>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
