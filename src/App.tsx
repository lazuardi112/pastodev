import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { ChatProvider } from "@/context/ChatContext";
import { publicService } from "@/services/api";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Categories from "./pages/Categories";
import CategoryDetail from "./pages/CategoryDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import PostLogin from "./pages/PostLogin";
import Dashboard from "./pages/Dashboard";
import CustomOrder from "./pages/CustomOrder";
import Topup from "./pages/Topup";
import Rating from "./pages/Rating";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import MaintenancePage from "./pages/Maintenance";
import Info from "./pages/Info";
import { ThemeSync } from "@/components/ThemeSync";

const queryClient = new QueryClient();

/** Blokir seluruh SPA untuk non-admin saat maintenance_mode dari API (login tetap dapat diakses). */
function MaintenanceGate({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { isAdmin, loading: authLoading } = useAuth();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["publicLanding"],
    queryFn: async () => (await publicService.getLanding()).data,
    staleTime: 30_000,
    retry: 1,
  });

  const path = location.pathname;
  const allowDuringMaintenance = ["/login", "/maintenance", "/post-login"].some(
    (p) => path === p || path.startsWith(`${p}/`)
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Memuat…</p>
      </div>
    );
  }

  const maintenance = data?.data?.maintenance_mode === true;
  if (maintenance && !isAdmin && !allowDuringMaintenance) {
    const msg =
      (!isError && data?.data?.maintenance_message) ||
      (typeof sessionStorage !== "undefined" ? sessionStorage.getItem("maintenance_message") : null) ||
      "Kami sedang melakukan pemeliharaan. Silakan kembali lagi nanti.";
    return <MaintenancePage message={msg} />;
  }

  return <>{children}</>;
}

const AppRoutes = () => (
  <BrowserRouter>
    <MaintenanceGate>
      <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:slug" element={<ProductDetail />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/categories/:slug" element={<CategoryDetail />} />
      <Route path="/categories/:slug/:subSlug" element={<CategoryDetail />} />
      <Route path="/info" element={<Info />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/topup" element={<Topup />} />
      <Route path="/rating" element={<Rating />} />
      <Route path="/login" element={<Login />} />
      <Route path="/post-login" element={<PostLogin />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/custom-order" element={<CustomOrder />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/maintenance" element={<MaintenancePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
    </MaintenanceGate>
  </BrowserRouter>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeSync />
      <AuthProvider>
        <CartProvider>
          <ChatProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </ChatProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
