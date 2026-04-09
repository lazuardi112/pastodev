import { useState } from "react";
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
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/mock";
import { useEffect } from "react";
import ProductCard from "@/components/ProductCard";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotif, setShowNotif] = useState(false);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Filter products for store
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock data
  const myOrders = [
    { id: "ORD-001", name: "BukaOlshop Pro", date: "15 Mar 2026", status: "success" as const, price: 250000, hasFile: true },
    { id: "ORD-002", name: "Website Company Profile", date: "10 Mar 2026", status: "processing" as const, price: 500000, hasFile: false },
    { id: "ORD-003", name: "Mobile POS App", date: "5 Mar 2026", status: "pending" as const, price: 750000, hasFile: false },
  ];

  const customOrders = [
    { id: "TKT-001", title: "Aplikasi Kasir Custom", date: "12 Mar 2026", status: "success" as const, budget: "Rp 2.000.000", hasFile: true, lastMessage: "File sudah siap, silakan download" },
    { id: "TKT-002", title: "Website Portofolio", date: "8 Mar 2026", status: "processing" as const, budget: "Rp 1.500.000", hasFile: false, lastMessage: "Sedang dikerjakan, estimasi 3 hari" },
    { id: "TKT-003", title: "Landing Page Event", date: "1 Mar 2026", status: "pending" as const, budget: "Rp 800.000", hasFile: false, lastMessage: "Menunggu konfirmasi admin" },
  ];

  const myDownloads = [
    { name: "BukaOlshop Pro", version: "v2.1.0", size: "15 MB", date: "15 Mar 2026" },
    { name: "Landing Page Template", version: "v1.3.0", size: "8 MB", date: "10 Mar 2026" },
  ];

  const balanceHistory = [
    { type: "Top Up", amount: "+Rp 100.000", date: "15 Mar 2026", positive: true },
    { type: "Pembelian - BukaOlshop Pro", amount: "-Rp 250.000", date: "14 Mar 2026", positive: false },
    { type: "Top Up", amount: "+Rp 300.000", date: "10 Mar 2026", positive: true },
  ];

  const notifications = [
    { text: "Pesanan ORD-001 telah selesai", time: "2 jam lalu", read: false },
    { text: "File custom order TKT-001 sudah ready", time: "5 jam lalu", read: false },
    { text: "Saldo berhasil ditambahkan Rp 100.000", time: "1 hari lalu", read: true },
  ];

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
              {notifications.map((n, i) => (
                <div key={i} className={`p-3 border-b border-border/50 last:border-0 ${!n.read ? "bg-primary/5" : ""}`}>
                  <p className="text-sm">{n.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                </div>
              ))}
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
                { label: "Saldo", value: formatCurrency(150000), icon: Wallet, color: "from-primary/20 to-primary/5" },
                { label: "Pesanan", value: "3", icon: ShoppingBag, color: "from-emerald-500/20 to-emerald-500/5" },
                { label: "Download", value: "5", icon: Download, color: "from-violet-500/20 to-violet-500/5" },
                { label: "Review", value: "2", icon: Star, color: "from-amber-500/20 to-amber-500/5" },
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
                { icon: CreditCard, label: "Top Up", action: () => setActiveTab("profile") },
                { icon: MessageSquare, label: "Bantuan", action: () => {} },
              ].map((q) => (
                <button key={q.label} onClick={q.action} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <q.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{q.label}</span>
                </button>
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
                {products.filter(p => p.featured).slice(0, 2).map(p => (
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
              {["Semua", "Script BukaOlshop", "Website", "Aplikasi"].map((cat, i) => (
                <button key={cat} className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-colors ${i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  {cat}
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
              {customOrders.map((t) => (
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
                      <p className="text-sm font-bold text-primary mt-2">{t.budget}</p>
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
                    <p className="text-2xl font-bold text-primary">{formatCurrency(150000)}</p>
                  </div>
                  <Button size="sm" className="gap-1">
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

            {/* Reviews */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Review Saya</h3>
              <div className="space-y-2">
                {[
                  { product: "BukaOlshop Pro", rating: 5, comment: "Produk sangat bagus, fitur lengkap!" },
                  { product: "Landing Page Template", rating: 4, comment: "Desain clean dan mudah dikustomisasi" },
                ].map((r) => (
                  <Card key={r.product} className="border-border/50">
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{r.product}</p>
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-500 text-amber-500" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">{r.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Profile Info */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Informasi Profil</h3>
              <Card className="border-border/50">
                <CardContent className="p-4 space-y-3">
                  {[
                    { label: "Nama", value: user.name },
                    { label: "Email", value: user.email },
                    { label: "Bergabung", value: "Maret 2026" },
                    { label: "Total Pembelian", value: "3 produk" },
                  ].map((info) => (
                    <div key={info.label} className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{info.label}</span>
                      <span className="text-sm font-medium">{info.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button variant="outline" className="w-full gap-2 justify-start">
                <Settings className="h-4 w-4" /> Edit Profil
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
