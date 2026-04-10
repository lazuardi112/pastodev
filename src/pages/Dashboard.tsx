import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User, ShoppingBag, Download, Wallet, Star, LogOut,
  Package, Clock, CheckCircle2, ArrowRight, Bell, CreditCard,
  FileText, MessageSquare, Store, Code, Home, Settings,
  Search, Filter, ChevronRight, Send, Upload, Eye,
  AlertCircle, Loader2, X, Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import ProductCard from "@/components/ProductCard";
import {
  authService,
  productService,
  categoryService,
  checkoutService,
  customOrderService,
  userService,
  paymentService,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";

function mapTxUiStatus(raw: string | undefined): "pending" | "processing" | "success" {
  const s = (raw || "").toLowerCase();
  if (s === "success" || s === "settlement") return "success";
  if (s === "pending") return "pending";
  if (s === "failed" || s === "expire" || s === "cancel" || s === "canceled" || s === "cancelled" || s === "expired" || s === "deny") return "pending";
  return "processing";
}

const Dashboard = () => {
  const { user, logout, refreshProfile } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [balanceRows, setBalanceRows] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [catFilter, setCatFilter] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  const loadDashboard = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [balRes, prodRes, catRes, txRes, coRes, bhRes, nRes] = await Promise.all([
        authService.getBalance(),
        productService.getAll(catFilter ?? undefined, undefined, 40, 0),
        categoryService.getAll(),
        checkoutService.getTransactions(40, 0),
        customOrderService.getMyOrders(25, 0),
        authService.getBalanceHistory(40, 0),
        userService.getNotifications(20, 0).catch(() => ({ data: { success: true, data: [] } })),
      ]);

      const balData = balRes.data?.data as { balance?: number } | undefined;
      setBalance(Number(balData?.balance ?? user.balance ?? 0));

      setProducts(prodRes.data?.data ?? []);
      const c = catRes.data?.data;
      setCategories(Array.isArray(c) ? c : []);

      setTransactions(txRes.data?.data ?? []);
      setCustomOrders(coRes.data?.data ?? []);
      setBalanceRows(bhRes.data?.data ?? []);
      setNotifications(nRes.data?.data ?? []);
    } catch {
      toast({ title: "Gagal memuat data", description: "Periksa koneksi ke API." });
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.balance, catFilter, toast]);

  useEffect(() => {
    if (user) refreshProfile();
  }, [user?.id, refreshProfile]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || "");
      setEditPhone(user.phone || "");
    }
  }, [user?.name, user?.phone, user?.id]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myOrders = transactions.map((t) => {
    const first = t.items?.[0];
    const ui = mapTxUiStatus(t.status);
    return {
      id: t.order_id || String(t.id),
      name: first?.product_name || "Pembelian",
      date: t.created_at ? new Date(t.created_at).toLocaleDateString("id-ID") : "",
      status: ui,
      price: Number(t.final_amount ?? t.gross_amount ?? 0),
      hasFile: !!first?.product_id,
      transactionId: t.id,
      productId: first?.product_id,
    };
  });

  const customOrdersUi = customOrders.map((t) => ({
    id: String(t.id),
    title: t.title,
    date: t.created_at ? new Date(t.created_at).toLocaleDateString("id-ID") : "",
    status:
      t.status === "selesai" ? ("success" as const) : t.status === "proses" ? ("processing" as const) : ("pending" as const),
    budget: formatCurrency(Number(t.budget ?? 0)),
    hasFile: !!t.result_file_url,
    lastMessage: t.admin_notes || t.status || "—",
  }));

  const myDownloads = transactions
    .filter((t) => (t.status === "success" || t.status === "settlement") && Array.isArray(t.items))
    .flatMap((t) =>
      (t.items || []).map((it: any) => ({
        name: it.product_name || "Produk",
        version: "",
        size: "",
        date: t.created_at ? new Date(t.created_at).toLocaleDateString("id-ID") : "",
        productId: it.product_id,
        transactionId: t.id,
      }))
    )
    .slice(0, 12);

  const balanceHistory = balanceRows.map((row) => ({
    type: row.description || row.type || "Transaksi",
    amount: `${Number(row.amount) >= 0 ? "+" : ""}${formatCurrency(Math.abs(Number(row.amount)))}`,
    date: row.created_at ? new Date(row.created_at).toLocaleDateString("id-ID") : "",
    positive: Number(row.amount) >= 0,
  }));

  const notificationsUi = notifications.map((n) => ({
    text: n.message || n.title || "",
    time: n.created_at ? new Date(n.created_at).toLocaleString("id-ID") : "",
    read: !!(n.is_read ?? n.isRead),
  }));

  const statusConfig = {
    pending: { label: "Pending", color: "bg-amber-500/15 text-amber-600", icon: Clock },
    processing: { label: "Diproses", color: "bg-primary/15 text-primary", icon: Loader2 },
    success: { label: "Selesai", color: "bg-emerald-500/15 text-emerald-600", icon: CheckCircle2 },
  };

  const StatusBadge = ({ status }: { status: "pending" | "processing" | "success" }) => {
    const config = statusConfig[status];
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <config.icon className={`h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`} />
        {config.label}
      </span>
    );
  };

  // Bottom nav items
  const bottomNav = [
    { id: "home", label: "Home", icon: Home },
    { id: "store", label: "Store", icon: Store },
    { id: "orders", label: "Pesanan", icon: ShoppingBag },
    { id: "custom", label: "Custom", icon: Code },
    { id: "profile", label: "Profil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50">
        <div className="flex items-center justify-between h-14 px-4 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">P</span>
              </div>
              <span className="font-bold text-lg hidden sm:inline">
                Pasto<span className="text-primary">DEV</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotif(!showNotif)}>
              <Bell className="h-4 w-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            </Button>
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon">
                <ShoppingBag className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Notification Dropdown */}
        {showNotif && (
          <div className="absolute top-14 right-2 left-2 sm:left-auto sm:w-80 bg-card border border-border rounded-xl shadow-xl z-50 animate-fade-in">
            <div className="flex items-center justify-between p-3 border-b border-border">
              <span className="text-sm font-semibold">Notifikasi</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowNotif(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notificationsUi.length === 0 ? (
                <p className="p-3 text-sm text-muted-foreground">Tidak ada notifikasi</p>
              ) : (
                notificationsUi.map((n, i) => (
                  <div key={i} className={`p-3 border-b border-border/50 last:border-0 ${!n.read ? "bg-primary/5" : ""}`}>
                    <p className="text-sm">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-20 max-w-6xl mx-auto w-full">
        {/* HOME TAB */}
        {activeTab === "home" && (
          <div className="p-4 space-y-5 animate-fade-in">
            {/* Welcome */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <User className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Halo, {user.name}! 👋</h1>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Saldo", value: formatCurrency(balance), icon: Wallet, color: "from-primary/20 to-primary/5" },
                { label: "Pesanan", value: String(myOrders.length), icon: ShoppingBag, color: "from-emerald-500/20 to-emerald-500/5" },
                { label: "Download", value: String(myDownloads.length), icon: Download, color: "from-violet-500/20 to-violet-500/5" },
                { label: "Custom", value: String(customOrdersUi.length), icon: Code, color: "from-amber-500/20 to-amber-500/5" },
              ].map((s) => (
                <Card key={s.label} className="overflow-hidden border-border/50">
                  <CardContent className="p-3.5">
                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-2`}>
                      <s.icon className="h-4.5 w-4.5 text-foreground" />
                    </div>
                    <p className="text-lg font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { icon: Store, label: "Store", action: () => setActiveTab("store") },
                { icon: Code, label: "Custom", action: () => setActiveTab("custom") },
                { icon: CreditCard, label: "Top Up", action: () => {} },
                { icon: MessageSquare, label: "Bantuan", action: () => {} },
              ].map((q) => (
                q.label === "Top Up" ? (
                  <Link key={q.label} to="/topup" className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <q.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">{q.label}</span>
                  </Link>
                ) : (
                  <button key={q.label} type="button" onClick={q.action} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <q.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-[11px] font-medium text-muted-foreground">{q.label}</span>
                  </button>
                )
              ))}
            </div>

            {/* Recent Orders */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Pesanan Terbaru</h2>
                <button onClick={() => setActiveTab("orders")} className="text-xs text-primary font-medium flex items-center gap-0.5">
                  Lihat Semua <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="space-y-2">
                {myOrders.slice(0, 2).map((o) => (
                  <Card key={o.id} className="border-border/50">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{o.name}</p>
                        <p className="text-xs text-muted-foreground">{o.id} • {formatCurrency(o.price)}</p>
                      </div>
                      <StatusBadge status={o.status} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Custom Order CTA */}
            <Card className="overflow-hidden border-primary/20">
              <CardContent className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Butuh Script Custom? 🚀</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Buat pesanan khusus sesuai kebutuhan</p>
                  </div>
                  <Button size="sm" onClick={() => setActiveTab("custom")} className="gap-1 text-xs">
                    Order <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Featured Products */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold">Produk Populer</h2>
                <button onClick={() => setActiveTab("store")} className="text-xs text-primary font-medium flex items-center gap-0.5">
                  Lihat Semua <ChevronRight className="h-3 w-3" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {products.slice(0, 4).map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STORE TAB */}
        {activeTab === "store" && (
          <div className="p-4 space-y-4 animate-fade-in">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari produk..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 rounded-xl"
                />
              </div>
              <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {/* Categories quick scroll */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                type="button"
                onClick={() => setCatFilter(null)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors ${catFilter === null ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCatFilter(Number(cat.id))}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors ${catFilter === cat.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <div className="p-4 space-y-4 animate-fade-in">
            <h2 className="text-lg font-bold">Pesanan Saya</h2>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["Semua", "Pending", "Diproses", "Selesai"].map((s, i) => (
                <button key={s} className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {s}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {myOrders.map((o) => (
                <Card key={o.id} className="border-border/50 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-sm">{o.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{o.id} • {o.date}</p>
                        </div>
                        <StatusBadge status={o.status} />
                      </div>
                      <p className="text-sm font-bold text-primary">{formatCurrency(o.price)}</p>
                    </div>
                    {o.status === "success" && (
                      <div className="px-4 py-3 bg-emerald-500/5 border-t border-border/50 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-emerald-600">
                          <CheckCircle2 className="h-4 w-4" />
                          <span className="text-xs font-medium">Pembelian berhasil</span>
                        </div>
                        <div className="flex gap-2">
                          {o.hasFile && (
                            <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                              <Download className="h-3 w-3" /> Download
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                            <Send className="h-3 w-3" /> Kirim File
                          </Button>
                        </div>
                      </div>
                    )}
                    {o.status === "pending" && (
                      <div className="px-4 py-3 bg-amber-500/5 border-t border-border/50 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                        <span className="text-xs text-amber-600 font-medium">Menunggu pembayaran</span>
                        <Button size="sm" className="h-7 text-xs ml-auto">Bayar Sekarang</Button>
                      </div>
                    )}
                    {o.status === "processing" && (
                      <div className="px-4 py-3 bg-primary/5 border-t border-border/50 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                        <span className="text-xs text-primary font-medium">Sedang diproses</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Downloads Section */}
            <div className="mt-6">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Download className="h-4 w-4 text-primary" /> File Saya
              </h3>
              <div className="space-y-2">
                {myDownloads.map((d) => (
                  <Card key={d.name} className="border-border/50">
                    <CardContent className="p-3 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.version} • {d.size}</p>
                      </div>
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                        <Download className="h-3 w-3" /> Download
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CUSTOM ORDERS TAB */}
        {activeTab === "custom" && (
          <div className="p-4 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Order Custom</h2>
              <Link to="/custom-order">
                <Button size="sm" className="gap-1 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Buat Order
                </Button>
              </Link>
            </div>

            {/* Status Filter */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {["Semua", "Pending", "Diproses", "Selesai"].map((s, i) => (
                <button key={s} className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                  {s}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {customOrdersUi.map((t) => (
                <Card key={t.id} className="border-border/50 overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <p className="font-semibold text-sm">{t.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{t.id} • {t.date}</p>
                        </div>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="text-sm font-bold text-primary mt-2">{t.budget as string}</p>
                    </div>

                    {/* Chat preview */}
                    <div className="px-4 py-2.5 bg-muted/30 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <p className="text-xs text-muted-foreground truncate">{t.lastMessage}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-3 border-t border-border/50 flex items-center justify-between">
                      <Button size="sm" variant="ghost" className="h-7 text-xs gap-1">
                        <Eye className="h-3 w-3" /> Detail
                      </Button>
                      <div className="flex gap-2">
                        {t.status === "success" && t.hasFile && (
                          <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                            <Download className="h-3 w-3" /> Download File
                          </Button>
                        )}
                        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
                          <MessageSquare className="h-3 w-3" /> Chat
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <div className="p-4 space-y-5 animate-fade-in">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <User className="h-8 w-8 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{user.name}</h2>
                <p className="text-xs text-muted-foreground">{user.email}</p>
                <Badge className="mt-1 text-[10px]">Member</Badge>
              </div>
            </div>

            {/* Balance Card */}
            <Card className="overflow-hidden border-primary/20">
              <CardContent className="p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Saldo Anda</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(balance)}</p>
                  </div>
                  <Button
                    size="sm"
                    className="gap-1"
                    onClick={async () => {
                      const raw = window.prompt("Nominal top up (minimal sesuai pengaturan)", "50000");
                      if (!raw) return;
                      const amt = Number(raw);
                      if (!Number.isFinite(amt) || amt <= 0) {
                        toast({ title: "Nominal tidak valid" });
                        return;
                      }
                      try {
                        const { data } = await paymentService.topup(amt);
                        if (data?.success && data?.data?.snap_token) {
                          toast({
                            title: "Lanjutkan pembayaran",
                            description: "Gunakan snap_token di client Midtrans (Snap.js) untuk menampilkan QRIS.",
                          });
                          await loadDashboard();
                        } else {
                          toast({ title: "Top up", description: data?.message || "Periksa konfigurasi Midtrans." });
                        }
                      } catch {
                        toast({ title: "Top up gagal", description: "Pastikan Midtrans dikonfigurasi di backend." });
                      }
                    }}
                  >
                    <Wallet className="h-4 w-4" /> Top Up
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Balance History */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Riwayat Transaksi</h3>
              <div className="space-y-2">
                {balanceHistory.map((t, i) => (
                  <Card key={i} className="border-border/50">
                    <CardContent className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{t.type}</p>
                        <p className="text-xs text-muted-foreground">{t.date}</p>
                      </div>
                      <span className={`text-sm font-bold ${t.positive ? "text-emerald-500" : "text-destructive"}`}>
                        {t.amount}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Profile edit */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Informasi Profil</h3>
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="dash-name" className="text-xs text-muted-foreground">
                      Nama
                    </Label>
                    <Input id="dash-name" value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded-xl h-10" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dash-phone" className="text-xs text-muted-foreground">
                      Telepon
                    </Label>
                    <Input id="dash-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="rounded-xl h-10" />
                  </div>
                  <p className="text-xs text-muted-foreground">Email: {user.email}</p>
                  <p className="text-xs text-muted-foreground">Total pembelian: {myOrders.filter((o) => o.status === "success").length} transaksi sukses</p>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full gap-2 justify-start"
                onClick={async () => {
                  try {
                    await authService.updateProfile({ name: editName, phone: editPhone });
                    await refreshProfile();
                    await loadDashboard();
                    toast({ title: "Profil diperbarui" });
                  } catch {
                    toast({ title: "Gagal menyimpan profil" });
                  }
                }}
              >
                <Settings className="h-4 w-4" /> Simpan Profil
              </Button>
              <Button variant="outline" className="w-full gap-2 justify-start text-destructive hover:text-destructive" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Keluar
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation - Mobile App Style */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 safe-area-bottom">
        <div className="max-w-6xl mx-auto flex items-center justify-around h-16 px-2">
          {bottomNav.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-colors ${activeTab === item.id ? "bg-primary/10" : ""}`}>
                <item.icon className={`h-5 w-5 ${activeTab === item.id ? "stroke-[2.5]" : ""}`} />
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Dashboard;
