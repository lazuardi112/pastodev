import { Link } from "react-router-dom";
import { Trash2, ArrowRight, ShoppingBag, Package, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/format";

const Cart = () => {
  const { items, removeFromCart, clearCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center animate-fade-in">
          <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Keranjang Kosong</h1>
          <p className="text-muted-foreground mb-8">Belum ada produk di keranjang Anda</p>
          <Link to="/products">
            <Button className="rounded-xl shadow-md shadow-primary/20 gap-2">
              <Package className="h-4 w-4" /> Jelajahi Produk
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="opacity-0 animate-fade-in mb-8">
          <h1 className="text-3xl font-bold">Keranjang Belanja</h1>
          <p className="text-muted-foreground mt-1">{items.length} produk</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item, i) => (
              <Card key={item.product.id} className={`rounded-2xl border-border/50 hover-lift opacity-0 animate-slide-up`} style={{ animationDelay: `${0.1 * i}s` }}>
                <CardContent className="p-4 flex gap-4">
                  <img 
                    src={item.product.thumbnail} 
                    alt={item.product.name} 
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <Link to={`/products/${item.product.slug}`} className="font-semibold hover:text-primary transition-colors text-sm">
                      {item.product.name}
                    </Link>
                    <p className="text-xs text-muted-foreground mt-1">{item.product.categoryName}</p>
                    <p className="font-bold text-primary mt-2">{formatCurrency(item.product.price)}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeFromCart(item.product.id)}
                    className="rounded-xl hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" size="sm" onClick={clearCart} className="rounded-xl text-xs">
              Kosongkan Keranjang
            </Button>
          </div>

          <div className="opacity-0 animate-slide-up stagger-2">
            <Card className="sticky top-20 rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <h2 className="font-bold text-lg flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Ringkasan
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal ({items.length} produk)</span>
                    <span className="font-medium">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Diskon</span>
                    <span className="text-muted-foreground">-</span>
                  </div>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gradient">{formatCurrency(totalPrice)}</span>
                </div>
                <Link to="/checkout">
                  <Button className="w-full rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" size="lg">
                    Checkout <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
