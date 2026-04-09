import { Link } from "react-router-dom";
import { Code, Globe, Smartphone, ArrowRight, ChevronRight, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { categories } from "@/data/mock";

const Categories = () => {
  const icons = [Code, Globe, Smartphone];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-10 opacity-0 animate-fade-in">
          <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-1">Kategori</p>
          <h1 className="text-3xl md:text-4xl font-bold">Kategori Produk</h1>
          <p className="text-muted-foreground mt-1">Pilih kategori sesuai kebutuhan Anda</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => {
            const Icon = icons[i];
            return (
              <Card key={cat.id} className={`rounded-2xl border-border/50 hover-lift opacity-0 animate-slide-up stagger-${i + 1}`}>
                <CardContent className="p-7 space-y-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">{cat.name}</h2>
                      <p className="text-sm text-muted-foreground">{cat.description}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {cat.subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/categories/${cat.slug}/${sub.slug}`}
                        className="flex items-center justify-between py-2.5 px-4 rounded-xl hover:bg-accent text-sm group transition-all duration-200"
                      >
                        <span className="text-muted-foreground group-hover:text-foreground transition-colors">{sub.name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))}
                  </div>
                  <Link to={`/categories/${cat.slug}`}>
                    <button className="text-sm text-primary font-semibold hover:underline mt-2 flex items-center gap-1 group">
                      Lihat semua <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default Categories;
