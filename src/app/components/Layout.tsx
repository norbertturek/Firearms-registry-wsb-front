import { Outlet, useNavigate, useLocation } from "react-router";
import { Button } from "./ui/button";
import { LogOut, ChevronLeft, Home, FileText, Shield, PlusCircle, CheckSquare, FileCheck } from "lucide-react";
import { WPA_REVIEW_BAR_PORTAL_ID } from "./wpa/WpaApplicationReviewBar";
import { contentColumnClass } from "../utils/layout";
import { cn } from "./ui/utils";
import { AppLogo } from "./AppLogo";

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if we're on the login page
  const isLoginPage = location.pathname === "/";
  
  // Get role from localStorage or fallback to citizen
  const getUserRole = () => {
    return localStorage.getItem("userRole") || "citizen";
  };

  const userRole = getUserRole();

  const roleHomePath: Record<string, string> = {
    citizen: "/citizen",
    officer: "/officer",
    shop: "/shop",
  };
  const homePath = roleHomePath[userRole] ?? "/citizen";

  const isNavItemActive = (itemPath: string) => {
    const path = location.pathname;
    if (itemPath === "/applications") {
      return path === "/applications" || path.startsWith("/applications/");
    }
    if (itemPath === "/application/new") {
      return path === "/application/new";
    }
    if (itemPath === "/wpa/search") {
      return path === "/wpa/search";
    }
    return path === itemPath;
  };

  const isDashboardPath = ["/citizen", "/officer", "/shop"].includes(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/");
  };

  // Mobile Bottom Navigation mapping
  const getMobileNavigation = () => {
    switch (userRole) {
      case "citizen":
        return [
          { label: "Pulpit", path: "/citizen", icon: Home },
          { label: "Wnioski", path: "/applications", icon: FileText },
          { label: "Broń", path: "/weapons", icon: Shield },
          { label: "Nowy", path: "/application/new", icon: PlusCircle },
        ];
      case "officer":
        return [
          { label: "Pulpit", path: "/officer", icon: Home },
          { label: "Zadania", path: "/applications", icon: CheckSquare },
          { label: "Rejestr", path: "/wpa/search", icon: Shield },
        ];
      case "shop":
        return [
          { label: "Pulpit", path: "/shop", icon: Home },
          { label: "Sprzedaż", path: "/shop/sale", icon: FileCheck },
        ];
      default:
        return [];
    }
  };

  const navigation = getMobileNavigation();
  const navTarget = (item: { path: string; search?: string }) =>
    `${item.path}${item.search ?? ""}`;

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      {/* Top App Bar - Mobile & Desktop */}
      {!isLoginPage && (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back button logic */}
              {!isDashboardPath && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="mr-1 h-10 w-10 rounded-full"
                  aria-label="Wróć"
                >
                  <ChevronLeft className="h-6 w-6 text-primary" />
                </Button>
              )}
              <button
                type="button"
                onClick={() => navigate(homePath)}
                className="flex items-center gap-2.5 rounded-xl hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Przejdź do pulpitu"
              >
                <AppLogo size="lg" />
                <span className="text-xl font-bold text-foreground">e-Broń</span>
              </button>
            </div>
            
            <div className="flex items-center gap-2">
              <nav className="hidden md:flex items-center gap-2 mr-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      onClick={() => navigate(navTarget(item))}
                      variant={isNavItemActive(item.path) ? "default" : "ghost"}
                      className={`h-10 px-4 rounded-xl font-medium ${
                        isNavItemActive(item.path) ? "bg-primary text-primary-foreground shadow-sm" : ""
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  );
                })}
              </nav>

              <Button
                onClick={handleLogout}
                variant="ghost"
                className="h-10 shrink-0 rounded-xl px-2.5 md:px-3 text-muted-foreground hover:text-foreground gap-1.5"
              >
                <LogOut className="h-5 w-5 shrink-0" aria-hidden />
                <span className="text-sm font-medium">Wyloguj się</span>
              </Button>
            </div>
          </div>
        </header>
      )}

      {!isLoginPage && (
        <div
          id={WPA_REVIEW_BAR_PORTAL_ID}
          className="sticky top-16 z-40 w-full empty:hidden border-b border-border bg-white/95 backdrop-blur-md"
        />
      )}

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 flex flex-col pt-4 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-8",
          contentColumnClass,
        )}
      >
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      {!isLoginPage && (
        <nav
          aria-label="Nawigacja główna"
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-white px-2 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-4px_12px_rgba(0,0,0,0.05)]"
        >
          <div className="flex h-16 items-stretch gap-1.5 px-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = isNavItemActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(navTarget(item))}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-0.5 min-h-0 h-full rounded-xl cursor-pointer",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <Icon className="h-6 w-6" aria-hidden />
                  <span className="text-[11px] font-medium tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
