import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Menu, Search } from "lucide-react";
import type { PageId } from "./Sidebar";

const pageTitles: Record<PageId, string> = {
  dashboard: "Dashboard",
  inquiries: "Inquiries",
  categories: "Categories",
  products: "Products",
  gallery: "Gallery",
  reviews: "Reviews",
  settings: "Settings",
};

interface NavbarProps {
  currentPage: PageId;
  onMenuToggle: () => void;
}

export function Navbar({ currentPage, onMenuToggle }: NavbarProps) {
  return (
    <header className="h-16 flex items-center gap-4 px-6 bg-card border-b border-border shrink-0">
      {/* Mobile menu button */}
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

      {/* Page title */}
      <h1 className="font-display text-lg font-semibold text-foreground hidden md:block">
        {pageTitles[currentPage]}
      </h1>

      <div className="flex-1" />

      {/* Search */}
      <div className="relative hidden sm:flex items-center">
        <Search className="absolute left-3 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search..."
          className="pl-9 w-56 bg-muted/50 border-transparent focus:border-input focus:bg-background text-sm"
          data-ocid="navbar-search"
        />
      </div>

      {/* Notifications */}
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

      {/* Profile */}
      <div
        className="flex items-center gap-2 cursor-pointer group"
        data-ocid="navbar-profile"
      >
        <Avatar className="w-8 h-8 border border-border">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
            AD
          </AvatarFallback>
        </Avatar>
        <div className="hidden md:flex flex-col leading-none">
          <span className="text-sm font-medium text-foreground">Admin</span>
          <span className="text-xs text-muted-foreground">admin@luxe.co</span>
        </div>
      </div>
    </header>
  );
}
