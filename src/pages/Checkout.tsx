import { useState } from "react";
import { Link } from "react-router-dom";
import { QrCode, Wallet, Tag, CheckCircle, ShieldCheck, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "balance">("qris");
  const [orderComplete, setOrderComplete] = useState(false);

  const applyVoucher = () => {
    if (voucherCode.toLowerCase() === "diskon10") {
      setDiscount(totalPrice * 0.1);
      toast({ title: "Voucher diterapkan! 🎉", description: "Diskon 10% berhasil" });
    } else {
      toast({ title: "Voucher tidak valid", variant: "destructive" });
    }
  };

  const handleCheckout = () => {
    setOrderComplete(true);
    clearCart();
    toast({ title: "Pesanan berhasil! 🎉", description: "Terima kasih telah berbelanja" });
  };

  if (orderComplete) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto animate-scale-in">
            <div className="w-24 h-24 rounded-3xl bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-14 w-14 text-success animate-bounce-subtle" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Pesanan Berhasil! 🎉</h1>
            <p className="text-muted-foreground mb-8">Silakan lakukan pembayaran untuk mengakses produk Anda.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/dashboard"><Button className="rounded-xl shadow-md shadow-primary/20">Dashboard</Button></Link>
              <Link to="/products"><Button variant="outline" className="rounded-xl">Belanja Lagi</Button></Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center animate-fade-in">
          <p className="text-muted-foreground text-lg">Keranjang kosong</p>
          <Link to="/products"><Button className="mt-4 rounded-xl">Belanja</Button></Link>
        </div>
      </Layout>
    );
  }

  const finalTotal = totalPrice - discount;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="opacity-0 animate-fade-in mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground mt-1">Selesaikan pembelian Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <Card className="rounded-2xl border-border/50 opacity-0 animate-slide-up stagger-1">
              <CardContent className="p-6">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Produk ({items.length})
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <img src={item.product.thumbnail} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <span className="flex-1 text-sm font-medium">{item.product.name}</span>
                      <span className="font-bold text-sm text-primary">{formatCurrency(item.product.price)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Voucher */}
            <Card className="rounded-2xl border-border/50 opacity-0 animate-slide-up stagger-2">
              <CardContent className="p-6">
                <h2 className="font-bold mb-4 flex items-center gap-2"><Tag className="h-4 w-4 text-primary" /> Kode Voucher</h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode voucher"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="rounded-xl h-11"
                  />
                  <Button variant="outline" onClick={applyVoucher} className="rounded-xl h-11 px-6">Terapkan</Button>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card className="rounded-2xl border-border/50 opacity-0 animate-slide-up stagger-3">
              <CardContent className="p-6">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Metode Pembayaran
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setPaymentMethod("qris")}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                      paymentMethod === "qris"
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === "qris" ? "bg-primary/15" : "bg-muted"}`}>
                      <QrCode className={`h-6 w-6 ${paymentMethod === "qris" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">QRIS</p>
                      <p className="text-xs text-muted-foreground">Scan & bayar instant</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("balance")}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                      paymentMethod === "balance"
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${paymentMethod === "balance" ? "bg-primary/15" : "bg-muted"}`}>
                      <Wallet className={`h-6 w-6 ${paymentMethod === "balance" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Saldo</p>
                      <p className="text-xs text-muted-foreground">Rp 150.000</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary */}
          <div className="opacity-0 animate-slide-up stagger-3">
            <Card className="sticky top-20 rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <h2 className="font-bold text-lg">Ringkasan Pembayaran</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Diskon</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-gradient">{formatCurrency(finalTotal)}</span>
                </div>
                <Button 
                  className="w-full rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300" 
                  size="lg" 
                  onClick={handleCheckout}
                >
                  Bayar Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Transaksi aman & terenkripsi
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
