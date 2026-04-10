import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QrCode, Wallet, Tag, CheckCircle, ShieldCheck, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/format";
import { useToast } from "@/hooks/use-toast";
import { cartService, checkoutService } from "@/services/api";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { QrisPayDialog } from "@/components/QrisPayDialog";

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [voucherCode, setVoucherCode] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"qris" | "balance">("qris");
  const [orderComplete, setOrderComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState<number | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrString, setQrString] = useState<string | null>(null);
  const [pollTxId, setPollTxId] = useState<number | null>(null);
  const [orderHint, setOrderHint] = useState("");
  const [expiryHint, setExpiryHint] = useState<string | null>(null);

  const syncServerCart = async () => {
    for (const item of items) {
      const pid = Number(item.product.id);
      await cartService.addItem({ product_id: pid, quantity: item.quantity ?? 1 });
    }
  };

  const runCheckout = async () => {
    if (!user) {
      toast({ title: "Login diperlukan", description: "Silakan login untuk checkout.", variant: "destructive" });
      navigate("/login");
      return;
    }
    if (items.length === 0) return;

    setConfirmOpen(false);
    setLoading(true);
    try {
      await syncServerCart();

      const backendMethod = paymentMethod === "qris" ? "midtrans_qris" : "balance";
      const res = await checkoutService.checkout({
        payment_method: backendMethod,
        voucher_code: voucherCode.trim() || undefined,
      });

      const data = res.data?.data as {
        transaction_id?: number;
        qr_string?: string;
        order_id?: string;
        expiry_time?: string;
        redirect_rating?: string;
      };

      if (backendMethod === "balance") {
        clearCart();
        setLastTransactionId(data.transaction_id ?? null);
        setOrderComplete(true);
        toast({ title: "Pesanan berhasil", description: "Terima kasih telah berbelanja" });
        return;
      }

      const qs = data?.qr_string;
      const tid = data?.transaction_id;
      if (!qs || !tid) {
        toast({
          title: "QRIS",
          description: "Respons server tidak berisi QR. Periksa Midtrans di backend.",
          variant: "destructive",
        });
        return;
      }

      setQrString(qs);
      setPollTxId(tid);
      setOrderHint(data.order_id || "");
      setExpiryHint(data.expiry_time || null);
      setLastTransactionId(tid);
      setQrOpen(true);
      toast({ title: "QRIS siap", description: "Scan untuk menyelesaikan pembayaran." });
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: "Checkout gagal", description: msg || "Periksa saldo, voucher, atau API.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto animate-scale-in">
            <div className="w-24 h-24 rounded-3xl bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-14 w-14 text-success animate-bounce-subtle" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Pesanan Berhasil</h1>
            <p className="text-muted-foreground mb-8">Terima kasih telah berbelanja.</p>
            <div className="flex flex-wrap gap-3 justify-center">
              {lastTransactionId != null && (
                <Link to={`/rating?transaction_id=${lastTransactionId}`}>
                  <Button className="rounded-xl shadow-md shadow-primary/20">Beri rating</Button>
                </Link>
              )}
              <Link to="/dashboard">
                <Button variant="outline" className="rounded-xl">
                  Dashboard
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" className="rounded-xl">
                  Belanja Lagi
                </Button>
              </Link>
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
          <Link to="/products">
            <Button className="mt-4 rounded-xl">Belanja</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="opacity-0 animate-fade-in mb-8">
          <h1 className="text-3xl font-bold">Checkout</h1>
          <p className="text-muted-foreground mt-1">Selesaikan pembelian Anda</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl border-border/50 opacity-0 animate-slide-up stagger-1">
              <CardContent className="p-6">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" /> Produk ({items.length})
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                      <img
                        src={item.product.thumbnail || (item.product as { thumbnail_url?: string }).thumbnail_url}
                        alt={item.product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <span className="flex-1 text-sm font-medium">{item.product.name}</span>
                      <span className="font-bold text-sm text-primary">{formatCurrency(item.product.price)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 opacity-0 animate-slide-up stagger-2">
              <CardContent className="p-6">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" /> Kode Voucher
                </h2>
                <div className="flex gap-2">
                  <Input
                    placeholder="Masukkan kode voucher"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    className="rounded-xl h-11"
                  />
                  <Button
                    variant="outline"
                    type="button"
                    className="rounded-xl h-11 px-6"
                    onClick={() => toast({ title: "Voucher", description: "Kode divalidasi saat bayar." })}
                  >
                    Info
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border/50 opacity-0 animate-slide-up stagger-3">
              <CardContent className="p-6">
                <h2 className="font-bold mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" /> Metode Pembayaran
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("qris")}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                      paymentMethod === "qris"
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        paymentMethod === "qris" ? "bg-primary/15" : "bg-muted"
                      }`}
                    >
                      <QrCode className={`h-6 w-6 ${paymentMethod === "qris" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">QRIS</p>
                      <p className="text-xs text-muted-foreground">Midtrans Core</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("balance")}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
                      paymentMethod === "balance"
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                        paymentMethod === "balance" ? "bg-primary/15" : "bg-muted"
                      }`}
                    >
                      <Wallet className={`h-6 w-6 ${paymentMethod === "balance" ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">Saldo</p>
                      <p className="text-xs text-muted-foreground">Potong saldo akun</p>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="opacity-0 animate-slide-up stagger-3">
            <Card className="sticky top-20 rounded-2xl border-border/50 shadow-sm">
              <CardContent className="p-6 space-y-5">
                <h2 className="font-bold text-lg">Ringkasan Pembayaran</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  {voucherCode.trim() && (
                    <p className="text-xs text-muted-foreground">Diskon voucher dihitung di server saat checkout.</p>
                  )}
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total (estimasi)</span>
                  <span className="text-gradient">{formatCurrency(totalPrice)}</span>
                </div>
                <Button
                  className="w-full rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  size="lg"
                  onClick={() => setConfirmOpen(true)}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Bayar Sekarang <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <p className="text-[11px] text-muted-foreground text-center flex items-center justify-center gap-1">
                  <ShieldCheck className="h-3 w-3" /> Konfirmasi sebelum memproses pembayaran
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi pembayaran</AlertDialogTitle>
            <AlertDialogDescription>
              Total {formatCurrency(totalPrice)} dengan metode{" "}
              <strong className="text-foreground">{paymentMethod === "qris" ? "QRIS Midtrans" : "saldo akun"}</strong>.
              Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl" onClick={() => void runCheckout()}>
              Ya, lanjutkan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <QrisPayDialog
        open={qrOpen}
        onOpenChange={(o) => {
          setQrOpen(o);
          if (!o) setQrString(null);
        }}
        qrString={qrString}
        transactionId={pollTxId}
        amountLabel={formatCurrency(totalPrice)}
        orderHint={orderHint}
        expiryHint={expiryHint}
        onSuccess={() => {
          clearCart();
          setQrOpen(false);
          setOrderComplete(true);
          toast({ title: "Pembayaran berhasil", description: "Transaksi telah dikonfirmasi." });
        }}
        onFailed={() => {
          toast({ title: "Pembayaran gagal", variant: "destructive" });
        }}
      />
    </Layout>
  );
};

export default Checkout;
