"use client";

import React, { createContext, useContext, useCallback, useSyncExternalStore } from "react";
import { en } from "@/locales/en";
import { hi } from "@/locales/hi";
import { mr } from "@/locales/mr";

export type Locale = "en" | "hi" | "mr";

export interface LanguageOption {
  code: Locale;
  label: string;
  nativeLabel: string;
  short: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English", short: "EN" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी", short: "HI" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", short: "MR" },
];

export type TranslationNode = string | { [key: string]: TranslationNode };
export type TranslationDict = Record<string, TranslationNode>;

const translations: Record<Locale, TranslationDict> = {
  en: en as unknown as TranslationDict,
  hi: hi as unknown as TranslationDict,
  mr: mr as unknown as TranslationDict,
};

function deepMerge<T extends Record<string, any>>(target: T, source: Record<string, any>): T {
  const output = { ...target } as any;
  if (!source) return output;
  for (const key of Object.keys(target)) {
    if (key in source) {
      if (typeof target[key] === "object" && target[key] !== null && !Array.isArray(target[key])) {
        output[key] = deepMerge(target[key], source[key]);
      } else if (source[key] !== undefined) {
        output[key] = source[key];
      }
    }
  }
  return output;
}

export type TFunction = ((path: string, fallback?: string) => string) & typeof en;

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: TFunction;
  dict: typeof en;
  languages: LanguageOption[];
  currentLanguage: LanguageOption;
}

const defaultT = Object.assign(
  ((path: string, fallback?: string) => fallback || path) as unknown as TFunction,
  en
);

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: defaultT,
  dict: en,
  languages: LANGUAGES,
  currentLanguage: LANGUAGES[0],
});

function getClientLocale(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const saved = localStorage.getItem("lexproof_locale") as Locale;
    if (saved === "en" || saved === "hi" || saved === "mr") {
      return saved;
    }
  } catch {
    // localStorage not accessible
  }
  return "en";
}

function subscribeLocale(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("lexproof-locale-change", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("lexproof-locale-change", callback);
    window.removeEventListener("storage", callback);
  };
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useSyncExternalStore<Locale>(
    subscribeLocale,
    getClientLocale,
    () => "en"
  );

  const setLocale = useCallback((newLocale: Locale) => {
    try {
      localStorage.setItem("lexproof_locale", newLocale);
      document.cookie = `lexproof_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLocale;
      }
    } catch (e) {
      console.warn("Could not save locale:", e);
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("lexproof-locale-change", { detail: newLocale }));
    }
  }, []);

  const activeDict = React.useMemo(() => {
    if (locale === "en") return en;
    return deepMerge(en, (translations[locale] || {}) as any);
  }, [locale]);

  const t = useCallback(
    (path: string, fallback?: string): string => {
      const keys = path.split(".");

      // 1. Try active locale
      let current: TranslationNode | undefined = translations[locale];
      let found = true;
      for (const key of keys) {
        if (current && typeof current === "object" && key in current) {
          current = current[key];
        } else {
          found = false;
          break;
        }
      }

      if (found && typeof current === "string") {
        return current;
      }

      // 2. Fallback to English
      let fallbackCurrent: TranslationNode | undefined = translations["en"];
      for (const key of keys) {
        if (fallbackCurrent && typeof fallbackCurrent === "object" && key in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[key];
        } else {
          return fallback || path;
        }
      }

      return typeof fallbackCurrent === "string" ? fallbackCurrent : fallback || path;
    },
    [locale]
  );

  const tWithDict = React.useMemo(() => {
    return Object.assign(t as unknown as TFunction, activeDict);
  }, [t, activeDict]);

  const currentLanguage = LANGUAGES.find((l) => l.code === locale) || LANGUAGES[0];

  return (
    <I18nContext.Provider
      value={{
        locale,
        setLocale,
        t: tWithDict,
        dict: activeDict,
        languages: LANGUAGES,
        currentLanguage,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

export const useTranslation = useI18n;
