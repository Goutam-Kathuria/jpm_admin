import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import type { PageId } from "./Sidebar";

const pageTitles: Record<PageId, string> = {
  dashboard: "Dashboard",
  inquiries: "Inquiries",
  categories: "Categories",
  products: "Products",
  gallery: "Gallery",
  blogs: "Blogs",
  reviews: "Reviews",
  "website-content": "Website Content",
  settings: "Settings",
};

interface NavbarProps {
  currentPage: PageId;
  onMenuToggle: () => void;
  adminDisplayName: string;
  onLogout: () => void;
}

function getInitials(name: string) {
  const segments = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (segments.length === 0) {
    return "AD";
  }

  return segments.map((segment) => segment[0]?.toUpperCase() ?? "").join("");
}

export function Navbar({
  currentPage,
  onMenuToggle,
  adminDisplayName,
  onLogout,
}: NavbarProps) {
  return (
    <header className="h-16 flex items-center gap-4 px-6 bg-card border-b border-border shrink-0">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden text-muted-foreground hover:text-foreground"
        onClick={onMenuToggle}
        aria-label="Toggle menu"
        data-ocid="navbar-menu-toggle"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <h1 className="font-display text-lg font-semibold text-foreground hidden md:block">
        {pageTitles[currentPage]}
      </h1>

      <div className="flex-1" />

      <div className="relative hidden sm:flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search..."
          className="pl-9 w-56 bg-muted/50 border-transparent focus:border-input focus:bg-background text-sm"
          data-ocid="navbar-search"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground hover:text-foreground relative"
        aria-label="Notifications"
        data-ocid="navbar-notifications"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
      </Button>

      <div
        className="hidden md:flex items-center gap-2 rounded-full border border-border bg-muted/30 px-3 py-1.5"
        data-ocid="navbar-profile"
      >
        <Avatar className="w-8 h-8 border border-border">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            {getInitials(adminDisplayName)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col leading-none">
          <span className="text-sm font-medium text-foreground">
            {adminDisplayName}
          </span>
          <span className="text-xs text-muted-foreground">Token session</span>
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onLogout}
        data-ocid="logout-button"
      >
        <LogOut className="w-4 h-4" />
        <span className="hidden sm:inline">Logout</span>
      </Button>
    </header>
  );
}
