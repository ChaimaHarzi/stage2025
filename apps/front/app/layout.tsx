/** @format */

"use client";

import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
});

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/shared/Theme/ThemeContext";
import AppHeader from "@/components/shared/Header/AppHeader";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fr' className={inter.variable}>
      <body>
        <SessionProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider> 
        </SessionProvider>
      </body>
    </html>
  );
}
