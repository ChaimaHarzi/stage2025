/** Constantes partagées entre code serveur et client (pas de directive "use client"). */

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/graphql";

/** Page d'accueil de chaque rôle après connexion. */
export const HOME_BY_ROLE = { ADMIN: "/admin/dashboard", OUVRIER: "/ouvrier" } as const;

export type Status = "STOCK" | "PROD" | "REP";

/** Libellés et styles des statuts d'équipement. */
export const STATUS_INFO: Record<Status, { label: string; badge: string; dot: string; soft: string; text: string; hex: string }> = {
  PROD: {
    label: "En production",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20",
    dot: "bg-emerald-500",
    soft: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    hex: "#10b981",
  },
  STOCK: {
    label: "En stock",
    badge: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-400 dark:ring-sky-500/20",
    dot: "bg-sky-500",
    soft: "bg-sky-50 dark:bg-sky-500/10",
    text: "text-sky-600 dark:text-sky-400",
    hex: "#0ea5e9",
  },
  REP: {
    label: "En réparation",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20",
    dot: "bg-amber-500",
    soft: "bg-amber-50 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    hex: "#f59e0b",
  },
};

/** Logique métier : nombre de scans → nouveau statut. */
export const STATUS_PAR_SCANS: Record<number, Status> = { 1: "PROD", 2: "STOCK", 3: "REP" };

/** Couleurs proposées pour les catégories et familles (classes Tailwind écrites en entier pour la compilation). */
export const COULEURS = {
  blue: { dot: "bg-blue-500", light: "bg-blue-50 dark:bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", hex: "#3b82f6" },
  green: { dot: "bg-emerald-500", light: "bg-emerald-50 dark:bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", hex: "#10b981" },
  purple: { dot: "bg-violet-500", light: "bg-violet-50 dark:bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", hex: "#8b5cf6" },
  orange: { dot: "bg-orange-500", light: "bg-orange-50 dark:bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", hex: "#f97316" },
  pink: { dot: "bg-pink-500", light: "bg-pink-50 dark:bg-pink-500/10", text: "text-pink-600 dark:text-pink-400", hex: "#ec4899" },
  indigo: { dot: "bg-indigo-500", light: "bg-indigo-50 dark:bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", hex: "#6366f1" },
} as const;

export type Couleur = keyof typeof COULEURS;

export const couleur = (c: string) => COULEURS[(c as Couleur) in COULEURS ? (c as Couleur) : "blue"];

export const formatDate = (iso?: string | null, withTime = false) =>
  iso
    ? new Date(iso).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
      })
    : "—";
