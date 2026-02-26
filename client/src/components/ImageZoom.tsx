import { useState } from "react";
import { X, ZoomIn } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ImageZoomProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ImageZoom({ src, alt, className = "" }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomLevel === 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  const toggleZoom = () => {
    setZoomLevel(zoomLevel === 1 ? 2.5 : 1);
    setPosition({ x: 50, y: 50 });
  };

  return (
    <>
      <div
        className={`image-zoom-container relative group cursor-zoom-in ${className}`}
        onClick={() => setIsOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-transparent border-0 shadow-none">
          <div className="relative w-full h-full flex items-center justify-center">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div
              className="relative overflow-hidden rounded-lg cursor-zoom-in max-w-[90vw] max-h-[90vh]"
              onClick={toggleZoom}
              onMouseMove={handleMouseMove}
              style={{ cursor: zoomLevel > 1 ? "zoom-out" : "zoom-in" }}
            >
              <img
                src={src}
                alt={alt}
                className="max-w-[90vw] max-h-[90vh] object-contain transition-transform duration-200"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: `${position.x}% ${position.y}%`,
                }}
              />
            </div>
            
            <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-4 py-2 rounded-full">
              {zoomLevel === 1 ? "Click to zoom in" : "Click to zoom out"}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
