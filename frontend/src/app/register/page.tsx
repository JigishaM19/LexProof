"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar, { LexProofLogo } from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api";
import {
  User,
  Building2,
  Check,
  ArrowRight,
  ArrowLeft,
  School,
  GraduationCap,
  Briefcase,
  BadgeCheck,
  Shield,
  Lock,
  Mail,
  Phone,
  AlertCircle,
  Loader2,
  CheckCircle2,
  RefreshCw,
  Info,
  Smartphone,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";

function RegisterWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect") || "/dashboard";
  const { t, currentLanguage } = useI18n();

  // Wizard state (Step 1 to 5)
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"INDIVIDUAL" | "ORGANIZATION">("INDIVIDUAL");
  const [userType, setUserType] = useState("STUDENT");

  // Step 3: Credentials Form
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [institution, setInstitution] = useState("University of Mumbai");
  const [course, setCourse] = useState("Bachelor of Technology (B.Tech)");
  const [branch, setBranch] = useState("Computer Science & Engineering");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [enrollmentId, setEnrollmentId] = useState("");

  // Step 4: OTP State
  const [verificationMethod, setVerificationMethod] = useState<"PHONE" | "EMAIL">("EMAIL");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // General Loading & Error
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 60-Second Cooldown Timer for Resend OTP
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Step 3 -> Step 4: Dispatch Real OTP via FastAPI
  const handleProceedToOtp = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      setErrorMsg("Please complete all required fields.");
      return;
    }
    if (password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    const target = verificationMethod === "PHONE" ? mobile.trim() : email.trim();
    if (verificationMethod === "PHONE" && !mobile.trim()) {
      setErrorMsg("Please enter your mobile number for Phone SMS verification, or select Email verification.");
      return;
    }

    setErrorMsg(null);
    setSendingOtp(true);
    setOtpError(null);
    setOtpSuccessMsg(null);

    try {
      const res = await api.sendOtp(target, "REGISTRATION", verificationMethod);
      setResendTimer(res.cooldown_seconds || 60);
      setOtp(["", "", "", "", "", ""]);
      setStep(4);
      setOtpSuccessMsg(res.message || "A verification code has been dispatched.");
      setTimeout(() => {
        document.getElementById("otp-input-0")?.focus();
      }, 100);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to dispatch verification code.");
    } finally {
      setSendingOtp(false);
    }
  };

  // Resend OTP via FastAPI
  const handleResendOtp = async () => {
    if (resendTimer > 0 || otpLoading) return;
    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccessMsg(null);

    const target = verificationMethod === "PHONE" ? mobile.trim() : email.trim();
    try {
      const res = await api.resendOtp(target, "REGISTRATION", verificationMethod);
      setResendTimer(res.cooldown_seconds || 60);
      setOtp(["", "", "", "", "", ""]);
      setOtpSuccessMsg(res.message || "A new verification code has been dispatched.");
      setTimeout(() => {
        document.getElementById("otp-input-0")?.focus();
      }, 50);
    } catch (err: any) {
      setOtpError(err.message || "Failed to resend verification code.");
    } finally {
      setOtpLoading(false);
    }
  };

  // OTP Input Handlers
  const handleOtpChange = (index: number, val: string) => {
    const cleaned = val.replace(/\D/g, "");
    if (!cleaned && val !== "") return;

    const newOtp = [...otp];
    newOtp[index] = cleaned ? cleaned[cleaned.length - 1] : "";
    setOtp(newOtp);
    setOtpError(null);

    // Auto-advance
    if (cleaned && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }

    // Auto-verify if all 6 digits entered
    if (cleaned && index === 5) {
      const full = [...newOtp.slice(0, 5), cleaned[cleaned.length - 1]].join("");
      if (full.length === 6) {
        triggerVerify(full);
      }
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        document.getElementById(`otp-input-${index - 1}`)?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-input-${index - 1}`)?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasteData) return;
    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtp(newOtp);
    setOtpError(null);

    const focusIdx = Math.min(pasteData.length, 5);
    document.getElementById(`otp-input-${focusIdx}`)?.focus();

    if (pasteData.length === 6) {
      triggerVerify(pasteData);
    }
  };

  const triggerVerify = async (fullOtp: string) => {
    setOtpLoading(true);
    setOtpError(null);
    setOtpSuccessMsg(null);

    const target = verificationMethod === "PHONE" ? mobile.trim() : email.trim();
    try {
      await api.verifyOtp(target, fullOtp, "REGISTRATION");
      setOtpVerified(true);
      setOtpSuccessMsg("Identity verified successfully! Advancing to Review...");
      setTimeout(() => {
        setStep(5); // Proceed to Review & Consent
      }, 700);
    } catch (err: any) {
      setOtpError(err.message || "Invalid verification code.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setOtpError("Please enter all 6 digits of your verification code.");
      return;
    }
    await triggerVerify(fullOtp);
  };

  // Final Registration Submission
  const handleFinalSubmit = async () => {
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await api.register({
        email,
        full_name: fullName,
        mobile: mobile || undefined,
        password,
        role,
        user_type: userType,
        institution,
        course,
        branch,
        academic_year: academicYear,
        enrollment_id: enrollmentId || undefined,
        terms_accepted: true,
      });

      // Auto login
      const authResp = await api.login(email, password);
      const userRole = (authResp.user.role || role || "INDIVIDUAL").toUpperCase();
      const defaultTarget = userRole === "ORGANIZATION" ? "/organization" : "/individual";
      let dest = defaultTarget;
      if (redirectParam && redirectParam !== "/dashboard" && redirectParam !== "/") {
        if (userRole === "ORGANIZATION" && redirectParam.startsWith("/organization")) {
          dest = redirectParam;
        } else if (userRole === "INDIVIDUAL" && (redirectParam.startsWith("/individual") || redirectParam.startsWith("/cases"))) {
          dest = redirectParam;
        }
      }
      router.push(dest);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#faf8ff] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans selection:bg-blue-100 selection:text-[#0f2942] transition-colors duration-200">
      {/* Global Navigation */}
      <Navbar />

      {/* Main Body */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col">
        {/* Institutional Progress Stepper */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 sm:p-5 mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            {/* Step 1 */}
            <div className={`flex items-center gap-2.5 ${step >= 1 ? "text-[#0f2942] dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                  step > 1 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : step === 1 ? "bg-[#0f2942] dark:bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {step > 1 ? <Check className="w-4 h-4" /> : "01"}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-semibold">Step 1</span>
                <span className="font-semibold truncate">{t.registerPage?.step1 || "Account Type"}</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className={`flex items-center gap-2.5 ${step >= 2 ? "text-[#0f2942] dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                  step > 2 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : step === 2 ? "bg-[#0f2942] dark:bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {step > 2 ? <Check className="w-4 h-4" /> : "02"}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-semibold">Step 2</span>
                <span className="font-semibold truncate">{t.registerPage?.step2 || "Role & Track"}</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className={`flex items-center gap-2.5 ${step >= 3 ? "text-[#0f2942] dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                  step > 3 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : step === 3 ? "bg-[#0f2942] dark:bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {step > 3 ? <Check className="w-4 h-4" /> : "03"}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-semibold">Step 3</span>
                <span className="font-semibold truncate">{t.registerPage?.step3 || "Credentials"}</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className={`flex items-center gap-2.5 ${step >= 4 ? "text-[#0f2942] dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                  step > 4 ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400" : step === 4 ? "bg-[#0f2942] dark:bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                {step > 4 ? <Check className="w-4 h-4" /> : "04"}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-semibold">Step 4</span>
                <span className="font-semibold truncate">Verification</span>
              </div>
            </div>

            {/* Step 5 */}
            <div className={`flex items-center gap-2.5 ${step === 5 ? "text-[#0f2942] dark:text-white" : "text-slate-400 dark:text-slate-500"}`}>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold font-mono text-xs ${
                  step === 5 ? "bg-[#0f2942] dark:bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                }`}
              >
                05
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-mono font-semibold">Step 5</span>
                <span className="font-semibold truncate">Consent & Submit</span>
              </div>
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div className="text-sm font-medium">{errorMsg}</div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 1: Account Type Selection (Individual vs Organization)        */}
        {/* =================================================================== */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h1 className="text-3xl font-bold tracking-tight text-[#0f2942] dark:text-white">
                {t.registerPage?.title || "Create your LexProof account"}
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {t.registerPage?.subtitle || "Access enterprise-grade educational document analysis and institutional verification rails."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Individual Card */}
              <div
                onClick={() => setRole("INDIVIDUAL")}
                className={`p-6 rounded-xl border-2 transition-all cursor-pointer bg-white dark:bg-slate-900 flex flex-col justify-between ${
                  role === "INDIVIDUAL"
                    ? "border-[#0f2942] dark:border-blue-500 shadow-md ring-2 ring-[#0f2942]/10 dark:ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#0f2942] dark:text-blue-400 flex items-center justify-center">
                      <User className="w-6 h-6" />
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        role === "INDIVIDUAL" ? "bg-[#0f2942] dark:bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {role === "INDIVIDUAL" && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#0f2942] dark:text-white">
                        {t.registerPage?.roleIndividual?.split("(")[0]?.trim() || "Individual"}
                      </h2>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Personal
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      For personal document analysis, credential verification, and sovereign document management.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Recommended for:</span> Students, Graduates, Job Seekers, Employees
                </div>
              </div>

              {/* Organization Card */}
              <div
                onClick={() => setRole("ORGANIZATION")}
                className={`p-6 rounded-xl border-2 transition-all cursor-pointer bg-white dark:bg-slate-900 flex flex-col justify-between ${
                  role === "ORGANIZATION"
                    ? "border-[#0f2942] dark:border-blue-500 shadow-md ring-2 ring-[#0f2942]/10 dark:ring-blue-500/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-[#0f2942] dark:text-white flex items-center justify-center">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        role === "ORGANIZATION" ? "bg-[#0f2942] dark:bg-blue-600 text-white" : "border border-slate-300 dark:border-slate-700"
                      }`}
                    >
                      {role === "ORGANIZATION" && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-[#0f2942] dark:text-white">
                        {t.registerPage?.roleOrg?.split("(")[0]?.trim() || "Organization"}
                      </h2>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        Institutional
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      For institutions and organizations that issue, review, or verify documents at institutional scale.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Recommended for:</span> Universities, Colleges, Boards, Employers
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-[#0f2942] dark:bg-blue-600 hover:bg-[#163b5f] dark:hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>{t.common?.next || "Continue"} ({role === "INDIVIDUAL" ? (t.registerPage?.roleIndividual?.split("(")[0]?.trim() || "Individual") : (t.registerPage?.roleOrg?.split("(")[0]?.trim() || "Organization")})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 2: Role & Category Track                                      */}
        {/* =================================================================== */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-left space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#0f2942]">
                What best describes you?
              </h1>
              <p className="text-sm text-slate-600">
                Choose the track that fits your primary verification goals. This configures your document templates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Student */}
              <div
                onClick={() => setUserType("STUDENT")}
                className={`p-5 rounded-xl border-2 cursor-pointer bg-white transition-all flex flex-col justify-between ${
                  userType === "STUDENT" ? "border-[#0f2942] shadow-md ring-2 ring-[#0f2942]/10" : "border-slate-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#0f2942] flex items-center justify-center">
                      <School className="w-5 h-5" />
                    </div>
                    {userType === "STUDENT" && (
                      <div className="w-5 h-5 rounded-full bg-[#0f2942] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0f2942]">Student</h3>
                    <span className="text-[10px] text-blue-600 font-mono">Academic Track</span>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Currently studying at an accredited school, college, or university.
                    </p>
                  </div>
                </div>
              </div>

              {/* Graduate */}
              <div
                onClick={() => setUserType("GRADUATE")}
                className={`p-5 rounded-xl border-2 cursor-pointer bg-white transition-all flex flex-col justify-between ${
                  userType === "GRADUATE" ? "border-[#0f2942] shadow-md ring-2 ring-[#0f2942]/10" : "border-slate-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-indigo-50 text-[#4338ca] flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    {userType === "GRADUATE" && (
                      <div className="w-5 h-5 rounded-full bg-[#0f2942] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0f2942]">Graduate</h3>
                    <span className="text-[10px] text-indigo-600 font-mono">Alumni & Degree Sync</span>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Completed education; managing and verifying degree transcripts and credentials.
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Applicant */}
              <div
                onClick={() => setUserType("JOB_SEEKER")}
                className={`p-5 rounded-xl border-2 cursor-pointer bg-white transition-all flex flex-col justify-between ${
                  userType === "JOB_SEEKER" ? "border-[#0f2942] shadow-md ring-2 ring-[#0f2942]/10" : "border-slate-200"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    {userType === "JOB_SEEKER" && (
                      <div className="w-5 h-5 rounded-full bg-[#0f2942] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0f2942]">Job Applicant</h3>
                    <span className="text-[10px] text-emerald-600 font-mono">Career & Dossier</span>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Verifying educational background for recruitment and hiring screenings.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-[#0f2942] hover:bg-[#163b5f] text-white text-sm font-semibold rounded-lg shadow-md flex items-center gap-2"
              >
                Continue to Credentials <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 3: Personal & Academic Credentials Form                       */}
        {/* =================================================================== */}
        {step === 3 && (
          <div className="space-y-6 bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-[#0f2942]">Personal & Academic Details</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Enter your genuine identity credentials. These will be verified against issuer records.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <label className="block font-medium text-slate-700">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Rahul Patil"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rahul.patil@example.com"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-700">Mobile Number (India +91)</label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9820012345"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-700">Security Password *</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              {/* Verification Channel Selector */}
              <div className="sm:col-span-2 pt-2 pb-1">
                <label className="block font-semibold text-slate-800 text-xs uppercase tracking-wider mb-2">
                  Account Verification Channel *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => setVerificationMethod("PHONE")}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      verificationMethod === "PHONE"
                        ? "border-[#0f2942] bg-blue-50/50 shadow-sm ring-1 ring-[#0f2942]"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${verificationMethod === "PHONE" ? "bg-[#0f2942] text-white" : "bg-slate-100 text-slate-600"}`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900">Phone SMS OTP</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          Direct SMS
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">
                        Real 6-digit SMS delivered to your mobile via SMS gateway.
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setVerificationMethod("EMAIL")}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      verificationMethod === "EMAIL"
                        ? "border-[#0f2942] bg-blue-50/50 shadow-sm ring-1 ring-[#0f2942]"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${verificationMethod === "EMAIL" ? "bg-[#0f2942] text-white" : "bg-slate-100 text-slate-600"}`}>
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-slate-900">Email OTP</span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          Direct Mail
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">
                        Cryptographic 6-digit verification code delivered directly to your email inbox via Resend.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="block font-medium text-slate-700">Educational Institution / University *</label>
                <select
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="University of Mumbai">University of Mumbai</option>
                  <option value="Savitribai Phule Pune University">Savitribai Phule Pune University</option>
                  <option value="Maharashtra State Board of Secondary and Higher Secondary Education">
                    Maharashtra State Board (MSBSHSE)
                  </option>
                  <option value="Maharashtra State Board of Technical Education">
                    Maharashtra State Board of Technical Education (MSBTE)
                  </option>
                  <option value="Other Accredited Institution">Other Accredited Institution</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-700">Course / Qualification</label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="e.g. B.Tech, B.Sc, Diploma"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-700">Branch / Specialization</label>
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="e.g. Information Technology"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-700">Academic Year / Year of Passing</label>
                <input
                  type="text"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="e.g. 2024-2025"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-slate-700">Student Roll / Enrollment No.</label>
                <input
                  type="text"
                  value={enrollmentId}
                  onChange={(e) => setEnrollmentId(e.target.value)}
                  placeholder="e.g. MH-2024-1982"
                  className="w-full h-10 px-3 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-sm font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                id="btn-proceed-to-otp"
                disabled={sendingOtp}
                onClick={handleProceedToOtp}
                className="px-6 py-2.5 bg-[#0f2942] hover:bg-[#163b5f] text-white text-sm font-semibold rounded-lg shadow-md flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {sendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching OTP...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Verification</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 4: OTP Verification Screen                                    */}
        {/* =================================================================== */}
        {step === 4 && (
          <div className="space-y-6 max-w-lg mx-auto w-full bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0f2942] flex items-center justify-center mx-auto">
                {verificationMethod === "PHONE" ? (
                  <Smartphone className="w-6 h-6 text-blue-600" />
                ) : (
                  <Mail className="w-6 h-6 text-blue-600" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-[#0f2942]">
                {verificationMethod === "PHONE" ? "Verify Your Phone Number" : "Verify Your Email Address"}
              </h2>
              <p className="text-xs text-slate-500">
                {verificationMethod === "PHONE" ? (
                  <>
                    A 6-digit SMS verification code has been dispatched to{" "}
                    <span className="font-semibold text-slate-700">{mobile || "your phone"}</span>.
                  </>
                ) : (
                  <>
                    A 6-digit cryptographic verification code has been dispatched to{" "}
                    <span className="font-semibold text-slate-700">{email}</span>.
                  </>
                )}
              </p>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] bg-slate-100 text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>
                  {verificationMethod === "PHONE"
                    ? "Cryptographic Mobile OTP Verification"
                    : "Cryptographic Email Verification (Resend)"}
                </span>
              </div>
            </div>

            {/* Success Notification */}
            {otpSuccessMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{otpSuccessMsg}</span>
              </div>
            )}

            {/* Error Notification */}
            {otpError && (
              <div className="p-3 bg-red-50 text-red-800 text-xs rounded-lg border border-red-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{otpError}</span>
              </div>
            )}

            {/* 6 Digit Input Cells */}
            <div
              className="flex justify-center gap-2 sm:gap-3 py-3"
              onPaste={handleOtpPaste}
            >
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  disabled={otpLoading || otpVerified}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className={`w-11 h-12 text-center text-lg font-bold font-mono border-2 rounded-lg transition-all focus:outline-none focus:ring-2 ${
                    otpError
                      ? "border-red-400 bg-red-50/30 text-red-900 focus:border-red-600 focus:ring-red-500/20"
                      : otpVerified
                      ? "border-emerald-500 bg-emerald-50/40 text-emerald-800"
                      : "border-slate-300 focus:border-[#0f2942] focus:ring-blue-600/20"
                  }`}
                />
              ))}
            </div>

            {/* Resend OTP Row with Cooldown */}
            <div className="text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
              <span>Did not receive code?</span>
              {resendTimer > 0 ? (
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Resend in <strong className="text-slate-600">{resendTimer}s</strong>
                </span>
              ) : (
                <button
                  type="button"
                  id="btn-resend-otp"
                  disabled={otpLoading}
                  onClick={handleResendOtp}
                  className="text-[#0f2942] font-semibold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Resend OTP</span>
                </button>
              )}
            </div>

            {/* Switch Channel Quick Link */}
            <div className="pt-2 text-center">
              {verificationMethod === "PHONE" ? (
                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod("EMAIL");
                    setStep(3);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Prefer Email verification? Switch to Email OTP</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setVerificationMethod("PHONE");
                    setStep(3);
                  }}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Prefer SMS verification? Switch to Phone OTP</span>
                </button>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 flex justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>
              <button
                type="button"
                id="btn-verify-otp"
                disabled={otpLoading || otpVerified || otp.join("").length !== 6}
                onClick={handleVerifyOtp}
                className="px-6 py-2.5 bg-[#0f2942] hover:bg-[#163b5f] text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer transition-all"
              >
                {otpLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifyingâ€¦</span>
                  </>
                ) : otpVerified ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verified!</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* STEP 5: Review & Consent                                           */}
        {/* =================================================================== */}
        {step === 5 && (
          <div className="space-y-6 max-w-2xl mx-auto w-full bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-sm animate-fadeIn">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-full border border-emerald-200 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Contact Authenticated
              </div>
              <h2 className="text-2xl font-bold text-[#0f2942]">Review & Consent</h2>
              <p className="text-xs text-slate-500 mt-1">
                Please review your profile details before finalizing your cryptographic account creation.
              </p>
            </div>

            {/* Summary Card */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px]">Full Name</span>
                  <div className="font-semibold text-slate-800">{fullName}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px]">Email Address</span>
                  <div className="font-semibold text-slate-800">{email}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px]">Institution</span>
                  <div className="font-semibold text-slate-800">{institution}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px]">Course & Branch</span>
                  <div className="font-semibold text-slate-800">{course} ({branch})</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px]">Academic Year</span>
                  <div className="font-semibold text-slate-800">{academicYear}</div>
                </div>
                <div>
                  <span className="text-slate-400 font-mono uppercase text-[10px]">Account Role</span>
                  <div className="font-semibold text-slate-800">{role} â€¢ {userType}</div>
                </div>
              </div>
            </div>

            {/* Legal consent check */}
            <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-100 flex items-start gap-2.5 text-xs text-slate-600">
              <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="leading-snug">
                I hereby consent to non-custodial document verification against authorized educational registers in accordance with the Digital Personal Data Protection (DPDP) principles.
              </div>
            </div>

            <div className="pt-4 flex justify-between border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep(4)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> {t.common?.back || "Back"}
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="px-6 py-2.5 bg-[#0f2942] dark:bg-blue-600 hover:bg-[#163b5f] dark:hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-md flex items-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t.registerPage?.submitting || "Creating account..."}</span>
                  </>
                ) : (
                  <>
                    <span>{t.registerPage?.submitBtn || "Complete Registration"}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}

export default function RegisterWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf8ff] dark:bg-[#090d16]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#0f2942] dark:text-blue-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Loading registration wizard…</span>
          </div>
        </div>
      }
    >
      <RegisterWizardContent />
    </Suspense>
  );
}

