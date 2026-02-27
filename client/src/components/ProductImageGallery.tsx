import { useState, useEffect } from "react";
import ImageZoom from "@/components/ImageZoom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const placeholderImage = "https://placehold.co/600x600/f5f5f4/a8a29e?text=No+Image";
  
  const validImages = images.filter(Boolean);
  const displayImages = validImages.length > 0 ? validImages : [placeholderImage];
  const currentImage = displayImages[selectedIndex] || placeholderImage;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
      } else if (e.key === "ArrowRight") {
        setSelectedIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [displayImages.length]);

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayImages.length - 1));
  };

  const goToNext = () => {
    setSelectedIndex((prev) => (prev < displayImages.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4">
      {/* Main Image with zoom and navigation */}
      <div className="relative aspect-square rounded-lg overflow-hidden bg-muted group">
        <ImageZoom
          src={currentImage}
          alt={`${productName} - View ${selectedIndex + 1}`}
          className="w-full h-full"
        />
        
        {/* Navigation arrows (only show if multiple images) */}
        {displayImages.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            
            {/* Image counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {selectedIndex + 1} / {displayImages.length}
            </div>
          </>
        )}
      </div>
      
      {/* Thumbnail Gallery */}
      {displayImages.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
          {displayImages.map((imageUrl, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary/20 scale-105"
                  : "border-border hover:border-muted-foreground/50"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={imageUrl}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {selectedIndex === index && (
                <div className="absolute inset-0 bg-primary/10" />
              )}
            </button>
          ))}
        </div>
      )}
      
      {/* Hint text for keyboard navigation */}
      {displayImages.length > 1 && (
        <p className="text-xs text-muted-foreground text-center">
          Use arrow keys or click thumbnails to navigate
        </p>
      )}
    </div>
  );
}
