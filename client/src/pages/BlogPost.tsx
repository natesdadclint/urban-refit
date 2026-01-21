import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Clock, Eye, Heart, Share2, Bookmark, Sparkles, Twitter, Facebook, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

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
    month: "long",
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

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  
  
  const { data: post, isLoading } = trpc.blog.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const likeMutation = trpc.blog.like.useMutation({
    onSuccess: () => {
      toast.success("Thanks for the love! 💚", {
        description: "Your support means everything to us.",
      });
    },
  });

  const handleLike = () => {
    if (post) {
      likeMutation.mutate({ id: post.id });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt || "",
          url,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied! 🔗", {
        description: "Share it with your friends!",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="aspect-[21/9] rounded-2xl mb-8" />
          <div className="max-w-3xl mx-auto space-y-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-48" />
            <div className="space-y-3 pt-8">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <Sparkles className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Post not found</h1>
          <p className="text-muted-foreground mb-6">
            This post might have been moved or deleted.
          </p>
          <Link href="/blog">
            <Button className="rounded-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const tags = post.tags ? JSON.parse(post.tags) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button */}
      <div className="container py-6">
        <Link href="/blog">
          <Button variant="ghost" className="rounded-full -ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Hero Image */}
      {post.featuredImageUrl && (
        <div className="container mb-8">
          <div className="aspect-[21/9] rounded-2xl overflow-hidden">
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* Article Content */}
      <article className="container pb-16">
        <div className="max-w-3xl mx-auto">
          {/* Meta */}
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <Badge
              variant="outline"
              className={cn(
                "text-sm",
                CATEGORY_COLORS[post.category] || "bg-muted"
              )}
            >
              {formatCategoryLabel(post.category)}
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readingTime} min read
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 leading-tight">
            {post.title}
          </h1>

          {/* Author & Date */}
          <div className="flex items-center justify-between flex-wrap gap-4 mb-8 pb-8 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 flex items-center justify-center text-black font-bold">
                {post.authorName?.charAt(0) || "U"}
              </div>
              <div>
                <p className="font-medium">{post.authorName || "Urban Refit Team"}</p>
                <p className="text-sm text-muted-foreground">{formatDate(post.publishedAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount} views
              </span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {post.likeCount}
              </span>
            </div>
          </div>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-muted-foreground mb-8 font-serif italic">
              {post.excerpt}
            </p>
          )}

          {/* Content */}
          <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-lime-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl">
            <Streamdown>{post.content}</Streamdown>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-8 pt-8 border-t border-border">
              <span className="text-sm text-muted-foreground">Tags:</span>
              {tags.map((tag: string) => (
                <Badge key={tag} variant="secondary" className="rounded-full">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between flex-wrap gap-4 mt-8 pt-8 border-t border-border">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={handleLike}
                disabled={likeMutation.isPending}
              >
                <Heart className={cn("h-4 w-4 mr-1", likeMutation.isSuccess && "fill-current text-red-500")} />
                {likeMutation.isSuccess ? "Liked!" : "Like"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={handleShare}
              >
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShare}>
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShare}>
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={handleShare}>
                <Link2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </article>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-lime-400/10 to-emerald-500/10">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              Ready to shop sustainably? 🌱
            </h2>
            <p className="text-muted-foreground mb-6">
              Discover unique pre-loved pieces that look good and do good.
            </p>
            <Link href="/shop">
              <Button className="rounded-full bg-gradient-to-r from-lime-400 to-emerald-500 text-black hover:opacity-90 px-8">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
