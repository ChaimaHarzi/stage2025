"use client";
import { useSidebar } from "./SidebarContext";

/** Fond sombre derrière le menu en tiroir (mobile). */
export default function Backdrop() {
  const { isMobileOpen, closeMobileSidebar } = useSidebar();
  if (!isMobileOpen) return null;
  return <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[1px] lg:hidden" onClick={closeMobileSidebar} />;
}
