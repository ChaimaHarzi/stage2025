"use client";
import { ChevronRight, Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { pageTitle } from "@/lib/navigation";
import { useSidebar } from "../Sidebar/SidebarContext";
import { ThemeToggleButton } from "./ThemeToggleButton";
import UserDropdown from "./UserDropdown";

/** Barre supérieure : bouton du menu, fil d'Ariane, thème et compte. */
export default function AppHeader() {
  const { isExpanded, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();
  const espace = session?.user.role === "ADMIN" ? "Administration" : "Atelier";
  const title = pageTitle(pathname);

  const iconButton =
    "flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/80">
      <button onClick={toggleMobileSidebar} className={`${iconButton} lg:hidden`} aria-label="Ouvrir le menu">
        <Menu className="h-5 w-5" />
      </button>
      <button
        onClick={toggleSidebar}
        className={`${iconButton} hidden lg:flex`}
        aria-label={isExpanded ? "Réduire le menu" : "Déplier le menu"}
        title={isExpanded ? "Réduire le menu" : "Déplier le menu"}
      >
        {isExpanded ? <PanelLeftClose className="h-5 w-5" /> : <PanelLeftOpen className="h-5 w-5" />}
      </button>

      <div className="hidden h-5 w-px bg-slate-200 sm:block dark:bg-slate-700" />

      <nav aria-label="Fil d'Ariane" className="flex min-w-0 items-center gap-1.5 text-sm">
        <span className="hidden text-slate-500 sm:inline">{espace}</span>
        {title && (
          <>
            <ChevronRight className="hidden h-4 w-4 text-slate-300 sm:block dark:text-slate-600" />
            <span className="truncate font-medium text-slate-900 dark:text-white">{title}</span>
          </>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <ThemeToggleButton />
        <div className="mx-1 hidden h-6 w-px bg-slate-200 sm:block dark:bg-slate-700" />
        <UserDropdown />
      </div>
    </header>
  );
}
