/** @format */
"use client";

import AppHeader from "@/components/shared/Header/AppHeader";
import { SidebarProvider, useSidebar } from "@/components/shared/Sidebar/SidebarContext";
import { ThemeProvider } from "@/components/shared/Theme/ThemeContext";
import AppSidebar from "@/components/shared/Sidebar/AppSidebar";
import Backdrop from "@/components/shared/Sidebar/Backdrop";
import React, { useEffect } from "react";

const AdminPageLayout = ({ children }: { children: React.ReactNode }) => {
    useEffect(() => {
        import('preline');
    }, []);
    const { isExpanded, isMobileOpen, isHovered } = useSidebar();
    return (
        <div className="flex h-screen bg-white">
            <AppSidebar />
            <Backdrop />
            <div className={`relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${(isExpanded || isHovered) && !isMobileOpen ? 'lg:ml-[290px]' : 'lg:ml-[90px]'}`}>
                <AppHeader />
                <main className="bg-[#f5f6fa] min-h-screen">
                    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
        <SidebarProvider>
            <AdminPageLayout>{children}</AdminPageLayout>
        </SidebarProvider>
    </ThemeProvider>
  );
}
