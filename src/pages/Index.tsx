import { Link } from "react-router-dom";
import { ArrowRight, Code, Globe, Smartphone, Star, Zap, Shield, HeadphonesIcon, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { categories, products, testimonials } from "@/data/mock";

const Index = () => {
  const featuredProducts = products.filter((p) => p.featured);
  const latestProducts = [...products].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const categoryIcons = [Code, Globe, Smartphone];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl animate-float" style={{ animationDelay: "1.5s" }} />
        
        <div className="container mx-auto px-4 py-20 md:py-36 relative">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium opacity-0 animate-fade-in border border-primary/20 shadow-sm">
              <Sparkles className="h-4 w-4 animate-bounce-subtle" /> Marketplace Produk Digital #1
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1.1] tracking-tight opacity-0 animate-fade-in stagger-1">
              Solusi Digital untuk
              <span className="text-gradient block mt-1">Bisnis Anda</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto opacity-0 animate-fade-in stagger-2 leading-relaxed">
              Dapatkan script website, template, dan aplikasi berkualitas tinggi. Siap pakai, mudah dikustomisasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center opacity-0 animate-fade-in stagger-3">
              <Link to="/products">
                <Button size="lg" className="w-full sm:w-auto rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 gap-2 text-base px-8">
                  Jelajahi Produk <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/custom-order">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-xl hover:bg-accent transition-all duration-300 text-base px-8">
                  Order Custom
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card/50 relative overflow-hidden">
        <div className="absolute inset-0 shimmer-bg opacity-50" />
        <div className="container mx-auto px-4 py-10 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Produk", value: "50+", icon: Code },
              { label: "Download", value: "1.2K+", icon: TrendingUp },
              { label: "Pelanggan", value: "500+", icon: Users },
              { label: "Rating", value: "4.8/5", icon: Star },
            ].map((s, i) => (
              <div key={s.label} className={`opacity-0 animate-slide-up stagger-${i + 1}`}>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-2xl md:text-3xl font-black text-gradient">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-2">Kategori</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Kategori Produk</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Temukan produk digital sesuai kebutuhan Anda</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat, i) => {
            const Icon = categoryIcons[i];
            return (
              <Link to={`/categories/${cat.slug}`} key={cat.id}>
                <Card className={`group hover-lift cursor-pointer h-full rounded-2xl border-border/50 hover:border-primary/30 opacity-0 animate-slide-up stagger-${i + 1}`}>
                  <CardContent className="p-7 text-center space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mx-auto group-hover:from-primary/25 group-hover:to-primary/10 transition-all duration-500 group-hover:scale-110">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-bold text-lg">{cat.name}</h3>
                    <p className="text-sm text-muted-foreground">{cat.description}</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {cat.subcategories.map((sub) => (
                        <span key={sub.id} className="text-xs px-3 py-1.5 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                          {sub.name}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="flex items-center justify-between mb-10 opacity-0 animate-fade-in">
            <div>
              <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-1">Unggulan</p>
              <h2 className="text-3xl md:text-4xl font-bold">Produk Unggulan</h2>
            </div>
            <Link to="/products">
              <Button variant="outline" className="rounded-xl gap-2 hover-scale">
                Lihat Semua <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p, i) => (
              <div key={p.id} className={`opacity-0 animate-slide-up stagger-${i + 1}`}>
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-between mb-10 opacity-0 animate-fade-in">
          <div>
            <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-1">Terbaru</p>
            <h2 className="text-3xl md:text-4xl font-bold">Produk Terbaru</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {latestProducts.map((p, i) => (
            <div key={p.id} className={`opacity-0 animate-slide-up stagger-${i + 1}`}>
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* Why PastoDEV */}
      <section className="bg-muted/30">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-12 opacity-0 animate-fade-in">
            <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-2">Keunggulan</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Kenapa PastoDEV?</h2>
            <p className="text-muted-foreground">Keunggulan berbelanja di marketplace kami</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: "Produk Terverifikasi", desc: "Semua produk diuji kualitasnya sebelum dipublish" },
              { icon: Zap, title: "Update Gratis", desc: "Dapatkan update produk secara gratis selamanya" },
              { icon: HeadphonesIcon, title: "Support 24/7", desc: "Tim support siap membantu kapanpun Anda butuhkan" },
            ].map((f, i) => (
              <Card key={f.title} className={`border-border/50 rounded-2xl hover-lift opacity-0 animate-slide-up stagger-${i + 1}`}>
                <CardContent className="p-8 text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mx-auto">
                    <f.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 opacity-0 animate-fade-in">
          <p className="text-sm text-primary font-semibold uppercase tracking-wider mb-2">Testimoni</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">Testimoni Pelanggan</h2>
          <p className="text-muted-foreground">Apa kata mereka tentang PastoDEV</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <Card key={t.name} className={`border-border/50 rounded-2xl hover-lift opacity-0 animate-slide-up stagger-${i + 1}`}>
              <CardContent className="p-7 space-y-5">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground italic leading-relaxed">"{t.comment}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <Card className="overflow-hidden relative rounded-3xl border-0 opacity-0 animate-fade-in">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-primary/80" />
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 right-20 w-32 h-32 bg-primary-foreground rounded-full blur-2xl" />
            <div className="absolute bottom-10 left-20 w-24 h-24 bg-primary-foreground rounded-full blur-xl" />
          </div>
          <CardContent className="relative p-10 md:p-16 text-center space-y-5">
            <h2 className="text-3xl md:text-4xl font-black text-primary-foreground">Butuh Solusi Custom? 🚀</h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto text-lg">
              Kami siap membantu membuatkan script, website, atau aplikasi sesuai kebutuhan bisnis Anda.
            </p>
            <Link to="/custom-order">
              <Button size="lg" variant="secondary" className="mt-3 rounded-xl text-base px-10 shadow-lg hover:shadow-xl transition-all duration-300 hover-scale">
                Order Custom Sekarang <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </Layout>
  );
};

export default Index;
