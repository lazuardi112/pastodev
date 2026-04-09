import { useState, useEffect, FormEvent } from "react";
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

  useEffect(() => {
    if (!user || !isAdmin) navigate("/login");
  }, [user, isAdmin, navigate]);

  // Fetch stats and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          statsRes,
          productsRes,
          categoriesRes,
          ordersRes,
          usersRes,
          vouchersRes,
          customOrdersRes
        ] = await Promise.all([
          adminService.getDashboardStats(),
          productService.getAll(undefined, undefined, 20, 0),
          categoryService.getAll(),
          adminService.getTransactions(),
          adminService.getUsers(),
          adminService.getVouchers(),
          adminService.getCustomOrders()
        ]);

        if (statsRes.data) {
          const data = statsRes.data;
          setStats([
            { label: "Total Transaksi", value: String(data.total_transactions || 0), icon: TrendingUp, trend: "+12%", color: "from-sky-500/20 to-sky-500/5" },
            { label: "Pendapatan", value: formatCurrency(data.total_revenue || 0), icon: DollarSign, trend: "+8%", color: "from-primary/20 to-primary/5" },
            { label: "Pengguna", value: String(data.total_users || 0), icon: Users, trend: "+5", color: "from-slate-500/20 to-slate-500/5" },
            { label: "Sukses Transaksi", value: String(data.success_transactions || 0), icon: CheckCircle, trend: "+90%", color: "from-emerald-500/20 to-emerald-500/5" },
          ]);
        }

        if (productsRes.data?.data) {
          setProducts(productsRes.data.data);
        }

        if (categoriesRes.data) {
          setCategories(categoriesRes.data);
        }

        if (ordersRes.data) {
          setOrders(ordersRes.data);
        }

        if (usersRes.data) {
          setUsers(usersRes.data);
        }

        if (vouchersRes.data) {
          setVouchers(vouchersRes.data);
        }

        if (customOrdersRes.data) {
          setCustomOrders(customOrdersRes.data);
        }

        setError("");
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
        setError("Gagal memuat data admin. Pastikan login admin, token valid, dan backend API berjalan.");
      } finally {
        setLoading(false);
      }
    };

    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

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
      fetchData();
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
      fetchData();
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
      fetchData();
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
      fetchData();
    } catch (error) {
      console.error('Failed to delete category', error);
      setError('Gagal menghapus kategori.');
    } finally {
      setLoading(false);
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

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
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
                      <Button variant="outline" className="h-20 flex flex-col items-center gap-2 border-slate-300 hover:bg-slate-50 hover:border-slate-300">
                        <Sparkles className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium">Buat Voucher</span>
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col items-center gap-2 border-slate-300 hover:bg-slate-50 hover:border-slate-300">
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
                        {[
                          { type: 'order', message: 'Pesanan baru dari John Doe', time: '2 menit yang lalu', icon: ShoppingBag, color: 'text-primary' },
                          { type: 'user', message: 'Pengguna baru mendaftar: Jane Smith', time: '15 menit yang lalu', icon: UserCheck, color: 'text-green-600' },
                          { type: 'product', message: 'Produk "Mobile POS" berhasil dijual', time: '1 jam yang lalu', icon: Package, color: 'text-purple-600' },
                          { type: 'voucher', message: 'Voucher DISKON10 digunakan', time: '2 jam yang lalu', icon: Sparkles, color: 'text-orange-600' },
                        ].map((activity, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                              <activity.icon className={`h-4 w-4 ${activity.color}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                              <p className="text-xs text-slate-500">{activity.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Ringkasan Hari Ini
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Penjualan</span>
                          <span className="font-semibold text-slate-900">Rp 2.5M</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Pengguna Baru</span>
                          <span className="font-semibold text-green-600">+12</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-slate-600">Order Custom</span>
                          <span className="font-semibold text-purple-600">3</span>
                        </div>
                        <div className="pt-2 border-t border-slate-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-900">Total Revenue</span>
                            <span className="font-bold text-lg text-primary">Rp 4.2M</span>
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
                    <div key={o.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <ShoppingBag className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{o.productName || o.product?.name}</p>
                        <p className="text-xs text-muted-foreground">{o.id} • {o.user?.name || o.userName}</p>
                      </div>
                      <p className="font-semibold text-sm text-primary">{formatCurrency(o.total || o.amount)}</p>
                      <Badge variant={o.status === "completed" ? "default" : o.status === "processing" ? "secondary" : "outline"} className="rounded-lg">
                        {o.status === "completed" ? "Selesai" : o.status === "processing" ? "Proses" : "Pending"}
                      </Badge>
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
                    <div key={u.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                      <Avatar className="w-10 h-10 rounded-xl flex-shrink-0">
                        <AvatarImage src={u.avatar} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-bold text-xs">
                          {u.name?.split(" ").map(n => n[0]).join("") || u.email?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">{u.orderCount || 0} pesanan</p>
                      <Button variant="ghost" size="sm" className="rounded-lg text-xs"><Eye className="h-3.5 w-3.5 mr-1" /> Detail</Button>
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
                <Button size="sm" className="rounded-xl gap-1.5 shadow-md shadow-primary/20"><Plus className="h-4 w-4" /> Buat Voucher</Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {vouchers.length > 0 ? vouchers.map((v) => (
                    <div key={v.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Tag className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-mono font-bold text-sm">{v.code}</p>
                        <p className="text-xs text-muted-foreground">
                          Diskon {v.discountType === 'percentage' ? `${v.discountValue}%` : formatCurrency(v.discountValue)} • 
                          {v.usedCount || 0}/{v.usageLimit || '∞'} used
                        </p>
                      </div>
                      <Badge variant={v.isActive ? "default" : "secondary"} className="rounded-lg">
                        {v.isActive ? "Aktif" : "Expired"}
                      </Badge>
                      <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8"><Edit className="h-4 w-4" /></Button>
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
                <div className="space-y-3">
                  {customOrders.length > 0 ? customOrders.map((t) => (
                    <div key={t.id} className="flex items-center gap-4 p-4 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        t.status === "completed" ? "bg-success/10" : t.status === "in_progress" ? "bg-primary/10" : "bg-warning/10"
                      }`}>
                        {t.status === "completed" ? <CheckCircle className="h-5 w-5 text-success" /> : 
                         t.status === "in_progress" ? <Clock className="h-5 w-5 text-primary" /> : 
                         <AlertCircle className="h-5 w-5 text-warning" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{t.title}</p>
                        <p className="text-xs text-muted-foreground">{t.id} • {t.user?.name || t.userName} • {formatCurrency(t.budget)}</p>
                      </div>
                      <Badge variant={t.status === "completed" ? "default" : t.status === "in_progress" ? "secondary" : "outline"} className="rounded-lg">
                        {t.status === "completed" ? "Selesai" : t.status === "in_progress" ? "Dikerjakan" : "Pending"}
                      </Badge>
                      <Button variant="ghost" size="sm" className="rounded-lg text-xs"><Eye className="h-3.5 w-3.5 mr-1" /> Detail</Button>
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
                <div className="space-y-4">
                  {[
                    { name: 'E-commerce Script', type: 'PHP', size: '2.5MB', downloads: 1250, rating: 4.8, status: 'active' },
                    { name: 'POS System', type: 'Node.js', size: '1.8MB', downloads: 890, rating: 4.6, status: 'active' },
                    { name: 'CRM Dashboard', type: 'React', size: '3.2MB', downloads: 654, rating: 4.9, status: 'active' },
                    { name: 'Inventory Management', type: 'Python', size: '1.4MB', downloads: 432, rating: 4.3, status: 'pending' },
                  ].map((script) => (
                    <Card key={script.name} className="rounded-xl border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <Code className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{script.name}</p>
                              <p className="text-xs text-muted-foreground">{script.type} • {script.size} • ⭐ {script.rating}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-medium">{script.downloads.toLocaleString()}</p>
                              <p className="text-xs text-muted-foreground">downloads</p>
                            </div>
                            <Badge variant={script.status === 'active' ? 'default' : 'secondary'} className="rounded-lg">
                              {script.status === 'active' ? 'Aktif' : 'Pending'}
                            </Badge>
                            <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">General</h3>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Nama Marketplace</Label>
                          <Input defaultValue="PastoDEV" className="mt-1 rounded-xl" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Email Admin</Label>
                          <Input defaultValue="admin@pastopup.id" className="mt-1 rounded-xl" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Bahasa Default</Label>
                          <Select defaultValue="id">
                            <SelectTrigger className="mt-1 rounded-xl">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="id">Bahasa Indonesia</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Payment</h3>
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Midtrans Server Key</Label>
                          <Input type="password" placeholder="SB-Mid-server-xxx" className="mt-1 rounded-xl" />
                        </div>
                        <div>
                          <Label className="text-sm font-medium">Midtrans Client Key</Label>
                          <Input type="password" placeholder="SB-Mid-client-xxx" className="mt-1 rounded-xl" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Mode Production</Label>
                          <Button variant="outline" size="sm" className="rounded-xl">
                            Aktifkan
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

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
                    Notifikasi
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifikasi Order Baru</p>
                      <p className="text-sm text-muted-foreground">Kirim email ketika ada order baru</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl">Aktif</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Push Notification Admin</p>
                      <p className="text-sm text-muted-foreground">Notifikasi real-time untuk admin</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl">Aktif</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Report</p>
                      <p className="text-sm text-muted-foreground">Laporan mingguan via email</p>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-xl">Aktif</Button>
                  </div>
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
