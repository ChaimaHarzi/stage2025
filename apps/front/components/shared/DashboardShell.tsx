"use client";
import React from "react";
import { cn } from "@/lib/utils";
import AppHeader from "./Header/AppHeader";
import AppSidebar from "./Sidebar/AppSidebar";
import Backdrop from "./Sidebar/Backdrop";
import { SidebarProvider, useSidebar } from "./Sidebar/SidebarContext";
import { ThemeProvider } from "./Theme/ThemeContext";

function ShellLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded } = useSidebar();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AppSidebar />
      <Backdrop />
      <div className={cn("flex min-h-screen flex-col transition-[padding] duration-200 ease-out", isExpanded ? "lg:pl-64" : "lg:pl-[72px]")}>
        <AppHeader />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

/** Mise en page commune aux espaces administrateur et ouvrier. */
export default function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <ShellLayout>{children}</ShellLayout>
      </SidebarProvider>
    </ThemeProvider>
  );
}
