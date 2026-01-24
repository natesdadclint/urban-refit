import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Sparkles } from "lucide-react";

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

  return (
    <div className="product-card group bg-card rounded-lg overflow-hidden border border-border">
      <Link href={`/product/${id}`}>
        {/* Single Image Display */}
        <div className="aspect-square overflow-hidden bg-muted relative">
          <img
            src={image1Url || placeholderImage}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* New Arrivals Badge */}
          {isNew && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 shadow-sm">
              <Sparkles className="h-3 w-3" />
              New
            </div>
          )}
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
