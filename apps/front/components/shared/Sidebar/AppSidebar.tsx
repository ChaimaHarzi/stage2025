"use client";
import { LogOut } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import { ADMIN_NAV, type NavItem, OUVRIER_NAV, PROFILE_ITEM } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { useSidebar } from "./SidebarContext";

function NavLink({ item, collapsed, active }: { item: NavItem; collapsed: boolean; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.path}
      title={collapsed ? item.name : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white",
      )}
    >
      {active && <span className="absolute -left-3 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-600" />}
      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-brand-600 dark:text-brand-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
      {!collapsed && <span className="truncate">{item.name}</span>}
    </Link>
  );
}

/** Menu latéral : regroupé par sections, repliable sur grand écran, en tiroir sur mobile. */
export default function AppSidebar() {
  const { isExpanded, isMobileOpen, closeMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user.role;
  const sections = role === "ADMIN" ? ADMIN_NAV : OUVRIER_NAV;
  const profile = PROFILE_ITEM(role);
  // Sur mobile, le tiroir est toujours affiché en version complète.
  const collapsed = !isExpanded && !isMobileOpen;

  // Fermer le tiroir mobile après navigation.
  useEffect(() => closeMobileSidebar(), [pathname, closeMobileSidebar]);

  const initials = (session?.user.name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-[width,transform] duration-200 ease-out dark:border-slate-800 dark:bg-slate-900",
        collapsed ? "w-[72px]" : "w-64",
        isMobileOpen ? "translate-x-0 shadow-xl" : "-translate-x-full lg:translate-x-0",
      )}
      aria-label="Navigation principale"
    >
      {/* Marque */}
      <div className={cn("flex h-16 shrink-0 items-center border-b border-slate-100 dark:border-slate-800", collapsed ? "justify-center" : "px-5")}>
        <Link href={role === "ADMIN" ? "/admin/dashboard" : "/ouvrier"} className="flex items-center gap-2.5">
          {collapsed ? (
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-brand-600 text-sm font-bold text-white">
              S
            </span>
          ) : (
            <div className="flex flex-col">
              <Image src="/LOGO_SAGEMCOM.png" alt="Sagemcom" width={128} height={28} className="h-7 w-auto object-contain dark:brightness-0 dark:invert" priority />
              <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-slate-400">Parc équipements</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.title} className="mb-6">
            {collapsed ? (
              <div className="mx-auto mb-2 h-px w-6 bg-slate-200 dark:bg-slate-800" />
            ) : (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{section.title}</p>
            )}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.path}>
                  <NavLink item={item} collapsed={collapsed} active={pathname === item.path} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Compte */}
      <div className="shrink-0 border-t border-slate-100 p-3 dark:border-slate-800">
        <NavLink item={profile} collapsed={collapsed} active={pathname === profile.path} />
        <div className={cn("mt-2 flex items-center gap-3 rounded-lg p-2", collapsed && "justify-center p-0 pt-2")}>
          {!collapsed && (
            <>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-white">{session?.user.name}</p>
                <p className="truncate text-xs text-slate-500">{role === "ADMIN" ? "Administrateur" : "Ouvrier"}</p>
              </div>
            </>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            title="Se déconnecter"
            aria-label="Se déconnecter"
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
