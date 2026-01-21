import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: number;
  name: string;
  brand: string | null;
  salePrice: string;
  image1Url: string | null;
  image2Url: string | null;
  condition: string;
  size: string | null;
  onAddToCart?: () => void;
  isAddingToCart?: boolean;
}

const conditionLabels: Record<string, string> = {
  like_new: "Like New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
};

export default function ProductCard({
  id,
  name,
  brand,
  salePrice,
  image1Url,
  image2Url,
  condition,
  size,
  onAddToCart,
  isAddingToCart,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const placeholderImage = "https://placehold.co/400x400/f5f5f4/a8a29e?text=No+Image";

  return (
    <div
      className="product-card group bg-card rounded-lg overflow-hidden border border-border"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/product/${id}`}>
        {/* Dual Image Display - Full body shot and stitching detail */}
        <div className="grid grid-cols-2 gap-0.5 bg-muted">
          <div className="aspect-square overflow-hidden relative">
            <img
              src={image1Url || placeholderImage}
              alt={`${name} - Full View`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-muted-foreground font-medium">
              Full View
            </span>
          </div>
          <div className="aspect-square overflow-hidden relative">
            <img
              src={image2Url || image1Url || placeholderImage}
              alt={`${name} - Stitching Detail`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute bottom-2 left-2 text-[10px] uppercase tracking-wider bg-background/80 backdrop-blur-sm px-2 py-0.5 rounded text-muted-foreground font-medium">
              Detail
            </span>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            {brand && (
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                {brand}
              </p>
            )}
            <Link href={`/product/${id}`}>
              <h3 className="font-medium text-sm leading-tight hover:text-primary transition-colors line-clamp-2">
                {name}
              </h3>
            </Link>
          </div>
          <span className={`condition-badge ${condition} shrink-0`}>
            {conditionLabels[condition] || condition}
          </span>
        </div>

        {size && (
          <p className="text-xs text-muted-foreground mb-3">Size: {size}</p>
        )}

        {/* Price and Buy Now */}
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
          <span className="text-lg font-serif font-semibold">
            ${parseFloat(salePrice).toFixed(2)}
          </span>
          
          {onAddToCart && (
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={isAddingToCart}
              className="gap-1.5"
            >
              <ShoppingBag className="h-4 w-4" />
              {isAddingToCart ? "Adding..." : "Buy Now"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
