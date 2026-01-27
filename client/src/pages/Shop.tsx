import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation, useSearch } from "wouter";
import { Search, SlidersHorizontal, X, ChevronDown, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

// Category values must match the database enum: tops, bottoms, dresses, outerwear, accessories, shoes, bags, other
const categories = [
  { name: "All", value: "all" },
  { name: "Tops", value: "tops" },
  { name: "Bottoms", value: "bottoms" },
  { name: "Outerwear", value: "outerwear" },
  { name: "Shoes", value: "shoes" },
  { name: "Accessories", value: "accessories" },
  { name: "Bags", value: "bags" },
  { name: "Dresses", value: "dresses" },
  { name: "Other", value: "other" },
];

const sortOptions = [
  { name: "Newest", value: "newest" },
  { name: "Price: Low to High", value: "price_asc" },
  { name: "Price: High to Low", value: "price_desc" },
  { name: "Name A-Z", value: "name" },
];

export default function Shop() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Get filter values from URL params
  const category = searchParams.get("category") || "all";
  const size = searchParams.get("size") || "";
  const brand = searchParams.get("brand") || "";
  const sortBy = (searchParams.get("sort") as any) || "newest";
  const minPriceParam = searchParams.get("minPrice");
  const maxPriceParam = searchParams.get("maxPrice");
  
  // Fetch filter options
  const { data: filterOptions } = trpc.product.filterOptions.useQuery();
  
  // Local state for price slider
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  
  // Update price range when filter options load
  useEffect(() => {
    if (filterOptions?.priceRange) {
      const min = minPriceParam ? parseFloat(minPriceParam) : filterOptions.priceRange.min;
      const max = maxPriceParam ? parseFloat(maxPriceParam) : filterOptions.priceRange.max;
      setPriceRange([min, max]);
    }
  }, [filterOptions?.priceRange, minPriceParam, maxPriceParam]);
  
  // Build query params for API
  const queryParams = useMemo(() => ({
    category: category === "all" ? undefined : category,
    size: size || undefined,
    brand: brand || undefined,
    minPrice: minPriceParam ? parseFloat(minPriceParam) : undefined,
    maxPrice: maxPriceParam ? parseFloat(maxPriceParam) : undefined,
    sortBy: sortBy as any,
  }), [category, size, brand, minPriceParam, maxPriceParam, sortBy]);
  
  const { data: products, isLoading } = trpc.product.list.useQuery(queryParams);
  
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

  // Filter products by search query (client-side)
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

  // Update URL with filters
  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchString);
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    
    const newSearch = params.toString();
    setLocation(newSearch ? `/shop?${newSearch}` : "/shop");
  };
  
  // Apply price range filter
  const applyPriceFilter = () => {
    updateFilters({
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
    });
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery("");
    setPriceRange([filterOptions?.priceRange.min || 0, filterOptions?.priceRange.max || 500]);
    setLocation("/shop");
  };
  
  // Check if any filters are active
  const hasActiveFilters = category !== "all" || size || brand || minPriceParam || maxPriceParam || sortBy !== "newest";

  const categoryTitle = category === "all" 
    ? "All Products" 
    : categories.find(c => c.value === category)?.name || "Products";

  // Filter sidebar content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Category</Label>
        <Select value={category} onValueChange={(value) => updateFilters({ category: value })}>
          <SelectTrigger>
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Separator />
      
      {/* Size Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Size</Label>
        <Select value={size} onValueChange={(value) => updateFilters({ size: value === "all" ? undefined : value })}>
          <SelectTrigger>
            <SelectValue placeholder="All Sizes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sizes</SelectItem>
            {filterOptions?.sizes.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Separator />
      
      {/* Brand Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Brand</Label>
        <Select value={brand} onValueChange={(value) => updateFilters({ brand: value === "all" ? undefined : value })}>
          <SelectTrigger>
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {filterOptions?.brands.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Separator />
      
      {/* Price Range Filter */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Price Range</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            min={filterOptions?.priceRange.min || 0}
            max={filterOptions?.priceRange.max || 500}
            step={5}
            className="mb-4"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <span>${priceRange[0].toFixed(0)}</span>
            <span>${priceRange[1].toFixed(0)}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={applyPriceFilter}
          >
            Apply Price Filter
          </Button>
        </div>
      </div>
      
      <Separator />
      
      {/* Sort By */}
      <div>
        <Label className="text-sm font-semibold mb-3 block">Sort By</Label>
        <Select value={sortBy} onValueChange={(value) => updateFilters({ sort: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Clear Filters */}
      {hasActiveFilters && (
        <>
          <Separator />
          <Button 
            variant="ghost" 
            className="w-full text-destructive hover:text-destructive"
            onClick={clearAllFilters}
          >
            <X className="h-4 w-4 mr-2" />
            Clear All Filters
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="container py-6 sm:py-8 md:py-12">
        <Link href="/" className="inline-flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base font-medium text-foreground hover:text-primary transition-colors mb-4 sm:mb-6 py-1.5 sm:py-2 px-2 sm:px-3 -ml-2 sm:-ml-3 rounded-lg hover:bg-accent/20">
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          Back to Home
        </Link>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold mb-0.5 sm:mb-1">
              {categoryTitle}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {filteredProducts.length} {filteredProducts.length === 1 ? "item" : "items"} available
            </p>
          </div>
          
          {/* Mobile Filter Button */}
          <div className="flex items-center gap-3 lg:hidden">
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      !
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="sticky top-24 bg-card rounded-lg border border-border p-5">
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
              
              <FilterContent />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Mobile Search */}
            <div className="relative mb-6 lg:hidden">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 mb-6">
                {category !== "all" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 h-7"
                    onClick={() => updateFilters({ category: "all" })}
                  >
                    {categories.find(c => c.value === category)?.name}
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {size && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 h-7"
                    onClick={() => updateFilters({ size: undefined })}
                  >
                    Size: {size}
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {brand && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 h-7"
                    onClick={() => updateFilters({ brand: undefined })}
                  >
                    {brand}
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {(minPriceParam || maxPriceParam) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 h-7"
                    onClick={() => updateFilters({ minPrice: undefined, maxPrice: undefined })}
                  >
                    ${minPriceParam || '0'} - ${maxPriceParam || '∞'}
                    <X className="h-3 w-3" />
                  </Button>
                )}
                {sortBy !== "newest" && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1 h-7"
                    onClick={() => updateFilters({ sort: "newest" })}
                  >
                    {sortOptions.find(s => s.value === sortBy)?.name}
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
            
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card rounded-lg overflow-hidden border border-border">
                    <div className="aspect-square skeleton" />
                    <div className="p-3 sm:p-4 space-y-2 sm:space-y-3">
                      <div className="h-3 sm:h-4 skeleton rounded w-1/3" />
                      <div className="h-4 sm:h-5 skeleton rounded w-2/3" />
                      <div className="h-6 sm:h-8 skeleton rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
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
              <div className="text-center py-10 sm:py-16 bg-secondary/30 rounded-lg px-4">
                <SlidersHorizontal className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium mb-1.5 sm:mb-2">Nothing matches those filters</p>
                <p className="text-sm sm:text-base text-muted-foreground mb-3 sm:mb-4">
                  {searchQuery
                    ? "We couldn't find anything matching your search. Try different keywords?"
                    : "Try loosening your filters – there might be hidden gems waiting."}
                </p>
                <Button variant="outline" size="sm" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
