import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { categories, products } from "@/data/mock";

const CategoryDetail = () => {
  const { slug, subSlug } = useParams();
  const category = categories.find((c) => c.slug === slug);

  if (!category) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center animate-fade-in">
          <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Kategori tidak ditemukan</p>
          <Link to="/categories"><button className="mt-4 text-primary font-semibold hover:underline">Kembali</button></Link>
        </div>
      </Layout>
    );
  }

  const subcategory = subSlug ? category.subcategories.find((s) => s.slug === subSlug) : null;
  const filtered = products.filter((p) => {
    if (subcategory) return p.subcategoryId === subcategory.id;
    return p.categoryId === category.id;
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Link to="/categories" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors opacity-0 animate-fade-in group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Semua Kategori
        </Link>

        <div className="mb-8 opacity-0 animate-fade-in stagger-1">
          <h1 className="text-3xl md:text-4xl font-bold">{subcategory ? subcategory.name : category.name}</h1>
          {subcategory && <p className="text-muted-foreground mt-1">Kategori: {category.name}</p>}
        </div>

        {!subcategory && (
          <div className="flex flex-wrap gap-2 mb-8 opacity-0 animate-slide-up stagger-2">
            <Link to={`/categories/${category.slug}`}>
              <Badge className="rounded-full px-4 py-1.5 text-xs cursor-pointer shadow-sm shadow-primary/20">Semua</Badge>
            </Link>
            {category.subcategories.map((sub) => (
              <Link key={sub.id} to={`/categories/${category.slug}/${sub.slug}`}>
                <Badge variant="outline" className="rounded-full px-4 py-1.5 text-xs cursor-pointer hover:bg-accent hover:border-primary/30 transition-colors">{sub.name}</Badge>
              </Link>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24 opacity-0 animate-fade-in">
            <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Belum ada produk di kategori ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((p, i) => (
              <div key={p.id} className="opacity-0 animate-slide-up" style={{ animationDelay: `${0.1 * i}s` }}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoryDetail;
