import Layout from "@/components/Layout";
import ProductImageGallery from "@/components/ProductImageGallery";
import SocialShare from "@/components/SocialShare";
import QualityComparisonChart from "@/components/QualityComparisonChart";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, Link, useLocation } from "wouter";
import { ShoppingBag, ArrowLeft, Truck, Shield, Recycle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const conditionLabels: Record<string, { label: string; description: string }> = {
  like_new: { label: "Like New", description: "Practically unworn – no visible signs of use. Ready for its first real adventure." },
  excellent: { label: "Excellent", description: "Minimal wear, maximum life left. Well cared for by its previous owner." },
  good: { label: "Good", description: "Honest wear that tells a story. Still plenty of life in this piece." },
  fair: { label: "Fair", description: "Character marks included. Priced to reflect – still a solid find." },
};

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

  
  const { data, isLoading, error } = trpc.product.getById.useQuery(
    { id: parseInt(params.id || "0") },
    { enabled: !!params.id }
  );
  
  const utils = trpc.useUtils();
  
  const addToCart = trpc.cart.add.useMutation({
    onSuccess: () => {
      utils.cart.get.invalidate();
      utils.cart.count.invalidate();
      toast.success("Added to cart!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="aspect-square skeleton rounded-lg" />
            <div className="space-y-4">
              <div className="h-6 skeleton rounded w-1/4" />
              <div className="h-10 skeleton rounded w-3/4" />
              <div className="h-8 skeleton rounded w-1/4" />
              <div className="h-24 skeleton rounded" />
              <div className="h-12 skeleton rounded w-1/2" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !data?.product) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-serif font-semibold mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This product may have been sold or removed.
          </p>
          <Button asChild size="lg" className="gap-2">
            <Link href="/shop">
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const { product, thriftStore } = data;
  const condition = conditionLabels[product.condition] || { label: product.condition, description: "" };
  const placeholderImage = "https://placehold.co/600x600/f5f5f4/a8a29e?text=No+Image";
  
  // Collect all available images (up to 4)
  const productImages = [product.image1Url, product.image2Url, product.image3Url, product.image4Url].filter((url): url is string => Boolean(url));

  return (
    <Layout>
      <div className="container py-8">
        {/* Breadcrumb navigation */}
        <PageBreadcrumb
          className="mb-6"
          segments={[
            { label: "Shop", href: "/shop" },
            { label: product.category.charAt(0).toUpperCase() + product.category.slice(1), href: `/shop/${product.category}` },
            { label: product.name },
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <ProductImageGallery
            images={productImages}
            productName={product.name}
          />

          {/* Product Info */}
          <div>
            {/* Brand */}
            {product.brand && (
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">
                {product.brand}
              </p>
            )}

            {/* Name */}
            <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-3xl font-serif font-semibold">
                NZ${parseFloat(product.salePrice).toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">incl. GST</span>
              {product.status !== "available" && (
                <Badge variant="secondary">Sold</Badge>
              )}
            </div>

            {/* Quick info badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.size && (
                <Badge variant="outline">Size: {product.size}</Badge>
              )}
              <Badge variant="outline" className={`condition-badge ${product.condition}`}>
                {condition.label}
              </Badge>
              {product.color && (
                <Badge variant="outline">{product.color}</Badge>
              )}
            </div>

            {/* Add to Cart */}
            {product.status === "available" && (
              <div className="mb-8">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    className="w-full sm:w-auto gap-2"
                    onClick={() => addToCart.mutate({ productId: product.id })}
                    disabled={addToCart.isPending}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {addToCart.isPending ? "Adding..." : "Add to Cart"}
                  </Button>
                ) : (
                  <Button size="lg" className="w-full sm:w-auto gap-2" asChild>
                    <a href={getLoginUrl()}>
                      <ShoppingBag className="h-5 w-5" />
                      Sign in to Buy
                    </a>
                  </Button>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  One-of-a-kind piece — once it's gone, it's gone. Free shipping on orders over NZ$50.
                </p>
              </div>
            )}

            <Separator className="my-6" />

            {/* Description */}
            {product.description && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{product.description}</p>
              </div>
            )}

            {/* Details */}
            <div className="mb-6">
              <h3 className="font-semibold mb-3">Details</h3>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <dt className="text-muted-foreground">Condition</dt>
                <dd>{condition.label}</dd>
                {product.material && (
                  <>
                    <dt className="text-muted-foreground">Material</dt>
                    <dd>{product.material}</dd>
                  </>
                )}
                <dt className="text-muted-foreground">Category</dt>
                <dd className="capitalize">{product.category}</dd>
              </dl>
              {condition.description && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  {condition.description}
                </p>
              )}
            </div>

            {/* Thrift Store Partner */}
            {thriftStore && (
              <div className="bg-secondary/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-muted-foreground mb-1">Sourced from</p>
                <p className="font-medium">{thriftStore.name}</p>
                {thriftStore.city && (
                  <p className="text-sm text-muted-foreground">{thriftStore.city}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  5% of this sale goes back to this thrift store partner.
                </p>
              </div>
            )}

            <Separator className="my-6" />

            {/* Quality Comparison Chart */}
            {product.brand && (
              <div className="mb-8">
                <QualityComparisonChart brand={product.brand} />
              </div>
            )}

            <Separator className="my-6" />

            {/* Social Share */}
            <SocialShare
              url={typeof window !== "undefined" ? window.location.href : ""}
              title={`${product.name} - Urban Refit`}
              description={product.description || `Check out this ${product.brand || ""} ${product.name} on Urban Refit`}
              image={product.image1Url || undefined}
            />

            <Separator className="my-6" />

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex flex-col items-center gap-2">
                <Truck className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Free shipping on orders over $50</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Secure payment via Stripe</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Recycle className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">One less item in landfill</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
