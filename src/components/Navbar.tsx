import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, User, Search, LogOut, LayoutDashboard, Shield, Store, Code, ChevronRight, MessageCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useChat } from "@/context/ChatContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems } = useCart();
  const { user, logout, isAdmin } = useAuth();
  const { toggleChat } = useChat();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { label: "Beranda", href: "/", icon: null },
    { label: "Store", href: "/products", icon: Store },
    { label: "Kategori", href: "/categories", icon: null },
    { label: "Custom Script", href: "/custom-order", icon: Code },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "glass-strong shadow-sm" : "glass"}`}>
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-300">
            <span className="text-primary-foreground font-extrabold text-sm">P</span>
          </div>
          <span className="font-extrabold text-lg text-foreground tracking-tight">
            Pasto<span className="text-gradient">DEV</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((l) => (
            <Link
              key={l.href}
              to={l.href}
              className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-1.5 ${
                isActive(l.href)
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {l.icon && <l.icon className="h-4 w-4" />}
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link to="/products">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent transition-colors">
              <Search className="h-4 w-4" />
            </Button>
          </Link>
          {user && (
            <Link to="/topup" title="Top Up Saldo">
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent transition-colors text-primary">
                <Wallet className="h-4 w-4" />
              </Button>
            </Link>
          )}
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-accent transition-colors">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center animate-scale-in shadow-md">
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-accent transition-colors"
            onClick={toggleChat}
          >
            <MessageCircle className="h-4 w-4" />
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="hidden md:inline-flex gap-2 rounded-xl border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <User className="h-3.5 w-3.5 text-primary-foreground" />
                  </div>
                  <span className="max-w-[100px] truncate text-xs font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-xl shadow-xl border-border/50 animate-scale-in">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer rounded-lg">
                    <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center gap-2 cursor-pointer rounded-lg">
                      <Shield className="h-4 w-4 text-primary" /> Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive cursor-pointer rounded-lg">
                  <LogOut className="h-4 w-4 mr-2" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button size="sm" className="hidden md:inline-flex rounded-xl gap-1.5 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300">
                <User className="h-4 w-4" /> Masuk
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="md:hidden rounded-xl" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 bg-card animate-fade-in">
          <nav className="flex flex-col p-3 gap-1">
            {navLinks.map((l, i) => (
              <Link
                key={l.href}
                to={l.href}
                onClick={() => setMobileOpen(false)}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all duration-300 flex items-center justify-between opacity-0 animate-slide-up stagger-${i + 1} ${
                  isActive(l.href) ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-2">
                  {l.icon && <l.icon className="h-4 w-4" />}
                  {l.label}
                </div>
                <ChevronRight className="h-4 w-4 opacity-30" />
              </Link>
            ))}
            <div className="h-px bg-border/50 my-2" />
            {user ? (
              <>
                <Link to="/topup" onClick={() => setMobileOpen(false)} className="py-3 px-4 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2 opacity-0 animate-slide-up stagger-4">
                  <Wallet className="h-4 w-4 text-primary" /> Top Up Saldo
                </Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="py-3 px-4 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2 opacity-0 animate-slide-up stagger-5">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileOpen(false)} className="py-3 px-4 rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground flex items-center gap-2 opacity-0 animate-slide-up stagger-6">
                    <Shield className="h-4 w-4" /> Admin Panel
                  </Link>
                )}
                <Button variant="destructive" className="w-full mt-2 rounded-xl opacity-0 animate-slide-up stagger-6" onClick={() => { logout(); setMobileOpen(false); }}>
                  <LogOut className="h-4 w-4 mr-1" /> Keluar
                </Button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileOpen(false)}>
                <Button className="w-full mt-2 rounded-xl shadow-md shadow-primary/20 opacity-0 animate-slide-up stagger-5">
                  <User className="h-4 w-4 mr-1" /> Masuk
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
