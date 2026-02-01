import Layout from "@/components/Layout";
import React from "react";
import ProductCard from "@/components/ProductCard";
import TestimonialsCarousel from "@/components/TestimonialsCarousel";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { ArrowRight, Leaf, Heart, Store } from "lucide-react";
import { toast } from "sonner";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: products, isLoading } = trpc.product.list.useQuery({});
  
  // Set page title and meta keywords for SEO
  React.useEffect(() => {
    document.title = "Urban Refit | Sustainable Secondhand Men's Fashion NZ";
    
    // Add or update meta keywords
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.setAttribute('content', 'secondhand fashion, sustainable clothing, thrift store, mens fashion NZ, eco-friendly apparel, circular economy, pre-loved brands, affordable fashion');
  }, []);
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
      <section className="relative overflow-hidden min-h-[500px] sm:min-h-[600px] md:min-h-[750px] w-full">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-background.jpg)' }}
        />
        {/* Stronger overlay at bottom for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-80 sm:h-96 md:h-[480px] bg-gradient-to-t from-white via-white/95 to-transparent" />
        
        {/* Content positioned at bottom */}
        <div className="container relative h-full min-h-[500px] sm:min-h-[600px] md:min-h-[750px] flex flex-col justify-end pb-24 sm:pb-32 md:pb-40">
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold leading-tight mb-4 md:mb-6 text-white max-w-2xl" style={{ textShadow: '0 0 20px rgba(0,0,0,0.44), 0 0 40px rgba(0,0,0,0.275), 0 2px 4px rgba(0,0,0,0.33)' }}>
              Buy Premium Secondhand Men's Fashion Online from NZ Thrift Stores
            </h1>
            <p className="text-sm sm:text-base text-white mb-6 sm:mb-8 max-w-xl leading-relaxed" style={{ textShadow: '-0.5px -0.5px 0 rgba(0,0,0,0.9), 0.5px -0.5px 0 rgba(0,0,0,0.9), -0.5px 0.5px 0 rgba(0,0,0,0.9), 0.5px 0.5px 0 rgba(0,0,0,0.9)' }}>
              Discover curated designer brands at affordable prices. Sustainable fashion for men who value quality, style, and supporting local communities through circular economy shopping.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link href="/shop">
                  Shop Now
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-white/90 hover:bg-white border-foreground/20">
                <Link href="/shop">See What's New</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="border-y border-border bg-card">
        <div className="container py-6 sm:py-8 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-full bg-secondary shrink-0">
                <Leaf className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">Sustainable Fashion</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Give pre-loved garments a second life and reduce textile waste.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-full bg-secondary shrink-0">
                <Store className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">Community Partners</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  5% of every sale goes back to our thrift store partners.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-full bg-secondary shrink-0">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm sm:text-base mb-0.5 sm:mb-1">Curated Quality</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Every piece is hand-selected for quality and style.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-10 sm:py-16 md:py-24">
        <div className="container">
          <div className="flex items-end justify-between mb-6 sm:mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold mb-1 sm:mb-2">
                New Arrivals
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
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
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-card rounded-lg overflow-hidden border border-border">
                  <div className="aspect-square bg-muted skeleton" />
                  <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                    <div className="h-3 sm:h-4 skeleton rounded w-1/3" />
                    <div className="h-4 sm:h-5 skeleton rounded w-2/3" />
                    <div className="h-6 sm:h-8 skeleton rounded w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
                  createdAt={product.createdAt}
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
                Fresh finds coming soon. We're out hunting for your next favourite piece.
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
      <section className="py-10 sm:py-16 bg-secondary/30">
        <div className="container">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold mb-6 sm:mb-10 text-center">
            Shop by Category
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
            {[
              { name: "All", href: "/shop", image: "/category-all.png" },
              { name: "Tops", href: "/shop?category=tops", image: "/category-shirts.png" },
              { name: "Bottoms", href: "/shop?category=bottoms", image: "/category-pants.png" },
              { name: "Outerwear", href: "/shop?category=outerwear", image: "/category-jackets.png" },
              { name: "Shoes", href: "/shop?category=shoes", image: "/category-shoes.png" },
              { name: "Accessories", href: "/shop?category=accessories", image: "/category-caps.png" },
            ].map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="group flex flex-col"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-1.5 sm:mb-3">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <p className="text-center font-medium text-xs sm:text-sm text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <TestimonialsCarousel />

      {/* CTA Section */}
      <section className="py-12 sm:py-20 md:py-28">
        <div className="container">
          <div className="bg-primary text-primary-foreground rounded-xl sm:rounded-2xl p-6 sm:p-8 md:p-16 text-center">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-serif font-semibold mb-3 sm:mb-4">
              Ready to Shop Sustainably?
            </h2>
            <p className="text-sm sm:text-base text-primary-foreground/80 max-w-2xl mx-auto mb-5 sm:mb-8">
              Every purchase keeps quality clothing out of landfill and puts money back into local thrift stores. Good style, good karma.
            </p>
            <Button asChild size="lg" variant="secondary" className="gap-2 text-sm sm:text-base">
              <Link href="/shop">
                Find Your Next Favourite
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
