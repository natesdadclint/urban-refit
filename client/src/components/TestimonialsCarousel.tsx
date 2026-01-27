import { useState, useEffect, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { Link } from "wouter";

export default function TestimonialsCarousel() {
  const { data: reviews, isLoading } = trpc.reviews.list.useQuery({ limit: 5 });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    if (reviews && reviews.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }
  }, [reviews]);

  const prevSlide = useCallback(() => {
    if (reviews && reviews.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    }
  }, [reviews]);

  // Auto-advance carousel every 5 seconds
  useEffect(() => {
    if (isPaused || !reviews || reviews.length <= 1) return;
    
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isPaused, reviews, nextSlide]);

  if (isLoading) {
    return (
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif font-bold mb-3">What Our Customers Say</h2>
            <p className="text-muted-foreground">Loading testimonials...</p>
          </div>
          <div className="max-w-3xl mx-auto">
            <Card className="animate-pulse">
              <CardContent className="p-8">
                <div className="h-24 bg-muted rounded"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  if (!reviews || reviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  const currentReview = reviews[currentIndex];

  return (
    <section className="py-10 sm:py-16 bg-secondary/30">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold mb-2 sm:mb-3">What Our Customers Say</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Real reviews from our community of sustainable fashion lovers
          </p>
        </div>

        {/* Carousel */}
        <div 
          className="max-w-3xl mx-auto relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Buttons */}
          {reviews.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-4 md:-translate-x-12 z-10 rounded-full bg-background shadow-md h-8 w-8 sm:h-10 sm:w-10"
                onClick={prevSlide}
                aria-label="Previous review"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-4 md:translate-x-12 z-10 rounded-full bg-background shadow-md h-8 w-8 sm:h-10 sm:w-10"
                onClick={nextSlide}
                aria-label="Next review"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </>
          )}

          {/* Review Card */}
          <Card className="border-0 shadow-lg mx-6 sm:mx-0">
            <CardContent className="p-5 sm:p-8 md:p-10">
              {/* Quote Icon */}
              <div className="flex justify-center mb-4 sm:mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Quote className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                </div>
              </div>

              {/* Rating Stars */}
              <div className="flex justify-center gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 sm:h-5 sm:w-5 ${
                      i < currentReview.review.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted"
                    }`}
                  />
                ))}
              </div>

              {/* Review Title */}
              {currentReview.review.title && (
                <h3 className="text-base sm:text-lg font-semibold text-center mb-2 sm:mb-3">
                  "{currentReview.review.title}"
                </h3>
              )}

              {/* Review Content */}
              <p className="text-sm sm:text-base text-center text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                {currentReview.review.content || "Great experience with Urban Refit!"}
              </p>

              {/* Reviewer Info */}
              <div className="flex flex-col items-center gap-1.5 sm:gap-2">
                <p className="font-medium text-sm sm:text-base">{currentReview.user.name}</p>
                {currentReview.product?.name && (
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    Purchased: {currentReview.product.name}
                  </p>
                )}
                {currentReview.review.isVerifiedPurchase && (
                  <span className="text-[10px] sm:text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full">
                    ✓ Verified Purchase
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Dots Indicator */}
          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {reviews.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to review ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link href="/reviews">
            <Button variant="outline">
              View All Reviews
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
