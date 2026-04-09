import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/api";

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login: contextLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Client-side validation
    if (!email.trim()) {
      toast({ title: "Error", description: "Email tidak boleh kosong" });
      setIsLoading(false);
      return;
    }
    if (!email.includes('@')) {
      toast({ title: "Error", description: "Email tidak valid" });
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      toast({ title: "Error", description: "Password minimal 6 karakter" });
      setIsLoading(false);
      return;
    }
    if (isRegister && !name.trim()) {
      toast({ title: "Error", description: "Nama tidak boleh kosong" });
      setIsLoading(false);
      return;
    }

    try {
      if (isRegister) {
        // Register
        const response = await authService.register({ name, email, password });
        if (response.data?.data) {
          toast({ title: "Registrasi berhasil! 🎉", description: "Silakan login dengan akun Anda" });
          setIsRegister(false);
          setEmail("");
          setPassword("");
          setName("");
        } else {
          toast({ title: "Registrasi gagal", description: response.data?.message || "Silakan coba lagi" });
        }
      } else {
        // Login
        const success = await contextLogin(email, password);
        if (success) {
          toast({ title: "Login berhasil! 👋", description: "Selamat datang di PastoDEV" });
          // Check role untuk redirect
          setTimeout(() => {
            const stored = localStorage.getItem("user");
            if (stored) {
              const userData = JSON.parse(stored);
              navigate(userData.role === "admin" ? "/admin" : "/dashboard");
            }
          }, 500);
        } else {
          toast({ title: "Login gagal", description: "Email atau password salah" });
        }
      }
    } catch (error: any) {
      let errorMessage = error.response?.data?.message || error.message || "Terjadi kesalahan";
      if (error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map((e: any) => e.msg).join(', ');
      }
      toast({ title: "Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[70vh] relative">
        <div className="absolute inset-0 gradient-mesh opacity-50" />
        
        <Card className="w-full max-w-md rounded-2xl border-border/50 shadow-xl relative animate-scale-in">
          <CardHeader className="text-center pb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
              <Sparkles className="h-7 w-7 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl font-bold">{isRegister ? "Daftar Akun" : "Selamat Datang"}</CardTitle>
            <CardDescription>{isRegister ? "Buat akun baru di PastoDEV" : "Masuk ke akun PastoDEV Anda"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <Button 
              variant="outline" 
              className="w-full rounded-xl h-11 hover:bg-accent transition-colors" 
              onClick={() => toast({ title: "Google OAuth", description: "Fitur ini membutuhkan backend" })}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Masuk dengan Google
            </Button>

            <div className="relative">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">atau</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-2 opacity-0 animate-fade-in">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input id="name" placeholder="Nama Anda" required className="rounded-xl h-11" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="email@example.com" className="pl-10 rounded-xl h-11" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10 rounded-xl h-11" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={isLoading} className="w-full rounded-xl h-11 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 gap-2">
                {isLoading && <Loader className="h-4 w-4 animate-spin" />}
                {isRegister ? "Daftar" : "Masuk"} <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
              <button onClick={() => setIsRegister(!isRegister)} className="text-primary font-semibold hover:underline">
                {isRegister ? "Masuk" : "Daftar"}
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
