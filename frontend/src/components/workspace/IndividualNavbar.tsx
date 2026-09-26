"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n";
import {
  Shield,
  FileText,
  Layers,
  Search,
  Globe,
  Sun,
  Moon,
  Laptop,
  User,
  LogOut,
  ChevronDown,
  Check,
  Menu,
  X,
  FileCheck,
  ExternalLink,
} from "lucide-react";
import { api, User as UserType } from "@/lib/api";
import { LexProofLogo } from "@/components/layout/Navbar";

export function IndividualNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale, t, languages, currentLanguage } = useI18n();
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [mounted, setMounted] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    setCurrentUser(api.getCurrentUser());

    const handleAuthChange = () => {
      setCurrentUser(api.getCurrentUser());
    };
    window.addEventListener("lexproof-auth-change", handleAuthChange);
    return () => window.removeEventListener("lexproof-auth-change", handleAuthChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (e) {
      console.warn("Logout error:", e);
    }
    api.clearToken();
    router.push("/");
  };

  const navLinks = [
    { label: "Overview", href: "/individual" },
    { label: "Cases & History", href: "/individual/cases" },
    { label: "Coverage Directory", href: "/verification/coverage" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={navRef}>
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Workspace Identity */}
          <div className="flex items-center gap-4">
            <Link href="/individual" className="flex items-center gap-2.5 focus:outline-none">
              <LexProofLogo className="w-8 h-8" />
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#0f2942] dark:text-white tracking-tight">
                  LexProof
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                  Individual
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Individual Workspace Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-[#0f2942] text-white dark:bg-blue-600 shadow-xs"
                        : "text-slate-600 dark:text-slate-300 hover:text-[#0f2942] dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Tools: Language | Theme | Profile */}
          <div className="flex items-center gap-2">
            
            {/* Language Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("language")}
                className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-medium flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="uppercase font-mono text-[11px] font-bold">{currentLanguage.short}</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDropdown === "language" ? "rotate-180" : ""}`} />
              </button>

              {activeDropdown === "language" && (
                <div className="absolute right-0 top-full mt-1.5 w-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-slideDown">
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
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span>{lang.nativeLabel}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("theme")}
                className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Toggle Theme"
              >
                {mounted ? (
                  resolvedTheme === "dark" ? (
                    <Moon className="w-3.5 h-3.5 text-amber-300" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                  )
                ) : (
                  <Sun className="w-3.5 h-3.5 text-slate-400" />
                )}
              </button>

              {activeDropdown === "theme" && (
                <div className="absolute right-0 top-full mt-1.5 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-slideDown">
                  {[
                    { id: "light", label: "Light", icon: Sun },
                    { id: "dark", label: "Dark", icon: Moon },
                    { id: "system", label: "System", icon: Laptop },
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
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                          isSelected
                            ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
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

            {/* User Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("profile")}
                className="flex items-center gap-2 h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-[#0f2942] dark:bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold font-mono">
                  {currentUser?.full_name?.charAt(0).toUpperCase() || "I"}
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                  {currentUser?.full_name || "Individual User"}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDropdown === "profile" ? "rotate-180" : ""}`} />
              </button>

              {activeDropdown === "profile" && (
                <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-slideDown">
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg mb-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#0f2942] dark:text-white truncate">
                        {currentUser?.full_name || "Individual"}
                      </span>
                      <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Individual
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                      {currentUser?.email}
                    </div>
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <Link
                      href="/individual"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Individual Workspace</span>
                    </Link>

                    <Link
                      href="/individual/cases"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>My Verification Cases</span>
                    </Link>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((p) => !p)}
              className="md:hidden p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Open Mobile Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1 animate-slideDown">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold ${
                  pathname === link.href
                    ? "bg-[#0f2942] text-white"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
