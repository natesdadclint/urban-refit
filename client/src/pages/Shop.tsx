import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useParams, Link } from "wouter";
import { Search, SlidersHorizontal } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const categories = [
  { name: "All", value: "all" },
  { name: "Tops", value: "tops" },
  { name: "Bottoms", value: "bottoms" },
  { name: "Dresses", value: "dresses" },
  { name: "Outerwear", value: "outerwear" },
  { name: "Accessories", value: "accessories" },
  { name: "Shoes", value: "shoes" },
  { name: "Bags", value: "bags" },
];

export default function Shop() {
  const params = useParams<{ category?: string }>();
  const category = params.category || "all";
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: products, isLoading } = trpc.product.list.useQuery({
    category: category === "all" ? undefined : category,
  });
  
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

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    if (!searchQuery.trim()) return products;
    
    const query = searchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        p.brand?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  const categoryTitle = category === "all" 
    ? "All Products" 
    : categories.find(c => c.value === category)?.name || "Products";

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-semibold mb-2">
            {categoryTitle}
          </h1>
          <p className="text-muted-foreground">
            {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"} available
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-24">
              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Category filters */}
              <div className="space-y-1">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Categories
                </h3>
                {categories.map((cat) => (
                  <Link
                    key={cat.value}
                    href={cat.value === "all" ? "/shop" : `/shop/${cat.value}`}
                  >
                    <Button
                      variant={category === cat.value ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      size="sm"
                    >
                      {cat.name}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
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
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
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
                  {searchQuery
                    ? "No products match your search."
                    : "No products available in this category yet."}
                </p>
                {searchQuery && (
                  <Button variant="outline" onClick={() => setSearchQuery("")}>
                    Clear Search
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
