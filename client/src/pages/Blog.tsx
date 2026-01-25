import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, ArrowLeft, Clock, Eye, Heart, TrendingUp, Leaf, Users, Star, Zap, Grid3X3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const CATEGORIES = [
  { value: undefined, label: "All", icon: Grid3X3 },
  { value: "style_tips", label: "Style Tips", icon: Star },
  { value: "sustainability", label: "Sustainability", icon: Leaf },
  { value: "brand_spotlight", label: "Brand Spotlight", icon: Zap },
  { value: "behind_the_scenes", label: "Behind the Scenes", icon: Users },
  { value: "community", label: "Community", icon: Heart },
  { value: "trends", label: "Trends", icon: TrendingUp },
] as const;

const CATEGORY_COLORS: Record<string, string> = {
  style_tips: "bg-neutral-100 text-neutral-700 border-neutral-200",
  sustainability: "bg-neutral-100 text-neutral-700 border-neutral-200",
  brand_spotlight: "bg-neutral-100 text-neutral-700 border-neutral-200",
  behind_the_scenes: "bg-neutral-100 text-neutral-700 border-neutral-200",
  community: "bg-neutral-100 text-neutral-700 border-neutral-200",
  trends: "bg-neutral-100 text-neutral-700 border-neutral-200",
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
  const [newsletterEmail, setNewsletterEmail] = useState("");
  
  const { data: posts, isLoading } = trpc.blog.list.useQuery(
    selectedCategory ? { category: selectedCategory as any } : undefined
  );

  const newsletterMutation = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      toast.success("Subscribed!", {
        description: data.message || "Thanks for subscribing to our newsletter!",
      });
      setNewsletterEmail("");
    },
    onError: (error) => {
      toast.error("Error", {
        description: error.message || "Failed to subscribe. Please try again.",
      });
    },
  });

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) {
      toast.error("Please enter your email address");
      return;
    }
    newsletterMutation.mutate({
      email: newsletterEmail,
      source: "newsletter",
      newArrivals: true,
      exclusiveOffers: true,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Clean, minimal design matching Urban Refit */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors mb-6 py-2 px-3 -ml-3 rounded-lg hover:bg-accent/20">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
              The Refit Journal
            </p>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 tracking-tight">
              Stories that inspire
            </h1>
            <p className="text-base text-muted-foreground max-w-2xl mx-auto">
              Discover sustainable fashion tips, brand stories, and community highlights. 
              Your guide to looking good while doing good.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter - Neutral styling */}
      <section className="sticky top-16 z-30 bg-background/95 backdrop-blur-lg border-b border-border">
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
                    isActive && "bg-black text-white hover:bg-black/90 border-0"
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
                  <Skeleton className="aspect-[4/3] rounded-xl" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : posts && posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                        "relative overflow-hidden rounded-xl bg-muted mb-4",
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
                        <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                          <Grid3X3 className="h-12 w-12 text-neutral-300" />
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
                            "text-xs font-normal",
                            CATEGORY_COLORS[post.category] || "bg-neutral-100 text-neutral-700"
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
                          "font-serif font-semibold group-hover:text-neutral-600 transition-colors line-clamp-2",
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
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
                <Grid3X3 className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground mb-6">
                {selectedCategory
                  ? "No posts in this category yet. Check back soon."
                  : "We're working on some amazing content. Stay tuned."}
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

      {/* Newsletter CTA - Neutral design */}
      <section className="py-16 border-t border-border bg-neutral-50">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
              Stay in the loop
            </p>
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              Get the freshest drops in your inbox
            </h2>
            <p className="text-muted-foreground mb-6">
              Style tips, exclusive deals, and sustainability stories. No spam, just quality content.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="your@email.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="flex-1 px-4 py-3 rounded-full border border-border bg-background focus:outline-none focus:ring-2 focus:ring-neutral-400"
                disabled={newsletterMutation.isPending}
              />
              <Button 
                type="submit"
                className="rounded-full bg-black text-white hover:bg-black/90 px-6"
                disabled={newsletterMutation.isPending}
              >
                {newsletterMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Subscribing...</>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
