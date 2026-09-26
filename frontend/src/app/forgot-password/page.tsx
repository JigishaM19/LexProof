"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LexProofLogo } from "@/components/layout/Navbar";
import { api } from "@/lib/api";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  X,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Globe,
  Loader2,
  KeyRound,
  RefreshCw,
} from "lucide-react";

function ForgotPasswordContent() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Timer countdown
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setSuccessMsg(
        res.message || "If an account exists, a cryptographic password reset code has been dispatched."
      );
      setCooldown(60);
      setStep(2);
    } catch (err: any) {
      setErrorMsg(err.message || "Unable to request password reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit verification code sent to your email.");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMsg("New password must be at least 8 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match. Please verify both fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword(email.trim(), cleanOtp, newPassword);
      setSuccessMsg(res.message || "Password updated successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to reset password. Please check your verification code.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (cooldown > 0 || loading) return;
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await api.forgotPassword(email.trim());
      setSuccessMsg(res.message || "A fresh verification code has been dispatched.");
      setCooldown(60);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to resend reset code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#faf8ff] text-slate-800 font-sans selection:bg-blue-100 selection:text-[#0f2942]">
      {/* Top Header */}
      <header className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/80">
        <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group" aria-label="LexProof Home">
            <LexProofLogo className="w-8 h-8" />
            <span className="text-lg font-bold text-[#0f2942]">LexProof</span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
            <span className="hidden sm:flex items-center gap-1.5 text-slate-500">
              <Globe className="w-3.5 h-3.5" />
              English (IN)
            </span>
            <Link href="/help" className="flex items-center gap-1 hover:text-[#0f2942] transition-colors">
              <HelpCircle className="w-3.5 h-3.5" />
              Support
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <div className="w-full max-w-5xl rounded-xl bg-white shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative">
          
          {/* Left Panel: Architectural Trust Infrastructure */}
          <div className="lg:col-span-5 bg-[#0f2942] text-white p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none opacity-10">
              <svg className="w-full h-full" fill="none" viewBox="0 0 400 600" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid-pattern-fp" width="32" height="32" patternUnits="userSpaceOnUse">
                    <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#ffffff" strokeWidth="0.75" />
                    <circle cx="0" cy="0" r="1.5" fill="#ffffff" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid-pattern-fp)" />
                <path d="M40 120 L200 240 L360 160" strokeDasharray="4 4" strokeWidth="1.5" />
                <path d="M200 240 L200 420" strokeWidth="1.5" />
                <circle cx="200" cy="240" r="6" fill="#ffffff" />
                <circle cx="200" cy="420" r="4" fill="#ffffff" />
              </svg>
            </div>

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Cryptographic Account Recovery
              </div>

              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
                  Zero-Knowledge Password Recovery
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  LexProof never stores plaintext passwords or cleartext verification codes. All recovery actions utilize ephemeral, cryptographically hashed tokens with enforced rate-limiting.
                </p>
              </div>

              <div className="pt-4 space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Argon2id Memory-Hard Key Derivation</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>HMAC-SHA256 Ephemeral Token Hashing</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Immediate Active Session Revocation</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-8 mt-8 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span>Security Standard: RFC 9106</span>
              <span className="text-emerald-400">â€¢ Protected</span>
            </div>
          </div>

          {/* Right Panel: Form Area */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#4338ca] mb-1">
                <KeyRound className="w-4 h-4" />
                {step === 1 ? "Step 1 of 2: Identity Verification" : "Step 2 of 2: New Security Password"}
              </div>
              <h2 className="text-2xl font-bold text-[#0f2942]">
                {step === 1 ? "Forgot Your Password?" : "Set New Security Password"}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {step === 1
                  ? "Enter your registered email address. We will dispatch a 6-digit cryptographic verification code to initiate password recovery."
                  : `Enter the 6-digit code sent to ${email} along with your new password.`}
              </p>
            </div>

            {/* Error Banner */}
            {errorMsg && (
              <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 relative transition-all">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 pr-6">
                  <p className="text-sm font-semibold text-red-800 leading-tight">
                    {errorMsg}
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

            {/* Success Banner */}
            {successMsg && (
              <div className="mb-5 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 relative transition-all">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1 pr-6">
                  <p className="text-sm font-semibold text-emerald-800 leading-tight">
                    {successMsg}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSuccessMsg(null)}
                  className="absolute top-2.5 right-2.5 text-emerald-400 hover:text-emerald-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 1: Request Code */}
            {step === 1 && (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700" htmlFor="reset-email">
                    Registered Email Address <span className="text-red-500 font-semibold">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Mail className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      id="reset-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@institution.ac.in"
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 text-sm placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#0f2942] hover:bg-[#163b5f] text-white font-semibold rounded-lg shadow-md transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Dispatching Verification Codeâ€¦</span>
                      </>
                    ) : (
                      <>
                        <span>Send Recovery Code</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-4 text-center">
                  <Link
                    href="/login"
                    className="text-xs text-slate-600 hover:text-[#0f2942] inline-flex items-center gap-1 font-semibold"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}

            {/* Step 2: Verify OTP and Set Password */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700" htmlFor="reset-otp">
                    6-Digit Verification Code <span className="text-red-500 font-semibold">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <ShieldCheck className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      id="reset-otp"
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="e.g. 123456"
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 text-sm font-mono tracking-widest placeholder:tracking-normal placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Check your inbox for the code.</span>
                    {cooldown > 0 ? (
                      <span className="text-slate-400">Resend in {cooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendCode}
                        className="text-[#4338ca] hover:underline font-semibold flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Resend Code
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700" htmlFor="new-password">
                    New Security Password <span className="text-red-500 font-semibold">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full h-11 pl-10 pr-12 rounded-lg border border-slate-300 text-sm placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 text-slate-400 hover:text-slate-700 transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700" htmlFor="confirm-password">
                    Confirm New Password <span className="text-red-500 font-semibold">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
                    <input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full h-11 pl-10 pr-4 rounded-lg border border-slate-300 text-sm placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-[#0f2942] hover:bg-[#163b5f] text-white font-semibold rounded-lg shadow-md transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Passwordâ€¦</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password & Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <div className="pt-4 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-slate-600 hover:text-[#0f2942] inline-flex items-center gap-1 font-semibold cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Change Email
                  </button>
                  <Link
                    href="/login"
                    className="text-slate-600 hover:text-[#0f2942] inline-flex items-center gap-1 font-semibold"
                  >
                    Back to Sign In
                  </Link>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-100/70 border-t border-slate-200 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Â© {new Date().getFullYear()} LexProof. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#0f2942]">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-[#0f2942]">Terms of Service</Link>
            <Link href="/help" className="hover:text-[#0f2942]">Help Desk</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf8ff]">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#0f2942]" />
            <span className="text-xs text-slate-500 font-mono">Loading password recovery...</span>
          </div>
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
