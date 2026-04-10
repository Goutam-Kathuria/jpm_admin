import { Layout } from "@/components/layout/Layout";
import type { PageId } from "@/components/layout/Sidebar";
import { ThemeCustomizer } from "@/components/ui-custom/ThemeCustomizer";
import { Toaster } from "@/components/ui/sonner";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { GalleryPage } from "@/pages/GalleryPage";
import { InquiriesPage } from "@/pages/InquiriesPage";
import { ProductsPage } from "@/pages/ProductsPage";
import { ReviewsPage } from "@/pages/ReviewsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { useThemeStore } from "@/store/themeStore";
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
    case "settings":
      return <SettingsPage />;
  }
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageId>("dashboard");
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
  }, [initTheme]);

  return (
    <>
      <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
        <PageContent page={currentPage} />
      </Layout>
      <ThemeCustomizer />
      <Toaster position="bottom-right" richColors />
    </>
  );
}
