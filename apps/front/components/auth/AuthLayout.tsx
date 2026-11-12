import { Activity, ScanLine, ShieldCheck } from "lucide-react";
import Image from "next/image";
import React from "react";

const FEATURES = [
  { icon: ScanLine, title: "Traçabilité par code-barres", text: "1 scan : production · 2 scans : stock · 3 scans : réparation." },
  { icon: Activity, title: "Suivi en temps réel", text: "Une vue instantanée de l'état de tout le parc matériel." },
  { icon: ShieldCheck, title: "Accès sécurisé par rôle", text: "Espaces distincts pour les administrateurs et les ouvriers." },
];

/** Mise en page des écrans de connexion et d'inscription. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-950">
      {/* Panneau de marque */}
      <aside className="relative hidden w-[44%] max-w-xl flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
        <div className="bg-grid absolute inset-0" />
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />

        <div className="relative">
          <div className="inline-flex rounded-xl bg-white px-4 py-2.5 shadow-sm">
            <Image src="/LOGO_SAGEMCOM.png" alt="Sagemcom" width={140} height={32} className="h-8 w-auto object-contain" priority />
          </div>
        </div>

        <div className="relative">
          <p className="text-sm font-medium uppercase tracking-wider text-sky-300">Sagemcom Tunisie</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight tracking-tight">
            Gestion des équipements industriels
          </h1>
          <p className="mt-4 max-w-md text-base text-slate-300">
            Digitalisez le suivi du parc matériel et réduisez les erreurs de saisie manuelle.
          </p>
          <ul className="mt-10 space-y-6">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
                  <Icon className="h-5 w-5 text-sky-300" />
                </span>
                <div>
                  <p className="font-medium">{title}</p>
                  <p className="mt-0.5 text-sm text-slate-400">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">© {new Date().getFullYear()} Sagemcom Tunisie — Traçabilité du parc matériel</p>
      </aside>

      {/* Formulaire */}
      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-12">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Image src="/LOGO_SAGEMCOM.png" alt="Sagemcom" width={140} height={32} className="h-8 w-auto object-contain dark:brightness-0 dark:invert" priority />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

/** Champ avec icône à gauche, utilisé par les écrans d'authentification. */
export function IconInput({
  icon,
  error,
  trailing,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon: React.ReactNode; error?: boolean; trailing?: React.ReactNode }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>
      <input
        {...props}
        className={`block h-11 w-full rounded-lg border bg-white pl-10 ${trailing ? "pr-11" : "pr-3"} text-sm text-slate-900 shadow-xs transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-4 dark:bg-slate-900 dark:text-white ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
            : "border-slate-300 focus:border-brand-500 focus:ring-brand-500/15 dark:border-slate-700"
        }`}
      />
      {trailing && <span className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</span>}
    </div>
  );
}
