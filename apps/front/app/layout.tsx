/** @format */
"use client";
import "./globals.css";
import 'flowbite';
import { Theme } from "@radix-ui/themes";
import { Inter } from "next/font/google";
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
});

import { SessionProvider } from "next-auth/react";
import 'datatables.net-dt/css/jquery.dataTables.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fr' className={inter.variable}>
      <body>
  <Theme>
        <SessionProvider>
          <main className="bg-[#f5f6fa] min-h-screen">
            {children}
          </main>
        </SessionProvider>
  </Theme>
      </body>
    </html>
  );
}
