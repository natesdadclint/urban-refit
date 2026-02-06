import { useState } from "react";
import { MessageSquare } from "lucide-react";
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

  return (
    <>
      {/* Floating button with tooltip */}
      <button
        onClick={() => setOpen(true)}
        className="fixed right-6 bottom-[5.5rem] z-50 flex items-center gap-2 h-12 px-5 rounded-full shadow-lg hover:shadow-xl transition-all bg-amber-600 hover:bg-amber-700 text-white"
        aria-label="Send feedback"
      >
        <MessageSquare className="h-5 w-5 shrink-0" />
        <span className="text-sm font-medium whitespace-nowrap">Feedback</span>
      </button>

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
