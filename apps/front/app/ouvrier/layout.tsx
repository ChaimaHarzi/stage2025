/** @format */
"use client";
import AppHeader from "@/components/shared/Header/AppHeader";
import { SidebarProvider, useSidebar } from "@/components/shared/Sidebar/SidebarContext";
import { ThemeProvider } from "@/components/shared/Theme/ThemeContext";
import AppSidebar from "@/components/shared/Sidebar/AppSidebar";
import Backdrop from "@/components/shared/Sidebar/Backdrop";
import React from "react";

const OuvrierPageLayout = ({ children }: { children: React.ReactNode }) => {
    const { isExpanded, isMobileOpen, isHovered } = useSidebar();
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            <AppSidebar />
            <Backdrop />
            <div className={`relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${(isExpanded || isHovered) && !isMobileOpen ? 'lg:ml-[290px]' : 'lg:ml-[90px]'}`}>
                <AppHeader />
                <main>
                    <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

export default function OuvrierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
        <SidebarProvider>
            <OuvrierPageLayout>{children}</OuvrierPageLayout>
        </SidebarProvider>
    </ThemeProvider>
  );
}
