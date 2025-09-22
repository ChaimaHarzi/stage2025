/** @format */
import "./globals.css";
import 'flowbite';
import { Theme } from "@radix-ui/themes";
import { Inter } from "next/font/google";
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
});

import 'datatables.net-dt/css/jquery.dataTables.css';
import SessionWrapper from "../components/providers/SessionWrapper";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='fr' className={inter.variable}>
      <body>
  <Theme>
        <SessionWrapper>
          <main className="bg-[#f5f6fa] min-h-screen">
            {children}
          </main>
        </SessionWrapper>
  </Theme>
      </body>
    </html>
  );
}
