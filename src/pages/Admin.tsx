import { useState, useEffect, useCallback, FormEvent } from "react";
import {
  BarChart3, Users, Package, ShoppingBag, Tag, FileText, Plus, Trash2, Edit,
  TrendingUp, Eye, Shield, Settings, Search, Download, CheckCircle, Clock,
  AlertCircle, ArrowUpRight, Sparkles, Loader, Menu, X, Home, PieChart,
  CreditCard, MessageSquare, Bell, UserCheck, DollarSign, Activity,
  Calendar, Filter, MoreHorizontal, ChevronDown, Star, Zap, Code
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { adminService, productService, categoryService } from "@/services/api";

const Admin = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [customOrders, setCustomOrders] = useState<any[]>([]);
  const [themeSettings, setThemeSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category_id: '',
    sub_category_id: '',
    price: '',
    is_active: true,
  });
  const [productFiles, setProductFiles] = useState<{ file: File | null; thumbnail: File | null }>({
    file: null,
    thumbnail: null,
  });

  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
  });

  const [activeTab, setActiveTab] = useState("dashboard");

  const [voucherModalOpen, setVoucherModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<any | null>(null);
  const [voucherForm, setVoucherForm] = useState({
    code: '',
    description: '',
    discount_type: 'percentage' as 'percentage' | 'fixed',
    discount_value: '',
    min_purchase: '',
    usage_limit: '',
    valid_until: '',
    is_active: true,
  });

  const [coDetailOpen, setCoDetailOpen] = useState(false);
  const [coDetailLoading, setCoDetailLoading] = useState(false);
  const [coDetail, setCoDetail] = useState<any | null>(null);
  const [coStatus, setCoStatus] = useState('');

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastAll, setBroadcastAll] = useState(true);
  const [broadcastUserId, setBroadcastUserId] = useState('');
  const [broadcastSending, setBroadcastSending] = useState(false);

  useEffect(() => {
    if (!user || !isAdmin) navigate("/login");
  }, [user, isAdmin, navigate]);

  const loadAdminData = useCallback(async () => {
    if (!user || !isAdmin) return;
    try {
      setLoading(true);
      setError("");
      const [
        statsRes,
        productsRes,
        categoriesRes,
        ordersRes,
        usersRes,
        vouchersRes,
        customOrdersRes,
        settingsRes,
      ] = await Promise.all([
        adminService.getDashboardStats(),
        productService.getAll(undefined, undefined, 50, 0),
        categoryService.getAll(),
        adminService.getTransactions(50, 0),
        adminService.getUsers(100, 0),
        adminService.getVouchers(50, 0),
        adminService.getCustomOrders(50, 0),
        adminService.getSettings(),
      ]);

      const dash = statsRes.data?.data ?? statsRes.data;
      if (dash && typeof dash === "object") {
        setStats([
          { label: "Total Transaksi", value: String((dash as any).total_transactions ?? 0), icon: TrendingUp, trend: "", color: "from-sky-500/20 to-sky-500/5" },
          { label: "Pendapatan", value: formatCurrency(Number((dash as any).total_revenue ?? 0)), icon: DollarSign, trend: "", color: "from-primary/20 to-primary/5" },
          { label: "Pengguna", value: String((dash as any).total_users ?? 0), icon: Users, trend: "", color: "from-slate-500/20 to-slate-500/5" },
          { label: "Sukses", value: String((dash as any).success_transactions ?? 0), icon: CheckCircle, trend: "", color: "from-emerald-500/20 to-emerald-500/5" },
        ]);
      }

      setProducts(productsRes.data?.data ?? []);
      const catPayload = categoriesRes.data?.data ?? categoriesRes.data;
      setCategories(Array.isArray(catPayload) ? catPayload : []);

      setOrders(ordersRes.data?.data ?? []);
      setUsers(usersRes.data?.data ?? []);
      setVouchers(vouchersRes.data?.data ?? []);
      setCustomOrders(customOrdersRes.data?.data ?? []);

      const sett = settingsRes.data?.data;
      if (sett && typeof sett === "object") setThemeSettings(sett as Record<string, string>);
    } catch (err) {
      console.error("Failed to fetch admin data:", err);
      setError("Gagal memuat data admin. Pastikan backend berjalan dan Anda login sebagai admin.");
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const resetProductForm = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      category_id: '',
      sub_category_id: '',
      price: '',
      is_active: true,
    });
    setProductFiles({ file: null, thumbnail: null });
  };

  const openProductModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name || '',
        description: product.description || '',
        category_id: product.category_id?.toString() || '',
        sub_category_id: product.sub_category_id?.toString() || '',
        price: product.price?.toString() || '',
        is_active: product.is_active ?? true,
      });
    } else {
      resetProductForm();
    }
    setProductModalOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formDataObj = new FormData();
      formDataObj.append('name', productForm.name);
      formDataObj.append('description', productForm.description);
      formDataObj.append('category_id', productForm.category_id);
      if (productForm.sub_category_id) {
        formDataObj.append('sub_category_id', productForm.sub_category_id);
      }
      formDataObj.append('price', productForm.price);
      formDataObj.append('is_active', productForm.is_active ? '1' : '0');
      if (productFiles.file) formDataObj.append('file', productFiles.file);
      if (productFiles.thumbnail) formDataObj.append('thumbnail', productFiles.thumbnail);

      if (editingProduct) {
        await productService.update(editingProduct.id, formDataObj);
      } else {
        await productService.create(formDataObj);
      }

      resetProductForm();
      setProductModalOpen(false);
      await loadAdminData();
    } catch (error) {
      console.error('Failed to save product', error);
      setError('Gagal menyimpan produk. Pastikan semua field sudah benar.');
    } finally {
      setLoading(false);
    }
  };

  const handleProductDelete = async (productId: number) => {
    if (!confirm('Hapus produk ini?')) return;
    try {
      setLoading(true);
      await productService.delete(productId);
      await loadAdminData();
    } catch (error) {
      console.error('Failed to delete product', error);
      setError('Gagal menghapus produk.');
    } finally {
      setLoading(false);
    }
  };

  const resetCategoryForm = () => {
    setEditingCategory(null);
    setCategoryForm({ name: '', description: '' });
  };

  const openCategoryModal = (category?: any) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name || '',
        description: category.description || '',
      });
    } else {
      resetCategoryForm();
    }
    setCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: categoryForm.name,
        description: categoryForm.description,
      };

      if (editingCategory) {
        await categoryService.update(editingCategory.id, payload);
      } else {
        await categoryService.create(payload);
      }

      resetCategoryForm();
      setCategoryModalOpen(false);
      await loadAdminData();
    } catch (error) {
      console.error('Failed to save category', error);
      setError('Gagal menyimpan kategori.');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryDelete = async (categoryId: number) => {
    if (!confirm('Hapus kategori ini?')) return;
    try {
      setLoading(true);
      await categoryService.delete(categoryId);
      await loadAdminData();
    } catch (error) {
      console.error('Failed to delete category', error);
      setError('Gagal menghapus kategori.');
    } finally {
      setLoading(false);
    }
  };

  const resetVoucherForm = () => {
    setEditingVoucher(null);
    setVoucherForm({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase: '',
      usage_limit: '',
      valid_until: '',
      is_active: true,
    });
  };

  const openVoucherModal = (v?: any) => {
    if (v) {
      setEditingVoucher(v);
      setVoucherForm({
        code: v.code || '',
        description: v.description || '',
        discount_type: v.discount_type === 'fixed' ? 'fixed' : 'percentage',
        discount_value: String(v.discount_value ?? ''),
        min_purchase: v.min_purchase != null ? String(v.min_purchase) : '',
        usage_limit: v.usage_limit != null ? String(v.usage_limit) : '',
        valid_until: v.valid_until ? String(v.valid_until).slice(0, 10) : '',
        is_active: !!(v.is_active ?? v.isActive ?? true),
      });
    } else {
      resetVoucherForm();
    }
    setVoucherModalOpen(true);
  };

  const handleVoucherSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      const dv = parseFloat(voucherForm.discount_value);
      if (Number.isNaN(dv)) {
        setError('Nilai diskon tidak valid');
        setLoading(false);
        return;
      }
      const payload: Record<string, unknown> = {
        code: voucherForm.code.trim().toUpperCase(),
        description: voucherForm.description.trim() || null,
        discount_type: voucherForm.discount_type,
        discount_value: dv,
        min_purchase: voucherForm.min_purchase ? parseFloat(voucherForm.min_purchase) : null,
        usage_limit: voucherForm.usage_limit ? parseInt(voucherForm.usage_limit, 10) : null,
        valid_until: voucherForm.valid_until || null,
      };
      if (editingVoucher) {
        payload.is_active = voucherForm.is_active ? 1 : 0;
        await adminService.updateVoucher(editingVoucher.id, payload);
      } else {
        await adminService.createVoucher(payload);
      }
      resetVoucherForm();
      setVoucherModalOpen(false);
      await loadAdminData();
    } catch (err) {
      console.error(err);
      setError('Gagal menyimpan voucher');
    } finally {
      setLoading(false);
    }
  };

  const handleVoucherDelete = async (id: number) => {
    if (!confirm('Hapus voucher ini?')) return;
    try {
      setLoading(true);
      await adminService.deleteVoucher(id);
      await loadAdminData();
    } catch {
      setError('Gagal menghapus voucher');
    } finally {
      setLoading(false);
    }
  };

  const exportOrdersCsv = () => {
    const esc = (x: unknown) => {
      const s = String(x ?? '');
      return `"${s.replace(/"/g, '""')}"`;
    };
    const header = ['id', 'order_id', 'email', 'user_name', 'status', 'final_amount', 'payment_method'];
    const lines = [header.join(',')];
    for (const o of orders) {
      lines.push(
        [
          esc(o.id),
          esc(o.order_id),
          esc(o.email),
          esc(o.user_name),
          esc(o.status),
          esc(o.final_amount ?? o.gross_amount),
          esc(o.payment_method),
        ].join(',')
      );
    }
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pesanan-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openCustomOrderDetail = async (t: { id: number }) => {
    setCoDetailOpen(true);
    setCoDetail(null);
    setCoStatus('');
    setCoDetailLoading(true);
    setError('');
    try {
      const res = await adminService.getCustomOrderDetail(t.id);
      const d = res.data?.data ?? null;
      setCoDetail(d);
      setCoStatus(d?.status || '');
    } catch {
      setError('Gagal memuat detail custom order');
    } finally {
      setCoDetailLoading(false);
    }
  };

  const handleCustomOrderStatusSave = async () => {
    if (!coDetail?.id || !coStatus) return;
    try {
      setLoading(true);
      await adminService.updateCustomOrderStatus(Number(coDetail.id), coStatus);
      setCoDetailOpen(false);
      await loadAdminData();
    } catch {
      setError('Gagal memperbarui status order');
    } finally {
      setLoading(false);
    }
  };

  const handleSendBroadcast = async () => {
    const title = broadcastTitle.trim();
    const message = broadcastMessage.trim();
    if (!title || !message) {
      setError('Judul dan pesan notifikasi wajib diisi');
      return;
    }
    if (!broadcastAll) {
      const uid = parseInt(broadcastUserId, 10);
      if (!Number.isFinite(uid) || uid < 1) {
        setError('Pilih atau masukkan ID pengguna yang valid');
        return;
      }
    }
    try {
      setBroadcastSending(true);
      setError('');
      const uid = parseInt(broadcastUserId, 10);
      await adminService.sendNotificationBroadcast({
        title,
        message,
        send_to_all: broadcastAll,
        user_id: broadcastAll ? undefined : uid,
      });
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastUserId('');
    } catch {
      setError('Gagal mengirim notifikasi');
    } finally {
      setBroadcastSending(false);
    }
  };

  return (
    <Layout hideShell>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Modern Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-8 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
                  <p className="text-slate-600 mt-1">Kelola marketplace dengan kontrol penuh</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-slate-500">Selamat datang</p>
                  <p className="font-semibold text-slate-900">{user?.name || 'Admin'}</p>
                </div>
                <Button variant="outline" className="rounded-xl border-slate-300 hover:bg-slate-50">
                  <Settings className="h-4 w-4 mr-2" />
                  Pengaturan
                </Button>
              </div>
            </div>
          </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm flex flex-wrap h-auto gap-1">
            <TabsTrigger value="dashboard" className="rounded-lg px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Dashboard</TabsTrigger>
            <TabsTrigger value="products" className="rounded-lg px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Produk</TabsTrigger>
            <TabsTrigger value="categories" className="rounded-lg px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Kategori</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-lg px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Pesanan</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Pengguna</TabsTrigger>
            <TabsTrigger value="vouchers" className="rounded-lg px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Voucher</TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-lg px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Custom Order</TabsTrigger>
            <TabsTrigger value="scripts" className="rounded-lg px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Script Custom</TabsTrigger>
            <TabsTrigger value="settings" className="rounded-lg px-6 py-2 data-[state=active]:bg-primary data-[state=active]:text-white">Pengaturan</TabsTrigger>
          </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex items-center gap-3">
                    <Loader className="h-6 w-6 animate-spin text-primary" />
                    <p className="text-slate-600">Memuat data admin...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                      <div key={stat.label} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                              <ArrowUpRight className="h-3 w-3" />
                              {stat.trend}
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <stat.icon className="h-6 w-6 text-primary" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">Aksi Cepat</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button onClick={() => openProductModal()} variant="outline" className="h-20 flex flex-col items-center gap-2 border-slate-300 hover:bg-slate-50 hover:border-slate-300">
                        <Plus className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium">Tambah Produk</span>
                      </Button>
                      <Button onClick={() => openCategoryModal()} variant="outline" className="h-20 flex flex-col items-center gap-2 border-slate-300 hover:bg-slate-50 hover:border-slate-300">
                        <Tag className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium">Buat Kategori</span>
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setActiveTab("vouchers");
                          openVoucherModal();
                        }}
                        variant="outline"
                        className="h-20 flex flex-col items-center gap-2 border-slate-300 hover:bg-slate-50 hover:border-slate-300"
                      >
                        <Sparkles className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium">Buat Voucher</span>
                      </Button>
                      <Button type="button" onClick={exportOrdersCsv} variant="outline" className="h-20 flex flex-col items-center gap-2 border-slate-300 hover:bg-slate-50 hover:border-slate-300">
                        <Download className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium">Export Data</span>
                      </Button>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Aktivitas Terbaru
                      </h3>
                      <div className="space-y-4">
                        {orders.length === 0 ? (
                          <p className="text-sm text-slate-500">Belum ada transaksi.</p>
                        ) : (
                          orders.slice(0, 6).map((o) => (
                            <div key={o.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-900 truncate">
                                  {o.order_id} — {o.user_name || o.email || "User"}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {formatCurrency(Number(o.final_amount ?? o.gross_amount ?? 0))} • {o.status}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Ringkasan Hari Ini
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Transaksi (sample)</span>
                          <span className="font-semibold text-slate-900">{orders.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Pengguna (sample)</span>
                          <span className="font-semibold text-green-600">{users.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Custom order</span>
                          <span className="font-semibold text-purple-600">{customOrders.length}</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-900">Produk aktif</span>
                            <span className="font-bold text-lg text-primary">{products.length}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Kelola Produk</h2>
                  <p className="text-sm text-slate-600">Tambah, edit, dan hapus produk marketplace dengan cepat.</p>
                </div>
                <Button onClick={() => openProductModal()} className="rounded-xl bg-primary text-white hover:bg-primary">
                  <Plus className="h-4 w-4" />
                  <span>Tambah Produk</span>
                </Button>
              </div>

              <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
                <DialogContent className="max-w-3xl rounded-3xl bg-white border border-slate-200">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-slate-900">
                          {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                        </DialogTitle>
                      </DialogHeader>
                      <Button variant="ghost" onClick={() => setProductModalOpen(false)}>
                        Batal
                      </Button>
                    </div>
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Nama Produk</Label>
                          <Input value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} placeholder="Contoh: Sistem POS" />
                        </div>
                        <div className="space-y-2">
                          <Label>Harga</Label>
                          <Input type="number" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="Rp" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={4} placeholder="Deskripsi singkat produk" />
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Kategori</Label>
                          <Select value={productForm.category_id} onValueChange={(value) => setProductForm({ ...productForm, category_id: value })}>
                            <SelectTrigger className="w-full rounded-xl">
                              <SelectValue placeholder="Pilih kategori" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Sub Kategori</Label>
                          <Input value={productForm.sub_category_id} onChange={(e) => setProductForm({ ...productForm, sub_category_id: e.target.value })} placeholder="ID sub kategori (opsional)" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>File Produk</Label>
                          <Input type="file" onChange={(e) => setProductFiles({ ...productFiles, file: e.target.files?.[0] || null })} />
                        </div>
                        <div className="space-y-2">
                          <Label>Thumbnail</Label>
                          <Input type="file" onChange={(e) => setProductFiles({ ...productFiles, thumbnail: e.target.files?.[0] || null })} accept="image/*" />
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setProductModalOpen(false)}>Batal</Button>
                        <Button type="submit" className="bg-primary text-white hover:bg-primary">Simpan</Button>
                      </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50 text-slate-700">
                      <tr>
                        <th className="px-6 py-4 text-left font-medium">Nama Produk</th>
                        <th className="px-6 py-4 text-left font-medium">Kategori</th>
                        <th className="px-6 py-4 text-left font-medium">Harga</th>
                        <th className="px-6 py-4 text-left font-medium">Status</th>
                        <th className="px-6 py-4 text-right font-medium">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Tidak ada produk tersedia</td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4 text-slate-900 font-medium">{product.name}</td>
                            <td className="px-6 py-4 text-slate-600">{product.category_name || product.categoryName || 'Tidak tersedia'}</td>
                            <td className="px-6 py-4 text-slate-900 font-medium">{formatCurrency(product.price)}</td>
                            <td className="px-6 py-4">
                              <Badge variant={product.is_active ? 'default' : 'secondary'} className={`rounded-full text-xs px-3 py-1 ${product.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                {product.is_active ? 'Aktif' : 'Tidak Aktif'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <Button variant="outline" size="sm" onClick={() => openProductModal(product)} className="border-slate-300 hover:bg-slate-50 hover:border-slate-300">Edit</Button>
                              <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400" onClick={() => handleProductDelete(product.id)}>Hapus</Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Kelola Kategori</h2>
                  <p className="text-sm text-slate-600">Buat, edit, dan hapus kategori dengan tema biru abu putih.</p>
                </div>
                <Button onClick={() => openCategoryModal()} className="rounded-xl bg-primary text-white hover:bg-primary">
                  <Plus className="h-4 w-4" />
                  <span>Tambah Kategori</span>
                </Button>
              </div>

              <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
                <DialogContent className="max-w-2xl rounded-3xl bg-white border border-slate-200">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <DialogHeader>
                        <DialogTitle className="text-lg font-semibold text-slate-900">
                          {editingCategory ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                        </DialogTitle>
                      </DialogHeader>
                      <Button variant="ghost" onClick={() => setCategoryModalOpen(false)}>
                        Batal
                      </Button>
                    </div>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Nama Kategori</Label>
                        <Input value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} placeholder="Contoh: Software" />
                      </div>
                      <div className="space-y-2">
                        <Label>Deskripsi</Label>
                        <Textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={4} placeholder="Deskripsi kategori (opsional)" />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={() => setCategoryModalOpen(false)}>Batal</Button>
                        <Button type="submit" className="bg-primary text-white hover:bg-primary">Simpan</Button>
                      </div>
                    </form>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="grid gap-4">
                {categories.length === 0 ? (
                  <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500">Belum ada kategori tersedia.</p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <div key={category.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-lg font-semibold text-slate-900">{category.name}</p>
                          <p className="text-sm text-slate-600">{category.description || 'Tidak ada deskripsi'}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => openCategoryModal(category)} className="border-slate-300 hover:bg-slate-50 hover:border-slate-300">Edit</Button>
                          <Button variant="outline" size="sm" className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400" onClick={() => handleCategoryDelete(category.id)}>Hapus</Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="animate-fade-in">
            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><ShoppingBag className="h-5 w-5 text-primary" /> Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {orders.length > 0 ? orders.map((o) => (
                    <div key={o.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm font-mono">{o.order_id || `#${o.id}`}</p>
                        <p className="text-xs text-muted-foreground">{o.user_name || o.email || "—"} • {o.payment_method || "—"}</p>
                      </div>
                      <p className="font-semibold text-sm text-primary">{formatCurrency(Number(o.final_amount ?? o.gross_amount ?? 0))}</p>
                      <div className="flex items-center gap-2">
                        <Select
                          value={String(o.status || "pending")}
                          onValueChange={async (v) => {
                            try {
                              await adminService.updateTransactionStatus(Number(o.id), v);
                              await loadAdminData();
                            } catch {
                              setError("Gagal memperbarui status transaksi");
                            }
                          }}
                        >
                          <SelectTrigger className="w-[140px] h-8 text-xs rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">pending</SelectItem>
                            <SelectItem value="success">success</SelectItem>
                            <SelectItem value="settlement">settlement</SelectItem>
                            <SelectItem value="canceled">canceled</SelectItem>
                            <SelectItem value="expired">expired</SelectItem>
                            <SelectItem value="failed">failed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Belum ada pesanan</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="animate-fade-in">
            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Pengguna</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {users.length > 0 ? users.map((u) => (
                    <div key={u.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                      <Avatar className="w-10 h-10 rounded-xl flex-shrink-0">
                        <AvatarImage src={u.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-xs">
                          {u.name?.split(" ").map((n: string) => n[0]).join("") || u.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                        <p className="text-xs text-primary mt-0.5">Saldo {formatCurrency(Number(u.balance ?? 0))}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-xs"
                          onClick={async () => {
                            const a = window.prompt("Jumlah tambah saldo (Rp)", "50000");
                            if (!a) return;
                            try {
                              await adminService.addUserBalance(Number(u.id), Number(a), "Admin");
                              await loadAdminData();
                            } catch {
                              setError("Gagal menambah saldo");
                            }
                          }}
                        >
                          + Saldo
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg text-xs"
                          onClick={async () => {
                            try {
                              await adminService.toggleUserBlock(Number(u.id));
                              await loadAdminData();
                            } catch {
                              setError("Gagal ubah blokir");
                            }
                          }}
                        >
                          Blokir
                        </Button>
                        {u.role !== "admin" && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="rounded-lg text-xs"
                            onClick={async () => {
                              if (!confirm("Nonaktifkan pengguna ini?")) return;
                              try {
                                await adminService.deactivateUser(Number(u.id));
                                await loadAdminData();
                              } catch {
                                setError("Gagal menonaktifkan");
                              }
                            }}
                          >
                            Nonaktifkan
                          </Button>
                        )}
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Belum ada pengguna</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vouchers" className="animate-fade-in">
            <Card className="rounded-2xl border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /> Voucher</CardTitle>
                <Button type="button" size="sm" className="rounded-xl gap-1.5 shadow-md shadow-primary/20" onClick={() => openVoucherModal()}>
                  <Plus className="h-4 w-4" /> Buat Voucher
                </Button>
              </CardHeader>
              <CardContent>
                <Dialog open={voucherModalOpen} onOpenChange={setVoucherModalOpen}>
                  <DialogContent className="max-w-lg rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>{editingVoucher ? "Edit Voucher" : "Voucher Baru"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleVoucherSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2 col-span-2 sm:col-span-1">
                          <Label>Kode</Label>
                          <Input
                            value={voucherForm.code}
                            onChange={(e) => setVoucherForm({ ...voucherForm, code: e.target.value.toUpperCase() })}
                            placeholder="PROMO10"
                            disabled={!!editingVoucher}
                            className="rounded-xl font-mono"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipe diskon</Label>
                          <Select
                            value={voucherForm.discount_type}
                            onValueChange={(val: "percentage" | "fixed") =>
                              setVoucherForm({ ...voucherForm, discount_type: val })
                            }
                          >
                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Persen (%)</SelectItem>
                              <SelectItem value="fixed">Nominal (Rp)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Nilai diskon</Label>
                        <Input
                          type="number"
                          step="0.01"
                          className="rounded-xl"
                          value={voucherForm.discount_value}
                          onChange={(e) => setVoucherForm({ ...voucherForm, discount_value: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label>Min. belanja (opsional)</Label>
                          <Input
                            type="number"
                            className="rounded-xl"
                            value={voucherForm.min_purchase}
                            onChange={(e) => setVoucherForm({ ...voucherForm, min_purchase: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Limit pakai (opsional)</Label>
                          <Input
                            type="number"
                            className="rounded-xl"
                            value={voucherForm.usage_limit}
                            onChange={(e) => setVoucherForm({ ...voucherForm, usage_limit: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Berlaku s/d (opsional)</Label>
                        <Input
                          type="date"
                          className="rounded-xl"
                          value={voucherForm.valid_until}
                          onChange={(e) => setVoucherForm({ ...voucherForm, valid_until: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Deskripsi (opsional)</Label>
                        <Textarea
                          rows={2}
                          className="rounded-xl"
                          value={voucherForm.description}
                          onChange={(e) => setVoucherForm({ ...voucherForm, description: e.target.value })}
                        />
                      </div>
                      {editingVoucher && (
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="v_active"
                            checked={voucherForm.is_active}
                            onChange={(e) => setVoucherForm({ ...voucherForm, is_active: e.target.checked })}
                          />
                          <Label htmlFor="v_active" className="font-normal cursor-pointer">Aktif</Label>
                        </div>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" className="rounded-xl" onClick={() => setVoucherModalOpen(false)}>
                          Batal
                        </Button>
                        <Button type="submit" className="rounded-xl">Simpan</Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <div className="space-y-3">
                  {vouchers.length > 0 ? vouchers.map((v) => (
                    <div key={v.id} className="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Tag className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-[140px]">
                        <p className="font-mono font-bold text-sm">{v.code}</p>
                        <p className="text-xs text-muted-foreground">
                          Diskon {(v.discount_type || v.discountType) === 'percentage' ? `${v.discount_value ?? v.discountValue}%` : formatCurrency(Number(v.discount_value ?? v.discountValue ?? 0))} •
                          {v.used_count ?? v.usedCount ?? 0}/{v.usage_limit ?? v.usageLimit ?? '∞'}
                        </p>
                      </div>
                      <Badge variant={(v.is_active ?? v.isActive) ? "default" : "secondary"} className="rounded-lg">
                        {(v.is_active ?? v.isActive) ? "Aktif" : "Nonaktif"}
                      </Badge>
                      <div className="flex gap-1">
                        <Button type="button" variant="ghost" size="icon" className="rounded-lg h-8 w-8" onClick={() => openVoucherModal(v)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button type="button" variant="ghost" size="icon" className="rounded-lg h-8 w-8 text-destructive" onClick={() => handleVoucherDelete(Number(v.id))}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Belum ada voucher</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="animate-fade-in">
            <Card className="rounded-2xl border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Order Custom</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={coDetailOpen} onOpenChange={setCoDetailOpen}>
                  <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl">
                    <DialogHeader>
                      <DialogTitle>Detail Custom Order</DialogTitle>
                    </DialogHeader>
                    {coDetailLoading ? (
                      <div className="flex items-center gap-2 py-8 text-muted-foreground">
                        <Loader className="h-5 w-5 animate-spin" /> Memuat…
                      </div>
                    ) : coDetail ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Judul</p>
                          <p className="font-medium">{coDetail.title}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Deskripsi</p>
                          <p className="text-sm whitespace-pre-wrap">{coDetail.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <span>Budget: <strong className="text-primary">{formatCurrency(Number(coDetail.budget ?? 0))}</strong></span>
                          <span>No: <strong className="font-mono">{coDetail.order_number || coDetail.id}</strong></span>
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select value={coStatus || "pending"} onValueChange={setCoStatus}>
                            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">pending</SelectItem>
                              <SelectItem value="diterima">diterima</SelectItem>
                              <SelectItem value="ditolak">ditolak</SelectItem>
                              <SelectItem value="proses">proses</SelectItem>
                              <SelectItem value="selesai">selesai</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        {Array.isArray(coDetail.messages) && coDetail.messages.length > 0 && (
                          <div className="space-y-2 border-t pt-3">
                            <p className="text-sm font-medium">Pesan</p>
                            <ul className="text-xs space-y-2 max-h-40 overflow-y-auto">
                              {coDetail.messages.map((m: any) => (
                                <li key={m.id} className="rounded-lg bg-muted/50 p-2">
                                  <span className="text-muted-foreground">{m.user_name || "Pengguna"}</span>
                                  <p className="mt-1">{m.message}</p>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <Button type="button" className="w-full rounded-xl" onClick={handleCustomOrderStatusSave} disabled={!coStatus}>
                          Simpan status
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground py-4">Tidak ada data.</p>
                    )}
                  </DialogContent>
                </Dialog>

                <div className="space-y-3">
                  {customOrders.length > 0 ? customOrders.map((t) => (
                    <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        t.status === "selesai" ? "bg-success/10" : t.status === "proses" ? "bg-primary/10" : "bg-warning/10"
                      }`}>
                        {t.status === "selesai" ? <CheckCircle className="h-5 w-5 text-success" /> :
                         t.status === "proses" ? <Clock className="h-5 w-5 text-primary" /> :
                         <AlertCircle className="h-5 w-5 text-warning" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.order_number || t.id} • {t.user_name || "—"} • {formatCurrency(Number(t.budget ?? 0))}</p>
                      </div>
                      <Badge variant={t.status === "selesai" ? "default" : t.status === "proses" ? "secondary" : "outline"} className="rounded-lg">
                        {t.status || "pending"}
                      </Badge>
                      <Button type="button" variant="ghost" size="sm" className="rounded-lg text-xs" onClick={() => openCustomOrderDetail(t)}>
                        <Eye className="h-3.5 w-3.5 mr-1" /> Detail
                      </Button>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Belum ada order custom</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scripts" className="animate-fade-in">
            <Card className="rounded-2xl border-border/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2"><Code className="h-5 w-5 text-primary" /> Script Custom</CardTitle>
                <Button size="sm" className="rounded-xl gap-1.5 shadow-md shadow-primary/20">
                  <Plus className="h-4 w-4" /> Upload Script
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-6 text-center">
                  File digital dikelola lewat tab <strong>Produk</strong> (upload file & thumbnail). Tidak ada data dummy di sini.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <div className="space-y-6">
              <Card className="rounded-2xl border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-primary" />
                    Pengaturan Sistem
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground">
                    Tema disimpan di tabel <code className="text-xs bg-muted px-1 rounded">settings</code> dan dibaca frontend lewat{" "}
                    <code className="text-xs bg-muted px-1 rounded">GET /api/settings/public</code>. Midtrans hanya via{" "}
                    <code className="text-xs bg-muted px-1 rounded">backend/.env</code>.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
                    <div className="space-y-2">
                      <Label>Judul situs</Label>
                      <Input
                        className="rounded-xl"
                        value={themeSettings.site_title || ""}
                        onChange={(e) => setThemeSettings((s) => ({ ...s, site_title: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Logo URL (opsional)</Label>
                      <Input
                        className="rounded-xl"
                        value={themeSettings.site_logo_url || ""}
                        onChange={(e) => setThemeSettings((s) => ({ ...s, site_logo_url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Warna utama (hex)</Label>
                      <Input
                        className="rounded-xl"
                        value={themeSettings.theme_primary_color || ""}
                        onChange={(e) => setThemeSettings((s) => ({ ...s, theme_primary_color: e.target.value }))}
                        placeholder="#00acc2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Warna sekunder (hex)</Label>
                      <Input
                        className="rounded-xl"
                        value={themeSettings.theme_secondary_color || ""}
                        onChange={(e) => setThemeSettings((s) => ({ ...s, theme_secondary_color: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Warna tombol (hex)</Label>
                      <Input
                        className="rounded-xl"
                        value={themeSettings.theme_button_color || ""}
                        onChange={(e) => setThemeSettings((s) => ({ ...s, theme_button_color: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Latar (hex)</Label>
                      <Input
                        className="rounded-xl"
                        value={themeSettings.theme_background || ""}
                        onChange={(e) => setThemeSettings((s) => ({ ...s, theme_background: e.target.value }))}
                        placeholder="#f8fafc"
                      />
                    </div>
                  </div>
                  <Button
                    className="rounded-xl"
                    onClick={async () => {
                      try {
                        setError("");
                        await adminService.updateSettingsBulk({
                          site_title: themeSettings.site_title || "",
                          site_logo_url: themeSettings.site_logo_url || "",
                          theme_primary_color: themeSettings.theme_primary_color || "#00acc2",
                          theme_secondary_color: themeSettings.theme_secondary_color || "#2196F3",
                          theme_button_color: themeSettings.theme_button_color || "#00acc2",
                          theme_background: themeSettings.theme_background || "#f8fafc",
                        });
                        await loadAdminData();
                      } catch {
                        setError("Gagal menyimpan tema");
                      }
                    }}
                  >
                    Simpan tema ke database
                  </Button>

                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Maintenance Mode</h3>
                        <p className="text-sm text-muted-foreground">Nonaktifkan marketplace untuk maintenance</p>
                      </div>
                      <Button variant="outline" className="rounded-xl">
                        <Shield className="h-4 w-4 mr-2" />
                        Aktifkan Maintenance
                      </Button>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Backup Database</h3>
                        <p className="text-sm text-muted-foreground">Buat backup data terbaru</p>
                      </div>
                      <Button className="rounded-xl">
                        <Download className="h-4 w-4 mr-2" />
                        Backup Sekarang
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Kirim notifikasi ke pengguna
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 max-w-xl">
                  <p className="text-sm text-muted-foreground">
                    Notifikasi muncul di kotak notifikasi dashboard pengguna (sama seperti update pesanan).
                  </p>
                  <div className="space-y-2">
                    <Label>Judul</Label>
                    <Input
                      className="rounded-xl"
                      value={broadcastTitle}
                      onChange={(e) => setBroadcastTitle(e.target.value)}
                      placeholder="Pengumuman"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pesan</Label>
                    <Textarea
                      className="rounded-xl"
                      rows={4}
                      value={broadcastMessage}
                      onChange={(e) => setBroadcastMessage(e.target.value)}
                      placeholder="Isi pesan untuk pengguna…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Penerima</Label>
                    <Select
                      value={broadcastAll ? "all" : "one"}
                      onValueChange={(v) => {
                        const all = v === "all";
                        setBroadcastAll(all);
                        if (!all) {
                          setBroadcastUserId((prev) => prev || String(users[0]?.id ?? ""));
                        }
                      }}
                    >
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua pengguna terdaftar</SelectItem>
                        <SelectItem value="one">Satu pengguna</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {!broadcastAll && (
                    <div className="space-y-2">
                      <Label>Pilih pengguna</Label>
                      <Select
                        value={broadcastUserId || String(users[0]?.id ?? "")}
                        onValueChange={setBroadcastUserId}
                      >
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih pengguna" /></SelectTrigger>
                        <SelectContent className="max-h-60">
                          {users.map((u) => (
                            <SelectItem key={u.id} value={String(u.id)}>
                              {u.name} — {u.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <Button
                    type="button"
                    className="rounded-xl"
                    disabled={broadcastSending}
                    onClick={handleSendBroadcast}
                  >
                    {broadcastSending ? <Loader className="h-4 w-4 animate-spin mr-2" /> : null}
                    Kirim notifikasi
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </Layout>
);

};

export default Admin;
