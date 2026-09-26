"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/lib/i18n";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={false}
    >
      <I18nProvider>{children}</I18nProvider>
    </ThemeProvider>
  );
}
