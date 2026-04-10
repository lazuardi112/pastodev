import { Link } from "react-router-dom";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { mediaUrl } from "@/lib/media";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Product } from "@/types";
import { formatCurrency } from "@/lib/format";
import { useCart } from "@/context/CartContext";

const ProductCard = ({ product }: { product: any }) => {
  const { addToCart } = useCart();
  
  // Handle both API and mock data formats
  const thumbnail = mediaUrl(product.thumbnail || product.thumbnail_url);
  const productSlug = product.slug || product.id;

  return (
    <Card className="group overflow-hidden hover-lift border-border/50 rounded-2xl">
      <div className="relative overflow-hidden">
        <img
          src={thumbnail}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {product.featured === true && (
          <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground shadow-lg shadow-primary/30 animate-scale-in">
            ⭐ Featured
          </Badge>
        )}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Link to={`/products/${productSlug}`}>
            <Button size="sm" className="rounded-xl shadow-lg gap-1.5 text-xs">
              <Eye className="h-3.5 w-3.5" /> Detail
            </Button>
          </Link>
        </div>
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wider font-medium">{product.categoryName}</p>
          <Link to={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm leading-tight hover:text-primary transition-colors duration-200 line-clamp-2">
              {product.name}
            </h3>
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 fill-warning text-warning" />
          <span className="text-xs font-semibold">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviewCount})</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="font-bold text-primary text-base">{formatCurrency(product.price)}</span>
          <Button 
            size="sm" 
            variant="outline" 
            className="rounded-xl h-8 w-8 p-0 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300"
            onClick={() => addToCart(product)}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
