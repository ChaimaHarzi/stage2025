import AppHeader from "@/components/shared/Header/AppHeader";
import { SidebarProvider } from "@/components/shared/Sidebar/SidebarContext";
import { ThemeProvider } from "@/components/shared/Theme/ThemeContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
<ThemeProvider>
  <SidebarProvider>
      <AppHeader />
      <main>
      {children}
      </main>
  </SidebarProvider>
</ThemeProvider>
    </>
  );
}
