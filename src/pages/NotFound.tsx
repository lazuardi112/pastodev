import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-24 flex items-center justify-center min-h-[60vh]">
        <div className="text-center animate-scale-in">
          <div className="text-8xl md:text-9xl font-black text-gradient mb-4">404</div>
          <h1 className="text-2xl font-bold mb-2">Halaman Tidak Ditemukan</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Maaf, halaman yang Anda cari tidak ada atau sudah dipindahkan.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/">
              <Button className="rounded-xl shadow-md shadow-primary/20 gap-2">
                <Home className="h-4 w-4" /> Ke Beranda
              </Button>
            </Link>
            <Link to="/products">
              <Button variant="outline" className="rounded-xl gap-2">
                <Search className="h-4 w-4" /> Cari Produk
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
