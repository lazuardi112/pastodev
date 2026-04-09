import { useState } from "react";
import { Send, FileText, CheckCircle, Code, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";

const CustomOrder = () => {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast({ title: "Tiket berhasil dibuat! 🎉", description: "Tim kami akan segera menghubungi Anda." });
  };

  if (submitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <div className="max-w-md mx-auto animate-scale-in">
            <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-14 w-14 text-primary animate-bounce-subtle" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Tiket Dibuat! 🚀</h1>
            <p className="text-muted-foreground mb-8">Tim PastoDEV akan segera meninjau permintaan Anda.</p>
            <Card className="rounded-2xl border-border/50 mb-6">
              <CardContent className="p-5 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Status</span><span className="text-warning font-semibold">⏳ Pending</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Estimasi</span><span className="font-medium">1-3 hari kerja</span></div>
              </CardContent>
            </Card>
            <div className="flex gap-3 justify-center">
              <Button className="rounded-xl shadow-md shadow-primary/20" onClick={() => setSubmitted(false)}>
                Buat Tiket Baru
              </Button>
              <a href="/dashboard">
                <Button variant="outline" className="rounded-xl">Dashboard</Button>
              </a>
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
            <p className="text-muted-foreground">Butuh solusi khusus? Ceritakan kebutuhan Anda dan kami akan membuatkannya.</p>
          </div>

          <Card className="rounded-2xl border-border/50 shadow-lg opacity-0 animate-slide-up stagger-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Form Permintaan
              </CardTitle>
              <CardDescription>Isi detail project yang Anda butuhkan</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul Project</Label>
                  <Input id="title" placeholder="Contoh: Website Toko Online" required className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea id="description" placeholder="Jelaskan detail project yang Anda butuhkan..." rows={5} required className="rounded-xl resize-none" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="budget">Budget (Rp)</Label>
                  <Input id="budget" type="number" placeholder="500000" required className="rounded-xl h-11" />
                </div>
                <Button type="submit" className="w-full rounded-xl h-11 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 gap-2">
                  <Send className="h-4 w-4" /> Kirim Permintaan <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="grid grid-cols-3 gap-4 mt-8 opacity-0 animate-slide-up stagger-2">
            {[
              { emoji: "⚡", label: "Respon Cepat", sub: "< 24 jam" },
              { emoji: "🔒", label: "Source Code", sub: "Full akses" },
              { emoji: "🎯", label: "Revisi Gratis", sub: "Hingga 3x" },
            ].map((f) => (
              <Card key={f.label} className="rounded-2xl border-border/50 text-center">
                <CardContent className="p-4">
                  <span className="text-2xl mb-1 block">{f.emoji}</span>
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
