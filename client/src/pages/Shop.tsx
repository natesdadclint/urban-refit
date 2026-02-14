import Layout from "@/components/Layout";
import { PageBreadcrumb } from "@/components/PageBreadcrumb";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Search, SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { useState, useMemo, useEffect, useCallback } from "react";
import { toast } from "sonner";

// Category values must match the database enum
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

const conditionLabels: Record<string, string> = {
  like_new: "Like New",
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
};

// Helper: parse comma-separated URL param into array
function parseMulti(param: string | null): string[] {
  if (!param) return [];
  return param.split(",").map(s => s.trim()).filter(Boolean);
}

// Helper: toggle a value in a comma-separated set
function toggleMulti(current: string[], value: string): string {
  const set = new Set(current);
  if (set.has(value)) {
    set.delete(value);
  } else {
    set.add(value);
  }
  const arr = Array.from(set);
  return arr.length > 0 ? arr.join(",") : "";
}

// Collapsible filter section
function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        className="flex items-center justify-between w-full text-sm font-semibold py-1"
        onClick={() => setOpen(!open)}
      >
        {title}
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="mt-2">{children}</div>}
    </div>
  );
}

// Checkbox list for multi-select
function CheckboxGroup({
  options,
  selected,
  onToggle,
  labelMap,
  maxVisible = 6,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  labelMap?: Record<string, string>;
  maxVisible?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? options : options.slice(0, maxVisible);
  const hasMore = options.length > maxVisible;

  return (
    <div className="space-y-2">
      {visible.map((opt) => (
        <label key={opt} className="flex items-center gap-2 cursor-pointer text-sm hover:text-foreground transition-colors">
          <Checkbox
            checked={selected.includes(opt)}
            onCheckedChange={() => onToggle(opt)}
          />
          <span className={selected.includes(opt) ? "font-medium" : "text-muted-foreground"}>
            {labelMap?.[opt] || opt}
          </span>
        </label>
      ))}
      {hasMore && (
        <button
          type="button"
          className="text-xs text-primary hover:underline mt-1"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Show less" : `+${options.length - maxVisible} more`}
        </button>
      )}
    </div>
  );
}

export default function Shop() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Get filter values from URL params
  const category = searchParams.get("category") || "all";
  const selectedSizes = parseMulti(searchParams.get("size"));
  const selectedBrands = parseMulti(searchParams.get("brand"));
  const selectedConditions = parseMulti(searchParams.get("condition"));
  const selectedColors = parseMulti(searchParams.get("color"));
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
    size: selectedSizes.length > 0 ? selectedSizes.join(",") : undefined,
    brand: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
    condition: selectedConditions.length > 0 ? selectedConditions.join(",") : undefined,
    color: selectedColors.length > 0 ? selectedColors.join(",") : undefined,
    minPrice: minPriceParam ? parseFloat(minPriceParam) : undefined,
    maxPrice: maxPriceParam ? parseFloat(maxPriceParam) : undefined,
    sortBy: sortBy as any,
  }), [category, selectedSizes.join(","), selectedBrands.join(","), selectedConditions.join(","), selectedColors.join(","), minPriceParam, maxPriceParam, sortBy]);
  
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
  const updateFilters = useCallback((updates: Record<string, string | undefined>) => {
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
  }, [searchString, setLocation]);

  // Multi-select toggle helpers
  const toggleSize = useCallback((val: string) => {
    updateFilters({ size: toggleMulti(selectedSizes, val) || undefined });
  }, [selectedSizes, updateFilters]);

  const toggleBrand = useCallback((val: string) => {
    updateFilters({ brand: toggleMulti(selectedBrands, val) || undefined });
  }, [selectedBrands, updateFilters]);

  const toggleCondition = useCallback((val: string) => {
    updateFilters({ condition: toggleMulti(selectedConditions, val) || undefined });
  }, [selectedConditions, updateFilters]);

  const toggleColor = useCallback((val: string) => {
    updateFilters({ color: toggleMulti(selectedColors, val) || undefined });
  }, [selectedColors, updateFilters]);
  
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
  
  // Count active filters
  const activeFilterCount = [
    category !== "all" ? 1 : 0,
    selectedSizes.length,
    selectedBrands.length,
    selectedConditions.length,
    selectedColors.length,
    minPriceParam ? 1 : 0,
    maxPriceParam ? 1 : 0,
    sortBy !== "newest" ? 1 : 0,
  ].reduce((a, b) => a + b, 0);
  
  const hasActiveFilters = activeFilterCount > 0;

  const categoryTitle = category === "all" 
    ? "All Products" 
    : categories.find(c => c.value === category)?.name || "Products";

  // Filter sidebar content (shared between desktop and mobile)
  const FilterContent = () => (
    <div className="space-y-5">
      {/* Category Filter */}
      <FilterSection title="Category">
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
      </FilterSection>
      
      <Separator />
      
      {/* Size Filter — Multi-select */}
      <FilterSection title={`Size${selectedSizes.length > 0 ? ` (${selectedSizes.length})` : ""}`}>
        {filterOptions?.sizes && filterOptions.sizes.length > 0 ? (
          <CheckboxGroup
            options={filterOptions.sizes}
            selected={selectedSizes}
            onToggle={toggleSize}
            maxVisible={8}
          />
        ) : (
          <p className="text-xs text-muted-foreground">No sizes available</p>
        )}
      </FilterSection>
      
      <Separator />
      
      {/* Condition Filter — Multi-select */}
      <FilterSection title={`Condition${selectedConditions.length > 0 ? ` (${selectedConditions.length})` : ""}`}>
        {filterOptions?.conditions && filterOptions.conditions.length > 0 ? (
          <CheckboxGroup
            options={filterOptions.conditions}
            selected={selectedConditions}
            onToggle={toggleCondition}
            labelMap={conditionLabels}
          />
        ) : (
          <p className="text-xs text-muted-foreground">No conditions available</p>
        )}
      </FilterSection>
      
      <Separator />
      
      {/* Brand Filter — Multi-select */}
      <FilterSection title={`Brand${selectedBrands.length > 0 ? ` (${selectedBrands.length})` : ""}`}>
        {filterOptions?.brands && filterOptions.brands.length > 0 ? (
          <CheckboxGroup
            options={filterOptions.brands}
            selected={selectedBrands}
            onToggle={toggleBrand}
          />
        ) : (
          <p className="text-xs text-muted-foreground">No brands available</p>
        )}
      </FilterSection>
      
      <Separator />
      
      {/* Colour Filter — Multi-select */}
      <FilterSection title={`Colour${selectedColors.length > 0 ? ` (${selectedColors.length})` : ""}`}>
        {filterOptions?.colors && filterOptions.colors.length > 0 ? (
          <CheckboxGroup
            options={filterOptions.colors}
            selected={selectedColors}
            onToggle={toggleColor}
          />
        ) : (
          <p className="text-xs text-muted-foreground">No colours available</p>
        )}
      </FilterSection>
      
      <Separator />
      
      {/* Price Range Filter */}
      <FilterSection title="Price Range">
        <div className="px-1">
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
      </FilterSection>
      
      <Separator />
      
      {/* Sort By */}
      <FilterSection title="Sort By">
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
      </FilterSection>
      
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
        <PageBreadcrumb
          className="mb-4 sm:mb-6"
          segments={[
            { label: "Shop", href: category !== "all" ? "/shop" : undefined },
            ...(category !== "all" ? [{ label: categories.find(c => c.value === category)?.name || category.charAt(0).toUpperCase() + category.slice(1) }] : []),
          ]}
        />
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
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
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
            <div className="sticky top-24 bg-card rounded-lg border border-border p-5 max-h-[calc(100vh-8rem)] overflow-y-auto">
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
                {selectedSizes.map((s) => (
                  <Button
                    key={`size-${s}`}
                    variant="secondary"
                    size="sm"
                    className="gap-1 h-7"
                    onClick={() => toggleSize(s)}
                  >
                    Size: {s}
                    <X className="h-3 w-3" />
                  </Button>
                ))}
                {selectedConditions.map((c) => (
                  <Button
                    key={`cond-${c}`}
                    variant="secondary"
                    size="sm"
                    className="gap-1 h-7"
                    onClick={() => toggleCondition(c)}
                  >
                    {conditionLabels[c] || c}
                    <X className="h-3 w-3" />
                  </Button>
                ))}
                {selectedBrands.map((b) => (
                  <Button
                    key={`brand-${b}`}
                    variant="secondary"
                    size="sm"
                    className="gap-1 h-7"
                    onClick={() => toggleBrand(b)}
                  >
                    {b}
                    <X className="h-3 w-3" />
                  </Button>
                ))}
                {selectedColors.map((c) => (
                  <Button
                    key={`color-${c}`}
                    variant="secondary"
                    size="sm"
                    className="gap-1 h-7"
                    onClick={() => toggleColor(c)}
                  >
                    {c}
                    <X className="h-3 w-3" />
                  </Button>
                ))}
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
                {activeFilterCount > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 h-7 text-destructive hover:text-destructive"
                    onClick={clearAllFilters}
                  >
                    Clear all
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
