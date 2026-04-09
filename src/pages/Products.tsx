import { useState, useEffect } from "react";
import { Search, SlidersHorizontal, Package, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { productService, categoryService } from "@/services/api";

interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  discount_price?: number;
  discount_percent?: number;
  thumbnail_url?: string;
  category_id: number;
  created_at?: string;
}

interface Category {
  id: number;
  name: string;
  slug?: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll();
        if (response.data?.data) {
          setCategories(response.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await productService.getAll(
          catFilter !== "all" ? parseInt(catFilter) : undefined,
          search || undefined,
          100,
          0
        );
        if (response.data?.data) {
          setProducts(response.data.data);
          setError("");
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
        setError("Gagal memuat produk. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [catFilter, search]);

  // Filter and sort products
  let filtered = [...products];

  if (sort === "price-asc") filtered.sort((a, b) => (a.discount_price || a.price) - (b.discount_price || b.price));
  else if (sort === "price-desc") filtered.sort((a, b) => (b.discount_price || b.price) - (a.discount_price || a.price));
  else if (sort === "newest") filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <div className="mb-8 opacity-0 animate-fade-in">
          <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-1">Store</p>
          <h1 className="text-3xl md:text-4xl font-bold">Semua Produk</h1>
          <p className="text-muted-foreground mt-1">{filtered.length} produk tersedia</p>
        </div>

        {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-lg">{error}</div>}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-8 opacity-0 animate-slide-up stagger-1">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-11 h-11 rounded-xl border-border/50 focus:border-primary/30 transition-colors"
            />
          </div>
          <Select value={catFilter} onValueChange={setCatFilter}>
            <SelectTrigger className="w-full md:w-48 h-11 rounded-xl border-border/50">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-full md:w-48 h-11 rounded-xl border-border/50">
              <SelectValue placeholder="Urutkan" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="newest">Terbaru</SelectItem>
              <SelectItem value="price-asc">Harga Terendah</SelectItem>
              <SelectItem value="price-desc">Harga Tertinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category quick filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide opacity-0 animate-slide-up stagger-2">
          <button
            onClick={() => setCatFilter("all")}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              catFilter === "all" ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            Semua
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCatFilter(c.id.toString())}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                catFilter === c.id.toString() ? "bg-primary text-primary-foreground shadow-md shadow-primary/25" : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-24 opacity-0 animate-fade-in">
            <Loader className="h-10 w-10 text-primary/50 mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Memuat produk...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 opacity-0 animate-fade-in">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Tidak ada produk ditemukan</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Coba ubah kata kunci pencarian</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p, i) => (
              <div key={p.id} className={`opacity-0 animate-slide-up`} style={{ animationDelay: `${0.1 * (i % 8)}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Products;
