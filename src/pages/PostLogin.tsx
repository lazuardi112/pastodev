import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, Shield, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

/**
 * Setelah login sebagai admin: pilih Dashboard (pengalaman user) atau Admin Panel.
 */
const PostLogin = () => {
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!isAdmin) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, isAdmin, navigate]);

  if (loading || !user || !isAdmin) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center text-muted-foreground">Memuat…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/85 text-primary-foreground shadow-lg shadow-primary/25 mx-auto">
            <Sparkles className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Halo, {user.name}</h1>
          <p className="text-muted-foreground text-sm">
            Anda masuk sebagai admin. Pilih halaman yang ingin dibuka.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="rounded-2xl border-border/60 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                Dashboard
              </CardTitle>
              <CardDescription>Saldo, pesanan, dan notifikasi seperti pengguna biasa.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full rounded-xl shadow-md shadow-primary/20">
                <Link to="/dashboard">Buka Dashboard</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/60 shadow-md hover:shadow-lg transition-shadow ring-1 ring-primary/15">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-primary" />
                Admin Panel
              </CardTitle>
              <CardDescription>Kelola produk, pengguna, voucher, dan broadcast notifikasi.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full rounded-xl border-primary/30 hover:bg-primary/5">
                <Link to="/admin">Buka Admin</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <p className="text-center mt-8 text-sm text-muted-foreground">
          <Link to="/" className="text-primary font-medium hover:underline">
            Kembali ke beranda
          </Link>
        </p>
      </div>
    </Layout>
  );
};

export default PostLogin;
