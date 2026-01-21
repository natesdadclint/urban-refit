import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Clock, Eye, Heart, Sparkles, TrendingUp, Leaf, Users, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { value: undefined, label: "All", icon: Sparkles },
  { value: "style_tips", label: "Style Tips", icon: Star },
  { value: "sustainability", label: "Sustainability", icon: Leaf },
  { value: "brand_spotlight", label: "Brand Spotlight", icon: Zap },
  { value: "behind_the_scenes", label: "Behind the Scenes", icon: Users },
  { value: "community", label: "Community", icon: Heart },
  { value: "trends", label: "Trends", icon: TrendingUp },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  style_tips: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  sustainability: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  brand_spotlight: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  behind_the_scenes: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  community: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  trends: "bg-blue-500/10 text-blue-500 border-blue-500/20",
};

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCategoryLabel(category: string) {
  return category
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function Blog() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  
  const { data: posts, isLoading } = trpc.blog.list.useQuery(
    selectedCategory ? { category: selectedCategory as any } : undefined
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-lime-400/20 via-emerald-400/10 to-background py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container relative">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-lime-400 text-black hover:bg-lime-500 border-0">
              <Sparkles className="h-3 w-3 mr-1" />
              The Refit Journal
            </Badge>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-4 tracking-tight">
              Stories that{" "}
              <span className="bg-gradient-to-r from-lime-400 to-emerald-500 bg-clip-text text-transparent">
                inspire
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover sustainable fashion tips, brand stories, and community highlights. 
              Your guide to looking good while doing good. ✨
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="sticky top-16 z-30 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="container py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.value;
              return (
                <Button
                  key={cat.label}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={cn(
                    "rounded-full whitespace-nowrap transition-all",
                    isActive && "bg-gradient-to-r from-lime-400 to-emerald-500 text-black border-0"
                  )}
                >
                  <Icon className="h-4 w-4 mr-1.5" />
                  {cat.label}
                </Button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 md:py-16">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/3] rounded-2xl" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post, index) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <article
                    className={cn(
                      "group cursor-pointer",
                      index === 0 && "md:col-span-2 md:row-span-2"
                    )}
                  >
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-2xl bg-muted mb-4",
                        index === 0 ? "aspect-[16/9]" : "aspect-[4/3]"
                      )}
                    >
                      {post.featuredImageUrl ? (
                        <img
                          src={post.featuredImageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-lime-400/30 to-emerald-500/30 flex items-center justify-center">
                          <Sparkles className="h-12 w-12 text-lime-500/50" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="inline-flex items-center gap-1 text-white text-sm font-medium">
                          Read more <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs",
                            CATEGORY_COLORS[post.category] || "bg-muted"
                          )}
                        >
                          {formatCategoryLabel(post.category)}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {post.readingTime} min read
                        </span>
                      </div>
                      
                      <h2
                        className={cn(
                          "font-serif font-semibold group-hover:text-lime-500 transition-colors line-clamp-2",
                          index === 0 ? "text-2xl md:text-3xl" : "text-lg"
                        )}
                      >
                        {post.title}
                      </h2>
                      
                      {post.excerpt && (
                        <p className="text-muted-foreground text-sm line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                        <span>{formatDate(post.publishedAt)}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {post.viewCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3" />
                          {post.likeCount}
                        </span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Sparkles className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-6">
                {selectedCategory
                  ? "No posts in this category yet. Check back soon!"
                  : "We're working on some amazing content. Stay tuned!"}
              </p>
              {selectedCategory && (
                <Button
                  variant="outline"
                  onClick={() => setSelectedCategory(undefined)}
                  className="rounded-full"
                >
                  View all posts
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-r from-lime-400/10 to-emerald-500/10">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <Badge className="mb-4 bg-black text-white hover:bg-black/90 border-0">
              <Zap className="h-3 w-3 mr-1" />
              Stay in the loop
            </Badge>
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              Get the freshest drops in your inbox
            </h2>
            <p className="text-muted-foreground mb-6">
              Style tips, exclusive deals, and sustainability stories. No spam, just vibes. 💚
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="flex-1 px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-lime-400"
              />
              <Button className="rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 text-black hover:opacity-90 px-6">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
