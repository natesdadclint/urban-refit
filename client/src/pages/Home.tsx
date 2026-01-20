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
      <section className="relative overflow-hidden min-h-[600px] md:min-h-[700px]">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-background.jpg)' }}
        />
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/80 to-transparent" />
        
        <div className="container relative py-20 md:py-32">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-6xl font-serif font-semibold leading-tight mb-6 text-foreground">
              Curated Fashion,
              <br />
              <span className="text-foreground">Second Chance</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Personally curated secondhand fashion that gives back to the community – because great style shouldn't cost the earth.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/shop">
                  Shop Collection
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/80 hover:bg-white">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Tops", href: "/shop/tops", image: "https://placehold.co/300x300/e7e5e4/78716c?text=Tops" },
              { name: "Bottoms", href: "/shop/bottoms", image: "https://placehold.co/300x300/e7e5e4/78716c?text=Bottoms" },
              { name: "Dresses", href: "/shop/dresses", image: "https://placehold.co/300x300/e7e5e4/78716c?text=Dresses" },
              { name: "Outerwear", href: "/shop/outerwear", image: "https://placehold.co/300x300/e7e5e4/78716c?text=Outerwear" },
            ].map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-serif text-xl font-semibold">
                    {category.name}
                  </h3>
                </div>
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
