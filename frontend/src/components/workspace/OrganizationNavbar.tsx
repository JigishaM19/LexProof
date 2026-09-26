"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n";
import {
  Building2,
  Layers,
  Globe,
  Sun,
  Moon,
  Laptop,
  LogOut,
  ChevronDown,
  Check,
  Menu,
  X,
  ShieldCheck,
  Users,
} from "lucide-react";
import { api, User as UserType } from "@/lib/api";
import { LexProofLogo } from "@/components/layout/Navbar";

export function OrganizationNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, setLocale, languages, currentLanguage } = useI18n();
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
    { label: "Overview", href: "/organization" },
    { label: "Verifications", href: "/organization/verifications" },
    { label: "Coverage Directory", href: "/verification/coverage" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" ref={navRef}>
        <div className="flex items-center justify-between h-16">
          
          {/* Brand & Workspace Identity */}
          <div className="flex items-center gap-4">
            <Link href="/organization" className="flex items-center gap-2.5 focus:outline-none">
              <LexProofLogo className="w-8 h-8" />
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-[#0f2942] dark:text-white tracking-tight">
                  LexProof
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200/60 dark:border-purple-800/60 flex items-center gap-1">
                  <Building2 className="w-2.5 h-2.5" />
                  Organization
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 ml-4" aria-label="Organization Workspace Navigation">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-[#0f2942] text-white dark:bg-purple-700 shadow-xs"
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
                <div className="absolute right-0 top-full mt-1.5 w-40 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-fadeIn">
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
                            ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <span>{lang.nativeLabel}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
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
                <div className="absolute right-0 top-full mt-1.5 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-fadeIn">
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
                            ? "bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Organization Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown("profile")}
                className="flex items-center gap-2 h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-5 h-5 rounded-full bg-purple-700 text-white flex items-center justify-center text-[10px] font-bold font-mono">
                  {currentUser?.institution?.charAt(0).toUpperCase() || currentUser?.full_name?.charAt(0).toUpperCase() || "O"}
                </div>
                <span className="hidden sm:inline-block text-xs font-semibold text-slate-800 dark:text-slate-200 max-w-[120px] truncate">
                  {currentUser?.institution || currentUser?.full_name || "Organization"}
                </span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${activeDropdown === "profile" ? "rotate-180" : ""}`} />
              </button>

              {activeDropdown === "profile" && (
                <div className="absolute right-0 top-full mt-1.5 w-64 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-lg mb-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#0f2942] dark:text-white truncate">
                        {currentUser?.institution || currentUser?.full_name || "Organization"}
                      </span>
                      <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
                        Organization
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                      {currentUser?.email}
                    </div>
                  </div>

                  <div className="space-y-0.5 text-xs">
                    <Link
                      href="/organization"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Organization Workspace</span>
                    </Link>

                    <Link
                      href="/organization/verifications"
                      onClick={() => setActiveDropdown(null)}
                      className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Batch Verifications</span>
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
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-1">
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
