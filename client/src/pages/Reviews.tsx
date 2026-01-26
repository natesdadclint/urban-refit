import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Star, ThumbsUp, CheckCircle, User, ShieldCheck, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { toast } from "sonner";

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "lg" }) {
  const sizeClass = size === "lg" ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            sizeClass,
            star <= rating ? "fill-black text-black" : "text-neutral-300"
          )}
        />
      ))}
    </div>
  );
}

function FitBadge({ fit }: { fit: string | null }) {
  if (!fit) return null;
  const labels: Record<string, string> = {
    runs_small: "Runs Small",
    true_to_size: "True to Size",
    runs_large: "Runs Large",
  };
  return (
    <Badge variant="outline" className="text-xs bg-neutral-100 text-neutral-700 border-neutral-200">
      {labels[fit] || fit}
    </Badge>
  );
}

// Local storage key for tracking helpful votes
const HELPFUL_VOTES_KEY = "urban_refit_helpful_votes";

function getHelpfulVotes(): Set<number> {
  try {
    const stored = localStorage.getItem(HELPFUL_VOTES_KEY);
    if (stored) {
      return new Set(JSON.parse(stored));
    }
  } catch {
    // Ignore localStorage errors
  }
  return new Set();
}

function saveHelpfulVote(reviewId: number) {
  try {
    const votes = getHelpfulVotes();
    votes.add(reviewId);
    localStorage.setItem(HELPFUL_VOTES_KEY, JSON.stringify(Array.from(votes)));
  } catch {
    // Ignore localStorage errors
  }
}

export default function Reviews() {
  const { data: reviews, isLoading } = trpc.reviews.list.useQuery({ limit: 50 });
  const { data: stats } = trpc.reviews.stats.useQuery();
  const utils = trpc.useUtils();
  
  // Track which reviews the user has marked as helpful (optimistic local state)
  const [helpfulVotes, setHelpfulVotes] = useState<Set<number>>(new Set());
  // Track optimistic count increments
  const [optimisticCounts, setOptimisticCounts] = useState<Record<number, number>>({});
  
  // Load helpful votes from localStorage on mount
  useEffect(() => {
    setHelpfulVotes(getHelpfulVotes());
  }, []);
  
  const markHelpful = trpc.reviews.markHelpful.useMutation({
    onMutate: async ({ reviewId }) => {
      // Optimistically update the count
      setOptimisticCounts(prev => ({
        ...prev,
        [reviewId]: (prev[reviewId] || 0) + 1
      }));
      
      // Mark as voted
      setHelpfulVotes(prev => new Set([...Array.from(prev), reviewId]));
      saveHelpfulVote(reviewId);
      
      // Show toast
      toast.success("Thanks for your feedback!", {
        description: "You found this review helpful",
        duration: 2000,
      });
    },
    onError: (error, { reviewId }) => {
      // Rollback optimistic update on error
      setOptimisticCounts(prev => ({
        ...prev,
        [reviewId]: Math.max((prev[reviewId] || 0) - 1, 0)
      }));
      
      // Remove from voted set
      setHelpfulVotes(prev => {
        const newSet = new Set(Array.from(prev));
        newSet.delete(reviewId);
        return newSet;
      });
      
      toast.error("Failed to mark as helpful", {
        description: "Please try again",
      });
    },
    onSettled: () => {
      // Refetch to sync with server
      utils.reviews.list.invalidate();
    },
  });

  const handleHelpful = (reviewId: number) => {
    // Check if already voted
    if (helpfulVotes.has(reviewId)) {
      toast.info("Already marked as helpful", {
        description: "You've already found this review helpful",
        duration: 2000,
      });
      return;
    }
    
    markHelpful.mutate({ reviewId });
  };

  const avgRating = stats?.avgRating ? Number(stats.avgRating).toFixed(1) : "0.0";
  const totalReviews = stats?.totalReviews || 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Men's Fashion Focus */}
      <section className="py-16 md:py-24 border-b border-border">
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-medium text-foreground hover:text-primary transition-colors mb-6 py-2 px-3 -ml-3 rounded-lg hover:bg-accent/20">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-sm uppercase tracking-widest text-muted-foreground mb-4">
                  Customer Reviews
                </p>
                <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6 tracking-tight">
                  Real Men. Real Style. Real Reviews.
                </h1>
                <p className="text-base text-muted-foreground mb-6">
                  No more waiting in fitting rooms. No more asking "does this look okay?" 
                  Our customers know what they want and they get it delivered to their door.
                </p>
                <p className="text-muted-foreground">
                  Take back control of your wardrobe. Shop on your terms, on your time.
                </p>
              </div>
              
              {/* Stats Card */}
              <div className="bg-neutral-50 rounded-xl p-8 text-center">
                <div className="text-6xl font-bold mb-2">{avgRating}</div>
                <StarRating rating={Math.round(Number(avgRating))} size="lg" />
                <p className="text-muted-foreground mt-2">
                  Based on {totalReviews} reviews
                </p>
                
                {stats && (
                  <div className="mt-6 space-y-2">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = Number(stats[`${star === 5 ? 'fiveStar' : star === 4 ? 'fourStar' : star === 3 ? 'threeStar' : star === 2 ? 'twoStar' : 'oneStar'}Count`] || 0);
                      const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-sm">
                          <span className="w-8">{star} star</span>
                          <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-black rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-muted-foreground">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition for Men */}
      <section className="py-12 bg-black text-white">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <ShieldCheck className="h-8 w-8 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Skip the Store</h3>
              <p className="text-neutral-400 text-sm">
                No crowds. No queues. No awkward fitting room experiences. 
                Quality menswear delivered to your door.
              </p>
            </div>
            <div>
              <User className="h-8 w-8 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Your Style, Your Choice</h3>
              <p className="text-neutral-400 text-sm">
                Browse at midnight or during lunch. Take your time. 
                Make decisions without pressure.
              </p>
            </div>
            <div>
              <CheckCircle className="h-8 w-8 mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Verified Quality</h3>
              <p className="text-neutral-400 text-sm">
                Every item inspected and photographed. What you see is what you get. 
                No surprises.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews List */}
      <section className="py-12 md:py-16">
        <div className="container">
          <h2 className="text-2xl font-serif font-bold mb-8">What Our Customers Say</h2>
          
          {isLoading ? (
            <div className="grid gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border border-border rounded-xl p-6">
                  <div className="flex gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : reviews && reviews.length > 0 ? (
            <div className="grid gap-6">
              {reviews.map(({ review, product, user }) => {
                const hasVoted = helpfulVotes.has(review.id);
                const optimisticIncrement = optimisticCounts[review.id] || 0;
                const displayCount = review.helpfulCount + optimisticIncrement;
                
                return (
                  <article 
                    key={review.id} 
                    className="border border-border rounded-xl p-6 hover:border-neutral-400 transition-colors"
                  >
                    <div className="flex gap-4">
                      {/* Product Image */}
                      <Link href={`/product/${product.id}`}>
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                          {product.image1Url ? (
                            <img 
                              src={product.image1Url} 
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-400">
                              No image
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <StarRating rating={review.rating} />
                              {review.isVerifiedPurchase && (
                                <Badge variant="outline" className="text-xs bg-neutral-100 text-neutral-700">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Verified Purchase
                                </Badge>
                              )}
                            </div>
                            {review.title && (
                              <h3 className="font-semibold">{review.title}</h3>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        
                        {/* Product Info */}
                        <Link href={`/product/${product.id}`}>
                          <p className="text-sm text-muted-foreground mb-2 hover:text-black transition-colors">
                            {product.brand} {product.name} - Size {product.size}
                          </p>
                        </Link>
                        
                        {/* Review Content */}
                        {review.content && (
                          <p className="text-muted-foreground mb-3">{review.content}</p>
                        )}
                        
                        {/* Fit Feedback */}
                        {review.fitFeedback && (
                          <div className="mb-3">
                            <FitBadge fit={review.fitFeedback} />
                          </div>
                        )}
                        
                        {/* Footer */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{user.name || "Anonymous"}</span>
                          </div>
                          <Button
                            variant={hasVoted ? "default" : "ghost"}
                            size="sm"
                            className={cn(
                              "transition-all duration-200",
                              hasVoted 
                                ? "bg-green-600 hover:bg-green-700 text-white" 
                                : "text-muted-foreground hover:text-black"
                            )}
                            onClick={() => handleHelpful(review.id)}
                            disabled={markHelpful.isPending}
                          >
                            <ThumbsUp className={cn(
                              "h-4 w-4 mr-1 transition-transform",
                              hasVoted && "fill-current"
                            )} />
                            {hasVoted ? "Helpful" : "Helpful"} ({displayCount})
                          </Button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-border rounded-xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-neutral-100 flex items-center justify-center">
                <Star className="h-10 w-10 text-neutral-400" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground mb-6">
                Be the first to share your experience with Urban Refit.
              </p>
              <Link href="/shop">
                <Button className="rounded-full bg-black text-white hover:bg-black/90">
                  Start Shopping
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 border-t border-border bg-neutral-50">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold mb-4">
              Ready to upgrade your wardrobe?
            </h2>
            <p className="text-muted-foreground mb-6">
              Join thousands of men who shop smarter, not harder. 
              Premium brands, curated selection, delivered to you.
            </p>
            <Link href="/shop">
              <Button className="rounded-full bg-black text-white hover:bg-black/90 px-8">
                Shop Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
