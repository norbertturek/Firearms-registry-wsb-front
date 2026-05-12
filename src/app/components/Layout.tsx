import { Outlet, useNavigate, useLocation } from "react-router";
import { Button } from "./ui/button";
import { Menu, LogOut, ChevronLeft, Home, FileText, Shield, User, PlusCircle, CheckSquare, Search } from "lucide-react";
import { useState, useEffect } from "react";

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
          { label: "Rejestr", path: "/weapons", icon: Shield },
        ];
      case "shop":
        return [
          { label: "Pulpit", path: "/shop", icon: Home },
          { label: "Weryfikuj", path: "/shop/verify", icon: Search },
          { label: "Sprzedaż", path: "/applications", icon: FileText },
        ];
      default:
        return [];
    }
  };

  const navigation = getMobileNavigation();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      {/* Top App Bar - Mobile & Desktop */}
      {!isLoginPage && (
        <header className="sticky top-0 z-50 w-full border-b border-border bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back button logic */}
              {!["/citizen", "/officer", "/shop"].includes(location.pathname) && (
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
              <h1 className="text-xl font-bold text-foreground">
                e-Broń
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <nav className="hidden md:flex gap-1 mr-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      variant={location.pathname === item.path ? "default" : "ghost"}
                      className={`h-10 px-4 rounded-xl font-medium ${
                        location.pathname === item.path ? "bg-primary text-primary-foreground shadow-sm" : ""
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
                size="icon"
                className="h-10 w-10 rounded-full text-muted-foreground hover:text-foreground"
                aria-label="Wyloguj"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 pb-24 md:pb-8 w-full flex flex-col">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      {!isLoginPage && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border px-2 pb-[env(safe-area-inset-bottom)] pt-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] z-50">
          <div className="flex justify-around items-center h-16">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex flex-col items-center justify-center w-full h-full gap-1 min-h-[44px] transition-colors ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  <div className={`p-1 rounded-xl transition-all ${isActive ? "bg-primary/10" : ""}`}>
                    <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <span className={`text-[11px] font-medium tracking-wide ${isActive ? "font-bold" : ""}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
