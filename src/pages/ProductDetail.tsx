import { useParams, Link } from "react-router-dom";
import { ShoppingCart, Star, Copy, Share2, ArrowLeft, Download, CheckCircle, Shield, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { products, reviews } from "@/data/mock";
import { formatCurrency, formatDate } from "@/lib/format";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/hooks/use-toast";

const ProductDetail = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center animate-fade-in">
          <p className="text-lg text-muted-foreground">Produk tidak ditemukan</p>
          <Link to="/products"><Button className="mt-4 rounded-xl">Kembali ke Produk</Button></Link>
        </div>
      </Layout>
    );
  }

  const productReviews = reviews.filter((r) => r.productId === product.id);
  const related = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link disalin! 📋" });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link to="/products" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors opacity-0 animate-fade-in group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Store
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden border border-border/50 shadow-sm opacity-0 animate-scale-in group">
            <img 
              src={product.thumbnail} 
              alt={product.name} 
              className="w-full h-auto object-cover aspect-video group-hover:scale-105 transition-transform duration-700" 
            />
          </div>

          {/* Details */}
          <div className="space-y-6 opacity-0 animate-slide-up stagger-1">
            <div>
              <div className="flex gap-2 mb-3">
                <Badge variant="secondary" className="rounded-lg">{product.categoryName}</Badge>
                {product.subcategoryName && <Badge variant="outline" className="rounded-lg">{product.subcategoryName}</Badge>}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-warning/10 px-3 py-1.5 rounded-xl">
                <Star className="h-4 w-4 fill-warning text-warning" />
                <span className="font-bold text-sm">{product.rating}</span>
              </div>
              <span className="text-muted-foreground text-sm">({product.reviewCount} ulasan)</span>
              <Separator orientation="vertical" className="h-4" />
              <span className="text-muted-foreground text-sm flex items-center gap-1">
                <Download className="h-3.5 w-3.5" /> {product.downloads} download
              </span>
            </div>

            <div className="text-3xl md:text-4xl font-black text-gradient">{formatCurrency(product.price)}</div>

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            {/* Features */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: CheckCircle, label: "Garansi 100%" },
                { icon: Shield, label: "Source Code" },
                { icon: Zap, label: "Update Free" },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 text-xs font-medium">
                  <f.icon className="h-4 w-4 text-primary flex-shrink-0" />
                  {f.label}
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/cart" className="flex-1">
                <Button className="w-full rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" size="lg" onClick={() => addToCart(product)}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Beli Sekarang
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="rounded-xl hover:border-primary/30 transition-colors" onClick={() => { addToCart(product); toast({ title: "Ditambahkan ke keranjang! 🛒" }); }}>
                Tambah ke Keranjang
              </Button>
            </div>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={copyLink} className="rounded-xl hover:bg-accent gap-1.5">
                <Copy className="h-4 w-4" /> Copy Link
              </Button>
              <Button variant="ghost" size="sm" onClick={copyLink} className="rounded-xl hover:bg-accent gap-1.5">
                <Share2 className="h-4 w-4" /> Share
              </Button>
              <Button variant="ghost" size="sm" className="rounded-xl hover:bg-destructive/10 hover:text-destructive gap-1.5">
                <Heart className="h-4 w-4" /> Wishlist
              </Button>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <section className="mb-16 opacity-0 animate-fade-in">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" /> Ulasan ({productReviews.length})
          </h2>
          {productReviews.length === 0 ? (
            <Card className="rounded-2xl border-border/50">
              <CardContent className="p-8 text-center text-muted-foreground">
                Belum ada ulasan untuk produk ini
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {productReviews.map((r, i) => (
                <Card key={r.id} className={`rounded-2xl border-border/50 hover-lift opacity-0 animate-slide-up`} style={{ animationDelay: `${0.1 * i}s` }}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-xs font-bold">
                        {r.userName.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{r.userName}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1 bg-warning/10 px-2.5 py-1 rounded-lg">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="text-sm font-bold">{r.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Related */}
        {related.length > 0 && (
          <section className="opacity-0 animate-fade-in">
            <h2 className="text-xl font-bold mb-6">Produk Terkait</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {related.map((p, i) => (
                <div key={p.id} className={`opacity-0 animate-slide-up`} style={{ animationDelay: `${0.1 * i}s` }}>
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetail;
