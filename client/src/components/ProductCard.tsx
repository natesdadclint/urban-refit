import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Sparkles } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  id: number;
  name: string;
  brand: string | null;
  salePrice: string;
  image1Url: string | null;
  image2Url?: string | null;
  condition: string;
  size: string | null;
  createdAt?: Date | string;
  onAddToCart?: () => void;
  isAddingToCart?: boolean;
}

const conditionLabels: Record<string, string> = {
  like_new: "Like New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
};

// Check if product was added within the last 7 days
function isNewArrival(createdAt?: Date | string): boolean {
  if (!createdAt) return false;
  const created = new Date(createdAt);
  const now = new Date();
  const diffInDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffInDays <= 7;
}

export default function ProductCard({
  id,
  name,
  brand,
  salePrice,
  image1Url,
  condition,
  size,
  createdAt,
  onAddToCart,
  isAddingToCart,
}: ProductCardProps) {
  const placeholderImage = "https://placehold.co/400x400/f5f5f4/a8a29e?text=No+Image";
  const isNew = isNewArrival(createdAt);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="product-card group bg-card rounded-lg overflow-hidden border border-border transition-all duration-300 hover:shadow-xl hover:scale-105 hover:z-10">
      <Link href={`/product/${id}`}>
        {/* Single Image Display */}
        <div className="aspect-square overflow-hidden bg-muted relative">
          {/* Low-quality placeholder */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-muted animate-pulse" />
          )}
          <img
            src={image1Url || placeholderImage}
            alt={name}
            loading="lazy"
            decoding="async"
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setImageLoaded(true)}
          />
          {/* New Arrivals Badge */}
          {isNew && (
            <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-primary text-primary-foreground px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md text-[10px] sm:text-xs font-medium flex items-center gap-0.5 sm:gap-1 shadow-sm">
              <Sparkles className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
              New
            </div>
          )}
          {/* Quick View Button */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              size="sm"
              className="gap-2 text-xs sm:text-sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              Quick View
            </Button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-2.5 sm:p-4">
        <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
          <div className="flex-1 min-w-0">
            {brand && (
              <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-0.5 sm:mb-1 truncate">
                {brand}
              </p>
            )}
            <Link href={`/product/${id}`}>
              <h3 className="font-medium text-xs sm:text-sm leading-tight hover:text-primary transition-colors line-clamp-2">
                {name}
              </h3>
            </Link>
          </div>
          <span className={`condition-badge ${condition} shrink-0 text-[9px] sm:text-xs px-1 sm:px-1.5 py-0.5`}>
            {conditionLabels[condition] || condition}
          </span>
        </div>

        {size && (
          <p className="text-[10px] sm:text-xs text-muted-foreground mb-2 sm:mb-3">Size: {size}</p>
        )}

        {/* Price and Buy Now */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-1.5 sm:pt-2 border-t border-border">
          <div className="min-w-0">
            <span className="text-sm sm:text-lg font-serif font-semibold">
              NZ${parseFloat(salePrice).toFixed(2)}
            </span>
            <span className="hidden sm:inline text-xs text-muted-foreground ml-1">incl. GST</span>
          </div>
          
          {onAddToCart && (
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart();
              }}
              disabled={isAddingToCart}
              className="gap-1 sm:gap-1.5 text-xs sm:text-sm px-2 sm:px-3 h-7 sm:h-9"
            >
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">{isAddingToCart ? "Adding..." : "Buy Now"}</span>
              <span className="sm:hidden">{isAddingToCart ? "..." : "Buy"}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
