import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Wallet, QrCode, Loader2, Sparkles, ShieldCheck, Info, Banknote } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { paymentService } from "@/services/api";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getApiBaseUrl } from "@/lib/apiBaseUrl";
import { QrisPayDialog } from "@/components/QrisPayDialog";

const MIN = 10_000;
const PRESETS = [50_000, 100_000, 250_000, 500_000, 1_000_000];

const Topup = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState<string>("100000");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrString, setQrString] = useState<string | null>(null);
  const [txId, setTxId] = useState<number | null>(null);
  const [orderId, setOrderId] = useState<string>("");
  const [expiryHint, setExpiryHint] = useState<string | null>(null);

  const isProd = import.meta.env.VITE_MIDTRANS_IS_PRODUCTION === "true";
  const balance = Number(user?.balance ?? 0);

  const parseAmount = useCallback(() => {
    const raw = amount.replace(/\D/g, "");
    const n = parseInt(raw, 10);
    return Number.isFinite(n) ? n : NaN;
  }, [amount]);

  const handlePreset = (v: number) => {
    setAmount(String(v));
    toast.info("Nominal dipilih", { description: formatCurrency(v) });
  };

  const openConfirm = () => {
    const n = parseAmount();
    if (!Number.isFinite(n) || n < MIN) {
      toast.error("Nominal tidak valid", { description: `Minimal ${formatCurrency(MIN)}` });
      return;
    }
    setConfirmOpen(true);
  };

  const executeTopup = async () => {
    const n = parseAmount();
    setConfirmOpen(false);
    setLoading(true);
    toast.loading("Menyiapkan QRIS…", { id: "topup-load" });
    try {
      const res = await paymentService.topup(n);
      toast.dismiss("topup-load");
      const data = res.data?.data as {
        qr_string?: string;
        transaction_id?: number;
        order_id?: string;
        expiry_time?: string;
      };
      if (!data?.qr_string || !data?.transaction_id) {
        toast.error("Respons Midtrans tidak lengkap", {
          description: "Periksa MIDTRANS_SERVER_KEY dan aktivasi QRIS di dashboard Midtrans.",
        });
        return;
      }
      setQrString(data.qr_string);
      setTxId(data.transaction_id);
      setOrderId(data.order_id || "");
      setExpiryHint(data.expiry_time || null);
      setQrOpen(true);
      toast.success("QRIS siap", { description: "Scan kode untuk menyelesaikan pembayaran." });
    } catch (e: unknown) {
      toast.dismiss("topup-load");
      const err = e as { response?: { data?: { message?: string } }; message?: string };
      const msg = err?.response?.data?.message || err?.message;
      toast.error("Gagal membuat pembayaran", { description: msg || "Periksa backend dan jaringan." });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center max-w-md">
          <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-sm animate-in fade-in zoom-in-95">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Login diperlukan</h2>
            <p className="text-sm text-muted-foreground mb-6">Masuk untuk top up saldo PastoDEV.</p>
            <Button className="rounded-xl w-full" onClick={() => navigate("/login")}>
              Masuk
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const n = parseAmount();

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto px-4 py-8 md:py-12">
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background p-6 md:p-8 mb-8">
          <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shadow-inner">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Top Up Saldo</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Bayar dengan QRIS (Midtrans Core API)</p>
              </div>
            </div>
            <div className="rounded-2xl bg-card/80 border border-border/50 px-5 py-3 text-left shadow-sm">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Saldo saat ini</p>
              <p className="text-xl font-bold text-primary tabular-nums">{formatCurrency(balance)}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-5">
          <Card className="md:col-span-3 rounded-2xl border-border/50 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Banknote className="h-5 w-5 text-primary" />
                Nominal top up
              </CardTitle>
              <CardDescription>Minimal {formatCurrency(MIN)} — pilih cepat atau ketik manual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((v) => (
                  <Button
                    key={v}
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "rounded-xl border-border/60 tabular-nums",
                      parseAmount() === v && "border-primary bg-primary/5 text-primary"
                    )}
                    onClick={() => handlePreset(v)}
                  >
                    {formatCurrency(v)}
                  </Button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Jumlah (Rp)</Label>
                <Input
                  id="amount"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="100000"
                  value={amount}
                  onChange={(e) => {
                    const d = e.target.value.replace(/\D/g, "");
                    setAmount(d);
                  }}
                  className="rounded-xl h-12 text-lg font-semibold tabular-nums"
                />
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 shrink-0" />
                  Konfirmasi nominal di langkah berikutnya sebelum QRIS ditampilkan.
                </p>
              </div>
              <Button
                className="w-full rounded-xl h-12 gap-2 text-base shadow-lg shadow-primary/20 transition-all hover:scale-[1.01]"
                size="lg"
                onClick={openConfirm}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <QrCode className="h-5 w-5" />}
                Lanjut ke pembayaran
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2 rounded-2xl border-border/50 bg-muted/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Aman
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-3">
              <p>Pembayaran diproses oleh Midtrans. Saldo akan bertambah setelah status transaksi sukses.</p>
              <p className="text-xs border-t border-border/50 pt-3">
                Mode:{" "}
                <span className="font-medium text-foreground">{isProd ? "Production" : "Sandbox"}</span>
                {" · "}
                API: <span className="font-mono text-[11px] break-all">{getApiBaseUrl()}</span>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi top up</AlertDialogTitle>
            <AlertDialogDescription>
              Anda akan membayar sebesar <strong className="text-foreground">{formatCurrency(n)}</strong>{" "}
              melalui QRIS. Lanjutkan?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Batal</AlertDialogCancel>
            <AlertDialogAction className="rounded-xl" onClick={() => void executeTopup()}>
              Tampilkan QRIS
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <QrisPayDialog
        open={qrOpen}
        onOpenChange={(o) => {
          setQrOpen(o);
          if (!o) {
            setQrString(null);
            setTxId(null);
            refreshProfile?.();
          }
        }}
        qrString={qrString}
        transactionId={txId}
        amountLabel={formatCurrency(n)}
        orderHint={orderId}
        expiryHint={expiryHint}
        onSuccess={async () => {
          toast.success("Top up berhasil", { description: "Saldo telah diperbarui." });
          await refreshProfile?.();
          navigate("/dashboard");
        }}
        onFailed={() => {
          toast.error("Pembayaran gagal atau kedaluwarsa");
        }}
      />
    </Layout>
  );
};

export default Topup;
