import { useState } from "react";
import { Link } from "react-router-dom";
import { Send, FileText, CheckCircle, Code, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { customOrderService } from "@/services/api";

const CustomOrder = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Login diperlukan", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", title.trim() || "Custom order");
      fd.append("description", description.trim());
      fd.append("budget", String(parseFloat(budget) || 0));
      if (file) fd.append("file", file);
      await customOrderService.create(fd);
      setSubmitted(true);
      toast({ title: "Permintaan terkirim", description: "Tim akan meninjau pesanan Anda." });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ title: "Gagal mengirim", description: msg || "Coba lagi.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto animate-scale-in">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-14 w-14 text-primary animate-bounce-subtle" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Tiket Dibuat</h1>
            <p className="text-muted-foreground mb-8">Tim PastoDEV akan meninjau permintaan Anda.</p>
            <Card className="rounded-2xl border-border/50 mb-6">
              <CardContent className="p-5 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <span className="text-amber-600 font-semibold">Pending</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimasi</span>
                  <span className="font-medium">1–3 hari kerja</span>
                </div>
              </CardContent>
            </Card>
            <div className="flex gap-3 justify-center">
              <Button className="rounded-xl shadow-md shadow-primary/20" onClick={() => setSubmitted(false)}>
                Buat Tiket Baru
              </Button>
              <Link to="/dashboard">
                <Button variant="outline" className="rounded-xl">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 relative">
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <div className="max-w-2xl mx-auto relative">
          <div className="text-center mb-10 opacity-0 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mx-auto mb-4">
              <Code className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Order Custom Script</h1>
            <p className="text-muted-foreground">Butuh solusi khusus? Ceritakan kebutuhan Anda.</p>
          </div>

          <Card className="rounded-2xl border-border/50 shadow-lg opacity-0 animate-slide-up stagger-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Form Permintaan
              </CardTitle>
              <CardDescription>Login diperlukan untuk mengirim. Lampiran opsional.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul project (opsional)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Website Toko Online"
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Jelaskan detail project..."
                    rows={5}
                    required
                    className="rounded-xl resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (Rp)</Label>
                  <Input
                    id="budget"
                    type="number"
                    min={0}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="500000"
                    required
                    className="rounded-xl h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Lampiran (opsional)</Label>
                  <Input
                    id="file"
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="rounded-xl"
                  />
                </div>
                <Button type="submit" className="w-full rounded-xl h-11 shadow-lg gap-2" disabled={loading || !user}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Kirim Permintaan <ArrowRight className="h-4 w-4" />
                </Button>
                {!user && <p className="text-sm text-center text-muted-foreground">Silakan login terlebih dahulu.</p>}
              </form>
            </CardContent>
          </Card>

          <div className="grid grid-cols-3 gap-4 mt-8 opacity-0 animate-slide-up stagger-2">
            {[
              { emoji: "⚡", label: "Respon Cepat", sub: "< 24 jam" },
              { emoji: "🔒", label: "Source Code", sub: "Full akses" },
              { emoji: "🎯", label: "Revisi", sub: "Sesuai paket" },
            ].map((f) => (
              <Card key={f.label} className="rounded-2xl border-border/50 text-center">
                <CardContent className="p-4">
                  <div className="text-2xl mb-1">{f.emoji}</div>
                  <p className="text-xs font-semibold">{f.label}</p>
                  <p className="text-[10px] text-muted-foreground">{f.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CustomOrder;
