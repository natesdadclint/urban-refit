import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { ArrowRight, Leaf, Heart, Store } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: products, isLoading } = trpc.product.list.useQuery({});
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

  const featuredProducts = products?.slice(0, 4) || [];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden min-h-[650px] md:min-h-[750px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-background.jpg)' }}
        />
        {/* Subtle overlay at bottom for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-white via-white/90 to-transparent" />
        
        {/* Content positioned at bottom */}
        <div className="container relative h-full min-h-[650px] md:min-h-[750px] flex flex-col justify-end pb-12 md:pb-16">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-5xl font-serif font-semibold leading-tight mb-4 text-foreground">
              
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-6 max-w-lg">
              Personally curated pre-loved fashion that gives back to the community – because great style shouldn't cost the earth.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/shop">
                  Shop Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/90 hover:bg-white border-foreground/20">
                <Link href="/shop">Browse All</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-y border-border bg-card">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-secondary">
                <Leaf className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Sustainable Fashion</h3>
                <p className="text-sm text-muted-foreground">
                  Give pre-loved garments a second life and reduce textile waste.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-secondary">
                <Store className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Community Partners</h3>
                <p className="text-sm text-muted-foreground">
                  10% of every sale goes back to our thrift store partners.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-secondary">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Curated Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Every piece is hand-selected for quality and style.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-2">
                New Arrivals
              </h2>
              <p className="text-muted-foreground">
                Fresh finds from our latest thrift store hauls
              </p>
            </div>
            <Button asChild variant="ghost" className="gap-2 hidden md:flex">
              <Link href="/shop">
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden border border-border">
                  <div className="grid grid-cols-2 gap-0.5 bg-muted">
                    <div className="aspect-square skeleton" />
                    <div className="aspect-square skeleton" />
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 skeleton rounded w-1/3" />
                    <div className="h-5 skeleton rounded w-2/3" />
                    <div className="h-8 skeleton rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  brand={product.brand}
                  salePrice={product.salePrice}
                  image1Url={product.image1Url}
                  image2Url={product.image2Url}
                  condition={product.condition}
                  size={product.size}
                  onAddToCart={
                    isAuthenticated
                      ? () => addToCart.mutate({ productId: product.id })
                      : undefined
                  }
                  isAddingToCart={addToCart.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-secondary/30 rounded-lg">
              <p className="text-muted-foreground mb-4">
                No products available yet. Check back soon!
              </p>
              <Button asChild variant="outline">
                <Link href="/shop">Browse Shop</Link>
              </Button>
            </div>
          )}

          <div className="mt-8 text-center md:hidden">
            <Button asChild variant="outline" className="gap-2">
              <Link href="/shop">
                View All Products
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-10 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { name: "All", href: "/shop", image: "/category-all.jpg" },
              { name: "Shirts", href: "/shop?category=shirts", image: "/category-shirts.jpg" },
              { name: "Pants", href: "/shop?category=pants", image: "/category-pants.jpg" },
              { name: "Jackets", href: "/shop?category=jackets", image: "/category-jackets.jpg" },
              { name: "Shoes", href: "/shop?category=shoes", image: "/category-shoes.jpg" },
              { name: "Caps", href: "/shop?category=caps", image: "/category-caps.jpg" },
            ].map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group flex flex-col"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-3">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="text-center font-medium text-sm text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4">
              Join the Circular Fashion Movement
            </h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
              Every garment you buy from Urban Refit helps reduce textile waste and supports 
              local thrift stores. Shop sustainably, look amazing.
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link href="/shop">
                Start Shopping
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
