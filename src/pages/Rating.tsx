import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Star, Loader2, CheckCircle } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { checkoutService, reviewsApi } from "@/services/api";

const Rating = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params] = useSearchParams();
  const transactionId = params.get("transaction_id");
  const productIdParam = params.get("product_id");

  const [productId, setProductId] = useState<number | null>(productIdParam ? parseInt(productIdParam, 10) : null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [loadTx, setLoadTx] = useState(!!transactionId && !productIdParam);

  useEffect(() => {
    if (!user) navigate("/login");
  }, [user, navigate]);

  useEffect(() => {
    if (!transactionId || productIdParam) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await checkoutService.getTransactionDetail(parseInt(transactionId, 10));
        const items = res.data?.data?.items as { product_id?: number }[] | undefined;
        const first = items?.[0]?.product_id;
        if (!cancelled && first) setProductId(Number(first));
      } catch {
        if (!cancelled) toast({ title: "Tidak dapat memuat transaksi", variant: "destructive" });
      } finally {
        if (!cancelled) setLoadTx(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [transactionId, productIdParam, toast]);

  const submit = async () => {
    if (!productId) {
      toast({ title: "Produk tidak ditemukan", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await reviewsApi.create({ product_id: productId, rating, comment: comment.trim() || undefined });
      setDone(true);
      toast({ title: "Terima kasih!", description: "Ulasan Anda telah disimpan." });
    } catch {
      toast({ title: "Gagal menyimpan ulasan", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  if (loadTx) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (done) {
    return (
      <Layout>
        <div className="container max-w-md mx-auto px-4 py-24 text-center">
          <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Ulasan terkirim</h1>
          <Button className="rounded-xl mt-4" onClick={() => navigate("/dashboard")}>
            Ke Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-lg mx-auto px-4 py-10 md:py-16">
        <Card className="rounded-2xl border-border/50">
          <CardHeader>
            <CardTitle>Beri rating</CardTitle>
            <CardDescription>Bagaimana pengalaman Anda dengan produk ini?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-1 justify-center">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                  aria-label={`${n} bintang`}
                >
                  <Star className={`h-10 w-10 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <div className="space-y-2">
              <Label htmlFor="comment">Komentar (opsional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="rounded-xl resize-none"
                placeholder="Ceritakan pengalaman Anda..."
              />
            </div>
            <Button className="w-full rounded-xl h-11" onClick={submit} disabled={loading || !productId}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Kirim ulasan"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Rating;
