import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, ArrowUpRight, Heart } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card/50 mt-20 relative overflow-hidden">
    <div className="absolute inset-0 gradient-mesh opacity-30" />
    <div className="container mx-auto px-4 py-14 relative">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-extrabold">P</span>
            </div>
            <span className="font-extrabold text-xl">Pasto<span className="text-gradient">DEV</span></span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Marketplace produk digital berkualitas dari Pasto Solusi Digital. Script, website, dan aplikasi siap pakai.
          </p>
          <div className="flex gap-3">
            {["GitHub", "Twitter", "Discord"].map((s) => (
              <button key={s} className="w-9 h-9 rounded-xl bg-muted hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground transition-all duration-300 text-xs font-bold">
                {s[0]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm">Produk</h4>
          <div className="flex flex-col gap-3">
            {[
              { label: "Script BukaOlshop", href: "/categories/script-bukaolshop" },
              { label: "Website", href: "/categories/website" },
              { label: "Aplikasi", href: "/categories/aplikasi" },
              { label: "Semua Produk", href: "/products" },
            ].map((l) => (
              <Link key={l.href} to={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                {l.label}
                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm">Layanan</h4>
          <div className="flex flex-col gap-3">
            {[
              { label: "Order Custom", href: "/custom-order" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Login", href: "/login" },
            ].map((l) => (
              <Link key={l.href} to={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                {l.label}
                <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-4 text-sm">Hubungi Kami</h4>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>hello@pastodev.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4 text-primary" />
              <span>+62 812-xxxx-xxxx</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Indonesia</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border/50 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground flex items-center gap-1">
          © {new Date().getFullYear()} PastoDEV by Pasto Solusi Digital. Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> in Indonesia
        </p>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
