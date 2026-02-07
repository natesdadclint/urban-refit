import { useState, useRef } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeedbackForm } from "./FeedbackForm";

export function FloatingFeedbackButton() {
  const [open, setOpen] = useState(false);
  const [showLabel, setShowLabel] = useState(false);
  const labelTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleButtonTouchStart = () => {
    setShowLabel(true);
    if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
    labelTimeoutRef.current = setTimeout(() => setShowLabel(false), 3000);
  };

  const handleButtonTouchEnd = () => {
    if (labelTimeoutRef.current) clearTimeout(labelTimeoutRef.current);
  };

  return (
    <>
      {/* Floating Feedback Button - compact icon with hover/touch label */}
      <div className="fixed right-6 bottom-20 z-50">
        <button
          onClick={() => setOpen(true)}
          onTouchStart={handleButtonTouchStart}
          onTouchEnd={handleButtonTouchEnd}
          className="group flex items-center justify-center h-10 w-10 rounded-full bg-amber-600 text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:bg-amber-700 active:bg-amber-800"
          aria-label="Send feedback"
          title="Send Feedback"
        >
          <MessageSquare className="h-4 w-4" />
        </button>
        <div className={cn("absolute bottom-12 right-0 mb-2 px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-full whitespace-nowrap transition-opacity duration-200 pointer-events-none shadow-lg", showLabel ? "opacity-100" : "opacity-0 group-hover:opacity-100")}>
          Feedback
        </div>
      </div>

      {/* Feedback dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Feedback</DialogTitle>
            <DialogDescription>
              We'd love to hear from you! Share your thoughts, report bugs, or suggest new features.
            </DialogDescription>
          </DialogHeader>
          <FeedbackForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
