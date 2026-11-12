import {
  Boxes,
  FolderTree,
  LayoutDashboard,
  type LucideIcon,
  ScanLine,
  ScrollText,
  Tags,
  UserRound,
  Users,
} from "lucide-react";

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

/** Menu de l'administrateur, regroupé par usage. */
export const ADMIN_NAV: NavSection[] = [
  {
    title: "Pilotage",
    items: [
      { name: "Tableau de bord", path: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Équipements", path: "/admin/equipements", icon: Boxes },
      { name: "Journal des scans", path: "/admin/logs", icon: ScrollText },
    ],
  },
  {
    title: "Référentiel",
    items: [
      { name: "Catégories", path: "/admin/categories", icon: Tags },
      { name: "Familles", path: "/admin/familles", icon: FolderTree },
    ],
  },
  {
    title: "Administration",
    items: [{ name: "Utilisateurs", path: "/admin/users", icon: Users }],
  },
];

/** Menu de l'ouvrier : volontairement réduit à l'essentiel. */
export const OUVRIER_NAV: NavSection[] = [
  {
    title: "Atelier",
    items: [{ name: "Scan & équipements", path: "/ouvrier", icon: ScanLine }],
  },
];

export const PROFILE_ITEM = (role?: string): NavItem => ({
  name: "Mon profil",
  path: role === "ADMIN" ? "/admin/profile" : "/ouvrier/profile",
  icon: UserRound,
});

/** Libellé de la page courante, pour le fil d'Ariane de l'en-tête. */
export function pageTitle(pathname: string): string {
  if (pathname.endsWith("/profile")) return "Mon profil";
  const all = [...ADMIN_NAV, ...OUVRIER_NAV].flatMap((s) => s.items);
  return all.find((i) => i.path === pathname)?.name ?? "";
}
