import { Layout } from "@/components/layout/Layout";
import type { PageId } from "@/components/layout/Sidebar";
import { ThemeCustomizer } from "@/components/ui-custom/ThemeCustomizer";
import { Toaster } from "@/components/ui/sonner";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { GalleryPage } from "@/pages/GalleryPage";
import { InquiriesPage } from "@/pages/InquiriesPage";
import { LoginPage } from "@/pages/LoginPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ReviewsPage } from "@/pages/ReviewsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { WebsiteContentPage } from "@/pages/WebsiteContentPage";
import { useAdminAuthStore } from "@/store/adminAuthStore";
import { useThemeStore } from "@/store/themeStore";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

function PageContent({ page }: { page: PageId }) {
  switch (page) {
    case "dashboard":
      return <DashboardPage />;
    case "inquiries":
      return <InquiriesPage />;
    case "categories":
      return <CategoriesPage />;
    case "products":
      return <ProductsPage />;
    case "gallery":
      return <GalleryPage />;
    case "reviews":
      return <ReviewsPage />;
    case "website-content":
      return <WebsiteContentPage />;
    case "settings":
      return <SettingsPage />;
  }
}

function SessionLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="font-display text-xl font-semibold text-foreground">
            Checking admin session
          </p>
          <p className="text-sm text-muted-foreground">
            Verifying your saved token with the backend.
          </p>
        </div>
      </div>
    </div>
  );
}

function AuthenticatedApp() {
  const queryClient = useQueryClient();
  const session = useAdminAuthStore((state) => state.session);
  const logout = useAdminAuthStore((state) => state.logout);
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard");

  function handleLogout() {
    queryClient.clear();
    logout();
    setCurrentPage("dashboard");
  }

  return (
    <>
      <Layout
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        adminDisplayName={session?.displayName ?? "Admin"}
        onLogout={handleLogout}
      >
        <PageContent page={currentPage} />
      </Layout>
      <ThemeCustomizer />
    </>
  );
}

export default function App() {
  const initTheme = useThemeStore((state) => state.initTheme);
  const initAuth = useAdminAuthStore((state) => state.initAuth);
  const authStatus = useAdminAuthStore((state) => state.status);

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  return (
    <>
      {authStatus === "checking" ? (
        <SessionLoader />
      ) : authStatus === "authenticated" ? (
        <AuthenticatedApp />
      ) : (
        <LoginPage />
      )}
      <Toaster position="bottom-right" richColors />
    </>
  );
}
