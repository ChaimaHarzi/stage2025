"use client";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

type SidebarContextType = {
  /** Menu déplié sur grand écran (sinon : icônes seules). */
  isExpanded: boolean;
  /** Menu ouvert en tiroir sur mobile. */
  isMobileOpen: boolean;
  toggleSidebar: () => void;
  toggleMobileSidebar: () => void;
  closeMobileSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within a SidebarProvider");
  return context;
};

const STORAGE_KEY = "sidebar-expanded";

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Préférence mémorisée entre les visites.
  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "false") setIsExpanded(false);
    } catch {}
  }, []);

  // Le tiroir mobile se ferme quand on repasse en grand écran.
  useEffect(() => {
    const onResize = () => window.innerWidth >= 1024 && setIsMobileOpen(false);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsExpanded((prev) => {
      try {
        localStorage.setItem(STORAGE_KEY, String(!prev));
      } catch {}
      return !prev;
    });
  }, []);

  const toggleMobileSidebar = useCallback(() => setIsMobileOpen((prev) => !prev), []);
  const closeMobileSidebar = useCallback(() => setIsMobileOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isExpanded, isMobileOpen, toggleSidebar, toggleMobileSidebar, closeMobileSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};
