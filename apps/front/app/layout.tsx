/** @format */
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import SessionWrapper from "../components/providers/SessionWrapper";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Sagemcom — Parc équipements", template: "%s · Sagemcom" },
  description: "Gestion des équipements industriels avec traçabilité par code-barres",
};

/** Applique le thème enregistré avant l'affichage, pour éviter un flash blanc en mode sombre. */
const themeScript = `try{if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark")}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <SessionWrapper>
          {children}
          <Toaster position="top-right" richColors closeButton toastOptions={{ className: "font-sans" }} />
        </SessionWrapper>
      </body>
    </html>
  );
}
