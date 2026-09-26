import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LexProof - Understand. Analyze. Verify.",
  description: "Enterprise educational document intelligence and authoritative credential verification platform.",
  icons: {
    icon: "/favicon.ico",
  },
};

import { AppProviders } from "@/components/providers/AppProviders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="bg-[#faf8ff] dark:bg-[#090d16] text-slate-800 dark:text-slate-100 font-sans min-h-screen relative overflow-x-hidden selection:bg-blue-100 selection:text-[#0f2942] transition-colors duration-200">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

