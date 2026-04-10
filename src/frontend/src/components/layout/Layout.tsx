import { cn } from "@/lib/utils";
import { useThemeStore } from "@/store/themeStore";
import { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { type PageId, Sidebar } from "./Sidebar";

interface LayoutProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  children: React.ReactNode;
}

export function Layout({ currentPage, onNavigate, children }: LayoutProps) {
  const { settings } = useThemeStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Apply dark class on html element
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.darkMode]);

  return (
    <div className={cn("flex h-screen overflow-hidden bg-background")}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm md:hidden cursor-default"
          onClick={() => setMobileOpen(false)}
          onKeyDown={(e) => e.key === "Escape" && setMobileOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile slide-over */}
      <div
        className={cn(
          "shrink-0 transition-all duration-300",
          "hidden md:flex md:flex-col",
        )}
      >
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            onNavigate(page);
            setMobileOpen(false);
          }}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
      </div>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col md:hidden transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            onNavigate(page);
            setMobileOpen(false);
          }}
          collapsed={false}
          onToggleCollapse={() => setMobileOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar
          currentPage={currentPage}
          onMenuToggle={() => setMobileOpen((v) => !v)}
        />
        <main
          className="flex-1 overflow-y-auto bg-background p-6"
          data-ocid="main-content"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
